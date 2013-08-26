namespace BundleTransformer.Core.HttpHandlers
{
	using System;
	using System.Collections.Generic;
	using System.IO;
	using System.Security.Cryptography;
	using System.Web;
	using System.Web.Caching;

	using Assets;
	using FileSystem;
	using Minifiers;
	using Resources;
	using Translators;
	using Web;

	/// <summary>
	/// HTTP-handler, which is responsible for text output 
	/// of processed asset
	/// </summary>
	public abstract class AssetHandlerBase : IHttpHandler
	{
		/// <summary>
		/// Duration of storage the text content of processed asset in 
		/// server cache (in minutes)
		/// </summary>
		const int SERVER_CACHE_DURATION_IN_MINUTES = 15;

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
		/// Information about web application
		/// </summary>
		protected readonly IHttpApplicationInfo _applicationInfo;

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
		/// Constructs instance of asset handler
		/// </summary>
		/// <param name="cache">Server cache</param>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		/// <param name="applicationInfo">Information about web application</param>
		protected AssetHandlerBase(Cache cache, IVirtualFileSystemWrapper virtualFileSystemWrapper,
			IHttpApplicationInfo applicationInfo)
		{
			_cache = cache;
			_virtualFileSystemWrapper = virtualFileSystemWrapper;
			_applicationInfo = applicationInfo;
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
			string content = string.Empty;

			try
			{
				content = GetProcessedAssetContent(assetUrl);
			}
			catch (FileNotFoundException)
			{
				ThrowHttpNotFoundError(response);
				return;
			}
			catch (AssetMinificationException e)
			{
				ThrowHttpInternalServerError(response,
					string.Format(Strings.AssetHandler_MinificationError, e.Message));
				return;
			}
			catch (AssetTranslationException e)
			{
				ThrowHttpInternalServerError(response,
					string.Format(Strings.AssetHandler_TranslationError, e.Message));
			}
			catch (Exception e)
			{
				ThrowHttpInternalServerError(response, 
					string.Format(Strings.AssetHandler_UnknownError, e.Message));
				return;
			}

			// Generate a ETag value and check it
			string eTag = GenerateAssetETag(assetUrl, content);
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

			var clientCache = response.Cache;
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

			response.End();
		}

		/// <summary>
		/// Returns a cache key to use for the specified URL
		/// </summary>
		/// <param name="assetUrl">URL to the asset</param>
		/// <returns>Cache key for the specified asset</returns>
		private string GetCacheKey(string assetUrl)
		{
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
			var asset = new Asset(assetUrl);
			string content;
			string cacheItemKey = GetCacheKey(asset.VirtualPath);

			lock (_cacheSynchronizer)
			{
				object cacheItem = _cache.Get(cacheItemKey);
				if (cacheItem != null)
				{
					content = (string)cacheItem;
				}
				else
				{
					IAsset processedAsset = ProcessAsset(asset);
					content = processedAsset.Content;
					string assetVirtualPath = processedAsset.VirtualPath;

					DateTime utcStart = DateTime.UtcNow;
					DateTime absoluteExpiration = DateTime.Now.AddMinutes(SERVER_CACHE_DURATION_IN_MINUTES);
					TimeSpan slidingExpiration = Cache.NoSlidingExpiration;

					var fileDependencies = new List<string> { assetVirtualPath };
					fileDependencies.AddRange(processedAsset.VirtualPathDependencies);

					var cacheDep = _virtualFileSystemWrapper.GetCacheDependency(assetVirtualPath,
						fileDependencies.ToArray(), utcStart);

					_cache.Insert(cacheItemKey, content, cacheDep,
						absoluteExpiration, slidingExpiration, CacheItemPriority.Low, null);
				}
			}

			return content;
		}

		/// <summary>
		/// Generates value for HTTP-header "ETag" based on 
		/// information about processed asset
		/// </summary>
		/// <param name="assetUrl">URL to the asset</param>
		/// <param name="assetContent">Text content of asset</param>
		/// <returns>ETag value</returns>
		private static string GenerateAssetETag(string assetUrl, string assetContent)
		{
			byte[] hash;

			using (Stream stream = Utils.GetStreamFromString(assetUrl + ";" + assetContent))
			{
				using (var md5 = new MD5CryptoServiceProvider())
				{
					hash = md5.ComputeHash(stream);
				}
			}

			string hashString = BitConverter.ToString(hash);
			string eTag = "\"" + hashString.Replace("-", string.Empty).ToLowerInvariant() + "\"";

			return eTag;
		}

		/// <summary>
		/// Checks actuality of data in browser cache using 
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
		/// Process asset
		/// </summary>
		/// <param name="asset">Asset</param>
		/// <returns>Processed asset</returns>
		protected abstract IAsset ProcessAsset(IAsset asset);

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