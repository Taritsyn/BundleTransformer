namespace BundleTransformer.SassAndScss.Compilers
{
	using System;
	using System.IO;
	using System.Reflection;
	using System.Text.RegularExpressions;
	using System.Web;

	using Microsoft.Scripting;

	/// <summary>
	/// Resource redirection platform adaptation layer
	/// </summary>
	internal sealed class ResourceRedirectionPlatformAdaptationLayer : PlatformAdaptationLayer
	{
		/// <summary>
		/// Regular expression for working with physical file paths
		/// </summary>
		private static readonly Regex _physicalFilePathRegExp = new Regex(@"^[a-zA-Z]:(\\|/)", 
			RegexOptions.Compiled);

		/// <summary>
		/// Resources namespace
		/// </summary>
		private readonly string _resourcesNamespace;

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
		}


		public override bool FileExists(string path)
		{
			Stream rubyResourceStream = GetRubyResourceStream(path);
			if (rubyResourceStream != null)
			{
				return true;
			}

			string physicalPath = GetAssetPhysicalPath(path);

			return base.FileExists(physicalPath);
		}

		public override Stream OpenInputFileStream(string path)
		{
			Stream rubyResourceStream = GetRubyResourceStream(path);
			if (rubyResourceStream != null)
			{
				return rubyResourceStream;
			}

			string physicalPath = GetAssetPhysicalPath(path);
			if (OnOpenInputFileStream != null)
			{
				OnOpenInputFileStream(physicalPath);
			}

			return base.OpenInputFileStream(physicalPath);
		}

		public override Stream OpenInputFileStream(string path, FileMode mode, FileAccess access, 
			FileShare share)
		{
			string physicalPath = GetAssetPhysicalPath(path);
			if (OnOpenInputFileStream != null)
			{
				OnOpenInputFileStream(physicalPath);
			}

			return base.OpenInputFileStream(physicalPath, mode, access, share);
		}

		public override Stream OpenInputFileStream(string path, FileMode mode, FileAccess access, 
			FileShare share, int bufferSize)
		{
			string physicalPath = GetAssetPhysicalPath(path);
			if (OnOpenInputFileStream != null)
			{
				OnOpenInputFileStream(physicalPath);
			}

			return base.OpenInputFileStream(physicalPath, mode, access, share, bufferSize);
		}

		/// <summary>
		/// Gets a specified Ruby resource from this assembly
		/// </summary>
		/// <param name="path">File path</param>
		/// <returns>A System.IO.Stream representing the Ruby resource;
		/// null if no resources were specified during compilation, 
		/// or if the resource is not visible to the caller</returns>
		private Stream GetRubyResourceStream(string path)
		{
			Stream rubyResourceStream = null;
			string extension = Path.GetExtension(path);

			if (FileExtensionHelper.IsRuby(extension))
			{
				Assembly assembly = Assembly.GetExecutingAssembly();
				string resourceName = PathToResourceName(path);

				try
				{
					rubyResourceStream = assembly.GetManifestResourceStream(resourceName);
				}
				catch
				{
					rubyResourceStream = null;
				}
			}

			return rubyResourceStream;
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

		/// <summary>
		/// Gets a physical path of Sass- or SCSS-asset
		/// </summary>
		/// <param name="path">File path</param>
		/// <returns>Physical file path</returns>
		private string GetAssetPhysicalPath(string path)
		{
			string physicalPath = path;
			string extension = Path.GetExtension(path);

			if (FileExtensionHelper.IsSass(extension) || FileExtensionHelper.IsScss(extension))
			{
				bool isPhysicalPath = _physicalFilePathRegExp.IsMatch(path);
				if (!isPhysicalPath)
				{
					physicalPath = HttpContext.Current.Server.MapPath(path);
				}
			}

			return physicalPath;
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
