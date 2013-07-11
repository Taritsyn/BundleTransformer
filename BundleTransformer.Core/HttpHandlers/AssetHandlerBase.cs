namespace BundleTransformer.Core.HttpHandlers
{
	using System;
	using System.Collections.Generic;
	using System.IO;
	using System.IO.Compression;
	using System.Web;
	using System.Web.Caching;
	using System.Linq;

	using Assets;
	using Configuration;
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
		/// Configuration settings of HTTP-handler that responsible 
		/// for text output of processed asset
		/// </summary>
		private readonly AssetHandlerSettings _assetHandlerConfig;

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
		/// <param name="assetHandlerConfig">Configuration settings of HTTP-handler that responsible 
		/// for text output of processed asset</param>
		/// <param name="applicationInfo">Information about web application</param>
		protected AssetHandlerBase(Cache cache, IVirtualFileSystemWrapper virtualFileSystemWrapper,
			AssetHandlerSettings assetHandlerConfig, IHttpApplicationInfo applicationInfo)
		{
			_cache = cache;
			_virtualFileSystemWrapper = virtualFileSystemWrapper;
			_assetHandlerConfig = assetHandlerConfig;
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

			string assetUrl = request.Url.LocalPath;
			string assetVirtualPath = assetUrl;
			var asset = new Asset(assetVirtualPath);

			string content = string.Empty;
			try
			{
				content = GetProcessedAssetContent(asset);
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

			// Add a special HTTP-headers to ensure that 
			// asset caching in browsers
			var clientCache = response.Cache;

			if (_applicationInfo.IsDebugMode && _assetHandlerConfig.DisableClientCacheInDebugMode)
			{
				clientCache.SetCacheability(HttpCacheability.NoCache);
				clientCache.SetExpires(DateTime.UtcNow.AddDays(-1));
				clientCache.SetValidUntilExpires(false);
				clientCache.SetRevalidation(HttpCacheRevalidation.AllCaches);
				clientCache.SetNoStore();
			}
			else
			{
				var cacheDuration = TimeSpan.FromDays(_assetHandlerConfig.ClientCacheDurationInDays);

				clientCache.SetCacheability(HttpCacheability.Public);
				clientCache.SetExpires(DateTime.UtcNow.Add(cacheDuration));
				clientCache.SetValidUntilExpires(true);
				clientCache.SetNoServerCaching();
				clientCache.SetMaxAge(cacheDuration);
				clientCache.AppendCacheExtension("must-revalidate");
			}

			if (_assetHandlerConfig.EnableCompression
				&& (!_applicationInfo.IsDebugMode || !_assetHandlerConfig.DisableCompressionInDebugMode))
			{
				// Compress asset by GZIP/Deflate
				TryCompressAsset(context);
			}

			// Output text content of asset
			response.ContentType = ContentType;
			response.Write(content);
			response.End();
		}

		/// <summary>
		/// Returns a cache key to use for the specified virtual path
		/// </summary>
		/// <param name="assetVirtualPath">The virtual path to the asset</param>
		/// <returns>A cache key for the specified asset</returns>
		private string GetCacheKey(string assetVirtualPath)
		{
			return string.Format(Constants.Common.ProcessedAssetContentCacheItemKeyPattern, assetVirtualPath);
		}

		/// <summary>
		/// Gets a processed asset content
		/// </summary>
		/// <param name="asset">Asset</param>
		/// <returns>Asset content</returns>
		private string GetProcessedAssetContent(IAsset asset)
		{
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

					DateTime absoluteExpiration;
					TimeSpan slidingExpiration;
					if (_assetHandlerConfig.UseServerCacheSlidingExpiration)
					{
						absoluteExpiration = Cache.NoAbsoluteExpiration;
						slidingExpiration = TimeSpan.FromMinutes(_assetHandlerConfig.ServerCacheDurationInMinutes);
					}
					else
					{
						absoluteExpiration = DateTime.Now.AddMinutes(_assetHandlerConfig.ServerCacheDurationInMinutes);
						slidingExpiration = Cache.NoSlidingExpiration;
					}

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
		/// Process asset
		/// </summary>
		/// <param name="asset">Asset</param>
		/// <returns>Processed asset</returns>
		protected abstract IAsset ProcessAsset(IAsset asset);

		/// <summary>
		/// Compresses processed asset, using GZIP or Deflate 
		/// (if there is support in browser)
		/// </summary>
		/// <param name="context">HttpContext object</param>
		private void TryCompressAsset(HttpContextBase context)
		{
			var response = context.Response;
			string acceptEncoding = context.Request.Headers["Accept-Encoding"];

			if (acceptEncoding != null)
			{
				if (acceptEncoding.Contains("gzip"))
				{
					response.Filter = new GZipStream(response.Filter, CompressionMode.Compress);
					response.AppendHeader("Content-Encoding", "gzip");
				}
				else if (acceptEncoding.Contains("deflate"))
				{
					response.Filter = new DeflateStream(response.Filter, CompressionMode.Compress);
					response.AppendHeader("Content-Encoding", "deflate");
				}
			}
		}

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
