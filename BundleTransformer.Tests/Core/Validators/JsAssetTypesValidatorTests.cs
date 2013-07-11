namespace BundleTransformer.Tests.Core.Validators
{
	using System;
	using System.Collections.Generic;
	using System.IO;

	using NUnit.Framework;

	using BundleTransformer.Core.Assets;
	using BundleTransformer.Core.FileSystem;
	using BundleTransformer.Core.Validators;

	[TestFixture]
	public class JsAssetTypesValidatorTests
	{
		private const string APPLICATION_ROOT_VIRTUAL_PATH = "~/";
		private const string STYLES_DIRECTORY_VIRTUAL_PATH = "~/Content/";
		private const string SCRIPTS_DIRECTORY_VIRTUAL_PATH = "~/Scripts/";

		private IVirtualFileSystemWrapper _virtualFileSystemWrapper;

		[TestFixtureSetUp]
		public void SetUp()
		{
			_virtualFileSystemWrapper = new MockVirtualFileSystemWrapper("/");
		}

		[Test]
		public void JsAssetsListContainAssetsWithInvalidTypes()
		{
			// Arrange
			var siteCssAsset = new Asset(Path.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "Site.css"), 
				_virtualFileSystemWrapper);

			var jqueryJsAsset = new Asset(Path.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "jquery-1.6.2.js"),
				_virtualFileSystemWrapper);

			var testLessAsset = new Asset(Path.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "TestLess.less"),
				_virtualFileSystemWrapper);

			var testCoffeeAsset = new Asset(Path.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "TestCoffeeScript.coffee"),
				_virtualFileSystemWrapper);

			var testLitCoffeeAsset = new Asset(
				Path.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "TestLiterateCoffeeScript.litcoffee"),
				_virtualFileSystemWrapper);

			var testCoffeeMdAsset = new Asset(
				Path.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "TestCoffeeScriptMarkdown.coffee.md"),
				_virtualFileSystemWrapper);

			var testPlainTextAsset = new Asset(Path.Combine(APPLICATION_ROOT_VIRTUAL_PATH, "TestPlainText.txt"),
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
			var jsAssetTypesValidator = new JsAssetTypesValidator();

			// Act
			try
			{
				jsAssetTypesValidator.Validate(assets);
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
			Assert.IsInstanceOf<InvalidAssetTypesException>(currentException);
			Assert.AreEqual(3, invalidAssetsVirtualPaths.Length);
			Assert.Contains(siteCssAsset.VirtualPath, invalidAssetsVirtualPaths);
			Assert.Contains(testLessAsset.VirtualPath, invalidAssetsVirtualPaths);
			Assert.Contains(testPlainTextAsset.VirtualPath, invalidAssetsVirtualPaths);
		}

		[Test]
		public void JsAssetsListNotContainAssetsWithInvalidTypes()
		{
			// Arrange
			var jqueryJsAsset = new Asset(Path.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "jquery-1.6.2.js"),
				_virtualFileSystemWrapper);

			var testCoffeeAsset = new Asset(
				Path.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "TestCoffeeScript.coffee"),
				_virtualFileSystemWrapper);

			var assets = new List<IAsset>
			{
			    jqueryJsAsset,
			    testCoffeeAsset
			};

			Exception currentException = null;
			var jsAssetTypesValidator = new JsAssetTypesValidator();

			// Act
			try
			{
				jsAssetTypesValidator.Validate(assets);
			}
			catch (Exception ex)
			{
				currentException = ex;
			}

			// Assert
			Assert.IsNotInstanceOf<InvalidAssetTypesException>(currentException);
		}

		[TestFixtureTearDown]
		public void TearDown()
		{
			_virtualFileSystemWrapper = null;
		}
	}
}
