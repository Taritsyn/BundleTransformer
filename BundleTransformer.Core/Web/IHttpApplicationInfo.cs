namespace BundleTransformer.Core.Web
{
	/// <summary>
	/// Information about web application
	/// </summary>
	public interface IHttpApplicationInfo
	{
		/// <summary>
		/// Gets a URL of web application root
		/// </summary>
		string RootUrl { get; }

		/// <summary>
		/// Gets a path to directory in which is located web application
		/// </summary>
		string RootPath { get; }

		/// <summary>
		/// Gets a flag that web application is in debug mode
		/// </summary>
		bool IsDebugMode { get; }

		/// <summary>
		/// Gets a value of the BundleTable.EnableOptimizations property
		/// </summary>
		bool IsOptimizationsEnabled { get; }
	}
}