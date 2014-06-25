namespace BundleTransformer.Core.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of processing assets
	/// </summary>
	public abstract class AssetSettingsBase : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets a name of default minifier
		/// </summary>
		[ConfigurationProperty("defaultMinifier", DefaultValue = Constants.MinifierName.NullMinifier)]
		public string DefaultMinifier
		{
			get { return (string)this["defaultMinifier"]; }
			set { this["defaultMinifier"] = value; }
		}

		/// <summary>
		/// Gets or sets a ordered comma-separated list of names of default postprocessors
		/// </summary>
		public abstract string DefaultPostProcessors
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to allow usage of pre-minified files
		/// </summary>
		[ConfigurationProperty("usePreMinifiedFiles", DefaultValue = true)]
		public bool UsePreMinifiedFiles
		{
			get { return (bool)this["usePreMinifiedFiles"]; }
			set { this["usePreMinifiedFiles"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to allow combine files before minification
		/// </summary>
		[ConfigurationProperty("combineFilesBeforeMinification", DefaultValue = false)]
		public bool CombineFilesBeforeMinification
		{
			get { return (bool)this["combineFilesBeforeMinification"]; }
			set { this["combineFilesBeforeMinification"] = value; }
		}

		/// <summary>
		/// Gets a list of registered translators
		/// </summary>
		[ConfigurationProperty("translators", IsRequired = true)]
		public TranslatorRegistrationCollection Translators
		{
			get { return (TranslatorRegistrationCollection)this["translators"]; }
		}

		/// <summary>
		/// Gets a list of registered postprocessors
		/// </summary>
		[ConfigurationProperty("postProcessors", IsRequired = true)]
		public PostProcessorRegistrationCollection PostProcessors
		{
			get { return (PostProcessorRegistrationCollection)this["postProcessors"]; }
		}

		/// <summary>
		/// Gets a list of registered minifiers
		/// </summary>
		[ConfigurationProperty("minifiers", IsRequired = true)]
		public MinifierRegistrationCollection Minifiers
		{
			get { return (MinifierRegistrationCollection)this["minifiers"]; }
		}

		/// <summary>
		/// Gets a list of registered file extensions
		/// </summary>
		[ConfigurationProperty("fileExtensions", IsRequired = true)]
		public FileExtensionRegistrationCollection FileExtensions
		{
			get { return (FileExtensionRegistrationCollection)this["fileExtensions"]; }
		}
	}
}