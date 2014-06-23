using System.Collections;

namespace BundleTransformer.Tests.Core.Filters
{
	using System.Collections.Generic;

	using Moq;
	using NUnit.Framework;

	using BundleTransformer.Core.Assets;
	using BundleTransformer.Core.FileSystem;
	using BundleTransformer.Core.Filters;
	using BundleTransformer.Core.Helpers;

	[TestFixture]
	public class StyleDuplicateAssetsFilterTests
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
		public void DuplicateStyleAssetsRemovedIsCorrect()
		{
			// Arrange
			var siteAsset = new Asset(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, 
				"Site.css"), _virtualFileSystemWrapper);
			var jqueryUiAccordionMinAsset = new Asset(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"themes/base/jquery.ui.accordion.min.css"), _virtualFileSystemWrapper);
			var testCssComponentsPathsAsset = new Asset(UrlHelpers.Combine(ALTERNATIVE_STYLES_DIRECTORY_VIRTUAL_PATH,
				"css/TestCssComponentsPaths.css"), _virtualFileSystemWrapper);
			var testCssComponentsPathsMinAsset = new Asset(UrlHelpers.Combine(
				ALTERNATIVE_STYLES_DIRECTORY_VIRTUAL_PATH, 
				"css/TestCssComponentsPaths.min.css"), _virtualFileSystemWrapper);
			var siteDuplicateAsset = new Asset(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"site.css"), _virtualFileSystemWrapper);
			var testLessAsset = new Asset(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, 
				"less/TestLess.less"), _virtualFileSystemWrapper);
			var testSassAsset = new Asset(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"sass/TestSass.sass"), _virtualFileSystemWrapper);
			var testScssAsset = new Asset(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"scss/TestScss.scss"), _virtualFileSystemWrapper);
			var duplicateTestLessAsset = new Asset(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"LESS/TestLess.less"), _virtualFileSystemWrapper);

			IList<IAsset> assets = new List<IAsset>
			{
			    siteAsset,
			    jqueryUiAccordionMinAsset,
			    testCssComponentsPathsAsset,
			    testCssComponentsPathsMinAsset,
			    siteDuplicateAsset,
				testLessAsset,
				testSassAsset,
				testScssAsset,
				duplicateTestLessAsset
			};

			var styleDuplicateFilter = new StyleDuplicateAssetsFilter();

			// Act
			IList<IAsset> processedAssets = styleDuplicateFilter.Transform(assets);

			// Assert
			Assert.AreEqual(6, processedAssets.Count);
			Assert.AreEqual(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, 
				"Site.css"), processedAssets[0].VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, 
				"themes/base/jquery.ui.accordion.min.css"), processedAssets[1].VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(ALTERNATIVE_STYLES_DIRECTORY_VIRTUAL_PATH, 
				"css/TestCssComponentsPaths.css"), processedAssets[2].VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"less/TestLess.less"), processedAssets[3].VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"sass/TestSass.sass"), processedAssets[4].VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"scss/TestScss.scss"), processedAssets[5].VirtualPath);
		}

		[TestFixtureTearDown]
		public void TearDown()
		{
			_virtualFileSystemWrapper = null;
		}
	}
}