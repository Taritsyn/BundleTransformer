namespace BundleTransformer.Yui.Minifiers
{
	using System.Collections.Generic;

	using Core.Assets;
	using Core.Minifiers;

	/// <summary>
	/// Base class of minifier, which produces minifiction of code 
	/// by using YUI Compressor for .NET
	/// </summary>
	public abstract class YuiMinifierBase : IMinifier
	{
		/// <summary>
		/// Gets or sets a column number, after which must be inserted a line break.
		/// Specify 0 to get a line break after each semi-colon in JavaScript, 
		/// and after each rule in CSS.
		/// </summary>
		public int LineBreakPosition
		{
			get;
			set;
		}


		/// <summary>
		/// Produces code minifiction of assets
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <returns>Set of assets with minified text content</returns>
		public abstract IList<IAsset> Minify(IList<IAsset> assets);

		/// <summary>
		/// Destroys object
		/// </summary>
		public abstract void Dispose();
	}
}
