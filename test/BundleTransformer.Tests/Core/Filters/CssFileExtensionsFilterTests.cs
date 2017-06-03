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
	public class CssFileExtensionsFilterTests
	{
		private const string STYLES_DIRECTORY_VIRTUAL_PATH = "~/Content/";
		private const string ALTERNATIVE_STYLES_DIRECTORY_VIRTUAL_PATH = "~/AlternativeContent/";

		private IVirtualFileSystemWrapper _virtualFileSystemWrapper;

		[TestFixtureSetUp]
		public void SetUp()
		{
			var virtualFileSystemMock = new Mock<IVirtualFileSystemWrapper>();

			virtualFileSystemMock
				.Setup(fs => fs.FileExists(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "Site.css")))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "Site.min.css")))
				.Returns(false)
				;

			virtualFileSystemMock
				.Setup(fs => fs.FileExists(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
					@"themes\base\jquery.ui.accordion.css")))
				.Returns(false)
				;
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
					@"themes\base\jquery.ui.accordion.min.css")))
				.Returns(true)
				;

			virtualFileSystemMock
				.Setup(fs => fs.FileExists(UrlHelpers.Combine(ALTERNATIVE_STYLES_DIRECTORY_VIRTUAL_PATH,
					@"css\TestCssComponentsPaths.css")))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(UrlHelpers.Combine(ALTERNATIVE_STYLES_DIRECTORY_VIRTUAL_PATH,
					@"css\TestCssComponentsPaths.min.css")))
				.Returns(true)
				;

			_virtualFileSystemWrapper = virtualFileSystemMock.Object;
		}

		private IList<IAsset> GetTestAssets()
		{
			var siteAsset = new Asset(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "Site.css"),
				_virtualFileSystemWrapper);
			var jqueryUiAccordionAsset = new Asset(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				@"themes\base\jquery.ui.accordion.min.css"), _virtualFileSystemWrapper);
			var testCssComponentsPathsAsset = new Asset(UrlHelpers.Combine(ALTERNATIVE_STYLES_DIRECTORY_VIRTUAL_PATH,
				@"css\TestCssComponentsPaths.css"), _virtualFileSystemWrapper);

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
			var cssFileExtensionsFilter = new CssFileExtensionsFilter(_virtualFileSystemWrapper)
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
			Assert.AreEqual(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "Site.css"), siteAsset.VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				@"themes\base\jquery.ui.accordion.min.css"), jqueryUiAccordionAsset.VirtualPath);
			Assert.AreNotEqual(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				@"themes\base\jquery.ui.accordion.css"), jqueryUiAccordionAsset.VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(ALTERNATIVE_STYLES_DIRECTORY_VIRTUAL_PATH,
				@"css\TestCssComponentsPaths.css"), testCssComponentsPathsAsset.VirtualPath);

			Assert.AreEqual(false, siteAsset.Minified);
			Assert.AreEqual(true, jqueryUiAccordionAsset.Minified);
			Assert.AreEqual(false, testCssComponentsPathsAsset.Minified);
		}

		[Test]
		public void ReplacementOfFileExtensionsInDebugModeAndUsageOfPreMinifiedFilesDisallowedIsCorrect()
		{
			// Arrange
			IList<IAsset> assets = GetTestAssets();
			var cssFileExtensionsFilter = new CssFileExtensionsFilter(_virtualFileSystemWrapper)
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
			Assert.AreEqual(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "Site.css"), siteAsset.VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				@"themes\base\jquery.ui.accordion.min.css"), jqueryUiAccordionAsset.VirtualPath);
			Assert.AreNotEqual(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				@"themes\base\jquery.ui.accordion.css"), jqueryUiAccordionAsset.VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(ALTERNATIVE_STYLES_DIRECTORY_VIRTUAL_PATH,
				@"css\TestCssComponentsPaths.css"), testCssComponentsPathsAsset.VirtualPath);

			Assert.AreEqual(false, siteAsset.Minified);
			Assert.AreEqual(true, jqueryUiAccordionAsset.Minified);
			Assert.AreEqual(false, testCssComponentsPathsAsset.Minified);
		}

		[Test]
		public void ReplacementOfFileExtensionsInReleaseModeAndUsageOfPreMinifiedFilesAllowedIsCorrect()
		{
			// Arrange
			IList<IAsset> assets = GetTestAssets();
			var cssFileExtensionsFilter = new CssFileExtensionsFilter(_virtualFileSystemWrapper)
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
			Assert.AreEqual(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "Site.css"), siteAsset.VirtualPath);
			Assert.AreNotEqual(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "Site.min.css"), siteAsset.VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				@"themes\base\jquery.ui.accordion.min.css"), jqueryUiAccordionAsset.VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(ALTERNATIVE_STYLES_DIRECTORY_VIRTUAL_PATH,
				@"css\TestCssComponentsPaths.min.css"), testCssComponentsPathsAsset.VirtualPath);

			Assert.AreEqual(false, siteAsset.Minified);
			Assert.AreEqual(true, jqueryUiAccordionAsset.Minified);
			Assert.AreEqual(true, testCssComponentsPathsAsset.Minified);
		}

		[Test]
		public void ReplacementOfFileExtensionsInReleaseModeAndUsageOfPreMinifiedFilesDisallowedIsCorrect()
		{
			// Arrange
			IList<IAsset> assets = GetTestAssets();
			var cssFileExtensionsFilter = new CssFileExtensionsFilter(_virtualFileSystemWrapper)
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
			Assert.AreEqual(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "Site.css"), siteAsset.VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				@"themes\base\jquery.ui.accordion.min.css"), jqueryUiAccordionAsset.VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(ALTERNATIVE_STYLES_DIRECTORY_VIRTUAL_PATH,
				@"css\TestCssComponentsPaths.css"), testCssComponentsPathsAsset.VirtualPath);

			Assert.AreEqual(false, siteAsset.Minified);
			Assert.AreEqual(true, jqueryUiAccordionAsset.Minified);
			Assert.AreEqual(false, testCssComponentsPathsAsset.Minified);
		}

		[TestFixtureTearDown]
		public void TearDown()
		{
			_virtualFileSystemWrapper = null;
		}
	}
}