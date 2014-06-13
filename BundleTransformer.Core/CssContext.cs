namespace BundleTransformer.Core
{
	using System;
	using System.Configuration;
	using System.Collections.Generic;

	using Configuration;
	using Minifiers;
	using PostProcessors;
	using Resources;
	using Transformers;
	using Translators;

	/// <summary>
	/// CSS-context
	/// </summary>
	public sealed class CssContext : AssetTypeContextBase
	{
		/// <summary>
		/// Configuration settings of core
		/// </summary>
		private readonly CoreSettings _coreConfig;

		/// <summary>
		/// CSS-transformer
		/// </summary>
		private readonly Lazy<CssTransformer> _transformer = new Lazy<CssTransformer>();

		/// <summary>
		/// Pool of CSS-translators
		/// </summary>
		private readonly Dictionary<string, ITranslator> _translatorsPool = new Dictionary<string, ITranslator>();

		/// <summary>
		/// Synchronizer of CSS-translators pool
		/// </summary>
		private readonly object _translatorsPoolSynchronizer = new object();

		/// <summary>
		/// Pool of CSS-postprocessors
		/// </summary>
		private readonly Dictionary<string, IPostProcessor> _postProcessorsPool = new Dictionary<string, IPostProcessor>();

		/// <summary>
		/// Synchronizer of CSS-postprocessors pool
		/// </summary>
		private readonly object _postProcessorsPoolSynchronizer = new object();

		/// <summary>
		/// Pool of CSS-minifiers
		/// </summary>
		private readonly Dictionary<string, IMinifier> _minifiersPool = new Dictionary<string, IMinifier>();

		/// <summary>
		/// Synchronizer of CSS-minifiers pool
		/// </summary>
		private readonly object _minifiersPoolSynchronizer = new object();


		/// <summary>
		/// Constructs instance of CSS-context
		/// </summary>
		/// <param name="coreConfig">Configuration settings of core</param>
		public CssContext(CoreSettings coreConfig)
		{
			_coreConfig = coreConfig;
		}


		/// <summary>
		/// Gets a instance of CSS-transformer
		/// </summary>
		/// <returns>Instance of CSS-transformer</returns>
		public CssTransformer GetTransformerInstance()
		{
			return _transformer.Value;
		}

		/// <summary>
		/// Gets a instance of CSS-translator
		/// </summary>
		/// <param name="translatorName">CSS-translator name</param>
		/// <returns>Instance of CSS-translator</returns>
		public override ITranslator GetTranslatorInstance(string translatorName)
		{
			ITranslator translator;

			lock (_translatorsPoolSynchronizer)
			{
				if (_translatorsPool.ContainsKey(translatorName))
				{
					translator = _translatorsPool[translatorName];
				}
				else
				{
					if (translatorName == Constants.TranslatorName.NullTranslator)
					{
						translator = new NullTranslator();
					}
					else
					{
						TranslatorRegistration translatorRegistration = _coreConfig.Css.Translators[translatorName];

						if (translatorRegistration == null)
						{
							throw new TranslatorNotFoundException(
								string.Format(Strings.Configuration_TranslatorNotRegistered, "CSS", translatorName));
						}

						string translatorFullTypeName = translatorRegistration.Type;
						translator = Utils.CreateInstanceByFullTypeName<ITranslator>(translatorFullTypeName);
					}

					_translatorsPool.Add(translatorName, translator);
				}
			}

			return translator;
		}

		/// <summary>
		/// Gets a instance of CSS-postprocessor
		/// </summary>
		/// <param name="postProcessorName">CSS-postprocessor name</param>
		/// <returns>Instance of CSS-postprocessor</returns>
		public override IPostProcessor GetPostProcessorInstance(string postProcessorName)
		{
			IPostProcessor postProcessor;

			lock (_postProcessorsPoolSynchronizer)
			{
				if (_postProcessorsPool.ContainsKey(postProcessorName))
				{
					postProcessor = _postProcessorsPool[postProcessorName];
				}
				else
				{
					if (postProcessorName == Constants.PostProcessorName.NullPostProcessor)
					{
						postProcessor = new NullPostProcessor();
					}
					else
					{
						PostProcessorRegistration postProcessorRegistration = _coreConfig.Css.PostProcessors[postProcessorName];

						if (postProcessorRegistration == null)
						{
							throw new PostProcessorNotFoundException(
								string.Format(Strings.Configuration_PostProcessorNotRegistered, "CSS", postProcessorName));
						}

						string postProcessorFullTypeName = postProcessorRegistration.Type;

						postProcessor = Utils.CreateInstanceByFullTypeName<IPostProcessor>(postProcessorFullTypeName);
						postProcessor.UseInDebugMode = postProcessorRegistration.UseInDebugMode;
					}

					_postProcessorsPool.Add(postProcessorName, postProcessor);
				}
			}

			return postProcessor;
		}

		/// <summary>
		/// Gets a instance of CSS-minifier
		/// </summary>
		/// <param name="minifierName">CSS-minifier name</param>
		/// <returns>Instance of CSS-minifier</returns>
		public override IMinifier GetMinifierInstance(string minifierName)
		{
			IMinifier minifier;

			lock (_minifiersPoolSynchronizer)
			{
				if (_minifiersPool.ContainsKey(minifierName))
				{
					minifier = _minifiersPool[minifierName];
				}
				else
				{
					if (minifierName == Constants.MinifierName.NullMinifier)
					{
						minifier = new NullMinifier();
					}
					else
					{
						MinifierRegistration minifierRegistration = _coreConfig.Css.Minifiers[minifierName];

						if (minifierRegistration == null)
						{
							throw new MinifierNotFoundException(
								string.Format(Strings.Configuration_MinifierNotRegistered, "CSS", minifierName));
						}

						string minifierFullTypeName = minifierRegistration.Type;
						minifier = Utils.CreateInstanceByFullTypeName<IMinifier>(minifierFullTypeName);
					}

					_minifiersPool.Add(minifierName, minifier);
				}
			}

			return minifier;
		}

		/// <summary>
		/// Gets a list of default CSS-translator instances
		/// </summary>
		/// <returns>List of default CSS-translator instances</returns>
		public override IList<ITranslator> GetDefaultTranslatorInstances()
		{
			var defaultTranslators = new List<ITranslator>();
			TranslatorRegistrationList translatorRegistrations = _coreConfig.Css.Translators;

			foreach (TranslatorRegistration translatorRegistration in translatorRegistrations)
			{
				if (translatorRegistration.Enabled)
				{
					string defaultTranslatorName = translatorRegistration.Name;
					ITranslator defaultTranslator =
						BundleTransformerContext.Current.Css.GetTranslatorInstance(defaultTranslatorName);

					defaultTranslators.Add(defaultTranslator);
				}
			}

			return defaultTranslators;
		}

		/// <summary>
		/// Gets a list of default CSS-postprocessor instances
		/// </summary>
		/// <returns>List of default CSS-postprocessor instances</returns>
		public override IList<IPostProcessor> GetDefaultPostProcessorInstances()
		{
			var defaultPostProcessors = new List<IPostProcessor>();
			string[] defaultPostProcessorNames = Utils.ConvertToStringCollection(
				_coreConfig.Css.DefaultPostProcessors, ',', trimItemValues: true, removeEmptyItems: true);

			foreach (string defaultPostProcessorName in defaultPostProcessorNames)
			{
				IPostProcessor defaultPostProcessor =
					BundleTransformerContext.Current.Css.GetPostProcessorInstance(defaultPostProcessorName);

				defaultPostProcessors.Add(defaultPostProcessor);
			}

			return defaultPostProcessors;
		}

		/// <summary>
		/// Gets a instance of default CSS-minifier
		/// </summary>
		/// <returns>Instance of default CSS-minifier</returns>
		public override IMinifier GetDefaultMinifierInstance()
		{
			string defaultMinifierName = _coreConfig.Css.DefaultMinifier;
			if (string.IsNullOrWhiteSpace(defaultMinifierName))
			{
				throw new ConfigurationErrorsException(
					string.Format(Strings.Configuration_DefaultMinifierNotSpecified, "CSS"));
			}

			IMinifier defaultMinifier =
				BundleTransformerContext.Current.Css.GetMinifierInstance(defaultMinifierName);

			return defaultMinifier;
		}
	}
}