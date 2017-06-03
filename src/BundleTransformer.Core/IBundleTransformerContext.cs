namespace BundleTransformer.Core
{
	using Assets;
	using FileSystem;
	using Configuration;

	/// <summary>
	/// Defines interface of bundle transformer context
	/// </summary>
	public interface IBundleTransformerContext
	{
		/// <summary>
		/// Gets a configuration context
		/// </summary>
		IConfigurationContext Configuration
		{
			get;
		}

		/// <summary>
		/// Gets a file system context
		/// </summary>
		IFileSystemContext FileSystem
		{
			get;
		}

		/// <summary>
		/// Gets a style context
		/// </summary>
		IAssetContext Styles
		{
			get;
		}

		/// <summary>
		/// Gets a script context
		/// </summary>
		IAssetContext Scripts
		{
			get;
		}

		/// <summary>
		/// Gets a flag that web application is in debug mode
		/// </summary>
		bool IsDebugMode
		{
			get;
		}
	}
}