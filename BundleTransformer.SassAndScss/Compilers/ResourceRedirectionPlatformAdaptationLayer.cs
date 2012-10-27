namespace BundleTransformer.SassAndScss.Compilers
{
	using System;
	using System.IO;
	using System.Reflection;

	using Microsoft.Scripting;

	/// <summary>
	/// Resource redirection platform adaptation layer
	/// </summary>
	internal sealed class ResourceRedirectionPlatformAdaptationLayer : PlatformAdaptationLayer
	{
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
			var assembly = Assembly.GetExecutingAssembly();
			var resourceName = PathToResourceName(path);

			try 
			{
				if (assembly.GetManifestResourceStream(resourceName) != null) 
				{
					return true;
				}
			} 
			catch
			{ }

			return base.FileExists(path);
		}

		public override Stream OpenInputFileStream(string path)
		{
			var assembly = Assembly.GetExecutingAssembly();
			var resourceName = PathToResourceName(path);

			try 
			{
				return assembly.GetManifestResourceStream(resourceName);
			}
			catch
			{ }

			if (OnOpenInputFileStream != null)
			{
				OnOpenInputFileStream(GetFullPath(path));
			}

			return base.OpenInputFileStream(path);
		}

		public override Stream OpenInputFileStream(string path, FileMode mode, FileAccess access, 
			FileShare share)
		{
			if (OnOpenInputFileStream != null)
			{
				OnOpenInputFileStream(GetFullPath(path));
			}

			return base.OpenInputFileStream(path, mode, access, share);
		}

		public override Stream OpenInputFileStream(string path, FileMode mode, FileAccess access, 
			FileShare share, int bufferSize)
		{
			if (OnOpenInputFileStream != null)
			{
				OnOpenInputFileStream(GetFullPath(path));
			}

			return base.OpenInputFileStream(path, mode, access, share, bufferSize);
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
