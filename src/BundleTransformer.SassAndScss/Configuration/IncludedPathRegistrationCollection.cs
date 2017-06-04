using System.Configuration;

namespace BundleTransformer.SassAndScss.Configuration
{
	/// <summary>
	/// Collection of registered included paths
	/// </summary>
	[ConfigurationCollection(typeof(IncludedPathRegistration))]
	public sealed class IncludedPathRegistrationCollection : ConfigurationElementCollection
	{
		/// <summary>
		/// Creates a new included path registration
		/// </summary>
		/// <returns>Included path registration</returns>
		protected override ConfigurationElement CreateNewElement()
		{
			return new IncludedPathRegistration();
		}

		/// <summary>
		/// Gets a key of the specified included path registration
		/// </summary>
		/// <param name="element">Included path registration</param>
		/// <returns>Key</returns>
		protected override object GetElementKey(ConfigurationElement element)
		{
			return ((IncludedPathRegistration)element).Path;
		}

		/// <summary>
		/// Gets a included path registration by path
		/// </summary>
		/// <param name="path">Path</param>
		/// <returns>Included path registration</returns>
		public new IncludedPathRegistration this[string path]
		{
			get { return (IncludedPathRegistration)BaseGet(path); }
		}
	}
}