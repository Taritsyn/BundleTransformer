namespace BundleTransformer.Tests.Core
{
	using System;
	using System.IO;
	using System.Web.Caching;

	using BundleTransformer.Core;
	using BundleTransformer.Core.FileSystem;

	public class MockVirtualFileSystemWrapper : IVirtualFileSystemWrapper
	{
		private readonly string _applicationRootUrl;


		public MockVirtualFileSystemWrapper(string applicationRootUrl)
		{
			_applicationRootUrl = applicationRootUrl;
		}


		public string ToAbsolutePath(string virtualPath)
		{
			return Utils.CombineUrls(_applicationRootUrl, virtualPath.TrimStart('~'));
		}

		#region Not implemented methods
		public bool FileExists(string virtualPath)
		{
			throw new NotImplementedException();
		}

		public string GetFileTextContent(string virtualPath)
		{
			throw new NotImplementedException();
		}

		public byte[] GetFileBinaryContent(string virtualPath)
		{
			throw new NotImplementedException();
		}

		public string ToAppRelative(string virtualPath)
		{
			throw new NotImplementedException();
		}

		public DateTime GetFileLastWriteTime(string virtualPath)
		{
			throw new NotImplementedException();
		}

		public DateTime GetFileLastWriteTimeUtc(string virtualPath)
		{
			throw new NotImplementedException();
		}

		public Stream GetFileStream(string virtualPath)
		{
			throw new NotImplementedException();
		}

		public string GetFileHash(string virtualPath, string[] virtualPathDependencies)
		{
			throw new NotImplementedException();
		}

		public string GetCacheKey(string virtualPath)
		{
			throw new NotImplementedException();
		}

		public CacheDependency GetCacheDependency(string virtualPath, string[] virtualPathDependencies, 
			DateTime utcStart)
		{
			throw new NotImplementedException();
		}
		#endregion
	}
}
