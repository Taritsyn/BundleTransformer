using System.Configuration;

namespace BundleTransformer.CleanCss.Configuration
{
	/// <summary>
	/// Configuration settings of spaces inserting
	/// </summary>
	public sealed class SpacesInsertingSettings : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets a flag for whether to insert a spaces around selector relations (e.g. <code>div > a</code>)
		/// </summary>
		[ConfigurationProperty("aroundSelectorRelation", DefaultValue = false)]
		public bool AroundSelectorRelation
		{
			get { return (bool)this["aroundSelectorRelation"]; }
			set { this["aroundSelectorRelation"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to insert a space before a block begins (e.g. <code>.block {</code>)
		/// </summary>
		[ConfigurationProperty("beforeBlockBegins", DefaultValue = false)]
		public bool BeforeBlockBegins
		{
			get { return (bool)this["beforeBlockBegins"]; }
			set { this["beforeBlockBegins"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to insert a space before a value (e.g. <code>width: 1rem</code>)
		/// </summary>
		[ConfigurationProperty("beforeValue", DefaultValue = false)]
		public bool BeforeValue
		{
			get { return (bool)this["beforeValue"]; }
			set { this["beforeValue"] = value; }
		}
	}
}