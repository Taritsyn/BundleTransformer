namespace BundleTransformer.Core.Assets
{
	using System;
	using System.Web.Optimization;

	using Configuration;
	using Transformers;

	/// <summary>
	/// Style context
	/// </summary>
	public sealed class StyleContext : AssetContextBase
	{
		/// <summary>
		/// Transformer
		/// </summary>
		private readonly Lazy<StyleTransformer> _transformer = new Lazy<StyleTransformer>();

		/// <summary>
		/// Gets a output code type
		/// </summary>
		protected override string OutputCodeType
		{
			get { return "CSS"; }
		}


		/// <summary>
		/// Constructs a instance of style context
		/// </summary>
		/// <param name="styleConfig">Configuration settings of processing style assets</param>
		public StyleContext(StyleSettings styleConfig)
			: base(styleConfig)
		{ }


		/// <summary>
		/// Gets a instance of default transform
		/// </summary>
		/// <returns>Instance of transformer</returns>
		public override IBundleTransform GetDefaultTransformInstance()
		{
			return _transformer.Value;
		}
	}
}