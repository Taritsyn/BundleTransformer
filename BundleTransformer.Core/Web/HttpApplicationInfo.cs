namespace BundleTransformer.Core.Web
{
	using System.Web;
	using System.Web.Optimization;

	using Configuration;

	/// <summary>
	/// Information about web application
	/// </summary>
	public sealed class HttpApplicationInfo : IHttpApplicationInfo
	{
		/// <summary>
		/// URL of web application root
		/// </summary>
		private readonly string _rootUrl;

		/// <summary>
		/// Path to directory in which is located web application
		/// </summary>
		private readonly string _rootPath;

		/// <summary>
		/// Configuration settings of core
		/// </summary>
		private readonly CoreSettings _coreConfig;

		/// <summary>
		/// Gets a URL of web application root
		/// </summary>
		public string RootUrl
		{
			get { return _rootUrl; }
		}

		/// <summary>
		/// Gets a path to directory in which is located web application
		/// </summary>
		public string RootPath
		{
			get { return _rootPath; }
		}

		/// <summary>
		/// Gets a flag that web application is in debug mode
		/// </summary>
		public bool IsDebugMode
		{
			get
			{
				if (_coreConfig.UseEnableOptimizationsProperty)
				{
					return !BundleTable.EnableOptimizations;
				}
				else
				{
					return HttpContext.Current.IsDebuggingEnabled;
				}
			}
		}

		/// <summary>
		/// Gets a value of the BundleTable.EnableOptimizations property
		/// </summary>
		public bool IsOptimizationsEnabled
		{
			get { return BundleTable.EnableOptimizations; }
		}


		/// <summary>
		/// Constructs instance of HttpApplicationInfo
		/// </summary>
		public HttpApplicationInfo()
			: this(VirtualPathUtility.ToAbsolute("~/"), HttpContext.Current.Server.MapPath("~/"))
		{ }

		/// <summary>
		/// Constructs instance of HttpApplicationInfo
		/// </summary>
		/// <param name="rootUrl">URL of web application root</param>
		/// <param name="rootPath">Path to directory in which is located web application</param>
		public HttpApplicationInfo(string rootUrl, string rootPath)
			: this(rootUrl, rootPath, BundleTransformerContext.Current.GetCoreConfiguration())
		{ }

		/// <summary>
		/// Constructs instance of HttpApplicationInfo
		/// </summary>
		/// <param name="rootUrl">URL of web application root</param>
		/// <param name="rootPath">Path to directory in which is located web application</param>
		/// <param name="coreConfig">Configuration settings of core</param>
		public HttpApplicationInfo(string rootUrl, string rootPath, CoreSettings coreConfig)
		{
			_rootUrl = rootUrl;
			_rootPath = rootPath;
			_coreConfig = coreConfig;
		}
	}
}
