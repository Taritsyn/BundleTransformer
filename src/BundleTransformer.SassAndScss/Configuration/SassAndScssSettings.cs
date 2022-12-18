using System.Configuration;

using BundleTransformer.Core.Configuration;

namespace BundleTransformer.SassAndScss.Configuration
{
	/// <summary>
	/// Configuration settings of Sass and SCSS translator
	/// </summary>
	public sealed class SassAndScssSettings : ConfigurationSection
	{
		/// <summary>
		/// Gets or sets a flag for whether to allow the use of native minification
		/// </summary>
		[ConfigurationProperty("useNativeMinification", DefaultValue = false)]
		public bool UseNativeMinification
		{
			get { return (bool)this["useNativeMinification"]; }
			set { this["useNativeMinification"] = value; }
		}

		/// <summary>
		/// Gets a list of include paths
		/// </summary>
		[ConfigurationProperty("includePaths", IsRequired = false)]
		public IncludedPathRegistrationCollection IncludePaths
		{
			get { return (IncludedPathRegistrationCollection)this["includePaths"]; }
		}

		/// <summary>
		/// Gets or sets a indent type
		/// </summary>
		[ConfigurationProperty("indentType", DefaultValue = IndentType.Space)]
		public IndentType IndentType
		{
			get { return (IndentType)this["indentType"]; }
			set { this["indentType"] = value; }
		}

		/// <summary>
		/// Gets or sets a number of spaces or tabs to be used for indentation
		/// </summary>
		[ConfigurationProperty("indentWidth", DefaultValue = 2)]
		[IntegerValidator(MinValue = 0, MaxValue = int.MaxValue, ExcludeRange = false)]
		public int IndentWidth
		{
			get { return (int)this["indentWidth"]; }
			set { this["indentWidth"] = value; }
		}

		/// <summary>
		/// Gets or sets a line feed type
		/// </summary>
		[ConfigurationProperty("lineFeedType", DefaultValue = LineFeedType.CrLf)]
		public LineFeedType LineFeedType
		{
			get { return (LineFeedType)this["lineFeedType"]; }
			set { this["lineFeedType"] = value; }
		}

		/// <summary>
		/// Gets or sets a severity level of errors:
		///		0 - only error messages;
		///		1 - only error messages and warnings except deprecations;
		///		2 - only error messages and all warnings.
		/// </summary>
		[ConfigurationProperty("severity", DefaultValue = 0)]
		[IntegerValidator(MinValue = 0, MaxValue = 2, ExcludeRange = false)]
		public int Severity
		{
			get { return (int)this["severity"]; }
			set { this["severity"] = value; }
		}

		/// <summary>
		/// Gets a configuration settings of JS engine
		/// </summary>
		[ConfigurationProperty("jsEngine")]
		public JsEngineSettings JsEngine
		{
			get { return (JsEngineSettings)this["jsEngine"]; }
		}
	}
}