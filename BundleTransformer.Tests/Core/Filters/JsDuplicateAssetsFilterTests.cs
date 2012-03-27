namespace BundleTransformer.Tests.Core.Filters
{
	using System.Collections.Generic;
	using System.IO;

	using Moq;
	using NUnit.Framework;

	using BundleTransformer.Core.Assets;
	using BundleTransformer.Core.FileSystem;
	using BundleTransformer.Core.Filters;

	[TestFixture]
	public class JsDuplicateAssetsFilterTests
	{
		private const string SCRIPTS_DIRECTORY_PATH = 
			@"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\Scripts\";

		[Test]
		public void DuplicateJsAssetsRemovedIsCorrect()
		{
			// Arrange
			var applicationInfo = new HttpApplicationInfo("/", 
				@"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\");
			var fileSystemWrapper = (new Mock<IFileSystemWrapper>()).Object;

			var jqueryAsset = new Asset(Path.Combine(SCRIPTS_DIRECTORY_PATH, "jquery-1.6.2.js"),
				applicationInfo, fileSystemWrapper);
			var jqueryMinAsset = new Asset(Path.Combine(SCRIPTS_DIRECTORY_PATH, "jquery-1.6.2.min.js"),
				applicationInfo, fileSystemWrapper);
			var ajaxLoginAsset = new Asset(Path.Combine(SCRIPTS_DIRECTORY_PATH, "AjaxLogin.js"),
				applicationInfo, fileSystemWrapper);
			var microsoftAjaxAsset = new Asset(Path.Combine(SCRIPTS_DIRECTORY_PATH, "MicrosoftAjax.js"),
				applicationInfo, fileSystemWrapper);
			var microsoftAjaxDebugAsset = new Asset(Path.Combine(SCRIPTS_DIRECTORY_PATH, "MicrosoftAjax.debug.js"),
				applicationInfo, fileSystemWrapper);
			var modernizrAsset = new Asset(Path.Combine(SCRIPTS_DIRECTORY_PATH, "modernizr-2.0.6-development-only.js"),
				applicationInfo, fileSystemWrapper);
			var ajaxLoginDuplicateAsset = new Asset(Path.Combine(SCRIPTS_DIRECTORY_PATH, "ajaxlogin.js"),
				applicationInfo, fileSystemWrapper);

			IList<IAsset> assets = new List<IAsset>
			{
				jqueryAsset,
				jqueryMinAsset,
				ajaxLoginAsset,
				microsoftAjaxAsset,
				microsoftAjaxDebugAsset,
				modernizrAsset,
				ajaxLoginDuplicateAsset
			};

			var jsDuplicateFilter = new JsDuplicateAssetsFilter();

			// Act
			IList<IAsset> processedAssets = jsDuplicateFilter.Transform(assets);

			// Assert
			Assert.AreEqual(Path.Combine(SCRIPTS_DIRECTORY_PATH, "jquery-1.6.2.js"), processedAssets[0].Path);
			Assert.AreEqual(Path.Combine(SCRIPTS_DIRECTORY_PATH, "AjaxLogin.js"), processedAssets[1].Path);
			Assert.AreEqual(Path.Combine(SCRIPTS_DIRECTORY_PATH, "MicrosoftAjax.js"), processedAssets[2].Path);
			Assert.AreEqual(Path.Combine(SCRIPTS_DIRECTORY_PATH, "modernizr-2.0.6-development-only.js"), 
				processedAssets[3].Path);
		}
	}
}
