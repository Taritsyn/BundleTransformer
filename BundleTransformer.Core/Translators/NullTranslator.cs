namespace BundleTransformer.Core.Translators
{
	using System;
	using System.Collections.Generic;

	using Assets;
	using Resources;

	/// <summary>
	/// Null translator (used as a placeholder)
	/// </summary>
	public sealed class NullTranslator : ITranslator
	{
		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private bool _disposed;

		/// <summary>
		/// Gets or sets a flag that web application is in debug mode
		/// </summary>
		public bool IsDebugMode
		{
			get;
			set;
		}


		/// <summary>
		/// Do not performs operations with assets
		/// </summary>
		/// <param name="assets">Set of CSS-assets</param>
		/// <returns>Set of CSS-assets</returns>
		public IList<IAsset> Translate(IList<IAsset> assets)
		{
			if (assets == null)
			{
				throw new ArgumentException(Strings.Common_ValueIsEmpty, "assets");
			}

			return assets;
		}

		/// <summary>
		/// Destroys object
		/// </summary>
		public void Dispose()
		{
			if (!_disposed)
			{
				_disposed = true;
			}
		}
	}
}
