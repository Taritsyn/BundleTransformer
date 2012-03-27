namespace BundleTransformer.Core
{
	using System;
	using System.Configuration;
	using System.Web;

	using Configuration;
	using FileSystem;

	/// <summary>
	/// Bundle transformer context
	/// </summary>
	public sealed class BundleTransformerContext
	{
		/// <summary>
		/// Instance of bundle transformer context
		/// </summary>
		private static readonly Lazy<BundleTransformerContext> _instance = 
			new Lazy<BundleTransformerContext>(() => new BundleTransformerContext());

		/// <summary>
		/// Information about web application
		/// </summary>
		private static readonly Lazy<HttpApplicationInfo> _applicationInfo =
			new Lazy<HttpApplicationInfo>(() => new HttpApplicationInfo(
				VirtualPathUtility.ToAbsolute("~/"), HttpContext.Current.Server.MapPath("~/")));

		/// <summary>
		/// File system wrapper 
		/// </summary>
		private static readonly Lazy<FileSystemWrapper> _fileSystemWrapper 
			= new Lazy<FileSystemWrapper>();

		/// <summary>
		/// CSS relative path resolver
		/// </summary>
		private static readonly Lazy<CssRelativePathResolver> _cssRelativePathResolver
			= new Lazy<CssRelativePathResolver>();

		/// <summary>
		/// Configuration settings of core
		/// </summary>
		private static readonly Lazy<CoreSettings> _coreConfiguration =
			new Lazy<CoreSettings>(() =>
				(CoreSettings)ConfigurationManager.GetSection("bundleTransformer/core"));

		/// <summary>
		/// Gets instance of bundle transformer context
		/// </summary>
		public static BundleTransformerContext Current
		{
			get { return _instance.Value; }
		}


		/// <summary>
		/// Private constructor for implementation Singleton pattern
		/// </summary>
		private BundleTransformerContext()
		{ }


		/// <summary>
		/// Gets instance of the web application info
		/// </summary>
		/// <returns>Information about web application</returns>
		public HttpApplicationInfo GetApplicationInfo()
		{
			return _applicationInfo.Value;
		}

		/// <summary>
		/// Gets instance of the file system wrapper
		/// </summary>
		/// <returns>File system wrapper</returns>
		public FileSystemWrapper GetFileSystemWrapper()
		{
			return _fileSystemWrapper.Value;
		}

		/// <summary>
		/// Gets instance of the CSS relative path resolver
		/// </summary>
		/// <returns>Stylesheet relative path resolver</returns>
		public CssRelativePathResolver GetCssRelativePathResolver()
		{
			return _cssRelativePathResolver.Value;
		}

		/// <summary>
		/// Gets core configuration settings
		/// </summary>
		/// <returns>Configuration settings of core</returns>
		public CoreSettings GetCoreConfiguration()
		{
			return _coreConfiguration.Value;
		}
	}
}
