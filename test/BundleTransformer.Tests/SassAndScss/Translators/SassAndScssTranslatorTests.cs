using System;
using System.Collections.Generic;

using JavaScriptEngineSwitcher.Core;
using Moq;
using Xunit;

using BundleTransformer.Core.Assets;
using BundleTransformer.Core.FileSystem;
using BundleTransformer.Core.Helpers;

using BundleTransformer.SassAndScss.Configuration;
using BundleTransformer.SassAndScss.Translators;

namespace BundleTransformer.Tests.SassAndScss.Translators
{
	public class SassAndScssTranslatorTests
	{
		private const string APPLICATION_PATH = "/";
		private const string STYLES_DIRECTORY_VIRTUAL_PATH = "/Content/";


		[Fact]
		public void FillingOfSassDependenciesIsCorrect()
		{
			// Arrange
			var files = new Dictionary<string, string>();

			string testSassSassAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"TestSass.sass");
			files[testSassSassAssetVirtualPath] = @"@import ""Colors""
@import ""Mixins.sass""

@mixin visible
	display: block

@mixin rounded-corners($radius)
	border-radius: $radius
	-webkit-border-radius: $radius
	-moz-border-radius: $radius

.translators #sass
	float: left
	@include visible
	padding: 0.2em 0.5em 0.2em 0.5em
	background-color: $bg-color
	color: $caption-color
	font-weight: bold
	border: 1px solid $bg-color
	@include border-radius(5px)

@import ""TestSassImport.sass""";

			string partialColorsSassAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "_Colors.sass");
			files[partialColorsSassAssetVirtualPath] = @"$bg-color: #7AC0DA
$caption-color: #FFFFFF
$alt-bg-color: #CE4DD6";

			string partialMixinsSassAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"_Mixins.sass");
			files[partialMixinsSassAssetVirtualPath] = @"// Border Radius
@mixin border-radius($radius)
	border-radius: $radius
	-webkit-border-radius: $radius
	-moz-border-radius: $radius

// Visible
@mixin visible
	display: block";

			string testSassImportSassAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"TestSassImport.sass");
			files[testSassImportSassAssetVirtualPath] = @"@charset ""UTF-8""

.translators #sass
	background-color: $alt-bg-color

.icon-license
	display: inline
	background-image: url(""$license.png"")

@import ""TestSassImport.Sub1"", 'TestSassImport.Sub2'
//@import 'TestSassImport.Sub3.sass'
//@import 'TestSassImport.Sub4.sass'
// @import ""TestSassImport.Sub5.sass"";
// Obsolete import //@import ""TestSassImport.Sub6.sass""
.icon-bean
	background-image: url(http://taritsyn.files.wordpress.com/2013/08/bean.png)
//@import ""TestSassImport.Sub7.sass""
// @import ""TestSassImport.Sub8.sass"", ""TestSassImport.Sub9.sass""";

			string testSassImportSub1SassAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"TestSassImport.Sub1.sass");
			files[testSassImportSub1SassAssetVirtualPath] = @"$border-color: #CE4DD6

.translators #sass
	border-color: $border-color

@import ""AndroidIcon"", 'BatteryIcon', ""ComputerIcon"", url(	 DatabaseIcon.css	 )";

			string androidIconSassAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"AndroidIcon.sass");
			files[androidIconSassAssetVirtualPath] = @".icon-android
	display: inline
	background-image: url(android.png) !important";

			string batteryIconScssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"BatteryIcon.scss");
			files[batteryIconScssAssetVirtualPath] = @".icon-battery
{
	display: inline;
	background-image: url(""battery.png"") !important;
}";

			string computerIconCssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"ComputerIcon.css");
			files[computerIconCssAssetVirtualPath] = @".icon-computer
{
	display: inline;
	background-image: url(""computer.png"") !important;
}";

			string testSassImportSub2SassAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"TestSassImport.Sub2.sass");
			files[testSassImportSub2SassAssetVirtualPath] = @"@import 'http://fonts.googleapis.com/css?family=Limelight&subset=latin,latin-ext'
@import url(""EbookReaderIcon.css"")
@import ""FolderIcon.css"" screen, projection";

			var virtualFileSystemMock = new Mock<IVirtualFileSystemWrapper>();
			virtualFileSystemMock
				.Setup(fs => fs.ToAbsolutePath(It.IsAny<string>()))
				.Returns((string p) => ToAbsoluteVirtualPath(p))
				;
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(It.IsAny<string>()))
				.Returns((string p) =>
				{
					return files.ContainsKey(p);
				})
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(It.IsAny<string>()))
				.Returns((string p) =>
				{
					return files[p];
				})
				;

			Func<IJsEngine> createJsEngineInstance =
				() => JsEngineSwitcher.Current.CreateDefaultEngine();
			IVirtualFileSystemWrapper virtualFileSystemWrapper = virtualFileSystemMock.Object;
			var sassAndScssConfig = new SassAndScssSettings();

			var sassAndScssTranslator = new SassAndScssTranslator(createJsEngineInstance,
				virtualFileSystemWrapper, sassAndScssConfig);
			IAsset asset = new Asset(testSassSassAssetVirtualPath, virtualFileSystemWrapper);

			// Act
			asset = sassAndScssTranslator.Translate(asset);
			IList<string> dependencies = asset.VirtualPathDependencies;

			// Assert
			Assert.Equal(8, dependencies.Count);
			Assert.Equal(partialColorsSassAssetVirtualPath, dependencies[0]);
			Assert.Equal(partialMixinsSassAssetVirtualPath, dependencies[1]);
			Assert.Equal(testSassImportSassAssetVirtualPath, dependencies[2]);
			Assert.Equal(testSassImportSub1SassAssetVirtualPath, dependencies[3]);
			Assert.Equal(androidIconSassAssetVirtualPath, dependencies[4]);
			Assert.Equal(batteryIconScssAssetVirtualPath, dependencies[5]);
			Assert.Equal(computerIconCssAssetVirtualPath, dependencies[6]);
			Assert.Equal(testSassImportSub2SassAssetVirtualPath, dependencies[7]);
		}

		[Fact]
		public void FillingOfScssDependenciesIsCorrect()
		{
			// Arrange
			var files = new Dictionary<string, string>();

			string testScssScssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"TestScss.scss");
			files[testScssScssAssetVirtualPath] = @"@import ""Colors"";
@import ""Mixins.scss"";

.translators #scss
{
	float: left;
	@include visible;
	padding: 0.2em 0.5em 0.2em 0.5em;
	background-color: $bg-color;
	color: $caption-color;
	font-weight: bold;
	border: 1px solid $bg-color;
	@include border-radius(5px);
}

@import ""TestScssImport.scss"";";

			string partialColorsScssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"_Colors.scss");
			files[partialColorsScssAssetVirtualPath] = @"$bg-color: #7AC0DA;
$caption-color: #FFFFFF;
$alt-bg-color: #CE4DD6;";

			string partialMixinsScssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"_Mixins.scss");
			files[partialMixinsScssAssetVirtualPath] = @"// Border Radius
@mixin border-radius ($radius: 5px)
{
	border-radius: $radius;
	-webkit-border-radius: $radius;
	-moz-border-radius: $radius;
}

// Visible
@mixin visible
{
	display: block;
}";

			string testScssImportScssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"TestScssImport.scss");
			files[testScssImportScssAssetVirtualPath] = @"@charset ""UTF-8"";

.translators #scss
{
	background-color: $alt-bg-color;
}

.icon-plug
{
	display: inline;
	background-image: url(""$plug.png"");
}

.singleline-comment { content: ""//"" } .triple-slash-directive { content: '///' } @import""TestScssImport.Sub1"", 'TestScssImport.Sub2';
/*@import 'TestScssImport.Sub3.scss';
@import 'TestScssImport.Sub4.scss';*/
// @import ""TestScssImport.Sub5.scss"";
// Obsolete import //@import ""TestScssImport.Sub6.scss"";
.icon-bean { background-image: url(http://taritsyn.files.wordpress.com/2013/08/bean.png); } //@import ""TestScssImport.Sub7.scss"";
// @import ""TestScssImport.Sub8.scss""; @import ""TestScssImport.Sub9.scss"";";

			string testScssImportSub1ScssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"TestScssImport.Sub1.scss");
			files[testScssImportSub1ScssAssetVirtualPath] = @"$border-color: #CE4DD6;

.translators #scss
{
	border-color: $border-color;
}

@import ""GitIcon"", 'HourglassIcon', ""ImageIcon"", url(	JsonIcon.css	 );";

			string gitIconScssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"GitIcon.scss");
			files[gitIconScssAssetVirtualPath] = @".icon-git
{
	display: inline;
	background-image: url(""git.png"") !important;
}";

			string hourglassIconSassAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"HourglassIcon.sass");
			files[hourglassIconSassAssetVirtualPath] = @".icon-hourglass
	display: inline
	background-image: url(""hourglass.png"") !important";

			string imageIconCssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"ImageIcon.css");
			files[imageIconCssAssetVirtualPath] = @".icon-image
{
	display: inline;
	background-image: url(""image.png"") !important;
}";

			string testScssImportSub2ScssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"TestScssImport.Sub2.scss");
			files[testScssImportSub2ScssAssetVirtualPath] = @"@import 'http://fonts.googleapis.com/css?family=Limelight&subset=latin,latin-ext';
@import url('KeyIcon.css');
@import 'LayoutIcon.css' screen and (orientation:landscape);";

			var virtualFileSystemMock = new Mock<IVirtualFileSystemWrapper>();
			virtualFileSystemMock
				.Setup(fs => fs.ToAbsolutePath(It.IsAny<string>()))
				.Returns((string p) => ToAbsoluteVirtualPath(p))
				;
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(It.IsAny<string>()))
				.Returns((string p) =>
				{
					return files.ContainsKey(p);
				})
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(It.IsAny<string>()))
				.Returns((string p) =>
				{
					return files[p];
				})
				;

			Func<IJsEngine> createJsEngineInstance =
				() => JsEngineSwitcher.Current.CreateDefaultEngine();
			IVirtualFileSystemWrapper virtualFileSystemWrapper = virtualFileSystemMock.Object;
			var sassAndScssConfig = new SassAndScssSettings();

			var sassAndScssTranslator = new SassAndScssTranslator(createJsEngineInstance,
				virtualFileSystemWrapper, sassAndScssConfig);
			IAsset asset = new Asset(testScssScssAssetVirtualPath, virtualFileSystemWrapper);

			// Act
			asset = sassAndScssTranslator.Translate(asset);
			IList<string> dependencies = asset.VirtualPathDependencies;

			// Assert
			Assert.Equal(8, dependencies.Count);
			Assert.Equal(partialColorsScssAssetVirtualPath, dependencies[0]);
			Assert.Equal(partialMixinsScssAssetVirtualPath, dependencies[1]);
			Assert.Equal(testScssImportScssAssetVirtualPath, dependencies[2]);
			Assert.Equal(testScssImportSub1ScssAssetVirtualPath, dependencies[3]);
			Assert.Equal(gitIconScssAssetVirtualPath, dependencies[4]);
			Assert.Equal(hourglassIconSassAssetVirtualPath, dependencies[5]);
			Assert.Equal(imageIconCssAssetVirtualPath, dependencies[6]);
			Assert.Equal(testScssImportSub2ScssAssetVirtualPath, dependencies[7]);
		}

		private static string ToAbsoluteVirtualPath(string path)
		{
			if (path == null)
			{
				throw new ArgumentNullException(nameof(path));
			}

			if (path.StartsWith("/"))
			{
				return path;
			}
			else if (path.StartsWith("~/"))
			{
				return UrlHelpers.Combine(APPLICATION_PATH, path.Substring(2));
			}

			throw new ArgumentException(
				string.Format("The relative virtual path '{0}' is not allowed here.", path),
				nameof(path)
			);
		}
	}
}