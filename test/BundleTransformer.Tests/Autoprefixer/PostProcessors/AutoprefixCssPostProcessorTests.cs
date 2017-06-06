using System;
using System.Collections.Generic;

using JavaScriptEngineSwitcher.Core;
using Moq;
using Xunit;

using BundleTransformer.Core.Assets;
using BundleTransformer.Core.FileSystem;
using BundleTransformer.Core.Helpers;

using BundleTransformer.Autoprefixer.Configuration;
using BundleTransformer.Autoprefixer.PostProcessors;

namespace BundleTransformer.Tests.Autoprefixer.PostProcessors
{
	public class AutoprefixCssPostProcessorTests : IClassFixture<ApplicationSetupFixture>
	{
		private const string STYLES_DIRECTORY_VIRTUAL_PATH = "/Content/";


		[Fact]
		public void FillingOfDependenciesIsCorrect()
		{
			// Arrange
			var virtualFileSystemMock = new Mock<IVirtualFileSystemWrapper>();

			string testCssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "Test.css");
			virtualFileSystemMock
				.Setup(fs => fs.ToAbsolutePath(testCssAssetVirtualPath))
				.Returns(testCssAssetVirtualPath)
				;
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(testCssAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(testCssAssetVirtualPath))
				.Returns(@":fullscreen a
{
	display: flex
}")
				;

			const string customStatisticsFileVirtualPath = "~/App_Data/BundleTransformer/stats.json";
			virtualFileSystemMock
				.Setup(fs => fs.ToAbsolutePath(customStatisticsFileVirtualPath))
				.Returns(customStatisticsFileVirtualPath.Replace("~/", "/"))
				;
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(customStatisticsFileVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(customStatisticsFileVirtualPath))
				.Returns(@"{
	""name"": ""All data of website"",
	""id"": ""90598522|undefined"",
	""type"": ""custom"",
	""source"": ""google_analytics"",
	""dataByBrowser"": {},
	""meta"": {
		""start_date"": ""2015-12-20"",
		""end_date"": ""2016-01-19""
	},
	""uid"": ""custom.90598522|undefined""
}")
				;

			Func<IJsEngine> createJsEngineInstance =
				() => JsEngineSwitcher.Instance.CreateDefaultEngine();
			IVirtualFileSystemWrapper virtualFileSystemWrapper = virtualFileSystemMock.Object;
			var autoprefixerConfig = new AutoprefixerSettings
			{
				Stats = customStatisticsFileVirtualPath
			};

			var autoprefixCssPostProcessor = new AutoprefixCssPostProcessor(createJsEngineInstance,
				virtualFileSystemWrapper, autoprefixerConfig);
			IAsset asset = new Asset(testCssAssetVirtualPath, virtualFileSystemWrapper);

			// Act
			asset = autoprefixCssPostProcessor.PostProcess(asset);
			IList<string> dependencies = asset.VirtualPathDependencies;

			// Assert
			Assert.Equal(1, dependencies.Count);
			Assert.Equal("/App_Data/BundleTransformer/stats.json", dependencies[0]);
		}
	}
}