namespace BundleTransformer.Core.Assets
{
	using System.Configuration;
	using System.Collections.Generic;
	using System.Web.Optimization;

	using Configuration;
	using Minifiers;
	using PostProcessors;
	using Resources;
	using Translators;
	using Utilities;

	public abstract class AssetContextBase : IAssetContext
	{
		/// <summary>
		/// Configuration settings of processing assets
		/// </summary>
		protected AssetSettingsBase _assetConfig;

		/// <summary>
		/// Pool of translators
		/// </summary>
		protected readonly Dictionary<string, ITranslator> _translatorsPool;

		/// <summary>
		/// Synchronizer of translators pool
		/// </summary>
		protected readonly object _translatorsPoolSynchronizer;

		/// <summary>
		/// Pool of postprocessors
		/// </summary>
		protected readonly Dictionary<string, IPostProcessor> _postProcessorsPool;

		/// <summary>
		/// Synchronizer of postprocessors pool
		/// </summary>
		protected readonly object _postProcessorsPoolSynchronizer;

		/// <summary>
		/// Pool of minifiers
		/// </summary>
		protected readonly Dictionary<string, IMinifier> _minifiersPool;

		/// <summary>
		/// Synchronizer of minifiers pool
		/// </summary>
		protected readonly object _minifiersPoolSynchronizer;

		/// <summary>
		/// File extension mappings
		/// </summary>
		protected readonly FileExtensionMappingCollection _fileExtensionMappings;

		/// <summary>
		/// Gets a output code type
		/// </summary>
		protected abstract string OutputCodeType
		{
			get;
		}

		/// <summary>
		/// Gets a file extension mappings
		/// </summary>
		public FileExtensionMappingCollection FileExtensionMappings
		{
			get { return _fileExtensionMappings; }
		}


		/// <summary>
		/// Constructs a instance of script context
		/// </summary>
		/// <param name="assetConfig">Configuration settings of processing assets</param>
		protected AssetContextBase(AssetSettingsBase assetConfig)
		{
			_assetConfig = assetConfig;

			_translatorsPool = new Dictionary<string, ITranslator>();
			_translatorsPoolSynchronizer = new object();
			_postProcessorsPool = new Dictionary<string, IPostProcessor>();
			_postProcessorsPoolSynchronizer = new object();
			_minifiersPool = new Dictionary<string, IMinifier>();
			_minifiersPoolSynchronizer = new object();
			_fileExtensionMappings = GetFileExtensionMappings();
		}


		/// <summary>
		/// Gets a file extension mappings
		/// </summary>
		/// <returns></returns>
		private FileExtensionMappingCollection GetFileExtensionMappings()
		{
			var fileExtensionMappings = new FileExtensionMappingCollection();
			FileExtensionRegistrationCollection fileExtensionRegistrations = _assetConfig.FileExtensions;

			foreach (FileExtensionRegistration fileExtensionRegistration in fileExtensionRegistrations)
			{
				fileExtensionMappings.Add(
					fileExtensionRegistration.FileExtension,
					fileExtensionRegistration.AssetTypeCode);
			}

			return fileExtensionMappings;
		}

		/// <summary>
		/// Gets a instance of default transform
		/// </summary>
		/// <returns>Instance of transformer</returns>
		public abstract IBundleTransform GetDefaultTransformInstance();

		/// <summary>
		/// Gets a instance of translator
		/// </summary>
		/// <param name="translatorName">Translator name</param>
		/// <returns>Instance of translator</returns>
		public ITranslator GetTranslatorInstance(string translatorName)
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
						TranslatorRegistration translatorRegistration = _assetConfig.Translators[translatorName];

						if (translatorRegistration == null)
						{
							throw new TranslatorNotFoundException(
								string.Format(Strings.Configuration_TranslatorNotRegistered,
									OutputCodeType, translatorName));
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
		/// Gets a instance of postprocessor
		/// </summary>
		/// <param name="postProcessorName">Postprocessor name</param>
		/// <returns>Instance of postprocessor</returns>
		public IPostProcessor GetPostProcessorInstance(string postProcessorName)
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
						PostProcessorRegistration postProcessorRegistration = _assetConfig.PostProcessors[postProcessorName];

						if (postProcessorRegistration == null)
						{
							throw new PostProcessorNotFoundException(
								string.Format(Strings.Configuration_PostProcessorNotRegistered,
									OutputCodeType, postProcessorName));
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
		/// Gets a instance of minifier
		/// </summary>
		/// <param name="minifierName">Minifier name</param>
		/// <returns>Instance of minifier</returns>
		public IMinifier GetMinifierInstance(string minifierName)
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
						MinifierRegistration minifierRegistration = _assetConfig.Minifiers[minifierName];
						if (minifierRegistration == null)
						{
							throw new MinifierNotFoundException(
								string.Format(Strings.Configuration_MinifierNotRegistered,
									OutputCodeType, minifierName));
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
		/// Gets a list of default translator instances
		/// </summary>
		/// <returns>List of default translator instances</returns>
		public IList<ITranslator> GetDefaultTranslatorInstances()
		{
			var defaultTranslators = new List<ITranslator>();
			TranslatorRegistrationCollection translatorRegistrations = _assetConfig.Translators;

			foreach (TranslatorRegistration translatorRegistration in translatorRegistrations)
			{
				if (translatorRegistration.Enabled)
				{
					string defaultTranslatorName = translatorRegistration.Name;
					ITranslator defaultTranslator = GetTranslatorInstance(defaultTranslatorName);

					defaultTranslators.Add(defaultTranslator);
				}
			}

			return defaultTranslators;
		}

		/// <summary>
		/// Gets a list of default postprocessor instances
		/// </summary>
		/// <returns>List of default postprocessor instances</returns>
		public IList<IPostProcessor> GetDefaultPostProcessorInstances()
		{
			var defaultPostProcessors = new List<IPostProcessor>();
			string[] defaultPostProcessorNames = Utils.ConvertToStringCollection(
				_assetConfig.DefaultPostProcessors, ',', trimItemValues: true, removeEmptyItems: true);

			foreach (string defaultPostProcessorName in defaultPostProcessorNames)
			{
				IPostProcessor defaultPostProcessor = GetPostProcessorInstance(defaultPostProcessorName);

				defaultPostProcessors.Add(defaultPostProcessor);
			}

			return defaultPostProcessors;
		}

		/// <summary>
		/// Gets a instance of default minifier
		/// </summary>
		/// <returns>Instance of default minifier</returns>
		public IMinifier GetDefaultMinifierInstance()
		{
			string defaultMinifierName = _assetConfig.DefaultMinifier;
			if (string.IsNullOrWhiteSpace(defaultMinifierName))
			{
				throw new ConfigurationErrorsException(
					string.Format(Strings.Configuration_DefaultMinifierNotSpecified, OutputCodeType));
			}

			IMinifier defaultMinifier = GetMinifierInstance(defaultMinifierName);

			return defaultMinifier;
		}
	}
}