namespace BundleTransformer.Closure.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of Closure local JS-minifier
	/// </summary>
	public sealed class LocalJsMinifierSettings : JsMinifierSettingsBase
	{
		/// <summary>
		/// Gets or sets a path to Java Virtual Machine
		/// </summary>
		[ConfigurationProperty("javaVirtualMachinePath", DefaultValue = "")]
		public string JavaVirtualMachinePath
		{
			get { return (string)this["javaVirtualMachinePath"]; }
			set { this["javaVirtualMachinePath"] = value; }
		}

		/// <summary>
		/// Gets or sets a path to Google Closure Compiler Application
		/// </summary>
		[ConfigurationProperty("closureCompilerApplicationPath", DefaultValue = "")]
		public string ClosureCompilerApplicationPath
		{
			get { return (string)this["closureCompilerApplicationPath"]; }
			set { this["closureCompilerApplicationPath"] = value; }
		}

		/// <summary>
		/// Gets or sets a language spec that input sources conform
		/// </summary>
		[ConfigurationProperty("languageSpec", DefaultValue = LanguageSpec.EcmaScript3)]
		public LanguageSpec LanguageSpec
		{
			get { return (LanguageSpec)this["languageSpec"]; }
			set { this["languageSpec"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to check source validity 
		/// but do not enforce Closure style rules and conventions
		/// </summary>
		[ConfigurationProperty("thirdParty", DefaultValue = true)]
		public bool ThirdParty
		{
			get { return (bool)this["thirdParty"]; }
			set { this["thirdParty"] = value; }
		}
	}
}