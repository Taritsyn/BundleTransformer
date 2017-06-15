using System.Configuration;

namespace BundleTransformer.Core.Configuration
{
	/// <summary>
	/// Configuration settings of JS engine
	/// </summary>
	public sealed class JsEngineSettings : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets a JS engine name
		/// </summary>
		[ConfigurationProperty("name", DefaultValue = "")]
		public string Name
		{
			get { return (string)this["name"]; }
			set { this["name"] = value; }
		}
	}
}