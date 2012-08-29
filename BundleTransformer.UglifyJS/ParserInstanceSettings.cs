namespace BundleTransformer.UglifyJs
{
	/// <summary>
	/// Settings of the parser
	/// </summary>
	public sealed class ParserInstanceSettings
	{
		/// <summary>
		/// Gets or sets a processing mode of semicolons. 
		/// If you pass true then the parser will throw an error when 
		/// it expects a semicolon and it doesn’t find it. 
		/// For most JS code you don’t want that, but it’s useful if 
		/// you want to strictly sanitize your code.
		/// </summary>
		public bool StrictSemicolons
		{
			get;
			set;
		}
	}
}
