using Xunit;

using BundleTransformer.Core.Assets;
using BundleTransformer.Core.FileSystem;
using BundleTransformer.Core.Helpers;

using CoffeeScriptAssetTypeCodes = BundleTransformer.CoffeeScript.Constants.AssetTypeCode;
using CoreAssetTypeCodes = BundleTransformer.Core.Constants.AssetTypeCode;
using HandlebarsAssetTypeCodes = BundleTransformer.Handlebars.Constants.AssetTypeCode;
using LessAssetTypeCodes = BundleTransformer.Less.Constants.AssetTypeCode;
using SassAndScssAssetTypeCodes = BundleTransformer.SassAndScss.Constants.AssetTypeCode;
using TypeScriptAssetTypeCodes = BundleTransformer.TypeScript.Constants.AssetTypeCode;

namespace BundleTransformer.Tests.Core.Assets
{
	public class AssetTests : IClassFixture<ApplicationSetupFixture>
	{
		private const string APPLICATION_ROOT_VIRTUAL_PATH = @"~/";
		private const string STYLES_DIRECTORY_VIRTUAL_PATH = "~/Content/";
		private const string SCRIPTS_DIRECTORY_VIRTUAL_PATH = "~/Scripts/";

		private const string APPLICATION_ROOT_URL = "/";
		private const string STYLES_DIRECTORY_URL = "/Content/";
		private const string SCRIPTS_DIRECTORY_URL = "/Scripts/";

		private readonly IVirtualFileSystemWrapper _virtualFileSystemWrapper;


		public AssetTests()
		{
			_virtualFileSystemWrapper = new MockVirtualFileSystemWrapper(APPLICATION_ROOT_URL);
		}


		[Fact]
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
			Assert.Equal(UrlHelpers.Combine(STYLES_DIRECTORY_URL, "Site.css"), siteCssAssetUrl);
			Assert.Equal(UrlHelpers.Combine(SCRIPTS_DIRECTORY_URL, "jquery-1.6.2.js"), jqueryAssetUrl);
		}

		[Fact]
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
			Assert.Equal(CoreAssetTypeCodes.Css, siteCssAsset.AssetTypeCode);
			Assert.Equal(CoreAssetTypeCodes.JavaScript, jqueryJsAsset.AssetTypeCode);
			Assert.Equal(LessAssetTypeCodes.Less, testLessAsset.AssetTypeCode);
			Assert.Equal(SassAndScssAssetTypeCodes.Sass, testSassAsset.AssetTypeCode);
			Assert.Equal(SassAndScssAssetTypeCodes.Scss, testScssAsset.AssetTypeCode);
			Assert.Equal(CoffeeScriptAssetTypeCodes.CoffeeScript, testCoffeeAsset.AssetTypeCode);
			Assert.Equal(CoffeeScriptAssetTypeCodes.LiterateCoffeeScript, testLitCoffeeAsset.AssetTypeCode);
			Assert.Equal(CoffeeScriptAssetTypeCodes.LiterateCoffeeScript, testCoffeeMdAsset.AssetTypeCode);
			Assert.Equal(TypeScriptAssetTypeCodes.TypeScript, testTsAsset.AssetTypeCode);
			Assert.Equal(HandlebarsAssetTypeCodes.Handlebars, testHandlebarsAsset.AssetTypeCode);
			Assert.Equal(HandlebarsAssetTypeCodes.Handlebars, testShortHandlebarsAsset.AssetTypeCode);
			Assert.Equal(CoreAssetTypeCodes.Unknown, testPlainTextAsset.AssetTypeCode);

			Assert.True(siteCssAsset.IsStylesheet);
			Assert.False(siteCssAsset.IsScript);
			Assert.False(jqueryJsAsset.IsStylesheet);
			Assert.True(jqueryJsAsset.IsScript);
			Assert.True(testLessAsset.IsStylesheet);
			Assert.False(testLessAsset.IsScript);
			Assert.True(testSassAsset.IsStylesheet);
			Assert.False(testSassAsset.IsScript);
			Assert.True(testScssAsset.IsStylesheet);
			Assert.False(testScssAsset.IsScript);
			Assert.False(testCoffeeAsset.IsStylesheet);
			Assert.True(testCoffeeAsset.IsScript);
			Assert.False(testLitCoffeeAsset.IsStylesheet);
			Assert.True(testLitCoffeeAsset.IsScript);
			Assert.False(testCoffeeMdAsset.IsStylesheet);
			Assert.True(testCoffeeMdAsset.IsScript);
			Assert.False(testTsAsset.IsStylesheet);
			Assert.True(testTsAsset.IsScript);
			Assert.False(testHandlebarsAsset.IsStylesheet);
			Assert.True(testHandlebarsAsset.IsScript);
			Assert.False(testShortHandlebarsAsset.IsStylesheet);
			Assert.True(testShortHandlebarsAsset.IsScript);
			Assert.False(testPlainTextAsset.IsStylesheet);
			Assert.False(testPlainTextAsset.IsScript);
		}
	}
}