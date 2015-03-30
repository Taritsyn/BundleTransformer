namespace BundleTransformer.Tests.Less.Translators
{
	using System;
	using System.Text;

	using JavaScriptEngineSwitcher.Core;
	using Moq;
	using NUnit.Framework;

	using BundleTransformer.Core.Assets;
	using BundleTransformer.Core.FileSystem;
	using BundleTransformer.Core.Helpers;

	using BundleTransformer.Less;
	using BundleTransformer.Less.Configuration;
	using BundleTransformer.Less.Translators;

	[TestFixture]
	public class LessTranslatorTests
	{
		private const string STYLES_DIRECTORY_VIRTUAL_PATH = "/Content/";
		private const string STYLES_DIRECTORY_URL = "/Content/";

		[Test]
		public void FillingOfImportedLessFilePathsIsCorrect()
		{
			// Arrange
			var virtualFileSystemMock = new Mock<IVirtualFileSystemWrapper>();
			var encoding = Encoding.Default;

			string mixinsLessAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "Mixins.less");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(mixinsLessAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(mixinsLessAssetVirtualPath))
				.Returns(@"// Border Radius
.border-radius(@radius) {
  -webkit-border-radius: @radius;
     -moz-border-radius: @radius;
          border-radius: @radius;
}")
				;

			string selectorsLessAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "Selectors.less");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(selectorsLessAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(selectorsLessAssetVirtualPath))
				.Returns(@"// Visible
.visible
{
	display: block;
}")
				;

			string testLessImportLessAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"TestLessImport.less");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(testLessImportLessAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(testLessImportLessAssetVirtualPath))
				.Returns(@"@alt-bg-color: #143352;

.translators #less
{
	background-color: @alt-bg-color;
}

.icon-headphone
{
	display: inline;
	background-image: data-uri('headphone.gif');
}

.icon-google-plus
{
	display: inline;
	background-image: data-uri('google-plus.svg');
}

@import (multiple) url(		""TestLessImport.Sub1.less""	);
.singleline-comment { content: ""//"" } .triple-slash-directive { content: '///' } @import 'TestLessImport.Sub2';
/*@import 'TestLessImport.Sub3.less';
@import 'TestLessImport.Sub4.less';*/
// @import ""TestLessImport.Sub5.less"";
// Obsolete import //@import ""TestLessImport.Sub6.less"";
.icon-bean { background-image: url(http://taritsyn.files.wordpress.com/2013/08/bean.png); } //@import ""TestLessImport.Sub7.less"";
// @import ""TestLessImport.Sub8.less""; @import ""TestLessImport.Sub9.less"";
")
				;


			string headphoneGifAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "headphone.gif");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(headphoneGifAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.IsTextFile(headphoneGifAssetVirtualPath, 256, out encoding))
				.Returns(false)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileBinaryContent(headphoneGifAssetVirtualPath))
				.Returns(new byte[0])
				;


			string googlePlusSvgAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "google-plus.svg");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(googlePlusSvgAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.IsTextFile(googlePlusSvgAssetVirtualPath, 256, out encoding))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(googlePlusSvgAssetVirtualPath))
				.Returns(string.Empty)
				;


			string testLessImportSub1LessAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"TestLessImport.Sub1.less");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(testLessImportSub1LessAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(testLessImportSub1LessAssetVirtualPath))
				.Returns(@"@import url(http://fonts.googleapis.com/css?family=Limelight&subset=latin,latin-ext);

@border-color: #143352;

.translators #less
{
	border-color: @border-color;
}

.icon-network
{
	display: inline;
	background-image: data-uri('image/png;base64', ""@network.png"");
}

@import url(""TagIcon.css"");")
				;


			string networkPngAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "@network.png");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(networkPngAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.IsTextFile(networkPngAssetVirtualPath, 256, out encoding))
				.Returns(false)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileBinaryContent(networkPngAssetVirtualPath))
				.Returns(new byte[0])
				;


			string tagIconCssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "TagIcon.css");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(tagIconCssAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(tagIconCssAssetVirtualPath))
				.Returns(@".icon-tag
{
	display: inline;
	background-image: url(tag.png) !important;
}")
				;


			string testLessImportSub2LessAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"TestLessImport.Sub2.less");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(testLessImportSub2LessAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(testLessImportSub2LessAssetVirtualPath))
				.Returns(@"@import 'http://fonts.googleapis.com/css?family=Limelight&subset=latin,latin-ext';
@import (css) ""UsbFlashDriveIcon"";
@import (less) ""ValidationIcon.css"";
@import (inline) ""MicroformatsIcon.css"";
@import (inline, css) 'NodeIcon.less';
@import (css) ""OpenIdIcon.less"";
@import (optional) ""PrinterIcon.less"";
@import (optional) ""NonExistentIcon.less"";")
				;


			string usbFlashDriveIconCssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"UsbFlashDriveIcon.css");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(usbFlashDriveIconCssAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(usbFlashDriveIconCssAssetVirtualPath))
				.Returns(@".icon-usb-flash-drive
{
	display: inline;
	background-image: ""usb-flash-drive.png"" !important;
}")
				;

			string validationIconCssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"ValidationIcon.css");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(validationIconCssAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(validationIconCssAssetVirtualPath))
				.Returns(@".icon-validation
{
	display: inline;
	background-image: url('validation.png') !important;
}")
				;

			string microformatsIconCssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"MicroformatsIcon.css");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(microformatsIconCssAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(microformatsIconCssAssetVirtualPath))
				.Returns(@".icon-microformats
{
	display: inline;
	background-image: url(microformats.png) !important;
}")
				;

			string nodeIconLessAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"NodeIcon.less");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(nodeIconLessAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(nodeIconLessAssetVirtualPath))
				.Returns(@".icon-node
{
	display: inline;
	background-image: url(node.png) !important;
}")
				;

			string openIdIconLessAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"OpenIdIcon.less");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(openIdIconLessAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(openIdIconLessAssetVirtualPath))
				.Returns(@".icon-openid
{
	display: inline;
	background-image: url(openid.png) !important;
}")
				;

			string printerIconLessAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"PrinterIcon.less");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(printerIconLessAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(printerIconLessAssetVirtualPath))
				.Returns(@".icon-printer
{
	display: inline;
	background-image: url(printer.png) !important;
}")
				;

			string nonExistentIconLessAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"NonExistentIcon.less");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(nonExistentIconLessAssetVirtualPath))
				.Returns(false)
				;

			Func<IJsEngine> createJsEngineInstance = () => (new Mock<IJsEngine>()).Object;
			IVirtualFileSystemWrapper virtualFileSystemWrapper = virtualFileSystemMock.Object;
			IRelativePathResolver relativePathResolver = new MockRelativePathResolver();
			var lessConfig = new LessSettings();

			var lessTranslator = new LessTranslator(createJsEngineInstance,
				virtualFileSystemWrapper, relativePathResolver, lessConfig);
			const string assetContent = @"@import (once) ""Mixins.less"";
@import (reference) ""Selectors.less"";
@import url(""data:text/css;base64,Ym9keSB7IGJhY2tncm91bmQtY29sb3I6IGxpbWUgIWltcG9ydGFudDsgfQ=="");

@bg-color: #7AC0DA;
@caption-color: #FFFFFF;
@monitor-icon-url: ""monitor.png"";

.translators #less
{
	float: left;
	.visible();
	padding: 0.2em 0.5em 0.2em 0.5em;
	background-color: @bg-color;
	color: @caption-color;
	font-weight: bold;
	border: 1px solid @bg-color;
	.border-radius(5px);
}

.icon-monitor
{
	display: inline;
	background-image: url(""@{monitor-icon-url}"");
}

@import (once) ""TestLessImport.less"";";
			string assetUrl = UrlHelpers.Combine(STYLES_DIRECTORY_URL, "TestLess.less");
			LessStylesheet stylesheet = lessTranslator.PreprocessStylesheet(assetContent, assetUrl,
				new LessImportOptions(".less"));
			var dependencies = new DependencyCollection();

			// Act
			lessTranslator.FillDependencies(assetUrl, stylesheet, dependencies);

			// Assert
			Assert.AreEqual(17, dependencies.Count);

			Dependency mixinsLessAsset = dependencies[0];
			Dependency selectorsLessAsset = dependencies[1];
			Dependency testLessImportLessAsset = dependencies[2];
			Dependency headphoneGifAsset = dependencies[3];
			Dependency googlePlusSvgAsset = dependencies[4];
			Dependency testLessImportSub1LessAsset = dependencies[5];
			Dependency networkPngAsset = dependencies[6];
			Dependency googleFontAsset = dependencies[7];
			Dependency tagIconCssAsset = dependencies[8];
			Dependency testLessImportSub2LessAsset = dependencies[9];
			Dependency usbFlashDriveIconCssAsset = dependencies[10];
			Dependency validationIconCssAsset = dependencies[11];
			Dependency microformatsIconCssAsset = dependencies[12];
			Dependency nodeIconLessAsset = dependencies[13];
			Dependency openIdIconLessAsset = dependencies[14];
			Dependency printerIconLessAsset = dependencies[15];
			Dependency nonExistentIconLessAsset = dependencies[16];

			Assert.AreEqual(mixinsLessAssetVirtualPath, mixinsLessAsset.Url);
			Assert.AreEqual(true, mixinsLessAsset.IsObservable);

			Assert.AreEqual(selectorsLessAssetVirtualPath, selectorsLessAsset.Url);
			Assert.AreEqual(true, selectorsLessAsset.IsObservable);

			Assert.AreEqual(testLessImportLessAssetVirtualPath, testLessImportLessAsset.Url);
			Assert.AreEqual(true, testLessImportLessAsset.IsObservable);

			Assert.AreEqual(headphoneGifAssetVirtualPath, headphoneGifAsset.Url);
			Assert.AreEqual(true, headphoneGifAsset.IsObservable);

			Assert.AreEqual(googlePlusSvgAssetVirtualPath, googlePlusSvgAsset.Url);
			Assert.AreEqual(true, googlePlusSvgAsset.IsObservable);

			Assert.AreEqual(testLessImportSub1LessAssetVirtualPath, testLessImportSub1LessAsset.Url);
			Assert.AreEqual(true, testLessImportSub1LessAsset.IsObservable);

			Assert.AreEqual(networkPngAssetVirtualPath, networkPngAsset.Url);
			Assert.AreEqual(true, networkPngAsset.IsObservable);

			Assert.AreEqual("http://fonts.googleapis.com/css?family=Limelight&subset=latin,latin-ext",
				googleFontAsset.Url);
			Assert.AreEqual(false, googleFontAsset.IsObservable);

			Assert.AreEqual(tagIconCssAssetVirtualPath, tagIconCssAsset.Url);
			Assert.AreEqual(false, tagIconCssAsset.IsObservable);

			Assert.AreEqual(testLessImportSub2LessAssetVirtualPath, testLessImportSub2LessAsset.Url);
			Assert.AreEqual(true, testLessImportSub2LessAsset.IsObservable);

			Assert.AreEqual(usbFlashDriveIconCssAssetVirtualPath, usbFlashDriveIconCssAsset.Url);
			Assert.AreEqual(false, usbFlashDriveIconCssAsset.IsObservable);

			Assert.AreEqual(validationIconCssAssetVirtualPath, validationIconCssAsset.Url);
			Assert.AreEqual(true, validationIconCssAsset.IsObservable);

			Assert.AreEqual(microformatsIconCssAssetVirtualPath, microformatsIconCssAsset.Url);
			Assert.AreEqual(true, microformatsIconCssAsset.IsObservable);

			Assert.AreEqual(nodeIconLessAssetVirtualPath, nodeIconLessAsset.Url);
			Assert.AreEqual(true, nodeIconLessAsset.IsObservable);

			Assert.AreEqual(openIdIconLessAssetVirtualPath, openIdIconLessAsset.Url);
			Assert.AreEqual(false, openIdIconLessAsset.IsObservable);

			Assert.AreEqual(printerIconLessAssetVirtualPath, printerIconLessAsset.Url);
			Assert.AreEqual(true, printerIconLessAsset.IsObservable);

			Assert.AreEqual(nonExistentIconLessAssetVirtualPath, nonExistentIconLessAsset.Url);
			Assert.AreEqual(true, nonExistentIconLessAsset.IsObservable);
		}

		private class MockRelativePathResolver : IRelativePathResolver
		{
			public string ResolveRelativePath(string basePath, string relativePath)
			{
				return UrlHelpers.Combine(STYLES_DIRECTORY_URL, relativePath);
			}
		}
	}
}