namespace BundleTransformer.Core.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Collection of registered minifiers
	/// </summary>
	[ConfigurationCollection(typeof(MinifierRegistration))]
	public sealed class MinifierRegistrationCollection : ConfigurationElementCollection
	{
		/// <summary>
		/// Creates a new minifier registration
		/// </summary>
		/// <returns>Minifier registration</returns>
		protected override ConfigurationElement CreateNewElement()
		{
			return new MinifierRegistration();
		}

		/// <summary>
		/// Gets a key of the specified minifier registration
		/// </summary>
		/// <param name="element">Minifier registration</param>
		/// <returns>Key</returns>
		protected override object GetElementKey(ConfigurationElement element)
		{
			return ((MinifierRegistration)element).Name;
		}

		/// <summary>
		/// Gets a minifier registration by minifier name
		/// </summary>
		/// <param name="name">Minifier name</param>
		/// <returns>Minifier registration</returns>
		public new MinifierRegistration this[string name]
		{
			get { return (MinifierRegistration)BaseGet(name); }
		}
	}
}