namespace BundleTransformer.Core.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Collection of registered file extensions
	/// </summary>
	[ConfigurationCollection(typeof(FileExtensionRegistration))]
	public sealed class FileExtensionRegistrationCollection : ConfigurationElementCollection
	{
		/// <summary>
		/// Creates a new file extension registration
		/// </summary>
		/// <returns>File extension registration</returns>
		protected override ConfigurationElement CreateNewElement()
		{
			return new FileExtensionRegistration();
		}

		/// <summary>
		/// Gets a key of the specified file extension registration
		/// </summary>
		/// <param name="element">File extension registration</param>
		/// <returns>Key</returns>
		protected override object GetElementKey(ConfigurationElement element)
		{
			return ((FileExtensionRegistration)element).FileExtension;
		}

		/// <summary>
		/// Gets a file extension registration by file extension
		/// </summary>
		/// <param name="name">File extension name</param>
		/// <returns>File extension registration</returns>
		public new FileExtensionRegistration this[string name]
		{
			get { return (FileExtensionRegistration)BaseGet(name); }
		}
	}
}