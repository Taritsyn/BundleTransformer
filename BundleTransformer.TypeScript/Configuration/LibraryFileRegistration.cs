namespace BundleTransformer.TypeScript.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Library file registration
	/// </summary>
	public sealed class LibraryFileRegistration : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets a library file name
		/// </summary>
		[ConfigurationProperty("libraryFileName", IsKey = true, IsRequired = true)]
		public string LibraryFileName
		{
			get { return (string)this["libraryFileName"]; }
			set { this["libraryFileName"] = value; }
		}
	}
}