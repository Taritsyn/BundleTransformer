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
	public class JsUnnecessaryAssetsFilterTests
	{
		private const string APPLICATION_ROOT_PATH
			= @"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\";
		private const string SCRIPTS_DIRECTORY_PATH
			= @"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\Scripts\";

		[Test]
		public void UnneededJsAssetsRemovedIsCorrect()
		{
			// Arrange
			var fileSystemWrapper = (new Mock<IFileSystemWrapper>()).Object;

			var ajaxLoginAsset = new Asset(Path.Combine(SCRIPTS_DIRECTORY_PATH, "AjaxLogin.js"),
				APPLICATION_ROOT_PATH, fileSystemWrapper);
			var jqueryMinAsset = new Asset(Path.Combine(SCRIPTS_DIRECTORY_PATH, "jquery-1.6.2.min.js"),
				APPLICATION_ROOT_PATH, fileSystemWrapper);
			var jqueryVsDocAsset = new Asset(Path.Combine(SCRIPTS_DIRECTORY_PATH, "jquery-1.6.2-vsdoc.js"),
				APPLICATION_ROOT_PATH, fileSystemWrapper);
			var jqueryValidateVsDocMinAsset = new Asset(Path.Combine(SCRIPTS_DIRECTORY_PATH, "jquery.validate-vsdoc.min.js"),
				APPLICATION_ROOT_PATH, fileSystemWrapper);
			var microsoftAjaxDebugAsset = new Asset(Path.Combine(SCRIPTS_DIRECTORY_PATH, "MicrosoftAjax.debug.js"),
				APPLICATION_ROOT_PATH, fileSystemWrapper);
			var telerikAllMinAsset = new Asset(Path.Combine(SCRIPTS_DIRECTORY_PATH, "telerik.all.min.js"),
				APPLICATION_ROOT_PATH, fileSystemWrapper);
			var knockoutAsset = new Asset(Path.Combine(SCRIPTS_DIRECTORY_PATH, "knockout-2.0.0.js"),
				APPLICATION_ROOT_PATH, fileSystemWrapper);
			var modernizrAsset = new Asset(Path.Combine(SCRIPTS_DIRECTORY_PATH, "modernizr-2.0.6-development-only.js"),
				APPLICATION_ROOT_PATH, fileSystemWrapper);
			var referencesAsset = new Asset(Path.Combine(SCRIPTS_DIRECTORY_PATH, "_references.js"),
				APPLICATION_ROOT_PATH, fileSystemWrapper);

			var assets = new List<IAsset>
			{
				ajaxLoginAsset,
				jqueryMinAsset,
				jqueryVsDocAsset,
				jqueryValidateVsDocMinAsset,
				microsoftAjaxDebugAsset,
				telerikAllMinAsset,
				knockoutAsset,
				modernizrAsset,
				referencesAsset
			};

			var jsUnnecessaryAssetsFilter = new JsUnnecessaryAssetsFilter(
				new[] { "*-vsdoc.js", "*.all.js", "_references.js" });

			// Act
			IList<IAsset> processedAssets = jsUnnecessaryAssetsFilter.Transform(assets).ToList();

			// Assert
			Assert.AreEqual(5, processedAssets.Count);
			Assert.AreEqual(Path.Combine(SCRIPTS_DIRECTORY_PATH, "AjaxLogin.js"), 
				processedAssets[0].Path);
			Assert.AreEqual(Path.Combine(SCRIPTS_DIRECTORY_PATH, "jquery-1.6.2.min.js"), 
				processedAssets[1].Path);
			Assert.AreEqual(Path.Combine(SCRIPTS_DIRECTORY_PATH, "MicrosoftAjax.debug.js"), 
				processedAssets[2].Path);
			Assert.AreEqual(Path.Combine(SCRIPTS_DIRECTORY_PATH, "knockout-2.0.0.js"), 
				processedAssets[3].Path);
			Assert.AreEqual(Path.Combine(SCRIPTS_DIRECTORY_PATH, "modernizr-2.0.6-development-only.js"), 
				processedAssets[4].Path);
		}

		[Test]
		public void FirstInvalidIgnorePatternProcessedIsCorrect()
		{
			// Arrange
			Exception currentException = null;

			// Act
			try
			{
				var jsUnnecessaryAssetsFilter = new JsUnnecessaryAssetsFilter(new[] { "*", "_references.js" });
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

		[Test]
		public void SecondInvalidIgnorePatternProcessedIsCorrect()
		{
			// Arrange
			Exception currentException = null;

			// Act
			try
			{
				var jsUnnecessaryAssetsFilter = new JsUnnecessaryAssetsFilter(new[] { "*-vsdoc.js", "*.*", "*.all.js" });
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
