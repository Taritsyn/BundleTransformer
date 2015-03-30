namespace BundleTransformer.Core.Filters
{
	using System.Collections.Generic;
	using System.IO;

	using Assets;
	using FileSystem;
	using Resources;

	/// <summary>
	/// Base class of filter is responsible for choosing appropriate
	/// version of asset file, depending on current mode of
	/// web application (debug mode - debug versions of asset files;
	/// release mode - minified versions)
	/// </summary>
	public abstract class FileExtensionsFilterBase : IFilter
	{
		/// <summary>
		/// Virtual file system wrapper
		/// </summary>
		private readonly IVirtualFileSystemWrapper _virtualFileSystemWrapper;

		/// <summary>
		/// Gets or sets a flag that web application is in debug mode
		/// </summary>
		public bool IsDebugMode
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to allow usage of pre-minified files
		/// </summary>
		public bool UsePreMinifiedFiles
		{
			get;
			set;
		}

		/// <summary>
		/// Gets a flag that indicating to use of pre-minified files
		/// </summary>
		public bool UsageOfPreMinifiedFilesEnabled
		{
			get
			{
				return UsePreMinifiedFiles && !IsDebugMode;
			}
		}


		/// <summary>
		/// Constructs a instance of the file extensions filter
		/// </summary>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		protected FileExtensionsFilterBase(IVirtualFileSystemWrapper virtualFileSystemWrapper)
		{
			_virtualFileSystemWrapper = virtualFileSystemWrapper;
		}


		/// <summary>
		/// Chooses a appropriate versions of files, depending on
		/// current mode of web application
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <returns>Set of assets adapted for current mode of web application</returns>
		public abstract IList<IAsset> Transform(IList<IAsset> assets);

		/// <summary>
		/// Gets a version of virtual file path, most appropriate for
		/// current mode of web application
		/// </summary>
		/// <param name="assetVirtualPath">Asset virtual file path</param>
		/// <param name="isMinified">Flag indicating what appropriate
		/// virtual file path version of asset is minified</param>
		/// <returns>Path to file, corresponding current mode
		/// of web application</returns>
		protected abstract string GetAppropriateAssetFilePath(string assetVirtualPath, out bool isMinified);

		/// <summary>
		/// Gets a appropriate version of asset virtual file path based
		/// on list of file extensions
		/// </summary>
		/// <param name="assetVirtualPath">Asset virtual file path</param>
		/// <param name="extensions">List of file extensions</param>
		/// <returns>Asset virtual file path with modified extension</returns>
		protected string ProbeAssetFilePath(string assetVirtualPath, string[] extensions)
		{
			string changedVirtualPath = string.Empty;

			foreach (string extension in extensions)
			{
				changedVirtualPath = Path.ChangeExtension(assetVirtualPath, extension);
				if (_virtualFileSystemWrapper.FileExists(changedVirtualPath))
				{
					return changedVirtualPath;
				}
			}

			throw new FileNotFoundException(string.Format(Strings.Common_FileNotExist, changedVirtualPath));
		}
	}
}