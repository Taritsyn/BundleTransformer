namespace BundleTransformer.Core.Bundles
{
	using System.Web.Optimization;

	using Builders;

	/// <summary>
	/// Bundle that uses ScriptTransformer as transformation by default
	/// and NullBuilder as builder by default
	/// </summary>
	public sealed class CustomScriptBundle : Bundle
	{
		/// <summary>
		/// Constructs a instance of custom script bundle
		/// </summary>
		/// <param name="virtualPath">Virtual path of bundle</param>
		public CustomScriptBundle(string virtualPath)
		  : this(virtualPath, null)
		{ }

		/// <summary>
		/// Constructs a instance of custom script bundle
		/// </summary>
		/// <param name="virtualPath">Virtual path of bundle</param>
		/// <param name="cdnPath">Path of bundle on CDN</param>
		public CustomScriptBundle(string virtualPath, string cdnPath)
			: base(virtualPath, cdnPath,
				new [] { BundleTransformerContext.Current.Scripts.GetDefaultTransformInstance() })
		{
			Builder = new NullBuilder();
		}
	}
}