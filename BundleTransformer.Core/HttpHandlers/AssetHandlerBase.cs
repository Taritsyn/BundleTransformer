namespace BundleTransformer.Core.HttpHandlers
{
	using System;
	using System.Collections.Generic;
	using System.IO;
	using System.Linq;
	using System.Reflection;
	using System.Security.Cryptography;
	using System.Text;
	using System.Web;
	using System.Web.Caching;
	using System.Web.Optimization;

	using Assets;
	using Configuration;
	using FileSystem;
	using Helpers;
	using PostProcessors;
	using Resources;
	using Transformers;
	using Translators;

	/// <summary>
	/// Base class of the debugging HTTP-handler that responsible for text output 
	/// of processed asset
	/// </summary>
	public abstract class AssetHandlerBase : IHttpHandler
	{
		/// <summary>
		/// HTTP context
		/// </summary>
		protected HttpContextBase _context;

		/// <summary>
		/// Server cache
		/// </summary>
		protected readonly Cache _cache;

		/// <summary>
		/// Synchronizer of requests to server cache
		/// </summary>
		private static readonly object _cacheSynchronizer = new object();

		/// <summary>
		/// Virtual file system wrapper
		/// </summary>
		private readonly IVirtualFileSystemWrapper _virtualFileSystemWrapper;

		/// <summary>
		/// Configuration settings of the debugging HTTP-handler
		/// </summary>
		private readonly AssetHandlerSettings _assetHandlerConfig;

		/// <summary>
		/// Static file handler
		/// </summary>
		private static readonly Lazy<IHttpHandler> _staticFileHandler = new Lazy<IHttpHandler>(
			CreateStaticFileHandlerInstance);

		/// <summary>
		/// Gets a asset content type
		/// </summary>
		protected abstract string ContentType
		{
			get;
		}

		/// <summary>
		/// Gets a value indicating whether asset is static
		/// </summary>
		protected abstract bool IsStaticAsset
		{
			get;
		}

		/// <summary>
		/// Gets a value indicating whether another request can use the instance of HTTP-handler
		/// </summary>
		public bool IsReusable
		{
			get { return true; }
		}


		/// <summary>
		/// Constructs a instance of the debugging HTTP-handler
		/// </summary>
		/// <param name="cache">Server cache</param>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		/// <param name="assetHandlerConfig">Configuration settings of the debugging HTTP-handler</param>
		protected AssetHandlerBase(Cache cache,
			IVirtualFileSystemWrapper virtualFileSystemWrapper,
			AssetHandlerSettings assetHandlerConfig)
		{
			_cache = cache;
			_virtualFileSystemWrapper = virtualFileSystemWrapper;
			_assetHandlerConfig = assetHandlerConfig;
		}


		public void ProcessRequest(HttpContext context)
		{
			ProcessRequest(new HttpContextWrapper(context));
		}

		public void ProcessRequest(HttpContextBase context)
		{
			_context = context;

			var request = context.Request; 
			var response = context.Response;

			Uri assetUri = request.Url;
			if (assetUri == null)
			{
				throw new HttpException(500, Strings.Common_ValueIsNull);
			}

			string assetVirtualPath = assetUri.LocalPath;
			if (string.IsNullOrWhiteSpace(assetVirtualPath))
			{
				throw new HttpException(500, Strings.Common_ValueIsEmpty);
			}

			if (!_virtualFileSystemWrapper.FileExists(assetVirtualPath))
			{
				throw new HttpException(404, string.Format(Strings.Common_FileNotExist, assetVirtualPath));
			}

			string bundleVirtualPath = request.QueryString[Constants.Common.BundleVirtualPathQueryStringParameterName];
			if (string.IsNullOrWhiteSpace(bundleVirtualPath) && IsStaticAsset)
			{
				// Delegate a processing of asset to the instance of `System.Web.StaticFileHandler` type
				ProcessStaticAssetRequest(context);
				return;
			}

			string content;

			try
			{
				content = GetProcessedAssetContent(assetVirtualPath, bundleVirtualPath);
			}
			catch (HttpException)
			{
				throw;
			}
			catch (AssetTranslationException e)
			{
				throw new HttpException(500, e.Message, e);
			}
			catch (AssetPostProcessingException e)
			{
				throw new HttpException(500, e.Message, e);
			}
			catch (FileNotFoundException e)
			{
				throw new HttpException(500, string.Format(Strings.AssetHandler_DependencyNotFound, e.Message, e));
			}
			catch (Exception e)
			{
				throw new HttpException(500, string.Format(Strings.AssetHandler_UnknownError, e.Message, e));
			}

			var clientCache = response.Cache;
			if (_assetHandlerConfig.DisableClientCache)
			{
				response.StatusCode = 200;
				response.StatusDescription = "OK";

				// Configure browser cache
				clientCache.SetCacheability(HttpCacheability.NoCache);
				clientCache.SetExpires(DateTime.UtcNow.Add(TimeSpan.FromDays(-365)));
				clientCache.SetValidUntilExpires(false);
				clientCache.SetNoStore();
				clientCache.SetNoServerCaching();

				// Output text content of asset
				response.ContentType = ContentType;
				response.Write(content);
			}
			else
			{
				// Generate a ETag value and check it
				string eTag = GenerateAssetETag(content);
				bool eTagChanged = IsETagHeaderChanged(request, eTag);

				// Add a special HTTP-headers to ensure that 
				// asset caching in browsers
				if (eTagChanged)
				{
					response.StatusCode = 200;
					response.StatusDescription = "OK";
				}
				else
				{
					response.StatusCode = 304;
					response.StatusDescription = "Not Modified";

					// Set to 0 to prevent client waiting for data
					response.AddHeader("Content-Length", "0");
				}

				// Add a Bundle Transformer's copyright HTTP header
				response.AddHeader("X-Asset-Transformation-Powered-By", "Bundle Transformer");

				clientCache.SetCacheability(HttpCacheability.Public);
				clientCache.SetExpires(DateTime.UtcNow.Add(TimeSpan.FromDays(-365)));
				clientCache.SetValidUntilExpires(true);
				clientCache.AppendCacheExtension("must-revalidate");
				clientCache.SetNoServerCaching();
				clientCache.VaryByHeaders["If-None-Match"] = true;
				clientCache.SetETag(eTag);

				if (eTagChanged)
				{
					// Output text content of asset
					response.ContentType = ContentType;
					response.Write(content);
				}
			}

			response.End();
		}

		/// <summary>
		/// Process a request of static asset
		/// </summary>
		/// <param name="context">HTTP context</param>
		private static void ProcessStaticAssetRequest(HttpContextBase context)
		{
			_staticFileHandler.Value.ProcessRequest(context.ApplicationInstance.Context);
		}

		/// <summary>
		/// Creates a instance of static file handler
		/// </summary>
		/// <returns>Instance of static file handler</returns>
		private static IHttpHandler CreateStaticFileHandlerInstance()
		{
			const string fullTypeName = "System.Web.StaticFileHandler";
			Assembly assembly = typeof(HttpApplication).Assembly;
			Type type = assembly.GetType(fullTypeName, true);

			var handler = (IHttpHandler)Activator.CreateInstance(type, true);
			if (handler == null)
			{
				throw new HttpException(500, string.Format(Strings.Common_InstanceCreationFailed,
					fullTypeName, assembly.FullName));
			}

			return handler;
		}

		/// <summary>
		/// Gets a cache key
		/// </summary>
		/// <param name="assetUrl">URL of asset</param>
		/// <param name="bundleUrl">URL of bundle</param>
		/// <returns>Cache key for specified asset</returns>
		protected virtual string GetCacheKey(string assetUrl, string bundleUrl)
		{
			if (string.IsNullOrWhiteSpace(assetUrl))
			{
				throw new ArgumentException(
					string.Format(Strings.Common_ArgumentIsEmpty, "assetUrl"), "assetUrl");
			}

			string processedAssetUrl = UrlHelpers.ProcessBackSlashes(assetUrl);
			string key = string.Format(
				Constants.Common.ProcessedAssetContentCacheItemKeyPattern, processedAssetUrl.ToLowerInvariant());
			if (!string.IsNullOrWhiteSpace(bundleUrl))
			{
				string processedBundleUrl = UrlHelpers.ProcessBackSlashes(bundleUrl);
				processedBundleUrl = UrlHelpers.RemoveLastSlash(processedBundleUrl);

				key += "_" + processedBundleUrl.ToLowerInvariant();
			}

			return key;
		}

		/// <summary>
		/// Gets a processed asset content
		/// </summary>
		/// <param name="assetVirtualPath">Virtual path of asset</param>
		/// <param name="bundleVirtualPath">Virtual path of bundle</param>
		/// <returns>Text content of asset</returns>
		private string GetProcessedAssetContent(string assetVirtualPath, string bundleVirtualPath)
		{
			if (string.IsNullOrWhiteSpace(assetVirtualPath))
			{
				throw new ArgumentException(
					string.Format(Strings.Common_ArgumentIsEmpty, "assetVirtualPath"), "assetVirtualPath");
			}

			string assetUrl = _virtualFileSystemWrapper.ToAbsolutePath(assetVirtualPath);
			string content;
			
			if (_assetHandlerConfig.DisableServerCache)
			{
				IAsset processedAsset = ProcessAsset(assetUrl, bundleVirtualPath);
				content = processedAsset.Content;
			}
			else
			{
				lock (_cacheSynchronizer)
				{
					string bundleUrl = !string.IsNullOrWhiteSpace(bundleVirtualPath) ?
						_virtualFileSystemWrapper.ToAbsolutePath(bundleVirtualPath) : string.Empty;
					string cacheItemKey = GetCacheKey(assetUrl, bundleUrl);
					object cacheItem = _cache.Get(cacheItemKey);

					if (cacheItem != null)
					{
						content = (string)cacheItem;
					}
					else
					{
						IAsset processedAsset = ProcessAsset(assetUrl, bundleVirtualPath);
						content = processedAsset.Content;

						DateTime utcStart = DateTime.UtcNow;
						DateTime absoluteExpiration = DateTime.Now.AddMinutes(
							_assetHandlerConfig.ServerCacheDurationInMinutes);
						TimeSpan slidingExpiration = Cache.NoSlidingExpiration;

						var fileDependencies = new List<string> { assetUrl };
						fileDependencies.AddRange(processedAsset.VirtualPathDependencies);

						var cacheDep = _virtualFileSystemWrapper.GetCacheDependency(assetUrl,
							fileDependencies.ToArray(), utcStart);

						_cache.Insert(cacheItemKey, content, cacheDep,
							absoluteExpiration, slidingExpiration, CacheItemPriority.Low, null);
					}
				}
			}

			return content;
		}

		/// <summary>
		/// Generates a value for HTTP-header "ETag" based on 
		/// information about processed asset
		/// </summary>
		/// <param name="assetContent">Text content of asset</param>
		/// <returns>ETag value</returns>
		private static string GenerateAssetETag(string assetContent)
		{
			string hash;

			using (var hashAlgorithm = CreateHashAlgorithm())
			{
				hash = HttpServerUtility.UrlTokenEncode(
					hashAlgorithm.ComputeHash(Encoding.Unicode.GetBytes(assetContent)));
			}

			string eTag = string.Format("\"{0}\"", hash);

			return eTag;
		}

		/// <summary>
		/// Creates a hash algorithm
		/// </summary>
		/// <returns>Hash algorithm</returns>
		private static SHA256 CreateHashAlgorithm()
		{
			bool isMonoRuntime = (Type.GetType("Mono.Runtime") != null);
			SHA256 hashAlgorithm;

			if (!isMonoRuntime)
			{
				hashAlgorithm = new SHA256CryptoServiceProvider();
			}
			else
			{
				hashAlgorithm = new SHA256Managed();
			}

			return hashAlgorithm;
		}

		/// <summary>
		/// Checks a actuality of data in browser cache using 
		/// HTTP-header "ETag"
		/// </summary>
		/// <param name="request">HttpRequest object</param>
		/// <param name="eTag">ETag value</param>
		/// <returns>Result of checking (true – data has changed; false – has not changed)</returns>
		private static bool IsETagHeaderChanged(HttpRequestBase request, string eTag)
		{
			bool eTagChanged = true;
			string ifNoneMatch = request.Headers["If-None-Match"];

			if (!string.IsNullOrWhiteSpace(ifNoneMatch))
			{
				eTagChanged = (ifNoneMatch != eTag);
			}

			return eTagChanged;
		}

		/// <summary>
		/// Process a asset
		/// </summary>
		/// <param name="assetUrl">URL of asset</param>
		/// <param name="bundleVirtualPath">Virtual path of bundle</param>
		/// <returns>Processed asset</returns>
		private IAsset ProcessAsset(string assetUrl, string bundleVirtualPath)
		{
			BundleFile bundleFile = null;
			ITransformer transformer = null;
			
			if (!string.IsNullOrWhiteSpace(bundleVirtualPath))
			{
				Bundle bundle = GetBundleByVirtualPath(bundleVirtualPath);
				if (bundle == null)
				{
					throw new HttpException(500, string.Format(Strings.AssetHandler_BundleNotFound, bundleVirtualPath));
				}

				bundleFile = GetBundleFileByVirtualPath(bundle, assetUrl);
				if (bundleFile == null)
				{
					throw new HttpException(500, string.Format(Strings.AssetHandler_BundleFileNotFound,
						assetUrl, bundleVirtualPath));
				}

				transformer = GetTransformer(bundle);
				if (transformer == null)
				{
					throw new HttpException(500, string.Format(Strings.AssetHandler_TransformerNotFound, bundleVirtualPath));
				}
			}

			IAsset asset = new Asset(assetUrl, bundleFile);

			if (!IsStaticAsset)
			{
				asset = TranslateAsset(asset, transformer, BundleTransformerContext.Current.IsDebugMode);
			}

			if (transformer != null)
			{
				asset = PostProcessAsset(asset, transformer);
			}

			return asset;
		}

		/// <summary>
		/// Gets a bundle by virtual path
		/// </summary>
		/// <param name="virtualPath">Virtual path</param>
		/// <returns>Bundle</returns>
		protected virtual Bundle GetBundleByVirtualPath(string virtualPath)
		{
			Bundle bundle = BundleTable.Bundles.GetBundleFor(virtualPath);

			return bundle;
		}

		/// <summary>
		/// Gets a bundle file by virtual path
		/// </summary>
		/// <param name="bundle">Bundle</param>
		/// <param name="virtualPath">Virtual path</param>
		/// <returns>Bundle</returns>
		protected virtual BundleFile GetBundleFileByVirtualPath(Bundle bundle, string virtualPath)
		{
			BundleFile file = null;
			string url = _virtualFileSystemWrapper.ToAbsolutePath(virtualPath);
			url = UrlHelpers.ProcessBackSlashes(url);
			url = RemoveAdditionalFileExtension(url);

			var bundleContext = new BundleContext(_context, BundleTable.Bundles, bundle.Path);
			IEnumerable<BundleFile> bundleFiles = bundle.EnumerateFiles(bundleContext);

			foreach (BundleFile bundleFile in bundleFiles)
			{
				string bundleFileUrl = _virtualFileSystemWrapper.ToAbsolutePath(bundleFile.VirtualFile.VirtualPath);
				bundleFileUrl = UrlHelpers.ProcessBackSlashes(bundleFileUrl);
				bundleFileUrl = RemoveAdditionalFileExtension(bundleFileUrl);

				if (string.Equals(bundleFileUrl, url, StringComparison.OrdinalIgnoreCase))
				{
					file = bundleFile;
					break;
				}
			}

			return file;
		}

		/// <summary>
		/// Removes a additional file extension from path of specified asset
		/// </summary>
		/// <param name="assetPath">Path of asset</param>
		/// <returns>Path of asset without additional file extension</returns>
		protected virtual string RemoveAdditionalFileExtension(string assetPath)
		{
			return assetPath;
		}

		/// <summary>
		/// Gets a transformer from bundle
		/// </summary>
		/// <param name="bundle">Bundle</param>
		/// <returns>Transformer</returns>
		protected abstract ITransformer GetTransformer(Bundle bundle);

		/// <summary>
		/// Translates code of asset written on intermediate language
		/// </summary>
		/// <param name="asset">Asset</param>
		/// <param name="transformer">Transformer</param>
		/// <param name="isDebugMode">Flag that web application is in debug mode</param>
		/// <returns>Translated asset</returns>
		protected virtual IAsset TranslateAsset(IAsset asset, ITransformer transformer, bool isDebugMode)
		{
			return asset;
		}

		/// <summary>
		/// Helper method to facilitate a translation of asset
		/// </summary>
		/// <typeparam name="T">Type of translator</typeparam>
		/// <param name="translatorName">Name of translator</param>
		/// <param name="asset">Asset</param>
		/// <param name="transformer">Transformer</param>
		/// <param name="isDebugMode">Flag that web application is in debug mode</param>
		/// <returns>Translated asset</returns>
		protected IAsset InnerTranslateAsset<T>(string translatorName, IAsset asset, ITransformer transformer,
			bool isDebugMode) where T : class, ITranslator
		{
			IAsset processedAsset = asset;
			T translator;

			if (transformer != null)
			{
				translator = GetTranslatorByType<T>(transformer);
				if (translator == null)
				{
					throw new HttpException(500, string.Format(Strings.AssetHandler_TranslatorNotFound,
						typeof(T).FullName, asset.Url));
				}
			}
			else
			{
				translator = GetTranslatorByName<T>(translatorName);
			}

			if (translator != null)
			{
				processedAsset = translator.Translate(processedAsset);
				translator.IsDebugMode = isDebugMode;
			}

			return processedAsset;
		}

		/// <summary>
		/// Gets a translator by name
		/// </summary>
		/// <typeparam name="T">Type of translator</typeparam>
		/// <param name="translatorName">Name of translator</param>
		/// <returns>Translator</returns>
		protected abstract T GetTranslatorByName<T>(string translatorName) where T : class, ITranslator;

		/// <summary>
		/// Gets a translator by type from transformer
		/// </summary>
		/// <typeparam name="T">Type of translator</typeparam>
		/// <param name="transformer">Transformer</param>
		/// <returns>Translator</returns>
		protected T GetTranslatorByType<T>(ITransformer transformer) where T : class, ITranslator
		{
			ITranslator translator = transformer.Translators.FirstOrDefault(t => t is T);

			return (T)translator;
		}

		/// <summary>
		/// Postprocess a text content of asset
		/// </summary>
		/// <param name="asset">Asset</param>
		/// <param name="transformer">Transformer</param>
		/// <returns>Postprocessed asset</returns>
		protected virtual IAsset PostProcessAsset(IAsset asset, ITransformer transformer)
		{
			IList<IPostProcessor> availablePostProcessors = transformer.PostProcessors
				.Where(p => p.UseInDebugMode)
				.ToList()
				;

			foreach (IPostProcessor postProcessor in availablePostProcessors)
			{
				postProcessor.PostProcess(asset);
			}

			return asset;
		}
	}
}