using System;
using System.Collections.Generic;

using Xunit;

using BundleTransformer.Core.Assets;
using BundleTransformer.Core.FileSystem;
using BundleTransformer.Core.Helpers;
using BundleTransformer.Core.Validators;

namespace BundleTransformer.Tests.Core.Validators
{
	public class ScriptAssetTypesValidatorTests : IClassFixture<ApplicationSetupFixture>
	{
		private const string APPLICATION_ROOT_VIRTUAL_PATH = "~/";
		private const string STYLES_DIRECTORY_VIRTUAL_PATH = "~/Content/";
		private const string SCRIPTS_DIRECTORY_VIRTUAL_PATH = "~/Scripts/";

		private readonly IVirtualFileSystemWrapper _virtualFileSystemWrapper;


		public ScriptAssetTypesValidatorTests()
		{
			_virtualFileSystemWrapper = new MockVirtualFileSystemWrapper("/");
		}


		[Fact]
		public void ScriptAssetsListContainAssetsWithInvalidTypes()
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
			var scriptAssetTypesValidator = new ScriptAssetTypesValidator();

			// Act
			try
			{
				scriptAssetTypesValidator.Validate(assets);
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
			Assert.Equal(3, invalidAssetsVirtualPaths.Length);
			Assert.Contains(siteCssAsset.VirtualPath, invalidAssetsVirtualPaths);
			Assert.Contains(testLessAsset.VirtualPath, invalidAssetsVirtualPaths);
			Assert.Contains(testPlainTextAsset.VirtualPath, invalidAssetsVirtualPaths);
		}

		[Fact]
		public void ScriptAssetsListNotContainAssetsWithInvalidTypes()
		{
			// Arrange
			var jqueryJsAsset = new Asset(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "jquery-1.6.2.js"),
				_virtualFileSystemWrapper);

			var testCoffeeAsset = new Asset(
				UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "TestCoffeeScript.coffee"),
				_virtualFileSystemWrapper);

			var assets = new List<IAsset>
			{
				jqueryJsAsset,
				testCoffeeAsset
			};

			Exception currentException = null;
			var scriptAssetTypesValidator = new ScriptAssetTypesValidator();

			// Act
			try
			{
				scriptAssetTypesValidator.Validate(assets);
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