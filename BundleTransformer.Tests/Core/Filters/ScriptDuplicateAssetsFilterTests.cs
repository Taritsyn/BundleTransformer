namespace BundleTransformer.Tests.Core.Filters
{
	using System.Collections.Generic;

	using Moq;
	using NUnit.Framework;

	using BundleTransformer.Core.Assets;
	using BundleTransformer.Core.FileSystem;
	using BundleTransformer.Core.Filters;
	using BundleTransformer.Core.Helpers;

	[TestFixture]
	public class ScriptDuplicateAssetsFilterTests
	{
		private const string SCRIPTS_DIRECTORY_VIRTUAL_PATH = "~/Scripts/";

		[Test]
		public void DuplicateScriptAssetsRemovedIsCorrect()
		{
			// Arrange
			var virtualFileSystemWrapper = (new Mock<IVirtualFileSystemWrapper>()).Object;

			var jqueryMinAsset = new Asset(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "jquery-1.6.2.min.js"),
				virtualFileSystemWrapper);
			var jqueryAsset = new Asset(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "jquery-1.6.2.js"),
				virtualFileSystemWrapper);
			var ajaxLoginAsset = new Asset(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "AjaxLogin.js"),
				virtualFileSystemWrapper);
			var microsoftAjaxDebugAsset = new Asset(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"MicrosoftAjax.debug.js"), virtualFileSystemWrapper);
			var microsoftAjaxAsset = new Asset(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"MicrosoftAjax.js"), virtualFileSystemWrapper);
			var modernizrAsset = new Asset(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"modernizr-2.0.6-development-only.js"), virtualFileSystemWrapper);
			var ajaxLoginDuplicateAsset = new Asset(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"ajaxlogin.js"), virtualFileSystemWrapper);

			IList<IAsset> assets = new List<IAsset>
			{
				jqueryMinAsset,
				jqueryAsset,
				ajaxLoginAsset,
				microsoftAjaxDebugAsset,
				microsoftAjaxAsset,
				modernizrAsset,
				ajaxLoginDuplicateAsset
			};

			var scriptDuplicateFilter = new ScriptDuplicateAssetsFilter();

			// Act
			IList<IAsset> processedAssets = scriptDuplicateFilter.Transform(assets);

			// Assert
			Assert.AreEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "jquery-1.6.2.min.js"), 
				processedAssets[0].VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "AjaxLogin.js"), 
				processedAssets[1].VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "MicrosoftAjax.debug.js"), 
				processedAssets[2].VirtualPath);
			Assert.AreEqual(UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, "modernizr-2.0.6-development-only.js"), 
				processedAssets[3].VirtualPath);
		}
	}
}