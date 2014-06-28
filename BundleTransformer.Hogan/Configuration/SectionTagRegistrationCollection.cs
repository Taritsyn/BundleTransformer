namespace BundleTransformer.Hogan.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Collection of registered custom section tags
	/// </summary>
	[ConfigurationCollection(typeof(SectionTagRegistration))]
	public sealed class SectionTagRegistrationCollection : ConfigurationElementCollection
	{
		/// <summary>
		/// Creates a new custom section tag registration
		/// </summary>
		/// <returns>Custom section tag registration</returns>
		protected override ConfigurationElement CreateNewElement()
		{
			return new SectionTagRegistration();
		}

		/// <summary>
		/// Gets a key of the specified custom section tag registration
		/// </summary>
		/// <param name="element">Custom section tag registration</param>
		/// <returns>Key</returns>
		protected override object GetElementKey(ConfigurationElement element)
		{
			return ((SectionTagRegistration)element).SectionName;
		}

		/// <summary>
		/// Gets a custom section tag registration by section name
		/// </summary>
		/// <param name="sectionName">Custom section name</param>
		/// <returns>Custom section tag registration</returns>
		public new SectionTagRegistration this[string sectionName]
		{
			get { return (SectionTagRegistration)BaseGet(sectionName); }
		}
	}
}