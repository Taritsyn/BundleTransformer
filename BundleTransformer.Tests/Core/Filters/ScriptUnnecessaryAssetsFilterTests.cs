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
	public class ScriptUnnecessaryAssetsFilterTests
	{
		private const string SCRIPTS_DIRECTORY_VIRTUAL_PATH = "~/Scripts/";

		[Test]
		public void UnneededScriptAssetsRemovedIsCorrect()
		{
			// Arrange
			var virtualFileSystemWrapper = (new Mock<IVirtualFileSystemWrapper>()).Object;

			var ajaxLoginAsset = new Asset(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"AjaxLogin.js"), virtualFileSystemWrapper);
			var jqueryMinAsset = new Asset(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"jquery-1.6.2.min.js"), virtualFileSystemWrapper);
			var jqueryVsDocAsset = new Asset(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"jquery-1.6.2-vsdoc.js"), virtualFileSystemWrapper);
			var jqueryValidateVsDocMinAsset = new Asset(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"jquery.validate-vsdoc.min.js"), virtualFileSystemWrapper);
			var microsoftAjaxDebugAsset = new Asset(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"MicrosoftAjax.debug.js"), virtualFileSystemWrapper);
			var telerikAllMinAsset = new Asset(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"telerik.all.min.js"), virtualFileSystemWrapper);
			var knockoutAsset = new Asset(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"knockout-2.0.0.js"), virtualFileSystemWrapper);
			var modernizrAsset = new Asset(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"modernizr-2.0.6-development-only.js"), virtualFileSystemWrapper);
			var referencesAsset = new Asset(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"_references.js"), virtualFileSystemWrapper);

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

			var scriptUnnecessaryAssetsFilter = new ScriptUnnecessaryAssetsFilter(
				new[] { "*-vsdoc.js", "*.all.js", "_references.js" });

			// Act
			IList<IAsset> processedAssets = scriptUnnecessaryAssetsFilter.Transform(assets).ToList();

			// Assert
			Assert.AreEqual(5, processedAssets.Count);
			Assert.AreEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "AjaxLogin.js"), 
				processedAssets[0].VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "jquery-1.6.2.min.js"), 
				processedAssets[1].VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "MicrosoftAjax.debug.js"), 
				processedAssets[2].VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "knockout-2.0.0.js"), 
				processedAssets[3].VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"modernizr-2.0.6-development-only.js"), processedAssets[4].VirtualPath);
		}

		[Test]
		public void FirstInvalidIgnorePatternProcessedIsCorrect()
		{
			// Arrange
			Exception currentException = null;

			// Act
			try
			{
				var scriptUnnecessaryAssetsFilter = new ScriptUnnecessaryAssetsFilter(new[] { "*", "_references.js" });
			}
			catch (Exception ex)
			{
				currentException = ex;
			}

			// Assert
			Assert.IsNotNull(currentException);
			Assert.IsInstanceOf<ArgumentException>(currentException);
			Assert.AreEqual(((ArgumentException)currentException).ParamName, "ignorePatterns");
		}

		[Test]
		public void SecondInvalidIgnorePatternProcessedIsCorrect()
		{
			// Arrange
			Exception currentException = null;

			// Act
			try
			{
				var scriptUnnecessaryAssetsFilter = new ScriptUnnecessaryAssetsFilter(new[] { "*-vsdoc.js", "*.*", "*.all.js" });
			}
			catch (Exception ex)
			{
				currentException = ex;
			}

			// Assert
			Assert.IsNotNull(currentException);
			Assert.IsInstanceOf<ArgumentException>(currentException);
			Assert.AreEqual(((ArgumentException)currentException).ParamName, "ignorePatterns");
		}
	}
}