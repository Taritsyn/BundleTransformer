namespace BundleTransformer.Core.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Configuration settings of JavaScript engine
	/// </summary>
	public sealed class JsEngineSettings : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets JavaScript engine name
		/// </summary>
		[ConfigurationProperty("name", DefaultValue = "")]
		public string Name
		{
			get { return (string)this["name"]; }
			set { this["name"] = value; }
		}
	}
}