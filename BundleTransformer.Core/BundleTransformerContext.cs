namespace BundleTransformer.Core
{
	using System;
	using System.Web.Optimization;

	using Assets;
	using FileSystem;
	using Configuration;

	/// <summary>
	/// Bundle transformer context
	/// </summary>
	public sealed class BundleTransformerContext : IBundleTransformerContext
	{
		/// <summary>
		/// Instance of default bundle transformer context
		/// </summary>
		private static readonly Lazy<BundleTransformerContext> _default =
			new Lazy<BundleTransformerContext>(() => new BundleTransformerContext());

		/// <summary>
		/// Instance of current bundle transformer context
		/// </summary>
		private static IBundleTransformerContext _current;

		/// <summary>
		/// Gets a instance of bundle transformer context
		/// </summary>
		public static IBundleTransformerContext Current
		{
			get
			{
				return _current ?? _default.Value;
			}
			set
			{
				_current = value;
			}
		}

		/// <summary>
		/// Gets a configuration context
		/// </summary>
		public IConfigurationContext Configuration
		{
			get;
			private set;
		}

		/// <summary>
		/// Gets a file system context
		/// </summary>
		public IFileSystemContext FileSystem
		{
			get;
			private set;
		}

		/// <summary>
		/// Gets a style context
		/// </summary>
		public IAssetContext Styles
		{
			get;
			private set;
		}

		/// <summary>
		/// Gets a script context
		/// </summary>
		public IAssetContext Scripts
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
			Styles = new StyleContext(coreConfig.Styles);
			Scripts = new ScriptContext(coreConfig.Scripts);
		}
	}
}