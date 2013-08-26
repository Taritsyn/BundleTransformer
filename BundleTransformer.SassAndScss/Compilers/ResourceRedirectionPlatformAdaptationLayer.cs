namespace BundleTransformer.SassAndScss.Compilers
{
	using System;
	using System.IO;
	using System.Reflection;

	using Microsoft.Scripting;

	using Core;
	using Core.Assets;
	using Core.Resources;
	using Helpers;

	/// <summary>
	/// Resource redirection platform adaptation layer
	/// </summary>
	internal sealed class ResourceRedirectionPlatformAdaptationLayer : PlatformAdaptationLayer
	{
		/// <summary>
		/// Resources namespace
		/// </summary>
		private readonly string _resourcesNamespace;

		/// <summary>
		/// List of dependencies
		/// </summary>
		private DependencyCollection _dependencies;

		/// <summary>
		/// Gets or sets a list of dependencies
		/// </summary>
		public DependencyCollection Dependencies
		{
			get { return _dependencies; }
			set { _dependencies = value; }
		}

		public Action<string> OnOpenInputFileStream
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs instance of Resource redirection platform adaptation layer
		/// </summary>
		/// <param name="resourcesNamespace">Resources namespace</param>
		public ResourceRedirectionPlatformAdaptationLayer(string resourcesNamespace)
		{
			_resourcesNamespace = resourcesNamespace;
			_dependencies = null;
		}


		public override bool FileExists(string path)
		{
			string extension = Path.GetExtension(path);

			if (FileExtensionHelpers.IsRuby(extension))
			{
				Stream rubyResourceStream = GetResourceStream(path);
				if (rubyResourceStream != null)
				{
					return true;
				}
			}
			else if (FileExtensionHelpers.IsSassOrScss(extension))
			{
				if (_dependencies.ContainsUrl(path))
				{
					return true;
				}
			}

			return base.FileExists(path);
		}

		public override Stream OpenInputFileStream(string path)
		{
			Stream fileStream = GetVirtualFileStream(path);
			if (fileStream != null)
			{
				return fileStream;
			}

			if (OnOpenInputFileStream != null)
			{
				OnOpenInputFileStream(path);
			}

			return base.OpenInputFileStream(path);
		}

		public override Stream OpenInputFileStream(string path, FileMode mode, FileAccess access, 
			FileShare share)
		{
			Stream fileStream = GetVirtualFileStream(path);
			if (fileStream != null)
			{
				return fileStream;
			}

			if (OnOpenInputFileStream != null)
			{
				OnOpenInputFileStream(path);
			}

			return base.OpenInputFileStream(path, mode, access, share);
		}

		public override Stream OpenInputFileStream(string path, FileMode mode, FileAccess access, 
			FileShare share, int bufferSize)
		{
			Stream fileStream = GetVirtualFileStream(path);
			if (fileStream != null)
			{
				return fileStream;
			}

			if (OnOpenInputFileStream != null)
			{
				OnOpenInputFileStream(path);
			}

			return base.OpenInputFileStream(path, mode, access, share, bufferSize);
		}

		/// <summary>
		/// Gets a virtual file stream
		/// </summary>
		/// <param name="path">File path</param>
		/// <returns>Virtual file stream</returns>
		private Stream GetVirtualFileStream(string path)
		{
			Stream fileStream;
			string extension = Path.GetExtension(path);

			if (FileExtensionHelpers.IsRuby(extension))
			{
				fileStream = GetResourceStream(path);
				if (fileStream != null)
				{
					return fileStream;
				}

				throw new FileNotFoundException(
					string.Format(Strings.Common_FileNotExist, path));
			}

			if (FileExtensionHelpers.IsSassOrScss(extension))
			{
				fileStream = GetAssetFileStream(path);
				if (fileStream != null)
				{
					return fileStream;
				}

				throw new FileNotFoundException(
					string.Format(Strings.Common_FileNotExist, path));
			}

			return null;
		}

		/// <summary>
		/// Gets a specified embedded resource from this assembly
		/// </summary>
		/// <param name="path">File path</param>
		/// <returns>A System.IO.Stream representing the embedded resource;
		/// null if no resources were specified during compilation, 
		/// or if the resource is not visible to the caller</returns>
		private Stream GetResourceStream(string path)
		{
			Stream resourceStream;
			Assembly assembly = Assembly.GetExecutingAssembly();
			string resourceName = PathToResourceName(path);

			try
			{
				resourceStream = assembly.GetManifestResourceStream(resourceName);
			}
			catch
			{
				resourceStream = null;
			}

			return resourceStream;
		}

		/// <summary>
		/// Gets a file stream of the Sass- and SCSS-assets
		/// </summary>
		/// <param name="path">File path</param>
		/// <returns>File stream of the Sass- and SCSS-assets</returns>
		private Stream GetAssetFileStream(string path)
		{
			Stream assetFileStream = null;
			Dependency dependency = _dependencies.GetByUrl(path);
			if (dependency != null)
			{
				assetFileStream = Utils.GetStreamFromString(dependency.Content);
			}

			return assetFileStream;
		}

		/// <summary>
		/// Converts file path to the resource name
		/// </summary>
		/// <param name="path">File path</param>
		/// <returns>Resource name</returns>
		private string PathToResourceName(string path) {
			return path
				.Replace("1.9.1", "_1._9._1")
				.Replace('\\', '.')
				.Replace('/', '.')
				.Replace(@"R:", _resourcesNamespace)
				.TrimStart('.')
				;
		}

		#region Disabled methods
		public override void CreateDirectory(string path)
		{
			throw new NotImplementedException();
		}

		public override void DeleteDirectory(string path, bool recursive)
		{
			throw new NotImplementedException();
		}

		public override void DeleteFile(string path, bool deleteReadOnly)
		{
			throw new NotImplementedException();
		}

		public override void MoveFileSystemEntry(string sourcePath, string destinationPath)
		{
			throw new NotImplementedException();
		}

		public override void SetEnvironmentVariable(string key, string value)
		{
			throw new NotImplementedException();
		}

		public override Stream OpenOutputFileStream(string path)
		{
			throw new NotImplementedException();
		}
		#endregion
	}
}