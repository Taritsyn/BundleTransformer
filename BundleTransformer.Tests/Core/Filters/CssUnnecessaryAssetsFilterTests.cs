namespace BundleTransformer.Tests.Core.Filters
{
	using System;
	using System.Collections.Generic;
	using System.Linq;

	using Moq;
	using NUnit.Framework;

	using BundleTransformer.Core.Assets;
	using BundleTransformer.Core.FileSystem;
	using BundleTransformer.Core.Filters;
	using BundleTransformer.Core.Helpers;

	[TestFixture]
	public class CssUnnecessaryAssetsFilterTests
	{
		private const string STYLES_DIRECTORY_VIRTUAL_PATH = "~/Content/";
		private const string ALTERNATIVE_STYLES_DIRECTORY_VIRTUAL_PATH = "~/AlternativeContent/";

		[Test]
		public void UnneededCssAssetsRemovedIsCorrect()
		{
			// Arrange
			var virtualFileSystemWrapper = (new Mock<IVirtualFileSystemWrapper>()).Object;

			var siteAsset = new Asset(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, @"Site.css"),
				virtualFileSystemWrapper);
			var jqueryUiAccordionAsset = new Asset(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				@"themes\base\jquery.ui.accordion.css"), virtualFileSystemWrapper);
			var jqueryUiAllAsset = new Asset(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				@"themes\base\jquery.ui.all.css"), virtualFileSystemWrapper);
			var testCssComponentsPathsAsset = new Asset(UrlHelpers.Combine(ALTERNATIVE_STYLES_DIRECTORY_VIRTUAL_PATH,
				@"css\TestCssComponentsPaths.css"), virtualFileSystemWrapper);
			var jqueryUiBaseMinAsset = new Asset(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				@"themes\base\jquery.ui.base.min.css"), virtualFileSystemWrapper);

			var assets = new List<IAsset>
			{
				siteAsset,
				jqueryUiAccordionAsset,
				jqueryUiAllAsset,
				testCssComponentsPathsAsset,
				jqueryUiBaseMinAsset
			};

			var cssUnnecessaryAssetsFilter = new CssUnnecessaryAssetsFilter(
				new[] { "*.all.css", "jquery.ui.base.css" });

			// Act
			IList<IAsset> processedAssets = cssUnnecessaryAssetsFilter.Transform(assets).ToList();

			// Assert
			Assert.AreEqual(3, processedAssets.Count);
			Assert.AreEqual(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, @"Site.css"), 
				processedAssets[0].VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, 
				@"themes\base\jquery.ui.accordion.css"), processedAssets[1].VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(ALTERNATIVE_STYLES_DIRECTORY_VIRTUAL_PATH, 
				@"css\TestCssComponentsPaths.css"), processedAssets[2].VirtualPath);
		}

		[Test]
		public void FirstInvalidIgnorePatternProcessedIsCorrect()
		{
			// Arrange
			Exception currentException = null;

			// Act
			try
			{
				var cssUnnecessaryAssetsFilter = new CssUnnecessaryAssetsFilter(new[] { "*.all.css", "*" });
			}
			catch(Exception ex)
			{
				currentException = ex;
			}

			// Assert
			Assert.IsNotNull(currentException);
			Assert.IsInstanceOf<ArgumentException>(currentException);
			Assert.AreEqual((currentException as ArgumentException).ParamName, "ignorePatterns");
		}

		[Test]
		public void SecondInvalidIgnorePatternProcessedIsCorrect()
		{
			// Arrange
			Exception currentException = null;

			// Act
			try
			{
				var cssUnnecessaryAssetsFilter = new CssUnnecessaryAssetsFilter(new[] { "*.*", "jquery.ui.base.css" });
			}
			catch (Exception ex)
			{
				currentException = ex;
			}

			// Assert
			Assert.IsNotNull(currentException);
			Assert.IsInstanceOf<ArgumentException>(currentException);
			Assert.AreEqual((currentException as ArgumentException).ParamName, "ignorePatterns");
		}
	}
}