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
		/// Configuration settings of core
		/// </summary>
		private readonly CoreSettings _coreConfig;

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

				return HttpContext.Current.IsDebuggingEnabled;
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
			: this(BundleTransformerContext.Current.GetCoreConfiguration())
		{ }

		/// <summary>
		/// Constructs instance of HttpApplicationInfo
		/// </summary>
		/// <param name="coreConfig">Configuration settings of core</param>
		public HttpApplicationInfo(CoreSettings coreConfig)
		{
			_coreConfig = coreConfig;
		}
	}
}