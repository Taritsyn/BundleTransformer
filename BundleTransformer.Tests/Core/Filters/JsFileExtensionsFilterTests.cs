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
	public class JsFileExtensionsFilterTests
	{
		private const string SCRIPTS_DIRECTORY_PATH = 
			@"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\Scripts\";

		private readonly string[] _jsFilesWithMicrosoftStyleExtensions =
			new[] { "MicrosoftAjax.js", "MicrosoftMvcAjax.js", 
				"MicrosoftMvcValidation.js", "knockout-$version$.js" };
		private IHttpApplicationInfo _applicationInfo;
		private IFileSystemWrapper _fileSystemWrapper;
		private IList<IAsset> _testAssets;

		[TestFixtureSetUp]
		public void SetUp()
		{
			_applicationInfo = new HttpApplicationInfo("/", 
				@"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\");

			var fileSystemMock = new Mock<IFileSystemWrapper>();
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(SCRIPTS_DIRECTORY_PATH, "jquery-1.6.2.debug.js")))
				.Returns(false)
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(SCRIPTS_DIRECTORY_PATH, "jquery-1.6.2.js")))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(SCRIPTS_DIRECTORY_PATH, "jquery-1.6.2.min.js")))
				.Returns(true)
				;

			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(SCRIPTS_DIRECTORY_PATH, "jquery-ui-1.8.11.debug.js")))
				.Returns(false)
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(SCRIPTS_DIRECTORY_PATH, "jquery-ui-1.8.11.js")))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(SCRIPTS_DIRECTORY_PATH, "jquery-ui-1.8.11.min.js")))
				.Returns(true)
				;

			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(SCRIPTS_DIRECTORY_PATH, "MicrosoftAjax.debug.js")))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(SCRIPTS_DIRECTORY_PATH, "MicrosoftAjax.js")))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(SCRIPTS_DIRECTORY_PATH, "MicrosoftAjax.min.js")))
				.Returns(false)
				;

			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(SCRIPTS_DIRECTORY_PATH, "knockout-2.1.0beta.debug.js")))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(SCRIPTS_DIRECTORY_PATH, "knockout-2.1.0beta.js")))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(SCRIPTS_DIRECTORY_PATH, "knockout-2.1.0beta.min.js")))
				.Returns(false)
				;

			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(SCRIPTS_DIRECTORY_PATH, "modernizr-2.0.6-development-only.debug.js")))
				.Returns(false)
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(SCRIPTS_DIRECTORY_PATH, "modernizr-2.0.6-development-only.js")))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(SCRIPTS_DIRECTORY_PATH, "modernizr-2.0.6-development-only.min.js")))
				.Returns(false)
				;

			var jqueryAsset = new Asset(Path.Combine(SCRIPTS_DIRECTORY_PATH, "jquery-1.6.2.js"),
				_applicationInfo, _fileSystemWrapper);
			var jqueryUiAsset = new Asset(Path.Combine(SCRIPTS_DIRECTORY_PATH, "jquery-ui-1.8.11.min.js"),
				_applicationInfo, _fileSystemWrapper);
			var microsoftAjaxAsset = new Asset(Path.Combine(SCRIPTS_DIRECTORY_PATH, "MicrosoftAjax.debug.js"),
				_applicationInfo, _fileSystemWrapper);
			var knockoutAsset = new Asset(Path.Combine(SCRIPTS_DIRECTORY_PATH, "knockout-2.1.0beta.js"),
				_applicationInfo, _fileSystemWrapper);
			var modernizrAsset = new Asset(Path.Combine(SCRIPTS_DIRECTORY_PATH, "modernizr-2.0.6-development-only.js"),
				_applicationInfo, _fileSystemWrapper);

			var testAssets = new List<IAsset>
			{
			    jqueryAsset, 
				jqueryUiAsset, 
				microsoftAjaxAsset, 
				knockoutAsset, 
				modernizrAsset
			};
			
			_fileSystemWrapper = fileSystemMock.Object;
			_testAssets = testAssets;
		}

		[Test]
		public void ReplacementOfFileExtensionsInDebugModeIsCorrect()
		{
			// Arrange
			IList<IAsset> assets = _testAssets;
			var jsFileExtensionsFilter = new JsFileExtensionsFilter(_jsFilesWithMicrosoftStyleExtensions,
				_fileSystemWrapper)
			{
			    IsDebugMode = true
			};

			// Act
			IList<IAsset> processedAssets = jsFileExtensionsFilter.Transform(assets);
			IAsset jqueryAsset = processedAssets[0];
			IAsset jqueryUiAsset = processedAssets[1];
			IAsset microsoftAjaxAsset = processedAssets[2];
			IAsset knockoutAsset = processedAssets[3];
			IAsset modernizrAsset = processedAssets[4];

			// Assert
			Assert.AreEqual(Path.Combine(SCRIPTS_DIRECTORY_PATH, "jquery-1.6.2.js"), jqueryAsset.Path);
			Assert.AreEqual(Path.Combine(SCRIPTS_DIRECTORY_PATH, "jquery-ui-1.8.11.js"), jqueryUiAsset.Path);
			Assert.AreEqual(Path.Combine(SCRIPTS_DIRECTORY_PATH, "MicrosoftAjax.debug.js"), microsoftAjaxAsset.Path);
			Assert.AreEqual(Path.Combine(SCRIPTS_DIRECTORY_PATH, "knockout-2.1.0beta.debug.js"), knockoutAsset.Path);
			Assert.AreEqual(Path.Combine(SCRIPTS_DIRECTORY_PATH, "modernizr-2.0.6-development-only.js"), modernizrAsset.Path);
			Assert.AreNotEqual(Path.Combine(SCRIPTS_DIRECTORY_PATH, "modernizr-2.0.6-development-only.debug.js"), modernizrAsset.Path);

			Assert.AreEqual(false, jqueryAsset.Minified);
			Assert.AreEqual(false, jqueryUiAsset.Minified);
			Assert.AreEqual(false, microsoftAjaxAsset.Minified);
			Assert.AreEqual(false, knockoutAsset.Minified);
			Assert.AreEqual(false, modernizrAsset.Minified);
		}

		[Test]
		public void ReplacementOfFileExtensionsInReleaseModeIsCorrect()
		{
			// Arrange
			IList<IAsset> assets = _testAssets;
			var jsFileExtensionsFilter = new JsFileExtensionsFilter(_jsFilesWithMicrosoftStyleExtensions,
				_fileSystemWrapper)
			{
			    IsDebugMode = false
			};

			// Act
			IList<IAsset> processedAssets = jsFileExtensionsFilter.Transform(assets);
			IAsset jqueryAsset = processedAssets[0];
			IAsset jqueryUiAsset = processedAssets[1];
			IAsset microsoftAjaxAsset = processedAssets[2];
			IAsset knockoutAsset = processedAssets[3];
			IAsset modernizrAsset = processedAssets[4];

			// Assert
			Assert.AreEqual(Path.Combine(SCRIPTS_DIRECTORY_PATH, "jquery-1.6.2.min.js"), jqueryAsset.Path);
			Assert.AreEqual(Path.Combine(SCRIPTS_DIRECTORY_PATH, "jquery-ui-1.8.11.min.js"), jqueryUiAsset.Path);
			Assert.AreEqual(Path.Combine(SCRIPTS_DIRECTORY_PATH, "MicrosoftAjax.js"), microsoftAjaxAsset.Path);
			Assert.AreEqual(Path.Combine(SCRIPTS_DIRECTORY_PATH, "knockout-2.1.0beta.js"), knockoutAsset.Path);
			Assert.AreEqual(Path.Combine(SCRIPTS_DIRECTORY_PATH, "modernizr-2.0.6-development-only.js"), modernizrAsset.Path);
			Assert.AreNotEqual(Path.Combine(SCRIPTS_DIRECTORY_PATH, "modernizr-2.0.6-development-only.min.js"), modernizrAsset.Path);

			Assert.AreEqual(true, jqueryAsset.Minified);
			Assert.AreEqual(true, jqueryUiAsset.Minified);
			Assert.AreEqual(true, microsoftAjaxAsset.Minified);
			Assert.AreEqual(true, knockoutAsset.Minified);
			Assert.AreEqual(false, modernizrAsset.Minified);
		}

		[TestFixtureTearDown]
		public void TearDown()
		{
			_applicationInfo = null;
			_fileSystemWrapper = null;
		}
	}
}
