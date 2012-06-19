using System.Security.Cryptography;
using System.Text;

namespace BundleTransformer.Core.HttpHandlers
{
	using System;
	using System.Collections.Generic;
	using System.IO;
	using System.IO.Compression;
	using System.Web;
	using System.Web.Caching;

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
		protected static readonly object _cacheSynchronizer = new object();

		/// <summary>
		/// File system wrapper
		/// </summary>
		protected readonly IFileSystemWrapper _fileSystemWrapper;

		/// <summary>
		/// Configuration settings of HTTP-handler that responsible 
		/// for text output of processed asset
		/// </summary>
		protected readonly AssetHandlerSettings _assetHandlerConfig;

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
		/// <param name="fileSystemWrapper">File system wrapper</param>
		/// <param name="assetHandlerConfig">Configuration settings of HTTP-handler that responsible 
		/// for text output of processed asset</param>
		/// <param name="applicationInfo">Information about web application</param>
		protected AssetHandlerBase(Cache cache, IFileSystemWrapper fileSystemWrapper,
			AssetHandlerSettings assetHandlerConfig, IHttpApplicationInfo applicationInfo)
		{
			_cache = cache;
			_fileSystemWrapper = fileSystemWrapper;
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

			bool useLastModified = _assetHandlerConfig.UseLastModifiedHeader;
			bool useETag = _assetHandlerConfig.UseETagHeader;

			string assetUrl = context.Request.Url.LocalPath;
			string assetPath = context.Server.MapPath(assetUrl);
			var asset = new Asset(assetPath);

			// Get date and time, in coordinated universal time (UTC), of 
			// last modification requested asset
			DateTime lastModifyTime;
			try
			{
				lastModifyTime = GetProcessedAssetLastModifyTimeUtc(asset);
			}
			catch (FileNotFoundException)
			{
				ThrowHttpNotFoundError(response);
				return;
			}

			// Generate ETag value
			string eTag = GenerateAssetETag(assetUrl, lastModifyTime);

			// Check whether requested asset has modified
			bool lastModifiedChanged = !useLastModified || IsLastModifiedHeaderChanged(request, lastModifyTime);
			bool eTagChanged = !useETag || IsETagHeaderChanged(request, eTag);

			if (!(lastModifiedChanged && eTagChanged))
			{
				// Requested asset has not changed, so return 304 HTTP-status
				response.StatusCode = 304;
				response.StatusDescription = "Not Modified";

				// Set HTTP-header "Content-Length" is zero, so that 
				// client did not wait for data, but also kept 
				// connection open for other requests
				response.AddHeader("Content-Length", "0");

				response.End();

				return;
			}

			string content = string.Empty;
			try
			{
				content = GetProcessedAssetContent(asset, ref lastModifyTime);
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
				if (useLastModified)
				{
					clientCache.VaryByHeaders["If-Modified-Since"] = true;
					clientCache.SetLastModified(lastModifyTime);
				}
				if (useETag)
				{
					clientCache.VaryByHeaders["If-None-Match"] = true;
					clientCache.SetETag(eTag);
				}
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
		/// Gets date and time, in coordinated universal time (UTC), of 
		/// last modification of the processed asset
		/// </summary>
		/// <param name="asset">Asset</param>
		/// <returns>Date and time, in coordinated universal time (UTC), of 
		/// last modification of the processed asset</returns>
		private DateTime GetProcessedAssetLastModifyTimeUtc(IAsset asset)
		{
			DateTime lastModifyTime;
			string cacheItemKey = string.Format(
				Constants.Common.ProcessedAssetContentCacheItemKeyPattern, asset.Url);
			string assetPath = asset.Path;

			lock (_cacheSynchronizer)
			{
				object cacheItem = _cache.Get(cacheItemKey);
				if (cacheItem != null)
				{
					var obj = (object[])cacheItem;
					lastModifyTime = (DateTime)obj[0];
				}
				else
				{
					if (!_fileSystemWrapper.FileExists(assetPath))
					{
						throw new FileNotFoundException(
							string.Format(Strings.Common_FileNotExist, assetPath), assetPath);
					}

					lastModifyTime = _fileSystemWrapper.GetFileLastWriteTimeUtc(assetPath);
				}
			}

			return lastModifyTime;
		}

		/// <summary>
		/// Gets a processed asset content
		/// </summary>
		/// <param name="asset">Asset</param>
		/// <param name="lastModifyTime">Date and time, in coordinated universal time (UTC), of 
		/// last modification of the processed asset</param>
		/// <returns>Asset content</returns>
		private string GetProcessedAssetContent(IAsset asset, ref DateTime lastModifyTime)
		{
			string content;
			string assetUrl = asset.Url;
			string cacheItemKey = string.Format(
				Constants.Common.ProcessedAssetContentCacheItemKeyPattern, assetUrl);

			lock (_cacheSynchronizer)
			{
				object cacheItem = _cache.Get(cacheItemKey);
				if (cacheItem != null)
				{
					var obj = (object[])cacheItem;
					lastModifyTime = (DateTime)obj[0];
					content = (string)obj[1];
				}
				else
				{
					IAsset processedAsset = ProcessAsset(asset);
					content = processedAsset.Content;
					lastModifyTime = processedAsset.LastModifyDateTimeUtc;

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

					var obj = new object[2];
					obj[0] = lastModifyTime;
					obj[1] = content;

					var fileDependencies = new List<string> { processedAsset.Path };
					fileDependencies.AddRange(processedAsset.RequiredFilePaths);

					var cacheDep = new CacheDependency(fileDependencies.ToArray());

					_cache.Insert(cacheItemKey, obj, cacheDep, 
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
		/// Generates value for HTTP-header "ETag" based on 
		/// information about processed asset
		/// </summary>
		/// <param name="assetUrl">URL of asset file</param>
		/// <param name="lastModifyTime">Date and time, in coordinated universal time (UTC), of 
		/// last modification of the processed asset</param>
		/// <returns>ETag value</returns>
		private static string GenerateAssetETag(string assetUrl, DateTime lastModifyTime)
		{
			string uniqueId = string.Concat(assetUrl, lastModifyTime);

			Encoder stringEncoder = Encoding.UTF8.GetEncoder();
			int byteCount = stringEncoder.GetByteCount(uniqueId.ToCharArray(), 0, uniqueId.Length, true);
			var bytes = new Byte[byteCount];

			stringEncoder.GetBytes(uniqueId.ToCharArray(), 0, uniqueId.Length, bytes, 0, true);

			MD5 md5 = MD5.Create();
			string hash = BitConverter
				.ToString(md5.ComputeHash(bytes))
				.Replace("-", string.Empty)
				.ToLower();

			string eTag = string.Format("\"{0}\"", hash);

			return eTag;
		}

		/// <summary>
		/// Checks actuality of data in browser cache using 
		/// HTTP-header "Last-Modified"
		/// </summary>
		/// <param name="request">HttpRequest object</param>
		/// <param name="lastModifyTime">Date and time of last modification 
		/// files associated with processed asset</param>
		/// <returns>Result of checking (true – data has changed; 
		/// false – has not changed)</returns>
		private static bool IsLastModifiedHeaderChanged(HttpRequestBase request, DateTime lastModifyTime)
		{
			bool fileDateModified = true;
			DateTime modifiedSince = DateTime.MinValue;

			string ifModifiedSince = request.Headers["If-Modified-Since"];
			if (!string.IsNullOrWhiteSpace(ifModifiedSince))
			{
				if (!DateTime.TryParse(ifModifiedSince, out modifiedSince))
				{
					modifiedSince = DateTime.MinValue;
				}
			}

			if (modifiedSince != DateTime.MinValue)
			{
				TimeSpan modifyDiff = lastModifyTime - modifiedSince;
				fileDateModified = modifyDiff > TimeSpan.FromSeconds(1);
			}

			return fileDateModified;
		}

		/// <summary>
		/// Checks actuality of data in browser cache using 
		/// HTTP-header "ETag"
		/// </summary>
		/// <param name="request">HttpRequest object</param>
		/// <param name="eTag">ETag value</param>
		/// <returns>Result of checking (true – data has changed; 
		/// false – has not changed)</returns>
		private static bool IsETagHeaderChanged(HttpRequestBase request, string eTag)
		{
			bool eTagChanged = true;
			string ifNoneMatch = request.Headers["If-None-Match"];

			if (!string.IsNullOrWhiteSpace(ifNoneMatch))
			{
				eTagChanged = !string.Equals(ifNoneMatch, eTag, StringComparison.InvariantCulture);
			}

			return eTagChanged;
		}

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
