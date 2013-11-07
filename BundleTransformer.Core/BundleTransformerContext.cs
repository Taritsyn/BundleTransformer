namespace BundleTransformer.Core
{
	using System;
	using System.Collections.Generic;
	using System.Configuration;
	using System.Web.Optimization;

	using Configuration;
	using FileSystem;
	using Minifiers;
	using Resources;
	using Transformers;
	using Translators;

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
		/// Instance of CSS-transformer
		/// </summary>
		private readonly Lazy<CssTransformer> _cssTransformer =
			new Lazy<CssTransformer>();

		/// <summary>
		/// Instance of JS-transformer
		/// </summary>
		private readonly Lazy<JsTransformer> _jsTransformer =
			new Lazy<JsTransformer>();

		/// <summary>
		/// Virtual file system wrapper 
		/// </summary>
		private readonly Lazy<VirtualFileSystemWrapper> _virtualFileSystemWrapper 
			= new Lazy<VirtualFileSystemWrapper>();

		/// <summary>
		/// Common relative path resolver
		/// </summary>
		private readonly Lazy<CommonRelativePathResolver> _commonRelativePathResolver
			= new Lazy<CommonRelativePathResolver>();

		/// <summary>
		/// CSS relative path resolver
		/// </summary>
		private readonly Lazy<CssRelativePathResolver> _cssRelativePathResolver
			= new Lazy<CssRelativePathResolver>();

		/// <summary>
		/// Configuration settings of core
		/// </summary>
		private readonly Lazy<CoreSettings> _coreConfig =
			new Lazy<CoreSettings>(() =>
				(CoreSettings) ConfigurationManager.GetSection("bundleTransformer/core"));

		/// <summary>
		/// Pool of CSS-translators
		/// </summary>
		private readonly Dictionary<string, ITranslator> _cssTranslatorsPool = new Dictionary<string, ITranslator>();

		/// <summary>
		/// Synchronizer of CSS-translators pool
		/// </summary>
		private readonly object _cssTranslatorsPoolSynchronizer = new object();

		/// <summary>
		/// Pool of CSS-minifiers
		/// </summary>
		private readonly Dictionary<string, IMinifier> _cssMinifiersPool = new Dictionary<string, IMinifier>();

		/// <summary>
		/// Synchronizer of CSS-minifiers pool
		/// </summary>
		private readonly object _cssMinifiersPoolSynchronizer = new object();

		/// <summary>
		/// Pool of JS-translators
		/// </summary>
		private readonly Dictionary<string, ITranslator> _jsTranslatorsPool = new Dictionary<string, ITranslator>();

		/// <summary>
		/// Synchronizer of JS-translators pool
		/// </summary>
		private readonly object _jsTranslatorsPoolSynchronizer = new object();

		/// <summary>
		/// Pool of JS-minifiers
		/// </summary>
		private readonly Dictionary<string, IMinifier> _jsMinifiersPool = new Dictionary<string, IMinifier>();

		/// <summary>
		/// Synchronizer of JS-minifiers pool
		/// </summary>
		private readonly object _jsMinifiersPoolSynchronizer = new object();
		
		/// <summary>
		/// Gets a instance of bundle transformer context
		/// </summary>
		public static BundleTransformerContext Current
		{
			get { return _instance.Value; }
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
		{ }


		/// <summary>
		/// Gets a instance of CSS-transformer
		/// </summary>
		/// <returns>Instance of CSS-transformer</returns>
		public CssTransformer GetCssTransformerInstance()
		{
			return _cssTransformer.Value;
		}

		/// <summary>
		/// Gets a instance of JS-transformer
		/// </summary>
		/// <returns>Instance of JS-transformer</returns>
		public JsTransformer GetJsTransformerInstance()
		{
			return _jsTransformer.Value;
		}

		/// <summary>
		/// Gets a instance of the virtual file system wrapper
		/// </summary>
		/// <returns>Virtual file system wrapper</returns>
		public VirtualFileSystemWrapper GetVirtualFileSystemWrapper()
		{
			return _virtualFileSystemWrapper.Value;
		}

		/// <summary>
		/// Gets a instance of the common relative path resolver
		/// </summary>
		/// <returns>Common relative path resolver</returns>
		public CommonRelativePathResolver GetCommonRelativePathResolver()
		{
			return _commonRelativePathResolver.Value;
		}

		/// <summary>
		/// Gets a instance of the CSS relative path resolver
		/// </summary>
		/// <returns>Stylesheet relative path resolver</returns>
		public CssRelativePathResolver GetCssRelativePathResolver()
		{
			return _cssRelativePathResolver.Value;
		}

		/// <summary>
		/// Gets a core configuration settings
		/// </summary>
		/// <returns>Configuration settings of core</returns>
		public CoreSettings GetCoreConfiguration()
		{
			return _coreConfig.Value;
		}

		/// <summary>
		/// Gets a instance of CSS-translator
		/// </summary>
		/// <param name="cssTranslatorName">CSS-translator name</param>
		/// <returns>Instance of CSS-translator</returns>
		public ITranslator GetCssTranslatorInstance(string cssTranslatorName)
		{
			ITranslator cssTranslator;

			lock (_cssTranslatorsPoolSynchronizer)
			{
				if (_cssTranslatorsPool.ContainsKey(cssTranslatorName))
				{
					cssTranslator = _cssTranslatorsPool[cssTranslatorName];
				}
				else
				{
					if (cssTranslatorName == Constants.TranslatorName.NullTranslator)
					{
						cssTranslator = new NullTranslator();
					}
					else
					{
						CoreSettings coreConfig = GetCoreConfiguration();
						TranslatorRegistration cssTranslatorRegistration = coreConfig.Css.Translators[cssTranslatorName];

						if (cssTranslatorRegistration == null)
						{
							throw new TranslatorNotFoundException(
								string.Format(Strings.Configuration_TranslatorNotRegistered, "CSS", cssTranslatorName));
						}

						string cssTranslatorFullTypeName = cssTranslatorRegistration.Type;
						cssTranslator = Utils.CreateInstanceByFullTypeName<ITranslator>(cssTranslatorFullTypeName);
					}

					_cssTranslatorsPool.Add(cssTranslatorName, cssTranslator);
				}
			}

			return cssTranslator;
		}

		/// <summary>
		/// Gets a instance of CSS-minifier
		/// </summary>
		/// <param name="cssMinifierName">CSS-minifier name</param>
		/// <returns>Instance of CSS-minifier</returns>
		public IMinifier GetCssMinifierInstance(string cssMinifierName)
		{
			IMinifier cssMinifier;

			lock (_cssMinifiersPoolSynchronizer)
			{
				if (_cssMinifiersPool.ContainsKey(cssMinifierName))
				{
					cssMinifier = _cssMinifiersPool[cssMinifierName];
				}
				else
				{
					if (cssMinifierName == Constants.MinifierName.NullMinifier)
					{
						cssMinifier = new NullMinifier();
					}
					else
					{
						CoreSettings coreConfig = GetCoreConfiguration();
						MinifierRegistration cssMinifierRegistration = coreConfig.Css.Minifiers[cssMinifierName];

						if (cssMinifierRegistration == null)
						{
							throw new MinifierNotFoundException(
								string.Format(Strings.Configuration_MinifierNotRegistered, "CSS", cssMinifierName));
						}

						string cssMinifierFullTypeName = cssMinifierRegistration.Type;
						cssMinifier = Utils.CreateInstanceByFullTypeName<IMinifier>(cssMinifierFullTypeName);
					}

					_cssMinifiersPool.Add(cssMinifierName, cssMinifier);
				}
			}

			return cssMinifier;
		}

		/// <summary>
		/// Gets a instance of JS-translator
		/// </summary>
		/// <param name="jsTranslatorName">JS-translator name</param>
		/// <returns>Instance of JS-translator</returns>
		public ITranslator GetJsTranslatorInstance(string jsTranslatorName)
		{
			ITranslator jsTranslator;

			lock (_jsTranslatorsPoolSynchronizer)
			{
				if (_jsTranslatorsPool.ContainsKey(jsTranslatorName))
				{
					jsTranslator = _jsTranslatorsPool[jsTranslatorName];
				}
				else
				{
					if (jsTranslatorName == Constants.TranslatorName.NullTranslator)
					{
						jsTranslator = new NullTranslator();
					}
					else
					{
						CoreSettings coreConfig = GetCoreConfiguration();
						TranslatorRegistration jsTranslatorRegistration = coreConfig.Js.Translators[jsTranslatorName];

						if (jsTranslatorRegistration == null)
						{
							throw new TranslatorNotFoundException(
								string.Format(Strings.Configuration_TranslatorNotRegistered, "JS", jsTranslatorName));
						}

						string jsTranslatorFullTypeName = jsTranslatorRegistration.Type;
						jsTranslator = Utils.CreateInstanceByFullTypeName<ITranslator>(jsTranslatorFullTypeName);
					}

					_jsTranslatorsPool.Add(jsTranslatorName, jsTranslator);
				}
			}

			return jsTranslator;
		}

		/// <summary>
		/// Gets a instance of JS-minifier
		/// </summary>
		/// <param name="jsMinifierName">JS-minifier name</param>
		/// <returns>Instance of JS-minifier</returns>
		public IMinifier GetJsMinifierInstance(string jsMinifierName)
		{
			IMinifier jsMinifier;

			lock (_jsMinifiersPoolSynchronizer)
			{
				if (_jsMinifiersPool.ContainsKey(jsMinifierName))
				{
					jsMinifier = _jsMinifiersPool[jsMinifierName];
				}
				else
				{
					if (jsMinifierName == Constants.MinifierName.NullMinifier)
					{
						jsMinifier = new NullMinifier();
					}
					else
					{
						CoreSettings coreConfig = GetCoreConfiguration();
						MinifierRegistration jsMinifierRegistration = coreConfig.Js.Minifiers[jsMinifierName];
						if (jsMinifierRegistration == null)
						{
							throw new MinifierNotFoundException(
								string.Format(Strings.Configuration_MinifierNotRegistered, "JS", jsMinifierName));
						}

						string jsMinifierFullTypeName = jsMinifierRegistration.Type;
						jsMinifier = Utils.CreateInstanceByFullTypeName<IMinifier>(jsMinifierFullTypeName);
					}

					_jsMinifiersPool.Add(jsMinifierName, jsMinifier);
				}
			}

			return jsMinifier;
		}
	}
}