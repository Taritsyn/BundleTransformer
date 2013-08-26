namespace BundleTransformer.Core.Web
{
	/// <summary>
	/// Information about web application
	/// </summary>
	public interface IHttpApplicationInfo
	{
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