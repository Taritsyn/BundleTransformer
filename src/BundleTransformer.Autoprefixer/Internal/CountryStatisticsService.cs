namespace BundleTransformer.Autoprefixer.Internal
{
	using System;
	using System.Collections.Generic;
	using System.IO;
	using System.Linq;
	using System.Reflection;

	using Core.Utilities;
	using CoreStrings = Core.Resources.Strings;

	using Resources;

	/// <summary>
	/// Country statistics service
	/// </summary>
	public sealed class CountryStatisticsService
	{
		/// <summary>
		/// Name of directory, which contains a Autoprefixer country statistics
		/// </summary>
		private const string AUTOPREFIXER_COUNTRY_STATISTICS_DIRECTORY_NAME = "CountryStatistics";

		/// <summary>
		/// Set of country codes for which there are statistics
		/// </summary>
		private readonly ISet<string> _countryCodes;

		/// <summary>
		/// Instance of country statistics service
		/// </summary>
		private static readonly Lazy<CountryStatisticsService> _instance =
			new Lazy<CountryStatisticsService>(() => new CountryStatisticsService());

		/// <summary>
		/// Gets a instance of country statistics service
		/// </summary>
		public static CountryStatisticsService Instance
		{
			get { return _instance.Value; }
		}


		/// <summary>
		/// Constructs a instance of country statistics service
		/// </summary>
		private CountryStatisticsService()
		{
			string[] allResourceNames = Assembly.GetExecutingAssembly().GetManifestResourceNames();
			string countryResourcePrefix = ResourceHelpers.ResourcesNamespace + "." +
				AUTOPREFIXER_COUNTRY_STATISTICS_DIRECTORY_NAME + ".";
			int countryResourcePrefixLength = countryResourcePrefix.Length;
			string[] countryCodes = allResourceNames
				.Where(r => r.StartsWith(countryResourcePrefix, StringComparison.Ordinal))
				.Select(r => Path.GetFileNameWithoutExtension(r.Substring(countryResourcePrefixLength)))
				.ToArray()
				;

			_countryCodes = new HashSet<string>(countryCodes);
		}


		/// <summary>
		/// Determines whether the statistics database contains the specified country
		/// </summary>
		/// <param name="countryCode">Two-letter country code</param>
		/// <returns>true if the statistics database contains an country with the specified code;
		/// otherwise, false</returns>
		public bool ContainsCountry(string countryCode)
		{
			bool result = _countryCodes.Contains(countryCode);

			return result;
		}

		/// <summary>
		/// Gets a statistics for country
		/// </summary>
		/// <param name="countryCode">Two-letter country code</param>
		/// <returns>Statistics for country</returns>
		public string GetStatisticsForCountry(string countryCode)
		{
			string statistics;
			string resourceName = ResourceHelpers.GetResourceName(
				AUTOPREFIXER_COUNTRY_STATISTICS_DIRECTORY_NAME + "." + countryCode + ".js");

			try
			{
				statistics = Utils.GetResourceAsString(resourceName, GetType().Assembly);
			}
			catch (NullReferenceException)
			{
				throw new CssAutoprefixingException(
					string.Format(Strings.PostProcessors_CountryStatisticsNotFound, countryCode));
			}

			return statistics;
		}
	}
}