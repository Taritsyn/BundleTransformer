namespace BundleTransformer.Core.Configuration
{
	using System.Configuration;

	/// <summary>
	/// List of registered postprocessors
	/// </summary>
	public sealed class PostProcessorRegistrationList : ConfigurationElementCollection
	{
		/// <summary>
		/// Creates a new postprocessor registration
		/// </summary>
		/// <returns>Postprocessor registration</returns>
		protected override ConfigurationElement CreateNewElement()
		{
			return new PostProcessorRegistration();
		}

		/// <summary>
		/// Gets a key of the specified postprocessor registration
		/// </summary>
		/// <param name="element">Postprocessor registration</param>
		/// <returns>Key</returns>
		protected override object GetElementKey(ConfigurationElement element)
		{
			return ((PostProcessorRegistration)element).Name;
		}

		/// <summary>
		/// Gets a postprocessor registration by postprocessor name
		/// </summary>
		/// <param name="name">Postprocessor name</param>
		/// <returns>Postprocessor registration</returns>
		public new PostProcessorRegistration this[string name]
		{
			get { return (PostProcessorRegistration)BaseGet(name); }
		}
	}
}