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
	public class JsFileExtensionsFilterTests
	{
		private const string SCRIPTS_DIRECTORY_VIRTUAL_PATH = "~/Scripts/";

		private readonly string[] _jsFilesWithMicrosoftStyleExtensions =
			new[] { "MicrosoftAjax.js", "MicrosoftMvcAjax.js", 
				"MicrosoftMvcValidation.js", "knockout-$version$.js" };
		private IVirtualFileSystemWrapper _virtualFileSystemWrapper;

		[TestFixtureSetUp]
		public void SetUp()
		{
			var virtualFileSystemMock = new Mock<IVirtualFileSystemWrapper>();
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
					"jquery-1.6.2.debug.js")))
				.Returns(false)
				;
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
					"jquery-1.6.2.js")))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
					"jquery-1.6.2.min.js")))
				.Returns(true)
				;

			virtualFileSystemMock
				.Setup(fs => fs.FileExists(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
					"jquery-ui-1.8.11.debug.js")))
				.Returns(false)
				;
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
					"jquery-ui-1.8.11.js")))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
					"jquery-ui-1.8.11.min.js")))
				.Returns(true)
				;

			virtualFileSystemMock
				.Setup(fs => fs.FileExists(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
					"MicrosoftAjax.debug.js")))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
					"MicrosoftAjax.js")))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
					"MicrosoftAjax.min.js")))
				.Returns(false)
				;

			virtualFileSystemMock
				.Setup(fs => fs.FileExists(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
					"knockout-2.1.0beta.debug.js")))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
					"knockout-2.1.0beta.js")))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
					"knockout-2.1.0beta.min.js")))
				.Returns(false)
				;

			virtualFileSystemMock
				.Setup(fs => fs.FileExists(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
					"modernizr-2.0.6-development-only.debug.js")))
				.Returns(false)
				;
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
					"modernizr-2.0.6-development-only.js")))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
					"modernizr-2.0.6-development-only.min.js")))
				.Returns(false)
				;

			_virtualFileSystemWrapper = virtualFileSystemMock.Object;
		}

		private IList<IAsset> GetTestAssets()
		{
			var jqueryAsset = new Asset(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"jquery-1.6.2.js"), _virtualFileSystemWrapper);
			var jqueryUiAsset = new Asset(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"jquery-ui-1.8.11.min.js"), _virtualFileSystemWrapper);
			var microsoftAjaxAsset = new Asset(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"MicrosoftAjax.debug.js"), _virtualFileSystemWrapper);
			var knockoutAsset = new Asset(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"knockout-2.1.0beta.js"), _virtualFileSystemWrapper);
			var modernizrAsset = new Asset(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"modernizr-2.0.6-development-only.js"), _virtualFileSystemWrapper);

			var testAssets = new List<IAsset>
			{
			    jqueryAsset, 
				jqueryUiAsset, 
				microsoftAjaxAsset, 
				knockoutAsset, 
				modernizrAsset
			};

			return testAssets;
		}

		[Test]
		public void ReplacementOfFileExtensionsInDebugModeAndUsageOfPreMinifiedFilesAllowedIsCorrect()
		{
			// Arrange
			IList<IAsset> assets = GetTestAssets();
			var jsFileExtensionsFilter = new JsFileExtensionsFilter(_jsFilesWithMicrosoftStyleExtensions,
				_virtualFileSystemWrapper)
			{
				IsDebugMode = true,
				UsePreMinifiedFiles = true
			};

			// Act
			IList<IAsset> processedAssets = jsFileExtensionsFilter.Transform(assets);
			IAsset jqueryAsset = processedAssets[0];
			IAsset jqueryUiAsset = processedAssets[1];
			IAsset microsoftAjaxAsset = processedAssets[2];
			IAsset knockoutAsset = processedAssets[3];
			IAsset modernizrAsset = processedAssets[4];

			// Assert
			Assert.AreEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "jquery-1.6.2.js"), 
				jqueryAsset.VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "jquery-ui-1.8.11.js"), 
				jqueryUiAsset.VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "MicrosoftAjax.debug.js"), 
				microsoftAjaxAsset.VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "knockout-2.1.0beta.debug.js"), 
				knockoutAsset.VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"modernizr-2.0.6-development-only.js"), modernizrAsset.VirtualPath);
			Assert.AreNotEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"modernizr-2.0.6-development-only.debug.js"), modernizrAsset.VirtualPath);

			Assert.AreEqual(false, jqueryAsset.Minified);
			Assert.AreEqual(false, jqueryUiAsset.Minified);
			Assert.AreEqual(false, microsoftAjaxAsset.Minified);
			Assert.AreEqual(false, knockoutAsset.Minified);
			Assert.AreEqual(false, modernizrAsset.Minified);
		}

		[Test]
		public void ReplacementOfFileExtensionsInDebugModeAndUsageOfPreMinifiedFilesDisallowedIsCorrect()
		{
			// Arrange
			IList<IAsset> assets = GetTestAssets();
			var jsFileExtensionsFilter = new JsFileExtensionsFilter(_jsFilesWithMicrosoftStyleExtensions,
				_virtualFileSystemWrapper)
			{
				IsDebugMode = true,
				UsePreMinifiedFiles = false
			};

			// Act
			IList<IAsset> processedAssets = jsFileExtensionsFilter.Transform(assets);
			IAsset jqueryAsset = processedAssets[0];
			IAsset jqueryUiAsset = processedAssets[1];
			IAsset microsoftAjaxAsset = processedAssets[2];
			IAsset knockoutAsset = processedAssets[3];
			IAsset modernizrAsset = processedAssets[4];

			// Assert
			Assert.AreEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "jquery-1.6.2.js"), 
				jqueryAsset.VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "jquery-ui-1.8.11.js"), 
				jqueryUiAsset.VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "MicrosoftAjax.debug.js"), 
				microsoftAjaxAsset.VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "knockout-2.1.0beta.debug.js"), 
				knockoutAsset.VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"modernizr-2.0.6-development-only.js"), modernizrAsset.VirtualPath);
			Assert.AreNotEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"modernizr-2.0.6-development-only.debug.js"), modernizrAsset.VirtualPath);

			Assert.AreEqual(false, jqueryAsset.Minified);
			Assert.AreEqual(false, jqueryUiAsset.Minified);
			Assert.AreEqual(false, microsoftAjaxAsset.Minified);
			Assert.AreEqual(false, knockoutAsset.Minified);
			Assert.AreEqual(false, modernizrAsset.Minified);
		}

		[Test]
		public void ReplacementOfFileExtensionsInReleaseModeAndUsageOfPreMinifiedFilesAllowedIsCorrect()
		{
			// Arrange
			IList<IAsset> assets = GetTestAssets();
			var jsFileExtensionsFilter = new JsFileExtensionsFilter(_jsFilesWithMicrosoftStyleExtensions,
				_virtualFileSystemWrapper)
			{
				IsDebugMode = false,
				UsePreMinifiedFiles = true
			};

			// Act
			IList<IAsset> processedAssets = jsFileExtensionsFilter.Transform(assets);
			IAsset jqueryAsset = processedAssets[0];
			IAsset jqueryUiAsset = processedAssets[1];
			IAsset microsoftAjaxAsset = processedAssets[2];
			IAsset knockoutAsset = processedAssets[3];
			IAsset modernizrAsset = processedAssets[4];

			// Assert
			Assert.AreEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "jquery-1.6.2.min.js"), 
				jqueryAsset.VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "jquery-ui-1.8.11.min.js"), 
				jqueryUiAsset.VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "MicrosoftAjax.js"), 
				microsoftAjaxAsset.VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "knockout-2.1.0beta.js"), 
				knockoutAsset.VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"modernizr-2.0.6-development-only.js"), modernizrAsset.VirtualPath);
			Assert.AreNotEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"modernizr-2.0.6-development-only.min.js"), modernizrAsset.VirtualPath);

			Assert.AreEqual(true, jqueryAsset.Minified);
			Assert.AreEqual(true, jqueryUiAsset.Minified);
			Assert.AreEqual(true, microsoftAjaxAsset.Minified);
			Assert.AreEqual(true, knockoutAsset.Minified);
			Assert.AreEqual(false, modernizrAsset.Minified);
		}

		[Test]
		public void ReplacementOfFileExtensionsInReleaseModeAndUsageOfPreMinifiedFilesDisallowedIsCorrect()
		{
			// Arrange
			IList<IAsset> assets = GetTestAssets();
			var jsFileExtensionsFilter = new JsFileExtensionsFilter(_jsFilesWithMicrosoftStyleExtensions,
				_virtualFileSystemWrapper)
			{
				IsDebugMode = false,
				UsePreMinifiedFiles = false
			};

			// Act
			IList<IAsset> processedAssets = jsFileExtensionsFilter.Transform(assets);
			IAsset jqueryAsset = processedAssets[0];
			IAsset jqueryUiAsset = processedAssets[1];
			IAsset microsoftAjaxAsset = processedAssets[2];
			IAsset knockoutAsset = processedAssets[3];
			IAsset modernizrAsset = processedAssets[4];

			// Assert
			Assert.AreEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "jquery-1.6.2.js"), 
				jqueryAsset.VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "jquery-ui-1.8.11.js"), 
				jqueryUiAsset.VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "MicrosoftAjax.debug.js"), 
				microsoftAjaxAsset.VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "knockout-2.1.0beta.debug.js"), 
				knockoutAsset.VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"modernizr-2.0.6-development-only.js"), modernizrAsset.VirtualPath);
			Assert.AreNotEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"modernizr-2.0.6-development-only.min.js"), modernizrAsset.VirtualPath);

			Assert.AreEqual(false, jqueryAsset.Minified);
			Assert.AreEqual(false, jqueryUiAsset.Minified);
			Assert.AreEqual(false, microsoftAjaxAsset.Minified);
			Assert.AreEqual(false, knockoutAsset.Minified);
			Assert.AreEqual(false, modernizrAsset.Minified);
		}

		[TestFixtureTearDown]
		public void TearDown()
		{
			_virtualFileSystemWrapper = null;
		}
	}
}