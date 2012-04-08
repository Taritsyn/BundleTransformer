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
		private const string STYLES_DIRECTORY_PATH = 
			@"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\Content\";
		private const string ALTERNATIVE_STYLES_DIRECTORY_PATH = 
			@"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\AlternativeContent\";

		private HttpApplicationInfo _applicationInfo;
		private IFileSystemWrapper _fileSystemWrapper;

		[TestFixtureSetUp]
		public void SetUp()
		{
			_applicationInfo = new HttpApplicationInfo("/", 
				@"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\");
			_fileSystemWrapper = (new Mock<IFileSystemWrapper>()).Object;
		}

		[Test]
		public void DuplicateCssAssetsRemovedIsCorrect()
		{
			// Arrange
			var siteAsset = new Asset(Path.Combine(STYLES_DIRECTORY_PATH, "Site.css"),
				_applicationInfo, _fileSystemWrapper);
			var jqueryUiAccordionMinAsset = new Asset(Path.Combine(STYLES_DIRECTORY_PATH,
				@"\themes\base\jquery.ui.accordion.min.css"), _applicationInfo, _fileSystemWrapper);
			var testCssComponentsPathsAsset = new Asset(Path.Combine(ALTERNATIVE_STYLES_DIRECTORY_PATH,
				@"\css\TestCssComponentsPaths.css"), _applicationInfo, _fileSystemWrapper);
			var testCssComponentsPathsMinAsset = new Asset(Path.Combine(ALTERNATIVE_STYLES_DIRECTORY_PATH,
				@"\css\TestCssComponentsPaths.min.css"), _applicationInfo, _fileSystemWrapper);
			var siteDuplicateAsset = new Asset(Path.Combine(STYLES_DIRECTORY_PATH, "site.css"),
				_applicationInfo, _fileSystemWrapper);

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
			Assert.AreEqual(Path.Combine(STYLES_DIRECTORY_PATH, @"\themes\base\jquery.ui.accordion.min.css"), 
				processedAssets[1].Path);
			Assert.AreEqual(Path.Combine(ALTERNATIVE_STYLES_DIRECTORY_PATH, @"\css\TestCssComponentsPaths.css"),
				processedAssets[2].Path);
		}

		[TestFixtureTearDown]
		public void TearDown()
		{
			_applicationInfo = null;
			_fileSystemWrapper = null;
		}
	}
}
