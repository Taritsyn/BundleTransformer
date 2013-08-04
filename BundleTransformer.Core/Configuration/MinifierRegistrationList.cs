namespace BundleTransformer.Core.Configuration
{
	using System.Configuration;

	/// <summary>
	/// List of registered minifiers
	/// </summary>
	public sealed class MinifierRegistrationList : ConfigurationElementCollection
	{
		/// <summary>
		/// Creates new minifier registration
		/// </summary>
		/// <returns>Minifier registration</returns>
		protected override ConfigurationElement CreateNewElement()
		{
			return new MinifierRegistration();
		}

		/// <summary>
		/// Gets key of the specified minifier registration
		/// </summary>
		/// <param name="element">Minifier registration</param>
		/// <returns>Key</returns>
		protected override object GetElementKey(ConfigurationElement element)
		{
			return ((MinifierRegistration)element).Name;
		}

		/// <summary>
		/// Gets minifier registration by minifier name
		/// </summary>
		/// <param name="name">Minifier name</param>
		/// <returns>Minifier registration</returns>
		public new MinifierRegistration this[string name]
		{
			get { return (MinifierRegistration)BaseGet(name); }
		}
	}
}