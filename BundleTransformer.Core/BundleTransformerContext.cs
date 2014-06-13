namespace BundleTransformer.Core
{
	using System;
	using System.Web.Optimization;

	using Configuration;

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
		/// Gets a instance of bundle transformer context
		/// </summary>
		public static BundleTransformerContext Current
		{
			get { return _instance.Value; }
		}

		/// <summary>
		/// Gets a configuration context
		/// </summary>
		public ConfigurationContext Configuration
		{
			get;
			private set;
		}

		/// <summary>
		/// Gets a file system context
		/// </summary>
		public FileSystemContext FileSystem
		{
			get;
			private set;
		}

		/// <summary>
		/// Gets a CSS-context
		/// </summary>
		public CssContext Css
		{
			get;
			private set;
		}

		/// <summary>
		/// Gets a JS-context
		/// </summary>
		public JsContext Js
		{
			get;
			private set;
		}


		/// <summary>
		/// Gets a flag that web application is in debug mode
		/// </summary>
		public bool IsDebugMode
		{
			get { return !BundleTable.EnableOptimizations; }
		}


		/// <summary>
		/// Private constructor for implementation Singleton pattern
		/// </summary>
		private BundleTransformerContext()
		{
			var configContext = new ConfigurationContext();
			CoreSettings coreConfig = configContext.GetCoreSettings();

			Configuration = configContext;
			FileSystem = new FileSystemContext();
			Css = new CssContext(coreConfig);
			Js = new JsContext(coreConfig);
		}
	}
}