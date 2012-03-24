namespace BundleTransformer.Core.Translators
{
	using System.Collections.Generic;

	using Assets;

	/// <summary>
	/// Base class of translator with support for native minification
	/// </summary>
	public abstract class TranslatorWithNativeMinificationBase : ITranslator
	{
		/// <summary>
		/// Gets or sets a flag that web application is in debug mode
		/// </summary>
		public bool IsDebugMode
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to allow the use of native minification
		/// </summary>
		public bool UseNativeMinification
		{
			get;
			set;
		}

		/// <summary>
		/// Gets a flag that indicating to use of native minification
		/// </summary>
		public bool NativeMinificationEnabled
		{
			get
			{
				return (UseNativeMinification && !IsDebugMode);
			}
		}


		/// <summary>
		/// Translates code of assets written on intermediate languages to CSS- and JS-code
		/// </summary>
		/// <param name="assets">Set of assets with code written on intermediate languages</param>
		/// <returns>Set of assets with translated code</returns>
		public abstract IList<IAsset> Translate(IList<IAsset> assets);

		/// <summary>
		/// Destroys object
		/// </summary>
		public abstract void Dispose();
	}
}
