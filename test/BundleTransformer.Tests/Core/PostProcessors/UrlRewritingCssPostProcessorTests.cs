using Moq;
using Xunit;

using BundleTransformer.Core.Assets;
using BundleTransformer.Core.FileSystem;
using BundleTransformer.Core.Helpers;
using BundleTransformer.Core.PostProcessors;

namespace BundleTransformer.Tests.Core.PostProcessors
{
	public class UrlRewritingCssPostProcessorTests : IClassFixture<ApplicationSetupFixture>
	{
		private const string STYLES_DIRECTORY_VIRTUAL_PATH = "/Content/";


		[Fact]
		public void UrlRewritingOfReferencedSvgPatternIsCorrect()
		{
			// Arrange
			var virtualFileSystemMock = new Mock<IVirtualFileSystemWrapper>();

			string testCssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "Test.css");
			string testCssAssetContent = @".card_slot_mapping_arrow__line {
	marker-end: url('#triangle');
}"
			;
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
				.Returns(testCssAssetContent)
				;

			IVirtualFileSystemWrapper virtualFileSystemWrapper = virtualFileSystemMock.Object;
			IRelativePathResolver commonRelativePathResolver = new CommonRelativePathResolver(virtualFileSystemWrapper);

			var urlRewritingCssPostProcessor = new UrlRewritingCssPostProcessor(commonRelativePathResolver);
			IAsset asset = new Asset(testCssAssetVirtualPath, virtualFileSystemWrapper);

			// Act
			asset = urlRewritingCssPostProcessor.PostProcess(asset);

			// Assert
			Assert.Equal(testCssAssetContent, asset.Content);
		}
	}
}