using System.Configuration;

namespace BundleTransformer.TypeScript.Configuration
{
	/// <summary>
	/// Collection of registered library files
	/// </summary>
	[ConfigurationCollection(typeof(LibraryFileRegistration))]
	public sealed class LibraryFileRegistrationCollection : ConfigurationElementCollection
	{
		/// <summary>
		/// Creates a new library file registration
		/// </summary>
		/// <returns>Library file registration</returns>
		protected override ConfigurationElement CreateNewElement()
		{
			return new LibraryFileRegistration();
		}

		/// <summary>
		/// Gets a key of the specified library file registration
		/// </summary>
		/// <param name="element">Library file registration</param>
		/// <returns>Key</returns>
		protected override object GetElementKey(ConfigurationElement element)
		{
			return ((LibraryFileRegistration)element).LibraryFileName;
		}

		/// <summary>
		/// Gets a library file registration by file name
		/// </summary>
		/// <param name="libraryFileName">Library file name</param>
		/// <returns>Library file registration</returns>
		public new LibraryFileRegistration this[string libraryFileName]
		{
			get { return (LibraryFileRegistration)BaseGet(libraryFileName); }
		}
	}
}