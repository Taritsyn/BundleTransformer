namespace BundleTransformer.Tests.Core.Assets
{
	using NUnit.Framework;

	using BundleTransformer.Core.Assets;
	using BundleTransformer.Core.FileSystem;
	using BundleTransformer.Core.Helpers;

	[TestFixture]
	public class AssetTests
	{
		private const string APPLICATION_ROOT_VIRTUAL_PATH = @"~/";
		private const string STYLES_DIRECTORY_VIRTUAL_PATH = "~/Content/";
		private const string SCRIPTS_DIRECTORY_VIRTUAL_PATH = "~/Scripts/";

		private const string APPLICATION_ROOT_URL = "/";
		private const string STYLES_DIRECTORY_URL = "/Content/";
		private const string SCRIPTS_DIRECTORY_URL = "/Scripts/";

		private IVirtualFileSystemWrapper _virtualFileSystemWrapper;

		[TestFixtureSetUp]
		public void SetUp()
		{
			_virtualFileSystemWrapper = new MockVirtualFileSystemWrapper(APPLICATION_ROOT_URL);
		}

		[Test]
		public void UrlCalculationIsCorrect()
		{
			// Arrange
			var siteCssAsset = new Asset(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "Site.css"),
				_virtualFileSystemWrapper);
			var jqueryAsset = new Asset(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "jquery-1.6.2.js"), 
				_virtualFileSystemWrapper);

			// Act
			string siteCssAssetUrl = siteCssAsset.Url;
			string jqueryAssetUrl = jqueryAsset.Url;

			// Assert
			Assert.AreEqual(UrlHelpers.Combine(STYLES_DIRECTORY_URL, "Site.css"), siteCssAssetUrl);
			Assert.AreEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_URL, "jquery-1.6.2.js"), jqueryAssetUrl);
		}

		[Test]
		public void DeterminationOfAssetTypeIsCorrect()
		{
			// Arrange

			// Act
			var siteCssAsset = new Asset(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "Site.css"), 
				_virtualFileSystemWrapper);

			var jqueryJsAsset = new Asset(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "jquery-1.6.2.js"), 
				_virtualFileSystemWrapper);

			var testLessAsset = new Asset(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "TestLess.less"), 
				_virtualFileSystemWrapper);

			var testSassAsset = new Asset(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "TestSass.sass"), 
				_virtualFileSystemWrapper);

			var testScssAsset = new Asset(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "TestScss.scss"), 
				_virtualFileSystemWrapper);

			var testCoffeeAsset = new Asset(
				UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "TestCoffeeScript.coffee"), 
				_virtualFileSystemWrapper);

			var testLitCoffeeAsset = new Asset(
				UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "TestLiterateCoffeeScript.litcoffee"), 
				_virtualFileSystemWrapper);

			var testCoffeeMdAsset = new Asset(
				UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "TestCoffeeScriptMarkdown.coffee.md"), 
				_virtualFileSystemWrapper);

			var testTsAsset = new Asset(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "TestTypeScript.ts"), 
				_virtualFileSystemWrapper);

			var testHandlebarsAsset = new Asset(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "TestHandlebars.handlebars"),
				_virtualFileSystemWrapper);

			var testShortHandlebarsAsset = new Asset(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "TestShortHandlebars.hbs"),
				_virtualFileSystemWrapper);

			var testPlainTextAsset = new Asset(UrlHelpers.Combine(APPLICATION_ROOT_VIRTUAL_PATH, "TestPlainText.txt"),
				_virtualFileSystemWrapper);

			// Assert
			Assert.AreEqual(AssetType.Css, siteCssAsset.AssetType);
			Assert.AreEqual(AssetType.JavaScript, jqueryJsAsset.AssetType);
			Assert.AreEqual(AssetType.Less, testLessAsset.AssetType);
			Assert.AreEqual(AssetType.Sass, testSassAsset.AssetType);
			Assert.AreEqual(AssetType.Scss, testScssAsset.AssetType);
			Assert.AreEqual(AssetType.CoffeeScript, testCoffeeAsset.AssetType);
			Assert.AreEqual(AssetType.LiterateCoffeeScript, testLitCoffeeAsset.AssetType);
			Assert.AreEqual(AssetType.CoffeeScriptMarkdown, testCoffeeMdAsset.AssetType);
			Assert.AreEqual(AssetType.TypeScript, testTsAsset.AssetType);
			Assert.AreEqual(AssetType.Handlebars, testHandlebarsAsset.AssetType);
			Assert.AreEqual(AssetType.Handlebars, testShortHandlebarsAsset.AssetType);
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
			Assert.AreEqual(testLitCoffeeAsset.IsStylesheet, false);
			Assert.AreEqual(testLitCoffeeAsset.IsScript, true);
			Assert.AreEqual(testCoffeeMdAsset.IsStylesheet, false);
			Assert.AreEqual(testCoffeeMdAsset.IsScript, true);
			Assert.AreEqual(testTsAsset.IsStylesheet, false);
			Assert.AreEqual(testTsAsset.IsScript, true);
			Assert.AreEqual(testHandlebarsAsset.IsStylesheet, false);
			Assert.AreEqual(testHandlebarsAsset.IsScript, true);
			Assert.AreEqual(testShortHandlebarsAsset.IsStylesheet, false);
			Assert.AreEqual(testShortHandlebarsAsset.IsScript, true);
			Assert.AreEqual(testPlainTextAsset.IsStylesheet, false);
			Assert.AreEqual(testPlainTextAsset.IsScript, false);
		}

		[TestFixtureTearDown]
		public void TearDown()
		{
			_virtualFileSystemWrapper = null;
		}
	}
}