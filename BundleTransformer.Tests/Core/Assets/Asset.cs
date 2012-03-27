namespace BundleTransformer.Tests.Core.Assets
{
	using System.IO;

	using Moq;
	using NUnit.Framework;

	using BundleTransformer.Core.Assets;
	using BundleTransformer.Core.FileSystem;

	[TestFixture]
	public class AssetTests
	{
		private const string APPLICATION_ROOT_PATH = 
			@"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\";
		private const string STYLES_DIRECTORY_PATH = 
			@"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\Content\";
		private const string SCRIPTS_DIRECTORY_PATH = 
			@"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\Scripts\";

		private HttpApplicationInfo _applicationInfo;
		private IFileSystemWrapper _fileSystemWrapper;

		[TestFixtureSetUp]
		public void SetUp()
		{
			_applicationInfo = new HttpApplicationInfo("/", APPLICATION_ROOT_PATH);
			_fileSystemWrapper = (new Mock<IFileSystemWrapper>()).Object;
		}
		
		[Test]
		public void UrlCalculationIsCorrect()
		{
			// Arrange
			var jqueryAsset = new Asset(
				Path.Combine(SCRIPTS_DIRECTORY_PATH, @"jquery-1.6.2.js"),
				_applicationInfo,
				_fileSystemWrapper);

			// Act
			string url = jqueryAsset.Url;

			// Assert
			Assert.AreEqual(@"/Scripts/jquery-1.6.2.js", url);
		}

		[Test]
		public void DeterminationOfAssetTypeIsCorrect()
		{
			// Arrange

			// Act
			var siteCssAsset = new Asset(
				Path.Combine(STYLES_DIRECTORY_PATH, @"Site.css"),
				_applicationInfo, _fileSystemWrapper);

			var jqueryJsAsset = new Asset(
				Path.Combine(SCRIPTS_DIRECTORY_PATH, @"jquery-1.6.2.js"),
				_applicationInfo, _fileSystemWrapper);

			var testLessAsset = new Asset(
				Path.Combine(STYLES_DIRECTORY_PATH, @"TestLess.less"),
				_applicationInfo, _fileSystemWrapper);

			var testSassAsset = new Asset(
				Path.Combine(STYLES_DIRECTORY_PATH, @"TestSass.sass"),
				_applicationInfo, _fileSystemWrapper);

			var testScssAsset = new Asset(
				Path.Combine(STYLES_DIRECTORY_PATH, @"TestScss.scss"),
				_applicationInfo, _fileSystemWrapper);

			var testCoffeeAsset = new Asset(
				Path.Combine(SCRIPTS_DIRECTORY_PATH, @"TestCoffeeScript.coffee"),
				_applicationInfo, _fileSystemWrapper);

			var testPlainTextAsset = new Asset(
				Path.Combine(APPLICATION_ROOT_PATH, @"TestPlainText.txt"),
					_applicationInfo, _fileSystemWrapper);

			// Assert
			Assert.AreEqual(AssetType.Css, siteCssAsset.AssetType);
			Assert.AreEqual(AssetType.JavaScript, jqueryJsAsset.AssetType);
			Assert.AreEqual(AssetType.Less, testLessAsset.AssetType);
			Assert.AreEqual(AssetType.Sass, testSassAsset.AssetType);
			Assert.AreEqual(AssetType.Scss, testScssAsset.AssetType);
			Assert.AreEqual(AssetType.CoffeeScript, testCoffeeAsset.AssetType);
			Assert.AreEqual(AssetType.Unknown, testPlainTextAsset.AssetType);

			Assert.AreEqual(siteCssAsset.IsStylesheet, true);
			Assert.AreEqual(siteCssAsset.IsScript, false);
			Assert.AreEqual(jqueryJsAsset.IsStylesheet, false);
			Assert.AreEqual(jqueryJsAsset.IsScript, true);
			Assert.AreEqual(testLessAsset.IsStylesheet, true);
			Assert.AreEqual(testLessAsset.IsScript, false);
			Assert.AreEqual(testSassAsset.IsStylesheet, true);
			Assert.AreEqual(testSassAsset.IsScript, false);
			Assert.AreEqual(testScssAsset.IsStylesheet, true);
			Assert.AreEqual(testScssAsset.IsScript, false);
			Assert.AreEqual(testCoffeeAsset.IsStylesheet, false);
			Assert.AreEqual(testCoffeeAsset.IsScript, true);
			Assert.AreEqual(testPlainTextAsset.IsStylesheet, false);
			Assert.AreEqual(testPlainTextAsset.IsScript, false);
		}

		[TestFixtureTearDown]
		public void TearDown()
		{
			_applicationInfo = null;
			_fileSystemWrapper = null;
		}
	}
}
