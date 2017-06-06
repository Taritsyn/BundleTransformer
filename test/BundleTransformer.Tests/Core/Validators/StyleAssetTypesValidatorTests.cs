using System;
using System.Collections.Generic;

using Xunit;

using BundleTransformer.Core.Assets;
using BundleTransformer.Core.FileSystem;
using BundleTransformer.Core.Helpers;
using BundleTransformer.Core.Validators;

namespace BundleTransformer.Tests.Core.Validators
{
	public class StyleAssetTypesValidatorTests : IClassFixture<ApplicationSetupFixture>
	{
		private const string APPLICATION_ROOT_VIRTUAL_PATH = "~/";
		private const string STYLES_DIRECTORY_VIRTUAL_PATH = "~/Content/";
		private const string SCRIPTS_DIRECTORY_VIRTUAL_PATH = "~/Scripts?";

		private readonly IVirtualFileSystemWrapper _virtualFileSystemWrapper;


		public StyleAssetTypesValidatorTests()
		{
			_virtualFileSystemWrapper = new MockVirtualFileSystemWrapper("/");
		}


		[Fact]
		public void StyleAssetsListContainAssetsWithInvalidTypes()
		{
			// Arrange
			var siteCssAsset = new Asset(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "Site.css"),
				_virtualFileSystemWrapper);

			var jqueryJsAsset = new Asset(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "jquery-1.6.2.js"),
				_virtualFileSystemWrapper);

			var testLessAsset = new Asset(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "TestLess.less"),
				_virtualFileSystemWrapper);

			var testCoffeeAsset = new Asset(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "TestCoffeeScript.coffee"),
				_virtualFileSystemWrapper);

			var testLitCoffeeAsset = new Asset(
				UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "TestLiterateCoffeeScript.litcoffee"),
				_virtualFileSystemWrapper);

			var testCoffeeMdAsset = new Asset(
				UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "TestCoffeeScriptMarkdown.coffee.md"),
				_virtualFileSystemWrapper);

			var testPlainTextAsset = new Asset(UrlHelpers.Combine(APPLICATION_ROOT_VIRTUAL_PATH, "TestPlainText.txt"),
				_virtualFileSystemWrapper);

			var assets = new List<IAsset>
			{
				siteCssAsset,
				jqueryJsAsset,
				testLessAsset,
				testCoffeeAsset,
				testLitCoffeeAsset,
				testCoffeeMdAsset,
				testPlainTextAsset
			};

			Exception currentException = null;
			var styleAssetTypesValidator = new StyleAssetTypesValidator();

			// Act
			try
			{
				styleAssetTypesValidator.Validate(assets);
			}
			catch(Exception ex)
			{
				currentException = ex;
			}

			var invalidAssetsVirtualPaths = new string[0];
			var invalidAssetTypesException = (InvalidAssetTypesException)currentException;
			if (invalidAssetTypesException != null)
			{
				invalidAssetsVirtualPaths = invalidAssetTypesException.InvalidAssetsVirtualPaths;
			}

			// Assert
			Assert.IsType<InvalidAssetTypesException>(currentException);
			Assert.Equal(5, invalidAssetsVirtualPaths.Length);
			Assert.Contains(jqueryJsAsset.VirtualPath, invalidAssetsVirtualPaths);
			Assert.Contains(testCoffeeAsset.VirtualPath, invalidAssetsVirtualPaths);
			Assert.Contains(testLitCoffeeAsset.VirtualPath, invalidAssetsVirtualPaths);
			Assert.Contains(testCoffeeMdAsset.VirtualPath, invalidAssetsVirtualPaths);
			Assert.Contains(testPlainTextAsset.VirtualPath, invalidAssetsVirtualPaths);
		}

		[Fact]
		public void StyleAssetsListNotContainAssetsWithInvalidTypes()
		{
			// Arrange
			var siteCssAsset = new Asset(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "Site.css"),
				_virtualFileSystemWrapper);

			var testLessAsset = new Asset(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "TestLess.less"),
				_virtualFileSystemWrapper);

			var assets = new List<IAsset>
			{
				siteCssAsset,
				testLessAsset
			};

			Exception currentException = null;

			var styleAssetTypesValidator = new StyleAssetTypesValidator();

			// Act
			try
			{
				styleAssetTypesValidator.Validate(assets);
			}
			catch (Exception ex)
			{
				currentException = ex;
			}

			// Assert
			Assert.IsNotType<InvalidAssetTypesException>(currentException);
		}
	}
}