namespace BundleTransformer.Core.Configuration
{
	using System.Configuration;

	/// <summary>
	/// List of registered translators
	/// </summary>
	public sealed class TranslatorRegistrationList : ConfigurationElementCollection
	{
		/// <summary>
		/// Creates a new translator registration
		/// </summary>
		/// <returns>Translator registration</returns>
		protected override ConfigurationElement CreateNewElement()
		{
			return new TranslatorRegistration();
		}

		/// <summary>
		/// Gets a key of the specified translator registration
		/// </summary>
		/// <param name="element">Translator registration</param>
		/// <returns>Key</returns>
		protected override object GetElementKey(ConfigurationElement element)
		{
			return ((TranslatorRegistration)element).Name;
		}

		/// <summary>
		/// Gets a translator registration by translator name
		/// </summary>
		/// <param name="name">Translator name</param>
		/// <returns>Translator registration</returns>
		public new TranslatorRegistration this[string name]
		{
			get { return (TranslatorRegistration)BaseGet(name); }
		}
	}
}