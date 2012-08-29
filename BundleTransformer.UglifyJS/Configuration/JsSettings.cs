namespace BundleTransformer.UglifyJs.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of minification JS-assets
	/// </summary>
	public sealed class JsSettings : ConfigurationElement
	{
		/// <summary>
		/// Gets a configuration settings of the parser
		/// </summary>
		[ConfigurationProperty("parser")]
		public ParserSettings Parser
		{
			get { return (ParserSettings)this["parser"]; }
		}

		/// <summary>
		/// Gets a configuration settings of the mangler
		/// </summary>
		[ConfigurationProperty("mangler")]
		public ManglerSettings Mangler
		{
			get { return (ManglerSettings)this["mangler"]; }
		}

		/// <summary>
		/// Gets a configuration settings of the squeezer
		/// </summary>
		[ConfigurationProperty("squeezer")]
		public SqueezerSettings Squeezer
		{
			get { return (SqueezerSettings)this["squeezer"]; }
		}

		/// <summary>
		/// Gets a configuration settings of the code generator
		/// </summary>
		[ConfigurationProperty("codeGenerator")]
		public CodeGeneratorSettings CodeGenerator
		{
			get { return (CodeGeneratorSettings)this["codeGenerator"]; }
		}
	}
}
