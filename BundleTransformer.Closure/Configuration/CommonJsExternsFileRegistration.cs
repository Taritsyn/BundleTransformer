namespace BundleTransformer.Closure.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Common JS-externs file registration
	/// </summary>
	public sealed class CommonJsExternsFileRegistration : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets a path to externs file
		/// </summary>
		[ConfigurationProperty("externsFilePath", IsKey = true, IsRequired = true)]
		public string ExternsFilePath
		{
			get { return (string)this["externsFilePath"]; }
			set { this["externsFilePath"] = value; }
		}
	}
}