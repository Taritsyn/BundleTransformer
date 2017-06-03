namespace BundleTransformer.Hogan.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Custom section tag registration
	/// </summary>
	public sealed class SectionTagRegistration : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets a custom section name (used as a key)
		/// </summary>
		[ConfigurationProperty("sectionName", IsKey = true, IsRequired = true)]
		public string SectionName
		{
			get { return (string)this["sectionName"]; }
			set { this["sectionName"] = value; }
		}

		/// <summary>
		/// Gets or sets a name of opening tag
		/// </summary>
		[ConfigurationProperty("openingTagName", IsRequired = true)]
		public string OpeningTagName
		{
			get { return (string)this["openingTagName"]; }
			set { this["openingTagName"] = value; }
		}

		/// <summary>
		/// Gets or sets a name of closing tag
		/// </summary>
		[ConfigurationProperty("closingTagName", IsRequired = true)]
		public string ClosingTagName
		{
			get { return (string)this["closingTagName"]; }
			set { this["closingTagName"] = value; }
		}
	}
}