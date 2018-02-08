using System.Configuration;

namespace BundleTransformer.Less.Configuration
{
	/// <summary>
	/// Included path registration
	/// </summary>
	public sealed class IncludedPathRegistration : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets a path
		/// </summary>
		[ConfigurationProperty("path", IsKey = true, IsRequired = true)]
		public string Path
		{
			get { return (string)this["path"]; }
			set { this["path"] = value; }
		}
	}
}