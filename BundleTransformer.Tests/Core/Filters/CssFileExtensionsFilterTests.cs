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
	public class CssFileExtensionsFilterTests
	{
		private const string STYLES_DIRECTORY_PATH = 
			@"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\Content\";
		private const string ALTERNATIVE_STYLES_DIRECTORY_PATH = 
			@"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\AlternativeContent\";

		private HttpApplicationInfo _applicationInfo;
		private IFileSystemWrapper _fileSystemWrapper;
		private IList<IAsset> _testAssets;

		[TestFixtureSetUp]
		public void SetUp()
		{
			_applicationInfo = new HttpApplicationInfo("/", 
				@"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\");

			var fileSystemMock = new Mock<IFileSystemWrapper>();

			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(STYLES_DIRECTORY_PATH, "Site.css")))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(STYLES_DIRECTORY_PATH, "Site.min.css")))
				.Returns(false)
				;

			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(STYLES_DIRECTORY_PATH, 
					@"\themes\base\jquery.ui.accordion.css")))
				.Returns(false)
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(STYLES_DIRECTORY_PATH, 
					@"\themes\base\jquery.ui.accordion.min.css")))
				.Returns(true)
				;

			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(ALTERNATIVE_STYLES_DIRECTORY_PATH, 
					@"\css\TestCssComponentsPaths.css")))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(ALTERNATIVE_STYLES_DIRECTORY_PATH, 
					@"\css\TestCssComponentsPaths.min.css")))
				.Returns(true)
				;

			var siteAsset = new Asset(Path.Combine(STYLES_DIRECTORY_PATH, "Site.css"),
				_applicationInfo, _fileSystemWrapper);
			var jqueryUiAccordionAsset = new Asset(Path.Combine(STYLES_DIRECTORY_PATH,
				@"\themes\base\jquery.ui.accordion.min.css"), _applicationInfo, _fileSystemWrapper);
			var testCssComponentsPathsAsset = new Asset(Path.Combine(ALTERNATIVE_STYLES_DIRECTORY_PATH,
				@"\css\TestCssComponentsPaths.css"), _applicationInfo, _fileSystemWrapper);

			var testAssets = new List<IAsset>
			{
				siteAsset,
				jqueryUiAccordionAsset,
				testCssComponentsPathsAsset
			};

			_fileSystemWrapper = fileSystemMock.Object;
			_testAssets = testAssets;
		}

		[Test]
		public void ReplacementOfFileExtensionsInDebugModeIsCorrect()
		{
			// Arrange
			IList<IAsset> assets = _testAssets;
			var cssFileExtensionsFilter = new CssFileExtensionsFilter(_fileSystemWrapper)
			{
			    IsDebugMode = true
			};

			// Act
			IList<IAsset> processedAssets = cssFileExtensionsFilter.Transform(assets);
			IAsset siteAsset = processedAssets[0];
			IAsset jqueryUiAccordionAsset = processedAssets[1];
			IAsset testCssComponentsPathsAsset = processedAssets[2];

			// Assert
			Assert.AreEqual(Path.Combine(STYLES_DIRECTORY_PATH, "Site.css"), siteAsset.Path);
			Assert.AreEqual(Path.Combine(STYLES_DIRECTORY_PATH, @"\themes\base\jquery.ui.accordion.min.css"),
				jqueryUiAccordionAsset.Path);
			Assert.AreNotEqual(Path.Combine(STYLES_DIRECTORY_PATH, @"\themes\base\jquery.ui.accordion.css"),
				jqueryUiAccordionAsset.Path);
			Assert.AreEqual(Path.Combine(ALTERNATIVE_STYLES_DIRECTORY_PATH, @"\css\TestCssComponentsPaths.css"),
				testCssComponentsPathsAsset.Path);

			Assert.AreEqual(false, siteAsset.Minified);
			Assert.AreEqual(true, jqueryUiAccordionAsset.Minified);
			Assert.AreEqual(false, testCssComponentsPathsAsset.Minified);
		}

		[Test]
		public void ReplacementOfFileExtensionsInReleaseModeIsCorrect()
		{
			// Arrange
			IList<IAsset> assets = _testAssets;
			var cssFileExtensionsFilter = new CssFileExtensionsFilter(_fileSystemWrapper)
			{
			    IsDebugMode = false
			};

			// Act
			IList<IAsset> processedAssets = cssFileExtensionsFilter.Transform(assets);
			IAsset siteAsset = processedAssets[0];
			IAsset jqueryUiAccordionAsset = processedAssets[1];
			IAsset testCssComponentsPathsAsset = processedAssets[2];

			// Assert
			Assert.AreEqual(Path.Combine(STYLES_DIRECTORY_PATH, "Site.css"), siteAsset.Path);
			Assert.AreNotEqual(Path.Combine(STYLES_DIRECTORY_PATH, "Site.min.css"), siteAsset.Path);
			Assert.AreEqual(Path.Combine(STYLES_DIRECTORY_PATH, @"\themes\base\jquery.ui.accordion.min.css"), 
				jqueryUiAccordionAsset.Path);
			Assert.AreEqual(Path.Combine(ALTERNATIVE_STYLES_DIRECTORY_PATH, @"\css\TestCssComponentsPaths.min.css"),
				testCssComponentsPathsAsset.Path);

			Assert.AreEqual(false, siteAsset.Minified);
			Assert.AreEqual(true, jqueryUiAccordionAsset.Minified);
			Assert.AreEqual(true, testCssComponentsPathsAsset.Minified);
		}

		[TestFixtureTearDown]
		public void TearDown()
		{
			_applicationInfo = null;
			_fileSystemWrapper = null;
		}
	}
}
