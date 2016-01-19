namespace BundleTransformer.Autoprefixer
{
	using System;
	using System.Reflection;

	using Core.Utilities;
	using CoreStrings = Core.Resources.Strings;

	using Helpers;

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
		/// Gets a statistics for country
		/// </summary>
		/// <param name="countryCode">Two-letter country code</param>
		/// <returns>Statistics for country</returns>
		public string GetStatisticsForCountry(string countryCode)
		{
			string statistics;
			string resourceName = AutoprefixingResourceHelpers.GetResourceName(
				AUTOPREFIXER_COUNTRY_STATISTICS_DIRECTORY_NAME + "." + countryCode + ".json");

			try
			{
				statistics = Utils.GetResourceAsString(resourceName, Assembly.GetExecutingAssembly());
			}
			catch (NullReferenceException)
			{
				statistics = null;
			}

			return statistics;
		}
	}
}