namespace BundleTransformer.Core.Bundles
{
	using System.Web.Optimization;

	using Builders;

	/// <summary>
	/// Bundle that uses CssTransformer as transformation by default 
	/// and NullBuilder as builder by default
	/// </summary>
	public sealed class CustomStyleBundle : Bundle
	{
		/// <summary>
		/// Constructs instance of custom style bundle
		/// </summary>
		/// <param name="virtualPath">Virtual path of bundle</param>
		public CustomStyleBundle(string virtualPath)
		  : this(virtualPath, null)
		{ }

		/// <summary>
		/// Constructs instance of custom style bundle
		/// </summary>
		/// <param name="virtualPath">Virtual path of bundle</param>
		/// <param name="cdnPath">Path of bundle on CDN</param>
		public CustomStyleBundle(string virtualPath, string cdnPath)
			: base(virtualPath, cdnPath, 
				new IBundleTransform[] { BundleTransformerContext.Current.Css.GetTransformerInstance() })
		{
			Builder = new NullBuilder();
		}
	}
}