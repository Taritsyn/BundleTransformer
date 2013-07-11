namespace BundleTransformer.Tests.Core.Filters
{
	using System.Collections.Generic;

	using Moq;
	using NUnit.Framework;

	using BundleTransformer.Core;
	using BundleTransformer.Core.Assets;
	using BundleTransformer.Core.FileSystem;
	using BundleTransformer.Core.Filters;

	[TestFixture]
	public class CssDuplicateAssetsFilterTests
	{
		private const string STYLES_DIRECTORY_VIRTUAL_PATH = "~/Content/";
		private const string ALTERNATIVE_STYLES_DIRECTORY_VIRTUAL_PATH = @"~/AlternativeContent/";

		private IVirtualFileSystemWrapper _virtualFileSystemWrapper;

		[TestFixtureSetUp]
		public void SetUp()
		{
			_virtualFileSystemWrapper = (new Mock<IVirtualFileSystemWrapper>()).Object;
		}

		[Test]
		public void DuplicateCssAssetsRemovedIsCorrect()
		{
			// Arrange
			var siteAsset = new Asset(Utils.CombineUrls(STYLES_DIRECTORY_VIRTUAL_PATH, "Site.css"),
				_virtualFileSystemWrapper);
			var jqueryUiAccordionMinAsset = new Asset(Utils.CombineUrls(STYLES_DIRECTORY_VIRTUAL_PATH,
				@"\themes\base\jquery.ui.accordion.min.css"), _virtualFileSystemWrapper);
			var testCssComponentsPathsAsset = new Asset(Utils.CombineUrls(ALTERNATIVE_STYLES_DIRECTORY_VIRTUAL_PATH,
				@"\css\TestCssComponentsPaths.css"), _virtualFileSystemWrapper);
			var testCssComponentsPathsMinAsset = new Asset(Utils.CombineUrls(
				ALTERNATIVE_STYLES_DIRECTORY_VIRTUAL_PATH, @"\css\TestCssComponentsPaths.min.css"), 
				_virtualFileSystemWrapper);
			var siteDuplicateAsset = new Asset(Utils.CombineUrls(STYLES_DIRECTORY_VIRTUAL_PATH, "site.css"),
				_virtualFileSystemWrapper);

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
			Assert.AreEqual(Utils.CombineUrls(STYLES_DIRECTORY_VIRTUAL_PATH, "Site.css"), 
				processedAssets[0].VirtualPath);
			Assert.AreEqual(Utils.CombineUrls(STYLES_DIRECTORY_VIRTUAL_PATH, 
				@"\themes\base\jquery.ui.accordion.min.css"), processedAssets[1].VirtualPath);
			Assert.AreEqual(Utils.CombineUrls(ALTERNATIVE_STYLES_DIRECTORY_VIRTUAL_PATH, 
				@"\css\TestCssComponentsPaths.css"), processedAssets[2].VirtualPath);
		}

		[TestFixtureTearDown]
		public void TearDown()
		{
			_virtualFileSystemWrapper = null;
		}
	}
}
