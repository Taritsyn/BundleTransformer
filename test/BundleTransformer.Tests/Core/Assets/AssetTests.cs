namespace BundleTransformer.Tests.Core.Assets
{
	using NUnit.Framework;

	using BundleTransformer.Core.Assets;
	using BundleTransformer.Core.FileSystem;
	using BundleTransformer.Core.Helpers;

	using CoffeeScriptAssetTypeCodes = BundleTransformer.CoffeeScript.Constants.AssetTypeCode;
	using CoreAssetTypeCodes = BundleTransformer.Core.Constants.AssetTypeCode;
	using HandlebarsAssetTypeCodes = BundleTransformer.Handlebars.Constants.AssetTypeCode;
	using LessAssetTypeCodes = BundleTransformer.Less.Constants.AssetTypeCode;
	using SassAndScssAssetTypeCodes = BundleTransformer.SassAndScss.Constants.AssetTypeCode;
	using TypeScriptAssetTypeCodes = BundleTransformer.TypeScript.Constants.AssetTypeCode;

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
			Assert.AreEqual(CoreAssetTypeCodes.Css, siteCssAsset.AssetTypeCode);
			Assert.AreEqual(CoreAssetTypeCodes.JavaScript, jqueryJsAsset.AssetTypeCode);
			Assert.AreEqual(LessAssetTypeCodes.Less, testLessAsset.AssetTypeCode);
			Assert.AreEqual(SassAndScssAssetTypeCodes.Sass, testSassAsset.AssetTypeCode);
			Assert.AreEqual(SassAndScssAssetTypeCodes.Scss, testScssAsset.AssetTypeCode);
			Assert.AreEqual(CoffeeScriptAssetTypeCodes.CoffeeScript, testCoffeeAsset.AssetTypeCode);
			Assert.AreEqual(CoffeeScriptAssetTypeCodes.LiterateCoffeeScript, testLitCoffeeAsset.AssetTypeCode);
			Assert.AreEqual(CoffeeScriptAssetTypeCodes.LiterateCoffeeScript, testCoffeeMdAsset.AssetTypeCode);
			Assert.AreEqual(TypeScriptAssetTypeCodes.TypeScript, testTsAsset.AssetTypeCode);
			Assert.AreEqual(HandlebarsAssetTypeCodes.Handlebars, testHandlebarsAsset.AssetTypeCode);
			Assert.AreEqual(HandlebarsAssetTypeCodes.Handlebars, testShortHandlebarsAsset.AssetTypeCode);
			Assert.AreEqual(CoreAssetTypeCodes.Unknown, testPlainTextAsset.AssetTypeCode);

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