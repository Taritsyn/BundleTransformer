namespace BundleTransformer.Core.Filters
{
	using System;
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
		/// File system wrapper
		/// </summary>
		private readonly IFileSystemWrapper _fileSystemWrapper;

		/// <summary>
		/// Gets or sets a flag that web application is in debug mode
		/// </summary>
		public bool IsDebugMode
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs instance of the file extensions filter
		/// </summary>
		/// <param name="fileSystemWrapper">File system wrapper</param>
		protected FileExtensionsFilterBase(IFileSystemWrapper fileSystemWrapper)
		{
			_fileSystemWrapper = fileSystemWrapper;
		}


		/// <summary>
		/// Chooses appropriate versions of files, depending on 
		/// current mode of web application
		/// </summary>
		/// <param name="assets">Set of assets</param>
		/// <returns>Set of assets adapted for current mode of web application</returns>
		public abstract IList<IAsset> Transform(IList<IAsset> assets);

		/// <summary>
		/// Gets version of file path, most appropriate for 
		/// current mode of web application
		/// </summary>
		/// <param name="assetPath">Asset file path</param>
		/// <param name="isMinified">Flag indicating what appropriate 
		/// file path version of asset is minified</param>
		/// <returns>Path to file, corresponding current mode 
		/// of web application</returns>
		protected abstract string GetAppropriateAssetFilePath(string assetPath, out bool isMinified);

		/// <summary>
		/// Gets appropriate version of asset file path based 
		/// on list of file extensions
		/// </summary>
		/// <param name="assetPath">Asset file path</param>
		/// <param name="extensions">List of file extensions</param>
		/// <returns>Asset file path with modified extension</returns>
		protected string ProbeAssetFilePath(string assetPath, string[] extensions)
		{
			string changedFilePath = string.Empty;

			foreach (string extension in extensions)
			{
				changedFilePath = Path.ChangeExtension(assetPath, extension);
				if (_fileSystemWrapper.FileExists(changedFilePath))
				{
					return changedFilePath;
				}
			}

			throw new FileNotFoundException(string.Format(Strings.Common_FileNotExist, changedFilePath));
		}
	}
}
