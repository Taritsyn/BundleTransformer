namespace BundleTransformer.Core.Resolvers
{
	using System;
	using System.Collections.Generic;
	using System.Web;
	using System.Web.Optimization;

	using Resources;

	/// <summary>
	/// Custom bundle resolver, that required in order to the debugging HTTP-handler can use
	/// transformations of the corresponding bundle
	/// </summary>
	public sealed class CustomBundleResolver : IBundleResolver
	{
		/// <summary>
		/// Collection of bundles
		/// </summary>
		private readonly BundleCollection _bundles;

		/// <summary>
		/// HTTP context
		/// </summary>
		private HttpContextBase _httpContext;

		/// <summary>
		/// Gets or sets a HTTP context
		/// </summary>
		internal HttpContextBase Context
		{
			get
			{
				return _httpContext ?? new HttpContextWrapper(HttpContext.Current);
			}
			set
			{
				_httpContext = value;
			}
		}


		/// <summary>
		/// Constructs a instance of the <see cref="T:System.Web.Optimization.CustomBundleResolver"/> class
		/// </summary>
		public CustomBundleResolver()
		  : this(BundleTable.Bundles)
		{ }

		/// <summary>
		/// Constructs a instance of the <see cref="T:System.Web.Optimization.CustomBundleResolver"/> class
		/// with the specified bundle
		/// </summary>
		/// <param name="bundles">Collection of bundles</param>
		public CustomBundleResolver(BundleCollection bundles)
		  : this(bundles, null)
		{ }

		/// <summary>
		/// Constructs a instance of the <see cref="T:System.Web.Optimization.CustomBundleResolver"/> class
		/// with the specified bundle and context
		/// </summary>
		/// <param name="bundles">Collection of bundles</param>
		/// <param name="context">HTTP context</param>
		public CustomBundleResolver(BundleCollection bundles, HttpContextBase context)
		{
			_bundles = bundles;
			Context = context;
		}


		/// <summary>
		/// Determines if the virtual path is to a bundle
		/// </summary>
		/// <param name="virtualPath">Virtual path of bundle</param>
		/// <returns>Result of check (true - is virtual path; false - is not virtual path)</returns>
		public bool IsBundleVirtualPath(string virtualPath)
		{
			if (ValidateVirtualPath(virtualPath, "virtualPath") != null)
			{
				return false;
			}

			return (_bundles.GetBundleFor(virtualPath) != null);
		}

		/// <summary>
		/// Gets a enumeration of actual file paths to the contents of bundle
		/// </summary>
		/// <param name="bundleVirtualPath">Virtual path of bundle</param>
		/// <returns>Actual file paths to the contents of bundle</returns>
		public IEnumerable<string> GetBundleContents(string bundleVirtualPath)
		{
			if (ValidateVirtualPath(bundleVirtualPath, "bundleVirtualPath") != null)
			{
				return null;
			}

			Bundle bundleFor = _bundles.GetBundleFor(bundleVirtualPath);
			if (bundleFor == null)
			{
				return null;
			}

			var list = new List<string>();
			var context = new BundleContext(Context, _bundles, bundleVirtualPath);
			var bundleFiles = GetBundleResponse(bundleFor, context).Files;
			string bundleVirtualPathEncoded = Context.Server.UrlEncode(bundleVirtualPath);

			foreach (BundleFile bundleFile in bundleFiles)
			{
				string fileVirtualPath = bundleFile.IncludedVirtualPath;

				// Store a information about bundle to the virtual path of file
				string processedFileVirtualPath = fileVirtualPath;
				if (fileVirtualPath.IndexOf("?", StringComparison.Ordinal) != -1)
				{
					processedFileVirtualPath += "&";
				}
				else
				{
					processedFileVirtualPath += "?";
				}
				processedFileVirtualPath += Constants.Common.BundleVirtualPathQueryStringParameterName + "=" + bundleVirtualPathEncoded;

				list.Add(processedFileVirtualPath);
			}

			return list;
		}

		/// <summary>
		/// Gets a versioned url for bundle or returns the virtual path unchanged if it does not point to a bundle
		/// </summary>
		/// <param name="virtualPath">Virtual file path</param>
		/// <returns>Versioned url for bundle</returns>
		public string GetBundleUrl(string virtualPath)
		{
			if (ValidateVirtualPath(virtualPath, "virtualPath") != null)
			{
				return null;
			}

			return _bundles.ResolveBundleUrl(virtualPath);
		}

		private static BundleResponse GetBundleResponse(Bundle bundle, BundleContext context)
		{
			BundleResponse response = bundle.CacheLookup(context);
			if (response == null || context.EnableInstrumentation)
			{
				response = bundle.GenerateBundleResponse(context);
				bundle.UpdateCache(context, response);
			}

			return response;
		}

		private static Exception ValidateVirtualPath(string virtualPath, string argumentName)
		{
			if (string.IsNullOrWhiteSpace(virtualPath))
			{
				return new ArgumentException(
					string.Format(Strings.Common_ArgumentIsEmpty, argumentName), argumentName);
			}

			if (!virtualPath.StartsWith("~/", StringComparison.OrdinalIgnoreCase))
			{
				return new ArgumentException(
					string.Format(Strings.UrlMappings_OnlyAppRelativeUrlAllowed, virtualPath), argumentName);
			}

			return null;
		}
	}
}