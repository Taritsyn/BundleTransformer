namespace BundleTransformer.Tests.Core.Filters
{
	using System.Collections.Generic;
	using System.IO;

	using Moq;
	using NUnit.Framework;

	using BundleTransformer.Core.Assets;
	using BundleTransformer.Core.FileSystem;
	using BundleTransformer.Core.Filters;

	[TestFixture]
	public class CssDuplicateAssetsFilterTests
	{
		private const string APPLICATION_ROOT_PATH
			= @"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\";
		private const string STYLES_DIRECTORY_PATH
			= @"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\Content\";
		private const string ALTERNATIVE_STYLES_DIRECTORY_PATH
			= @"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\AlternativeContent\";

		[Test]
		public void DuplicateCssAssetsRemovedIsCorrect()
		{
			// Arrange
			var fileSystemWrapper = (new Mock<IFileSystemWrapper>()).Object;

			var siteAsset = new Asset(Path.Combine(STYLES_DIRECTORY_PATH, "Site.css"), 
				APPLICATION_ROOT_PATH, fileSystemWrapper);
			var jqueryUiAccordionMinAsset = new Asset(Path.Combine(STYLES_DIRECTORY_PATH,
				@"\themes\base\jquery.ui.accordion.min.css"), APPLICATION_ROOT_PATH, fileSystemWrapper);
			var testCssComponentsPathsAsset = new Asset(Path.Combine(ALTERNATIVE_STYLES_DIRECTORY_PATH, 
				@"\css\TestCssComponentsPaths.css"), APPLICATION_ROOT_PATH, fileSystemWrapper);
			var testCssComponentsPathsMinAsset = new Asset(Path.Combine(ALTERNATIVE_STYLES_DIRECTORY_PATH,
				@"\css\TestCssComponentsPaths.min.css"), APPLICATION_ROOT_PATH, fileSystemWrapper);
			var siteDuplicateAsset = new Asset(Path.Combine(STYLES_DIRECTORY_PATH, "site.css"),
				APPLICATION_ROOT_PATH, fileSystemWrapper);

			IList<IAsset> assets = new List<IAsset>
			{
			    siteAsset,
			    jqueryUiAccordionMinAsset,
			    testCssComponentsPathsAsset,
			    testCssComponentsPathsMinAsset,
			    siteDuplicateAsset
			};

			var cssDuplicateFilter = new CssDuplicateAssetsFilter();

			// Act
			IList<IAsset> processedAssets = cssDuplicateFilter.Transform(assets);

			// Assert
			Assert.AreEqual(Path.Combine(STYLES_DIRECTORY_PATH, @"Site.css"), processedAssets[0].Path);
			Assert.AreEqual(Path.Combine(STYLES_DIRECTORY_PATH, @"\themes\base\jquery.ui.accordion.css"), 
				processedAssets[1].Path);
			Assert.AreEqual(Path.Combine(ALTERNATIVE_STYLES_DIRECTORY_PATH, @"\css\TestCssComponentsPaths.css"),
				processedAssets[2].Path);
		}
	}
}
