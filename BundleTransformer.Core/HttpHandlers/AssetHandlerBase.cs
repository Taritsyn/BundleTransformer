namespace BundleTransformer.Core.HttpHandlers
{
	using System;
	using System.Collections.Generic;
	using System.IO;
	using System.Security.Cryptography;
	using System.Text;
	using System.Web;
	using System.Web.Caching;

	using Assets;
	using Configuration;
	using FileSystem;
	using Resources;
	using Translators;

	/// <summary>
	/// Base class of the debugging HTTP-handler that responsible for text output 
	/// of processed asset
	/// </summary>
	public abstract class AssetHandlerBase : IHttpHandler
	{
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
		/// Configuration settings of the debugging HTTP-handler, that responsible 
		/// for text output of processed asset
		/// </summary>
		private readonly AssetHandlerSettings _assetHandlerConfig;

		/// <summary>
		/// Asset content type
		/// </summary>
		public abstract string ContentType
		{
			get;
		}

		public bool IsReusable
		{
			get { return true; }
		}


		/// <summary>
		/// Constructs a instance of the debugging HTTP-handler
		/// </summary>
		/// <param name="cache">Server cache</param>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		/// <param name="assetHandlerConfig">Configuration settings of the debugging HTTP-handler,
		/// that responsible for text output of processed asset</param>
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
			var request = context.Request; 
			var response = context.Response;

			Uri assetUri = request.Url;
			if (assetUri == null)
			{
				ThrowHttpNotFoundError(response);
				return;
			}

			string assetUrl = assetUri.LocalPath;
			if (!_virtualFileSystemWrapper.FileExists(assetUrl))
			{
				ThrowHttpNotFoundError(response);
				return;
			}

			string content;

			try
			{
				content = GetProcessedAssetContent(assetUrl);
			}
			catch (AssetTranslationException e)
			{
				ThrowHttpInternalServerError(response,
					string.Format(Strings.AssetHandler_TranslationError, e.Message));
				return;
			}
			catch (FileNotFoundException e)
			{
				ThrowHttpInternalServerError(response,
					string.Format(Strings.AssetHandler_DependencyNotFoundError, e.Message));
				return;
			}
			catch (Exception e)
			{
				ThrowHttpInternalServerError(response, 
					string.Format(Strings.AssetHandler_UnknownError, e.Message));
				return;
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
		/// Returns a cache key to use for the specified URL
		/// </summary>
		/// <param name="assetUrl">URL to the asset</param>
		/// <returns>Cache key for the specified asset</returns>
		public virtual string GetCacheKey(string assetUrl)
		{
			if (string.IsNullOrWhiteSpace(assetUrl))
			{
				throw new ArgumentException(
					string.Format(Strings.Common_ArgumentIsEmpty, "assetUrl"), "assetUrl");
			}

			return string.Format(
				Constants.Common.ProcessedAssetContentCacheItemKeyPattern, assetUrl.ToLowerInvariant());
		}

		/// <summary>
		/// Gets a processed asset content
		/// </summary>
		/// <param name="assetUrl">URL to the asset</param>
		/// <returns>Text content of asset</returns>
		private string GetProcessedAssetContent(string assetUrl)
		{
			if (string.IsNullOrWhiteSpace(assetUrl))
			{
				throw new ArgumentException(
					string.Format(Strings.Common_ArgumentIsEmpty, "assetUrl"), "assetUrl");
			}

			string content;
			var asset = new Asset(assetUrl);
			
			if (_assetHandlerConfig.DisableServerCache)
			{
				IAsset processedAsset = ProcessAsset(asset);
				content = processedAsset.Content;
			}
			else
			{
				lock (_cacheSynchronizer)
				{
					string processedAssetUrl = asset.Url;
					string cacheItemKey = GetCacheKey(processedAssetUrl);
					object cacheItem = _cache.Get(cacheItemKey);

					if (cacheItem != null)
					{
						content = (string)cacheItem;
					}
					else
					{
						IAsset processedAsset = ProcessAsset(asset);
						content = processedAsset.Content;

						DateTime utcStart = DateTime.UtcNow;
						DateTime absoluteExpiration = DateTime.Now.AddMinutes(
							_assetHandlerConfig.ServerCacheDurationInMinutes);
						TimeSpan slidingExpiration = Cache.NoSlidingExpiration;

						var fileDependencies = new List<string> { processedAssetUrl };
						fileDependencies.AddRange(processedAsset.VirtualPathDependencies);

						var cacheDep = _virtualFileSystemWrapper.GetCacheDependency(processedAssetUrl,
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
		/// <param name="asset">Asset</param>
		/// <returns>Processed asset</returns>
		protected IAsset ProcessAsset(IAsset asset)
		{
			return ProcessAsset(asset, BundleTransformerContext.Current.IsDebugMode);
		}

		/// <summary>
		/// Process a asset
		/// </summary>
		/// <param name="asset">Asset</param>
		/// <param name="isDebugMode">Flag that web application is in debug mode</param>
		/// <returns>Processed asset</returns>
		protected abstract IAsset ProcessAsset(IAsset asset, bool isDebugMode);

		/// <summary>
		/// Throw 404 error (page not found)
		/// </summary>
		/// <param name="response">HttpResponse object</param>
		private static void ThrowHttpNotFoundError(HttpResponseBase response)
		{
			response.Clear();
			response.StatusCode = 404;
			response.End();
		}

		/// <summary>
		/// Throw 500 error (internal server error)
		/// </summary>
		/// <param name="response">HttpResponse object</param>
		/// <param name="errorMessage">Error message text</param>
		private static void ThrowHttpInternalServerError(HttpResponseBase response, string errorMessage)
		{
			response.Clear();
			response.StatusCode = 500;
			response.Write(string.Format("/*{0}{1}{0}*/", Environment.NewLine, errorMessage));
			response.End();
		}
	}
}