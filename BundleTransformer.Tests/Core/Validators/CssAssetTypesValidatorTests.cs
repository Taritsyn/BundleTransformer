namespace BundleTransformer.Tests.Core.Validators
{
	using System;
	using System.Collections.Generic;
	using System.IO;

	using Moq;
	using NUnit.Framework;

	using BundleTransformer.Core.Assets;
	using BundleTransformer.Core.FileSystem;
	using BundleTransformer.Core.Validators;

	[TestFixture]
	public class CssAssetTypesValidatorTests
	{
		private const string APPLICATION_ROOT_PATH
			= @"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\";
		private const string STYLES_DIRECTORY_PATH
			= @"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\Content\";
		private const string SCRIPTS_DIRECTORY_PATH
			= @"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\Scripts\";

		private IFileSystemWrapper _fileSystemWrapper;

		[TestFixtureSetUp]
		public void SetUp()
		{
			_fileSystemWrapper = (new Mock<IFileSystemWrapper>()).Object;
		}

		[Test]
		public void CssAssetsListContainAssetsWithInvalidTypes()
		{
			// Arrange
			var siteCssAsset = new Asset(
				Path.Combine(STYLES_DIRECTORY_PATH, @"Site.css"),
				APPLICATION_ROOT_PATH, _fileSystemWrapper);

			var jqueryJsAsset = new Asset(
				Path.Combine(SCRIPTS_DIRECTORY_PATH, @"jquery-1.6.2.js"),
				APPLICATION_ROOT_PATH, _fileSystemWrapper);

			var testLessAsset = new Asset(
				Path.Combine(STYLES_DIRECTORY_PATH, @"TestLess.less"),
				APPLICATION_ROOT_PATH, _fileSystemWrapper);

			var testCoffeeAsset = new Asset(
				Path.Combine(SCRIPTS_DIRECTORY_PATH, @"TestCoffeeScript.coffee"),
				APPLICATION_ROOT_PATH, _fileSystemWrapper);

			var testPlainTextAsset = new Asset(
				Path.Combine(APPLICATION_ROOT_PATH, @"TestPlainText.txt"),
				APPLICATION_ROOT_PATH, _fileSystemWrapper);

			var assets = new List<IAsset>
			{
				siteCssAsset,
				jqueryJsAsset,
				testLessAsset,
				testCoffeeAsset,
				testPlainTextAsset
			};

			Exception currentException = null;
			var cssAssetTypesValidator = new CssAssetTypesValidator();

			// Act
			try
			{
				cssAssetTypesValidator.Validate(assets);
			}
			catch(Exception ex)
			{
				currentException = ex;
			}

			var invalidAssetsUrls = new string[0];
			var invalidAssetTypesException = (InvalidAssetTypesException)currentException;
			if (invalidAssetTypesException != null)
			{
				invalidAssetsUrls = invalidAssetTypesException.InvalidAssetsUrls;
			}

			// Assert
			Assert.IsInstanceOf<InvalidAssetTypesException>(currentException);
			Assert.AreEqual(3, invalidAssetsUrls.Length);
			Assert.Contains(jqueryJsAsset.Url, invalidAssetsUrls);
			Assert.Contains(testCoffeeAsset.Url, invalidAssetsUrls);
			Assert.Contains(testPlainTextAsset.Url, invalidAssetsUrls);
		}

		[Test]
		public void CssAssetsListNotContainAssetsWithInvalidTypes()
		{
			// Arrange
			var siteCssAsset = new Asset(
				Path.Combine(STYLES_DIRECTORY_PATH, @"Site.css"),
				APPLICATION_ROOT_PATH, _fileSystemWrapper);

			var testLessAsset = new Asset(
				Path.Combine(STYLES_DIRECTORY_PATH, @"TestLess.less"),
				APPLICATION_ROOT_PATH, _fileSystemWrapper);

			var assets = new List<IAsset>
			{
				siteCssAsset,
				testLessAsset
			};

			Exception currentException = null;

			var cssAssetTypesValidator = new CssAssetTypesValidator();

			// Act
			try
			{
				cssAssetTypesValidator.Validate(assets);
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
			_fileSystemWrapper = null;
		}
	}
}
