namespace BundleTransformer.Core.Assets
{
	using System;
	using System.Web.Optimization;

	using Configuration;
	using Transformers;

	/// <summary>
	/// Script context
	/// </summary>
	public sealed class ScriptContext : AssetContextBase
	{
		/// <summary>
		/// Transformer
		/// </summary>
		private readonly Lazy<ScriptTransformer> _transformer = new Lazy<ScriptTransformer>();

		/// <summary>
		/// Gets a output code type
		/// </summary>
		protected override string OutputCodeType
		{
			get { return "JS"; }
		}


		/// <summary>
		/// Constructs a instance of script context
		/// </summary>
		/// <param name="scriptConfig">Configuration settings of processing script assets</param>
		public ScriptContext(ScriptSettings scriptConfig)
			: base(scriptConfig)
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