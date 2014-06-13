namespace BundleTransformer.Core
{
	using System;
	using System.Collections.Generic;
	using System.Configuration;

	using Configuration;
	using Minifiers;
	using PostProcessors;
	using Resources;
	using Transformers;
	using Translators;

	/// <summary>
	/// JS-context
	/// </summary>
	public sealed class JsContext : AssetTypeContextBase
	{
		/// <summary>
		/// Configuration settings of core
		/// </summary>
		private readonly CoreSettings _coreConfig;

		/// <summary>
		/// JS-transformer
		/// </summary>
		private readonly Lazy<JsTransformer> _transformer = new Lazy<JsTransformer>();

		/// <summary>
		/// Pool of JS-translators
		/// </summary>
		private readonly Dictionary<string, ITranslator> _translatorsPool = new Dictionary<string, ITranslator>();

		/// <summary>
		/// Synchronizer of JS-translators pool
		/// </summary>
		private readonly object _translatorsPoolSynchronizer = new object();

		/// <summary>
		/// Pool of JS-postprocessors
		/// </summary>
		private readonly Dictionary<string, IPostProcessor> _postProcessorsPool = new Dictionary<string, IPostProcessor>();

		/// <summary>
		/// Synchronizer of JS-postprocessors pool
		/// </summary>
		private readonly object _postProcessorsPoolSynchronizer = new object();


		/// <summary>
		/// Pool of JS-minifiers
		/// </summary>
		private readonly Dictionary<string, IMinifier> _minifiersPool = new Dictionary<string, IMinifier>();

		/// <summary>
		/// Synchronizer of JS-minifiers pool
		/// </summary>
		private readonly object _minifiersPoolSynchronizer = new object();


		/// <summary>
		/// Constructs instance of JS-context
		/// </summary>
		/// <param name="coreConfig">Configuration settings of core</param>
		public JsContext(CoreSettings coreConfig)
		{
			_coreConfig = coreConfig;
		}


		/// <summary>
		/// Gets a instance of JS-transformer
		/// </summary>
		/// <returns>Instance of JS-transformer</returns>
		public JsTransformer GetTransformerInstance()
		{
			return _transformer.Value;
		}

		/// <summary>
		/// Gets a instance of JS-translator
		/// </summary>
		/// <param name="translatorName">JS-translator name</param>
		/// <returns>Instance of JS-translator</returns>
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
						TranslatorRegistration translatorRegistration = _coreConfig.Js.Translators[translatorName];

						if (translatorRegistration == null)
						{
							throw new TranslatorNotFoundException(
								string.Format(Strings.Configuration_TranslatorNotRegistered, "JS", translatorName));
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
		/// Gets a instance of JS-postprocessor
		/// </summary>
		/// <param name="postProcessorName">JS-postprocessor name</param>
		/// <returns>Instance of JS-postprocessor</returns>
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
						PostProcessorRegistration postProcessorRegistration = _coreConfig.Js.PostProcessors[postProcessorName];

						if (postProcessorRegistration == null)
						{
							throw new PostProcessorNotFoundException(
								string.Format(Strings.Configuration_PostProcessorNotRegistered, "JS", postProcessorName));
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
		/// Gets a instance of JS-minifier
		/// </summary>
		/// <param name="minifierName">JS-minifier name</param>
		/// <returns>Instance of JS-minifier</returns>
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
						MinifierRegistration minifierRegistration = _coreConfig.Js.Minifiers[minifierName];
						if (minifierRegistration == null)
						{
							throw new MinifierNotFoundException(
								string.Format(Strings.Configuration_MinifierNotRegistered, "JS", minifierName));
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
		/// Gets a list of default JS-translator instances
		/// </summary>
		/// <returns>List of default JS-translator instances</returns>
		public override IList<ITranslator> GetDefaultTranslatorInstances()
		{
			var defaultTranslators = new List<ITranslator>();
			TranslatorRegistrationList translatorRegistrations = _coreConfig.Js.Translators;

			foreach (TranslatorRegistration translatorRegistration in translatorRegistrations)
			{
				if (translatorRegistration.Enabled)
				{
					string defaultTranslatorName = translatorRegistration.Name;
					ITranslator defaultTranslator =
						BundleTransformerContext.Current.Js.GetTranslatorInstance(defaultTranslatorName);

					defaultTranslators.Add(defaultTranslator);
				}
			}

			return defaultTranslators;
		}

		/// <summary>
		/// Gets a list of default JS-postprocessor instances
		/// </summary>
		/// <returns>List of default JS-postprocessor instances</returns>
		public override IList<IPostProcessor> GetDefaultPostProcessorInstances()
		{
			var defaultPostProcessors = new List<IPostProcessor>();
			string[] defaultPostProcessorNames = Utils.ConvertToStringCollection(
				_coreConfig.Js.DefaultPostProcessors, ',', trimItemValues: true, removeEmptyItems: true);

			foreach (string defaultPostProcessorName in defaultPostProcessorNames)
			{
				IPostProcessor defaultPostProcessor =
					BundleTransformerContext.Current.Js.GetPostProcessorInstance(defaultPostProcessorName);

				defaultPostProcessors.Add(defaultPostProcessor);
			}

			return defaultPostProcessors;
		}

		/// <summary>
		/// Gets a instance of default JS-minifier
		/// </summary>
		/// <returns>Instance of default JS-minifier</returns>
		public override IMinifier GetDefaultMinifierInstance()
		{
			string defaultMinifierName = _coreConfig.Js.DefaultMinifier;
			if (string.IsNullOrWhiteSpace(defaultMinifierName))
			{
				throw new ConfigurationErrorsException(
					string.Format(Strings.Configuration_DefaultMinifierNotSpecified, "JS"));
			}

			IMinifier defaultMinifier = BundleTransformerContext.Current.Js.GetMinifierInstance(defaultMinifierName);

			return defaultMinifier;
		}
	}
}
