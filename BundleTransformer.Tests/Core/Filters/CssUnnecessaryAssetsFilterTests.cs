namespace BundleTransformer.Tests.Core.Filters
{
	using System;
	using System.Collections.Generic;
	using System.IO;
	using System.Linq;

	using Moq;
	using NUnit.Framework;

	using BundleTransformer.Core.Assets;
	using BundleTransformer.Core.FileSystem;
	using BundleTransformer.Core.Filters;

	[TestFixture]
	public class CssUnnecessaryAssetsFilterTests
	{
		private const string STYLES_DIRECTORY_PATH = 
			@"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\Content\";
		private const string ALTERNATIVE_STYLES_DIRECTORY_PATH = 
			@"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\AlternativeContent\";

		[Test]
		public void UnneededCssAssetsRemovedIsCorrect()
		{
			// Arrange
			var applicationInfo = new HttpApplicationInfo("/", 
				@"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\");
			var fileSystemWrapper = (new Mock<IFileSystemWrapper>()).Object;

			var siteAsset = new Asset(Path.Combine(STYLES_DIRECTORY_PATH, @"Site.css"),
				applicationInfo, fileSystemWrapper);
			var jqueryUiAccordionAsset = new Asset(Path.Combine(STYLES_DIRECTORY_PATH,
				@"\themes\base\jquery.ui.accordion.css"), applicationInfo, fileSystemWrapper);
			var jqueryUiAllAsset = new Asset(Path.Combine(STYLES_DIRECTORY_PATH,
				@"\themes\base\jquery.ui.all.css"), applicationInfo, fileSystemWrapper);
			var testCssComponentsPathsAsset = new Asset(Path.Combine(ALTERNATIVE_STYLES_DIRECTORY_PATH,
				@"\css\TestCssComponentsPaths.css"), applicationInfo, fileSystemWrapper);
			var jqueryUiBaseMinAsset = new Asset(Path.Combine(STYLES_DIRECTORY_PATH,
				@"\themes\base\jquery.ui.base.min.css"), applicationInfo, fileSystemWrapper);

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
			Assert.AreEqual(Path.Combine(STYLES_DIRECTORY_PATH, @"Site.css"), processedAssets[0].Path);
			Assert.AreEqual(Path.Combine(STYLES_DIRECTORY_PATH, 
				@"\themes\base\jquery.ui.accordion.css"), processedAssets[1].Path);
			Assert.AreEqual(Path.Combine(ALTERNATIVE_STYLES_DIRECTORY_PATH, 
				@"\css\TestCssComponentsPaths.css"), processedAssets[2].Path);
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
