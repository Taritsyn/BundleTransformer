namespace BundleTransformer.SassAndScss.Compilers
{
	using Microsoft.Scripting;
	using Microsoft.Scripting.Hosting;

	/// <summary>
	/// Sass- and SCSS-compiler script host
	/// </summary>
	internal sealed class SassAndScssCompilerScriptHost : ScriptHost
	{
		/// <summary>
		/// Platform adaptation layer
		/// </summary>
		private readonly PlatformAdaptationLayer _platformAdaptationLayer;

		/// <summary>
		/// Gets a platform adaptation layer
		/// </summary>
		public override PlatformAdaptationLayer PlatformAdaptationLayer
		{
			get
			{
				return _platformAdaptationLayer;
			}
		}


		/// <summary>
		/// Constructs instance of Sass- and SCSS-compiler script host
		/// </summary>
		/// <param name="platformAdaptationLayer">Platform adaptation layer</param>
		public SassAndScssCompilerScriptHost(PlatformAdaptationLayer platformAdaptationLayer)
		{
			_platformAdaptationLayer = platformAdaptationLayer;
		}
	}
}
