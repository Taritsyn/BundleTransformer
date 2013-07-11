namespace BundleTransformer.Core.FileSystem
{
	using System;
	using System.IO;
	using System.Text.RegularExpressions;

	using Core;
	using Resources;

	/// <summary>
	/// Common relative path resolver
	/// </summary>
	public class CommonRelativePathResolver : IRelativePathResolver
	{
		/// <summary>
		/// Regular expression for determine protocol in URL
		/// </summary>
		private static readonly Regex _protocolRegExp = new Regex(@"^(https?|ftp)\://",
			RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Virtual file system wrapper
		/// </summary>
		private readonly IVirtualFileSystemWrapper _virtualFileSystemWrapper;


		/// <summary>
		/// Constructs instance of common relative path resolver
		/// </summary>
		public CommonRelativePathResolver()
			: this(BundleTransformerContext.Current.GetVirtualFileSystemWrapper())
		{ }

		/// <summary>
		/// Constructs instance of common relative path resolver
		/// </summary>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		public CommonRelativePathResolver(IVirtualFileSystemWrapper virtualFileSystemWrapper)
		{
			_virtualFileSystemWrapper = virtualFileSystemWrapper;
		}


		/// <summary>
		/// Transforms relative path to absolute
		/// </summary>
		/// <param name="basePath">The base path</param>
		/// <param name="relativePath">The relative path</param>
		public string ResolveRelativePath(string basePath, string relativePath)
		{
			if (string.IsNullOrWhiteSpace(basePath))
			{
				throw new ArgumentException(Strings.Common_ValueIsEmpty, "basePath");
			}

			if (string.IsNullOrWhiteSpace(relativePath))
			{
				throw new ArgumentException(Strings.Common_ValueIsEmpty, "relativePath");
			}

			string newRelativePath = Utils.ProcessBackSlashesInUrl(relativePath);

			if (newRelativePath.StartsWith("/") || _protocolRegExp.IsMatch(newRelativePath))
			{
				return newRelativePath;
			}

			if (newRelativePath.StartsWith("~/"))
			{
				return _virtualFileSystemWrapper.ToAbsolutePath(newRelativePath);
			}

			string absolutePath;
			string newBasePath = Utils.ProcessBackSlashesInUrl(
				_virtualFileSystemWrapper.ToAbsolutePath(Path.GetDirectoryName(basePath)) + @"/");

			if (newRelativePath.StartsWith("../") || newRelativePath.StartsWith("./"))
			{
				string hash = string.Empty;
				int hashPosition = newRelativePath.IndexOf('#');
				if (hashPosition != -1)
				{
					hash = newRelativePath.Substring(hashPosition + 1);
					newRelativePath = newRelativePath.Substring(0, hashPosition);
				}

				const string fakeSiteUrl = "http://bundletransformer.codeplex.com/";
				var baseUri = new Uri(Utils.CombineUrls(fakeSiteUrl, newBasePath), UriKind.Absolute);

				var absoluteUri = new Uri(baseUri, newRelativePath);
				absolutePath = absoluteUri.PathAndQuery;
				if (hash.Length > 0)
				{
					absolutePath += "#" + hash;
				}
			}
			else
			{
				absolutePath = Utils.CombineUrls(newBasePath, newRelativePath);
			}

			return absolutePath;
		}
	}
}
