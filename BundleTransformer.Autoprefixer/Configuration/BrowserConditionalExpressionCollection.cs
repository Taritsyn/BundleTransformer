namespace BundleTransformer.Autoprefixer.Configuration
{
	using System.Configuration;

	/// <summary>
	/// Collection of browser conditional expressions
	/// </summary>
	[ConfigurationCollection(typeof(BrowserConditionalExpression))]
	public sealed class BrowserConditionalExpressionCollection : ConfigurationElementCollection
	{
		/// <summary>
		/// Creates a new browser conditional expression
		/// </summary>
		/// <returns>Browser conditional expression</returns>
		protected override ConfigurationElement CreateNewElement()
		{
			return new BrowserConditionalExpression();
		}

		/// <summary>
		/// Gets a key of the specified browser conditional expression
		/// </summary>
		/// <param name="element">Browser conditional expression</param>
		/// <returns>Key</returns>
		protected override object GetElementKey(ConfigurationElement element)
		{
			return ((BrowserConditionalExpression)element).ConditionalExpression;
		}

		/// <summary>
		/// Gets a browser conditional expression by conditional expression
		/// </summary>
		/// <param name="conditionalExpression">Conditional expression</param>
		/// <returns>Browser conditional expression</returns>
		public new BrowserConditionalExpression this[string conditionalExpression]
		{
			get { return (BrowserConditionalExpression)BaseGet(conditionalExpression); }
		}
	}
}