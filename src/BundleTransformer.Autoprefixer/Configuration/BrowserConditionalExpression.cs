namespace BundleTransformer.Autoprefixer.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Browser conditional expression
	/// </summary>
	public sealed class BrowserConditionalExpression : ConfigurationElement
	{
		/// <summary>
		/// Gets or sets conditional expression
		/// </summary>
		[ConfigurationProperty("conditionalExpression", IsKey = true, IsRequired = true)]
		public string ConditionalExpression
		{
			get { return (string)this["conditionalExpression"]; }
			set { this["conditionalExpression"] = value; }
		}
	}
}