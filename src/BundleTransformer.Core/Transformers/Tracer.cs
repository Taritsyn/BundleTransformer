using System.Collections.Generic;
using System.Text;
using System.Web.Optimization;

using AdvancedStringBuilder;

using BundleTransformer.Core.Utilities;

namespace BundleTransformer.Core.Transformers
{
	/// <summary>
	/// Transformer that responsible to output trace information
	/// </summary>
	public sealed class Tracer : IBundleTransform
	{
		/// <summary>
		/// Displays trace information
		/// </summary>
		/// <param name="context">Object BundleContext</param>
		/// <param name="response">Object BundleResponse</param>
		public void Process(BundleContext context, BundleResponse response)
		{
			var stringBuilderPool = StringBuilderPool.Shared;
			StringBuilder contentBuilder = stringBuilderPool.Rent();

			contentBuilder.AppendLine("*************************************************************************************");
			contentBuilder.AppendLine("* BUNDLE RESPONSE                                                                   *");
			contentBuilder.AppendLine("*************************************************************************************");

			IEnumerable<BundleFile> responseFiles = response.Files;
			foreach (var responseFile in responseFiles)
			{
				contentBuilder.AppendLine("  " + responseFile.IncludedVirtualPath);
			}

			contentBuilder.AppendLine();

			contentBuilder.AppendLine("*************************************************************************************");
			contentBuilder.AppendLine("* BUNDLE COLLECTION                                                                 *");
			contentBuilder.AppendLine("*************************************************************************************");
			BundleCollection bundles = context.BundleCollection;
			foreach (var bundle in bundles)
			{
				contentBuilder.AppendFormatLine("-= {0} =-", bundle.Path);

				IEnumerable<BundleFile> bundleFiles = bundle.EnumerateFiles(context);
				foreach (var bundleFile in bundleFiles)
				{
					contentBuilder.AppendLine("  " + bundleFile.IncludedVirtualPath);
				}

				contentBuilder.AppendLine();
			}

			string content = contentBuilder.ToString();
			stringBuilderPool.Return(contentBuilder);

			response.ContentType = "text/plain";
			response.Content = content;
		}
	}
}