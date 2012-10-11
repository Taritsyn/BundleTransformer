namespace BundleTransformer.Tests.Core.Filters
{
	using System.Collections.Generic;
	using System.IO;

	using Moq;
	using NUnit.Framework;

	using BundleTransformer.Core.Assets;
	using BundleTransformer.Core.FileSystem;
	using BundleTransformer.Core.Filters;
	using BundleTransformer.Core.Web;

	[TestFixture]
	public class CssFileExtensionsFilterTests
	{
		private const string STYLES_DIRECTORY_PATH = 
			@"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\Content\";
		private const string ALTERNATIVE_STYLES_DIRECTORY_PATH = 
			@"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\AlternativeContent\";

		private IHttpApplicationInfo _applicationInfo;
		private IFileSystemWrapper _fileSystemWrapper;

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

			_fileSystemWrapper = fileSystemMock.Object;
		}

		private IList<IAsset> GetTestAssets()
		{
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

			return testAssets;
		}

		[Test]
		public void ReplacementOfFileExtensionsInDebugModeAndUsageOfPreMinifiedFilesAllowedIsCorrect()
		{
			// Arrange
			IList<IAsset> assets = GetTestAssets();
			var cssFileExtensionsFilter = new CssFileExtensionsFilter(_fileSystemWrapper)
			{
			    IsDebugMode = true,
				UsePreMinifiedFiles = true
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
		public void ReplacementOfFileExtensionsInDebugModeAndUsageOfPreMinifiedFilesDisallowedIsCorrect()
		{
			// Arrange
			IList<IAsset> assets = GetTestAssets();
			var cssFileExtensionsFilter = new CssFileExtensionsFilter(_fileSystemWrapper)
			{
				IsDebugMode = true,
				UsePreMinifiedFiles = false
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
		public void ReplacementOfFileExtensionsInReleaseModeAndUsageOfPreMinifiedFilesAllowedIsCorrect()
		{
			// Arrange
			IList<IAsset> assets = GetTestAssets();
			var cssFileExtensionsFilter = new CssFileExtensionsFilter(_fileSystemWrapper)
			{
			    IsDebugMode = false,
				UsePreMinifiedFiles = true
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

		[Test]
		public void ReplacementOfFileExtensionsInReleaseModeAndUsageOfPreMinifiedFilesDisallowedIsCorrect()
		{
			// Arrange
			IList<IAsset> assets = GetTestAssets();
			var cssFileExtensionsFilter = new CssFileExtensionsFilter(_fileSystemWrapper)
			{
				IsDebugMode = false,
				UsePreMinifiedFiles = false
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
			Assert.AreEqual(Path.Combine(ALTERNATIVE_STYLES_DIRECTORY_PATH, @"\css\TestCssComponentsPaths.css"),
				testCssComponentsPathsAsset.Path);

			Assert.AreEqual(false, siteAsset.Minified);
			Assert.AreEqual(true, jqueryUiAccordionAsset.Minified);
			Assert.AreEqual(false, testCssComponentsPathsAsset.Minified);
		}

		[TestFixtureTearDown]
		public void TearDown()
		{
			_applicationInfo = null;
			_fileSystemWrapper = null;
		}
	}
}
