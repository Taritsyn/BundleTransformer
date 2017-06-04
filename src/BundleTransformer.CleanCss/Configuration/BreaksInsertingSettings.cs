using System.Configuration;

namespace BundleTransformer.CleanCss.Configuration
{
	/// <summary>
	/// Configuration settings of breaks inserting
	/// </summary>
	public sealed class BreaksInsertingSettings : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets a flag for whether to insert a line break after at-rule (e.g. <code>@charset</code>)
		/// </summary>
		[ConfigurationProperty("afterAtRule", DefaultValue = false)]
		public bool AfterAtRule
		{
			get { return (bool)this["afterAtRule"]; }
			set { this["afterAtRule"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to insert a line break after a beginning of block (e.g. <code>@media</code>)
		/// </summary>
		[ConfigurationProperty("afterBlockBegins", DefaultValue = false)]
		public bool AfterBlockBegins
		{
			get { return (bool)this["afterBlockBegins"]; }
			set { this["afterBlockBegins"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to insert a line break after a ending of block
		/// </summary>
		[ConfigurationProperty("afterBlockEnds", DefaultValue = false)]
		public bool AfterBlockEnds
		{
			get { return (bool)this["afterBlockEnds"]; }
			set { this["afterBlockEnds"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to insert a line break after a comment
		/// </summary>
		[ConfigurationProperty("afterComment", DefaultValue = false)]
		public bool AfterComment
		{
			get { return (bool)this["afterComment"]; }
			set { this["afterComment"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to insert a line break after a property
		/// </summary>
		[ConfigurationProperty("afterProperty", DefaultValue = false)]
		public bool AfterProperty
		{
			get { return (bool)this["afterProperty"]; }
			set { this["afterProperty"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to insert a line break after a rule begins
		/// </summary>
		[ConfigurationProperty("afterRuleBegins", DefaultValue = false)]
		public bool AfterRuleBegins
		{
			get { return (bool)this["afterRuleBegins"]; }
			set { this["afterRuleBegins"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to insert a line break after a rule ends
		/// </summary>
		[ConfigurationProperty("afterRuleEnds", DefaultValue = false)]
		public bool AfterRuleEnds
		{
			get { return (bool)this["afterRuleEnds"]; }
			set { this["afterRuleEnds"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to insert a line break before a block ends
		/// </summary>
		[ConfigurationProperty("beforeBlockEnds", DefaultValue = false)]
		public bool BeforeBlockEnds
		{
			get { return (bool)this["beforeBlockEnds"]; }
			set { this["beforeBlockEnds"] = value; }
		}

		/// <summary>
		/// Gets or sets a flag for whether to insert a line break between selectors
		/// </summary>
		[ConfigurationProperty("betweenSelectors", DefaultValue = false)]
		public bool BetweenSelectors
		{
			get { return (bool)this["betweenSelectors"]; }
			set { this["betweenSelectors"] = value; }
		}
	}
}