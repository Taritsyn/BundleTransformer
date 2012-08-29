namespace BundleTransformer.Yui.Minifiers
{
	using System.Collections.Generic;

	using YuiCompressionType = Yahoo.Yui.Compressor.CompressionType;

	using Core.Assets;
	using Core.Minifiers;
	using BtCompressionType = CompressionType;

	/// <summary>
	/// Base class of minifier, which produces minifiction of code 
	/// by using YUI Compressor for .NET
	/// </summary>
	public abstract class YuiMinifierBase : IMinifier
	{
		/// <summary>
		/// Gets or sets a code compression type
		/// </summary>
		public abstract BtCompressionType CompressionType
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a column number, after which must be inserted a line break.
		/// Specify 0 to get a line break after each semi-colon in JavaScript, 
		/// and after each rule in CSS.
		/// </summary>
		public abstract int LineBreakPosition
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
	}
}
