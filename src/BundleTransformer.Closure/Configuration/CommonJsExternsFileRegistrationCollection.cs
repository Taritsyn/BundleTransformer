namespace BundleTransformer.Closure.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Collection of registered common JS-externs files
	/// </summary>
	[ConfigurationCollection(typeof(CommonJsExternsFileRegistration))]
	public sealed class CommonJsExternsFileRegistrationCollection : ConfigurationElementCollection
	{
		/// <summary>
		/// Creates a new common JS-externs file registration
		/// </summary>
		/// <returns>Common JS-externs file registration</returns>
		protected override ConfigurationElement CreateNewElement()
		{
			return new CommonJsExternsFileRegistration();
		}

		/// <summary>
		/// Gets a key of the specified common JS-externs file registration
		/// </summary>
		/// <param name="element">Common JS-externs file registration</param>
		/// <returns>Key</returns>
		protected override object GetElementKey(ConfigurationElement element)
		{
			return ((CommonJsExternsFileRegistration)element).ExternsFilePath;
		}

		/// <summary>
		/// Gets a common JS-externs file registration by externs file path
		/// </summary>
		/// <param name="externsFilePath">Path to externs file</param>
		/// <returns>Common JS-externs file registration</returns>
		public new CommonJsExternsFileRegistration this[string externsFilePath]
		{
			get { return (CommonJsExternsFileRegistration)BaseGet(externsFilePath); }
		}
	}
}