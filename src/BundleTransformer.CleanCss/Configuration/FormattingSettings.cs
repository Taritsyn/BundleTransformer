using System.Configuration;

namespace BundleTransformer.CleanCss.Configuration
{
	/// <summary>
	/// Configuration settings of output CSS formatting
	/// </summary>
	public sealed class FormattingSettings : ConfigurationElement
	{
		/// <summary>
		/// Gets a configuration settings of breaks inserting
		/// </summary>
		[ConfigurationProperty("breaksInserting")]
		public BreaksInsertingSettings BreaksInserting
		{
			get { return (BreaksInsertingSettings)this["breaksInserting"]; }
		}

		/// <summary>
		/// Gets or sets a number of characters to indent with
		/// </summary>
		[ConfigurationProperty("indentBy", DefaultValue = 0)]
		[IntegerValidator(MinValue = 0, MaxValue = int.MaxValue, ExcludeRange = false)]
		public int IndentBy
		{
			get { return (int)this["indentBy"]; }
			set { this["indentBy"] = value; }
		}

		/// <summary>
		/// Gets or sets a character to indent with
		/// </summary>
		[ConfigurationProperty("indentWith", DefaultValue = IndentType.Space)]
		public IndentType IndentWith
		{
			get { return (IndentType)this["indentWith"]; }
			set { this["indentWith"] = value; }
		}

		/// <summary>
		/// Gets a configuration settings of spaces inserting
		/// </summary>
		[ConfigurationProperty("spacesInserting")]
		public SpacesInsertingSettings SpacesInserting
		{
			get { return (SpacesInsertingSettings)this["spacesInserting"]; }
		}

		/// <summary>
		/// Gets or sets a maximum line length
		/// </summary>
		[ConfigurationProperty("wrapAt", DefaultValue = 0)]
		[IntegerValidator(MinValue = 0, MaxValue = int.MaxValue, ExcludeRange = false)]
		public int WrapAt
		{
			get { return (int)this["wrapAt"]; }
			set { this["wrapAt"] = value; }
		}
	}
}