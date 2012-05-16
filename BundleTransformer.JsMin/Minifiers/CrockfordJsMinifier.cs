namespace BundleTransformer.JsMin.Minifiers
{
	using System;
	using System.Collections.Generic;
	using System.Linq;

	using Core.Assets;
	using Core.Minifiers;
	using CoreStrings = Core.Resources.Strings;

	using DouglasCrockford;
	using Resources;

	/// <summary>
	/// Minifier, which produces minifiction of JS-code 
	/// by using C# port of Douglas Crockford JSMin (version of May 22 2007)
	/// </summary>
	public sealed class CrockfordJsMinifier : IMinifier
	{
		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private bool _disposed;


		/// <summary>
		/// Destructs instance of JSMin JS-minifier
		/// </summary>
		~CrockfordJsMinifier()
		{
			Dispose(false /* disposing */);
		}


		/// <summary>
		/// Produces code minifiction of JS-assets by using C# port of 
		/// Douglas Crockford JSMin (version of May 22 2007)
		/// </summary>
		/// <param name="assets">Set of JS-assets</param>
		/// <returns>Set of JS-assets with minified text content</returns>
		public IList<IAsset> Minify(IList<IAsset> assets)
		{
			if (assets == null)
			{
				throw new ArgumentException(CoreStrings.Common_ValueIsEmpty, "assets");
			}

			if (assets.Count == 0)
			{
				return assets;
			}

			var jsMin = new JavaScriptMinifier();

			foreach (var asset in assets.Where(a => a.IsScript && !a.Minified))
			{
				string newContent = String.Empty;
				string assetPath = asset.Path;
				
				try
				{
					newContent = jsMin.Minify(asset.Content);
				}
				catch (Exception e)
				{
					throw new AssetMinificationException(
						String.Format(Strings.Minifiers_JsMinMinificationFailed, assetPath, e.Message));
				}

				asset.Content = newContent;
				asset.Minified = true;
			}

			return assets;
		}

		/// <summary>
		/// Destroys object
		/// </summary>
		public void Dispose()
		{
			Dispose(true /* disposing */);
			GC.SuppressFinalize(this);
		}

		/// <summary>
		/// Destroys object
		/// </summary>
		/// <param name="disposing">Flag, allowing destruction of 
		/// managed objects contained in fields of class</param>
		private void Dispose(bool disposing)
		{
			if (!_disposed)
			{
				_disposed = true;
			}
		}
	}
}
