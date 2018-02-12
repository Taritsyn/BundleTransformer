using System;
using System.Collections.Generic;

using JavaScriptEngineSwitcher.Core;
using Moq;
using Xunit;

using BundleTransformer.Core.Assets;
using BundleTransformer.Core.FileSystem;
using BundleTransformer.Core.Helpers;

using BundleTransformer.Less.Configuration;
using BundleTransformer.Less.Translators;

namespace BundleTransformer.Tests.Less.Translators
{
	public class LessTranslatorTests : IClassFixture<ApplicationSetupFixture>
	{
		private const string STYLES_DIRECTORY_VIRTUAL_PATH = "/Content/";


		[Fact]
		public void FillingOfDependenciesIsCorrect()
		{
			// Arrange
			var virtualFileSystemMock = new Mock<IVirtualFileSystemWrapper>();

			string testLessLessAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "TestLess.less");
			virtualFileSystemMock
				.Setup(fs => fs.ToAbsolutePath(testLessLessAssetVirtualPath))
				.Returns(testLessLessAssetVirtualPath)
				;
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(testLessLessAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(testLessLessAssetVirtualPath))
				.Returns(@"@import (once) ""Mixins.less"";
@import (reference) ""Variables.less"";
//@import url(""data:text/css;base64,Ym9keSB7IGJhY2tncm91bmQtY29sb3I6IGxpbWUgIWltcG9ydGFudDsgfQ=="");

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
	background-image: url(""@{icons-path}monitor.png"");
}

@import (once) ""TestLessImport.less"";")
				;

			string mixinsLessAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "Mixins.less");
			virtualFileSystemMock
				.Setup(fs => fs.ToAbsolutePath(mixinsLessAssetVirtualPath))
				.Returns(mixinsLessAssetVirtualPath)
				;
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
}

// Visible
.visible
{
	display: block;
}")
				;

			string variablesLessAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "Variables.less");
			virtualFileSystemMock
				.Setup(fs => fs.ToAbsolutePath(variablesLessAssetVirtualPath))
				.Returns(variablesLessAssetVirtualPath)
				;
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(variablesLessAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(variablesLessAssetVirtualPath))
				.Returns(@"@bg-color: #7AC0DA;
@caption-color: #FFFFFF;
@stylesheets-path: ""/Content/"";
@icons-path: ""/Content/images/icons/"";")
				;

			string testLessImportLessAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"TestLessImport.less");
			virtualFileSystemMock
				.Setup(fs => fs.ToAbsolutePath(testLessImportLessAssetVirtualPath))
				.Returns(testLessImportLessAssetVirtualPath)
				;
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
	background-image: data-uri('@{icons-path}headphone.gif');
}

.icon-google-plus
{
	display: inline;
	background-image: data-uri('google-plus.svg');
}

@import (multiple) url(		""TestLessImport.Sub1.less""	);
.singleline-comment { content: ""//"" } .triple-slash-directive { content: '///' } @import '@{stylesheets-path}TestLessImport.Sub2';
/*@import 'TestLessImport.Sub3.less';
@import 'TestLessImport.Sub4.less';*/
// @import ""TestLessImport.Sub5.less"";
// Obsolete import //@import ""TestLessImport.Sub6.less"";
.icon-bean { background-image: url(http://taritsyn.files.wordpress.com/2013/08/bean.png); } //@import ""TestLessImport.Sub7.less"";
// @import ""TestLessImport.Sub8.less""; @import ""TestLessImport.Sub9.less"";
")
				;


			string headphoneGifAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "images/icons/headphone.gif");
			virtualFileSystemMock
				.Setup(fs => fs.ToAbsolutePath(headphoneGifAssetVirtualPath))
				.Returns(headphoneGifAssetVirtualPath)
				;
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(headphoneGifAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileBinaryContent(headphoneGifAssetVirtualPath))
				.Returns(new byte[0])
				;


			string googlePlusSvgAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "google-plus.svg");
			virtualFileSystemMock
				.Setup(fs => fs.ToAbsolutePath(googlePlusSvgAssetVirtualPath))
				.Returns(googlePlusSvgAssetVirtualPath)
				;
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(googlePlusSvgAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(googlePlusSvgAssetVirtualPath))
				.Returns(string.Empty)
				;


			string testLessImportSub1LessAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"TestLessImport.Sub1.less");
			virtualFileSystemMock
				.Setup(fs => fs.ToAbsolutePath(testLessImportSub1LessAssetVirtualPath))
				.Returns(testLessImportSub1LessAssetVirtualPath)
				;
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(testLessImportSub1LessAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(testLessImportSub1LessAssetVirtualPath))
				.Returns(@"//@import url(http://fonts.googleapis.com/css?family=Limelight&subset=latin,latin-ext);

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
				.Setup(fs => fs.ToAbsolutePath(networkPngAssetVirtualPath))
				.Returns(networkPngAssetVirtualPath)
				;
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(networkPngAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileBinaryContent(networkPngAssetVirtualPath))
				.Returns(new byte[0])
				;


			string tagIconCssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "TagIcon.css");
			virtualFileSystemMock
				.Setup(fs => fs.ToAbsolutePath(tagIconCssAssetVirtualPath))
				.Returns(tagIconCssAssetVirtualPath)
				;
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
				.Setup(fs => fs.ToAbsolutePath(testLessImportSub2LessAssetVirtualPath))
				.Returns(testLessImportSub2LessAssetVirtualPath)
				;
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(testLessImportSub2LessAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(testLessImportSub2LessAssetVirtualPath))
				.Returns(@"//@import 'http://fonts.googleapis.com/css?family=Limelight&subset=latin,latin-ext';
@import (css) ""UsbFlashDriveIcon.css"";
@import (less) ""ValidationIcon.css"";
@import (inline) ""MicroformatsIcon.css"";
@import (inline, css) 'NodeIcon.less';
@import (css) ""OpenIdIcon.less"";
@import (optional) ""PrinterIcon.less"";
@import (optional) ""NonExistentIcon.less"";
@import ""~/Content/XfnIcon.less"";
@import ""~/Content/YahooIcon.css"";")
				;


			string usbFlashDriveIconCssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"UsbFlashDriveIcon.css");
			virtualFileSystemMock
				.Setup(fs => fs.ToAbsolutePath(usbFlashDriveIconCssAssetVirtualPath))
				.Returns(usbFlashDriveIconCssAssetVirtualPath)
				;
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
				.Setup(fs => fs.ToAbsolutePath(validationIconCssAssetVirtualPath))
				.Returns(validationIconCssAssetVirtualPath)
				;
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
				.Setup(fs => fs.ToAbsolutePath(microformatsIconCssAssetVirtualPath))
				.Returns(microformatsIconCssAssetVirtualPath)
				;
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
				.Setup(fs => fs.ToAbsolutePath(nodeIconLessAssetVirtualPath))
				.Returns(nodeIconLessAssetVirtualPath)
				;
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
				.Setup(fs => fs.ToAbsolutePath(openIdIconLessAssetVirtualPath))
				.Returns(openIdIconLessAssetVirtualPath)
				;
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
				.Setup(fs => fs.ToAbsolutePath(printerIconLessAssetVirtualPath))
				.Returns(printerIconLessAssetVirtualPath)
				;
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
				.Setup(fs => fs.ToAbsolutePath(nonExistentIconLessAssetVirtualPath))
				.Returns(nonExistentIconLessAssetVirtualPath)
				;
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(nonExistentIconLessAssetVirtualPath))
				.Returns(false)
				;

			string xfnIconLessAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"XfnIcon.less");
			virtualFileSystemMock
				.Setup(fs => fs.ToAbsolutePath("~" + xfnIconLessAssetVirtualPath))
				.Returns(xfnIconLessAssetVirtualPath)
				;
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(xfnIconLessAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(xfnIconLessAssetVirtualPath))
				.Returns(@".icon-xfn
{
	display: inline;
	background-image: url(""~/Content/xfn.png"");
}")
				;

			string xfnPngAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"xfn.png");
			virtualFileSystemMock
				.Setup(fs => fs.ToAbsolutePath("~" + xfnPngAssetVirtualPath))
				.Returns(xfnPngAssetVirtualPath)
				;

			string yahooIconCssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"YahooIcon.css");
			virtualFileSystemMock
				.Setup(fs => fs.ToAbsolutePath("~" + yahooIconCssAssetVirtualPath))
				.Returns(yahooIconCssAssetVirtualPath)
				;
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(yahooIconCssAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(yahooIconCssAssetVirtualPath))
				.Returns(@".icon-yahoo
{
	display: inline;
	background-image: url(""/Content/yahoo.ico"") !important;
}")
				;

			Func<IJsEngine> createJsEngineInstance =
				() => JsEngineSwitcher.Instance.CreateDefaultEngine();
			IVirtualFileSystemWrapper virtualFileSystemWrapper = virtualFileSystemMock.Object;
			var lessConfig = new LessSettings();

			var lessTranslator = new LessTranslator(createJsEngineInstance,
				virtualFileSystemWrapper, lessConfig);
			IAsset asset = new Asset(testLessLessAssetVirtualPath, virtualFileSystemWrapper);

			// Act
			asset = lessTranslator.Translate(asset);
			IList<string> dependencies = asset.VirtualPathDependencies;

			// Assert
			Assert.Equal(14, dependencies.Count);
			Assert.Equal(mixinsLessAssetVirtualPath, dependencies[0]);
			Assert.Equal(variablesLessAssetVirtualPath, dependencies[1]);
			Assert.Equal(testLessImportLessAssetVirtualPath, dependencies[2]);
			Assert.Equal(testLessImportSub1LessAssetVirtualPath, dependencies[3]);
			Assert.Equal(testLessImportSub2LessAssetVirtualPath, dependencies[4]);
			Assert.Equal(validationIconCssAssetVirtualPath, dependencies[5]);
			Assert.Equal(microformatsIconCssAssetVirtualPath, dependencies[6]);
			Assert.Equal(nodeIconLessAssetVirtualPath, dependencies[7]);
			Assert.Equal(printerIconLessAssetVirtualPath, dependencies[8]);
			Assert.Equal(nonExistentIconLessAssetVirtualPath, dependencies[9]);
			Assert.Equal(xfnIconLessAssetVirtualPath, dependencies[10]);
			Assert.Equal(headphoneGifAssetVirtualPath, dependencies[11]);
			Assert.Equal(googlePlusSvgAssetVirtualPath, dependencies[12]);
			Assert.Equal(networkPngAssetVirtualPath, dependencies[13]);
		}
	}
}