namespace BundleTransformer.Core.Filters
{
	using System;
	using System.Collections.Generic;

	using Assets;
	using FileSystem;
	using Resources;

	/// <summary>
	/// Filter that responsible for transformation of relative 
	/// paths in CSS-files to absolute
	/// </summary>
	public sealed class CssRelativePathFilter : IFilter
	{
		/// <summary>
		/// CSS relative path resolver
		/// </summary>
		private readonly ICssRelativePathResolver _cssRelativePathResolver;

		/// <summary>
		/// Constructs instance of CSS relative path filter
		/// </summary>
		public CssRelativePathFilter()
			: this(BundleTransformerContext.Current.GetCssRelativePathResolver())
		{
		}

		/// <summary>
		/// Constructs instance of CSS relative path filter
		/// </summary>
		/// <param name="cssRelativePathResolver">CSS relative path resolver</param>
		public CssRelativePathFilter(ICssRelativePathResolver cssRelativePathResolver)
		{
			_cssRelativePathResolver = cssRelativePathResolver;
		}


		/// <summary>
		/// Transforms relative paths to absolute in CSS-files
		/// </summary>
		/// <param name="assets">Set of CSS-assets</param>
		/// <returns>Set of processed CSS-assets</returns>
		public IList<IAsset> Transform(IList<IAsset> assets)
		{
			if (assets == null)
			{
				throw new ArgumentException(Strings.Common_ValueIsEmpty, "assets");
			}

			if (assets.Count == 0)
			{
				return assets;
			}

			foreach (var asset in assets)
			{
				string url = asset.Url;
				string content = _cssRelativePathResolver.ResolveAllRelativePaths(asset.Content, url);

				asset.Content = content;
			}

			return assets;
		}
	}
}
