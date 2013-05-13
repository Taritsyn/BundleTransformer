namespace BundleTransformer.Core.Filters
{
	using System;
	using System.Collections.Generic;
	using System.Text.RegularExpressions;

	using Assets;
	using Resources;

	/// <summary>
	/// Base class of filter is responsible for removal of unnecessary assets
	/// </summary>
	public abstract class UnnecessaryAssetsFilterBase : IFilter
	{
		/// <summary>
		/// List of regular expressions of files and directories that 
		/// should be ignored when processing
		/// </summary>
		protected readonly List<Regex> _ignoreRegExps;


		/// <summary>
		/// Constructs instance of unnecessary assets filter
		/// </summary>
		/// <param name="ignorePatterns">List of patterns of files and directories that 
		/// should be ignored when processing</param>
		protected UnnecessaryAssetsFilterBase(string[] ignorePatterns)
		{
			if (ignorePatterns == null || ignorePatterns.Length == 0)
			{
				_ignoreRegExps = new List<Regex>();

				return;
			}

			var ignoreRegExps = new List<Regex>();

			foreach(var ignorePattern in ignorePatterns)
			{
				if (!string.IsNullOrWhiteSpace(ignorePattern))
				{
					string processedIgnorePattern = ignorePattern.Trim();
					if (processedIgnorePattern == "*" || processedIgnorePattern == "*.*")
					{
						throw new ArgumentException(Strings.Assets_InvalidIgnorePattern, "ignorePatterns");
					}

					string newIgnorePattern = Regex.Escape(processedIgnorePattern);
					if (processedIgnorePattern.IndexOf("*", StringComparison.InvariantCultureIgnoreCase) != -1)
					{
						newIgnorePattern = "^" + newIgnorePattern.Replace(@"\*", @"(.*)") + "$";
					}
					else
					{
						newIgnorePattern = newIgnorePattern + "$";
					}

					ignoreRegExps.Add(new Regex(newIgnorePattern, RegexOptions.IgnoreCase));
				}
			}

			_ignoreRegExps = ignoreRegExps;
		}


		/// <summary>
		/// Removes unnecessary assets
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <returns>Set of necessary assets</returns>
		public abstract IList<IAsset> Transform(IList<IAsset> assets);

		/// <summary>
		/// Checks whether asset is unnecessary
		/// </summary>
		/// <param name="assetPath">Asset file path</param>
		/// <returns>Checking result (true - unnecessary; false - necessary)</returns>
		protected bool IsUnnecessaryAsset(string assetPath)
		{
			bool isUnnecessaryAsset = false;

			foreach (var ignoreRegExp in _ignoreRegExps)
			{
				if (ignoreRegExp.IsMatch(assetPath))
				{
					isUnnecessaryAsset = true;
					break;
				}
			}

			return isUnnecessaryAsset;
		}
	}
}