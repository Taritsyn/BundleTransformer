namespace BundleTransformer.Core.Translators
{
	using System;
	using System.Collections.Generic;

	using Assets;

	/// <summary>
	/// This interface used in implementation of containers for 
	/// translators of code written on intermediate languages 
	/// (LESS, Sass, SCSS, CoffeeScript and etc) to CSS- and JS-code
	/// </summary>
	public interface ITranslator : IDisposable
	{
		/// <summary>
		/// Gets or sets a flag that web application is in debug mode
		/// </summary>
		bool IsDebugMode { get; set; }

		/// <summary>
		/// Translates code of assets written on intermediate languages to CSS- and JS-code
		/// </summary>
		/// <param name="assets">Set of assets with code written on intermediate languages</param>
		/// <returns>Set of assets with translated code</returns>
		IList<IAsset> Translate(IList<IAsset> assets);
	}
}
