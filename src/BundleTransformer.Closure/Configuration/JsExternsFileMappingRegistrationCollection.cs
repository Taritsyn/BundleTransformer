namespace BundleTransformer.Closure.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Collection of registered JS-externs file mappings
	/// </summary>
	[ConfigurationCollection(typeof(JsExternsFileMappingRegistration))]
	public sealed class JsExternsFileMappingRegistrationCollection : ConfigurationElementCollection
	{
		/// <summary>
		/// Creates a new JS-externs file mapping registration
		/// </summary>
		/// <returns>JS-externs file mapping registration</returns>
		protected override ConfigurationElement CreateNewElement()
		{
			return new JsExternsFileMappingRegistration();
		}

		/// <summary>
		/// Gets a key of the specified JS-externs file mapping registration
		/// </summary>
		/// <param name="element">JS-externs file mapping registration</param>
		/// <returns>Key</returns>
		protected override object GetElementKey(ConfigurationElement element)
		{
			return ((JsExternsFileMappingRegistration)element).ScriptFilePath;
		}

		/// <summary>
		/// Gets a JS-externs file mapping registration by script file path
		/// </summary>
		/// <param name="scriptFilePath">Path to script file</param>
		/// <returns>JS-externs file mapping registration</returns>
		public new JsExternsFileMappingRegistration this[string scriptFilePath]
		{
			get { return (JsExternsFileMappingRegistration)BaseGet(scriptFilePath); }
		}
	}
}