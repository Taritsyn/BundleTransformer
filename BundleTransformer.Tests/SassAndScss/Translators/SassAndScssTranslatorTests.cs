namespace BundleTransformer.Tests.SassAndScss.Translators
{
	using Moq;
	using NUnit.Framework;

	using BundleTransformer.Core.Assets;
	using BundleTransformer.Core.FileSystem;
	using BundleTransformer.Core.Helpers;

	using BundleTransformer.SassAndScss;
	using BundleTransformer.SassAndScss.Configuration;
	using BundleTransformer.SassAndScss.Translators;

	[TestFixture]
	public class SassAndScssTranslatorTests
	{
		private const string STYLES_DIRECTORY_VIRTUAL_PATH = "/Content/";
		private const string STYLES_DIRECTORY_URL = "/Content/";

		private IRelativePathResolver _relativePathResolver;
		private SassAndScssSettings _sassAndScssConfig;

		[TestFixtureSetUp]
		public void SetUp()
		{
			_relativePathResolver = new MockRelativePathResolver();
			_sassAndScssConfig = new SassAndScssSettings();
		}

		[Test]
		public void FillingOfSassDependenciesIsCorrect()
		{
			// Arrange
			var virtualFileSystemMock = new Mock<IVirtualFileSystemWrapper>();


			string colorsSassAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"Colors.sass");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(colorsSassAssetVirtualPath))
				.Returns(false)
				;

			string partialColorsSassAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"_Colors.sass");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(partialColorsSassAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(partialColorsSassAssetVirtualPath))
				.Returns(@"$bg-color: #7AC0DA
$caption-color: #FFFFFF
$alt-bg-color: #CE4DD6")
				;

			string colorsScssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"Colors.scss");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(colorsScssAssetVirtualPath))
				.Returns(false)
				;

			string partialColorsScssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"_Colors.scss");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(partialColorsScssAssetVirtualPath))
				.Returns(false)
				;

			string colorsCssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"Colors.css");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(colorsCssAssetVirtualPath))
				.Returns(false)
				;


			string mixinsSassAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"Mixins.sass");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(mixinsSassAssetVirtualPath))
				.Returns(false)
				;

			string partialMixinsSassAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"_Mixins.sass");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(partialMixinsSassAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(partialMixinsSassAssetVirtualPath))
				.Returns(@"// Border Radius
@mixin border-radius($radius)
	border-radius: $radius
	-webkit-border-radius: $radius
	-moz-border-radius: $radius

// Visible
@mixin visible
	display: block")
				;

			string mixinsScssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"Mixins.scss");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(mixinsScssAssetVirtualPath))
				.Returns(false)
				;

			string partialMixinsScssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"_Mixins.scss");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(partialMixinsScssAssetVirtualPath))
				.Returns(false)
				;

			string mixinsCssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"Mixins.css");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(mixinsCssAssetVirtualPath))
				.Returns(false)
				;


			string testSassImportSassAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, 
				"TestSassImport.sass");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(testSassImportSassAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(testSassImportSassAssetVirtualPath))
				.Returns(@"@charset ""UTF-8""

.translators #sass
	background-color: $alt-bg-color

.icon-license
	display: inline
	background-image: url(""$license.png"")

@import ""TestSassImport.Sub1"", 'TestSassImport.Sub2'
/*@import 'TestSassImport.Sub3.sass'
@import 'TestSassImport.Sub4.sass'*/
// @import ""TestSassImport.Sub5.sass"";
// Obsolete import //@import ""TestSassImport.Sub6.sass"";
.icon-bean { background-image: url(http://taritsyn.files.wordpress.com/2013/08/bean.png); } //@import ""TestSassImport.Sub7.sass"";
// @import ""TestSassImport.Sub8.sass""; @import ""TestSassImport.Sub9.sass"";")
				;

			string testSassImportScssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, 
				"TestSassImport.scss");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(testSassImportScssAssetVirtualPath))
				.Returns(false)
				;

			string testSassImportCssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"TestSassImport.css");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(testSassImportCssAssetVirtualPath))
				.Returns(false)
				;


			string testSassImportSub1SassAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"TestSassImport.Sub1.sass");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(testSassImportSub1SassAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(testSassImportSub1SassAssetVirtualPath))
				.Returns(@"$border-color: #CE4DD6

.translators #sass
	border-color: $border-color

@import ""AndroidIcon"", 'BatteryIcon', ""ComputerIcon"", url(DatabaseIcon.css)")
				;

			string testSassImportSub1ScssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, 
				"TestSassImport.Sub1.scss");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(testSassImportSub1ScssAssetVirtualPath))
				.Returns(false)
				;

			string testSassImportSub1CssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"TestSassImport.Sub1.css");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(testSassImportSub1CssAssetVirtualPath))
				.Returns(false)
				;


			string androidIconSassAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"AndroidIcon.sass");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(androidIconSassAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(androidIconSassAssetVirtualPath))
				.Returns(@".icon-android
	display: inline
	background-image: url(android.png) !important")
				;

			string androidIconScssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"AndroidIcon.scss");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(androidIconScssAssetVirtualPath))
				.Returns(false)
				;

			string androidIconCssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"AndroidIcon.css");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(androidIconCssAssetVirtualPath))
				.Returns(false)
				;


			string batteryIconSassAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"BatteryIcon.sass");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(batteryIconSassAssetVirtualPath))
				.Returns(false)
				;

			string batteryIconScssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"BatteryIcon.scss");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(batteryIconScssAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(batteryIconScssAssetVirtualPath))
				.Returns(@".icon-battery
{
	display: inline;
	background-image: url(""battery.png"") !important;
}")
				;

			string batteryIconCssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"BatteryIcon.css");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(batteryIconCssAssetVirtualPath))
				.Returns(false)
				;


			string computerIconSassAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"ComputerIcon.sass");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(computerIconSassAssetVirtualPath))
				.Returns(false)
				;

			string computerIconScssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"ComputerIcon.scss");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(computerIconScssAssetVirtualPath))
				.Returns(false)
				;

			string computerIconCssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"ComputerIcon.css");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(computerIconCssAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(computerIconCssAssetVirtualPath))
				.Returns(@".icon-computer
{
	display: inline;
	background-image: url(""computer.png"") !important;
}")
				;


			string testSassImportSub2SassAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, 
				"TestSassImport.Sub2.sass");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(testSassImportSub2SassAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(testSassImportSub2SassAssetVirtualPath))
				.Returns(@"@import 'http://fonts.googleapis.com/css?family=Limelight&subset=latin,latin-ext'
@import url(""EbookReaderIcon.css"")
@import ""FolderIcon.css"" screen, projection")
				;

			string testSassImportSub2ScssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, 
				"TestSassImport.Sub2.scss");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(testSassImportSub2ScssAssetVirtualPath))
				.Returns(false)
				;

			string testSassImportSub2CssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"TestSassImport.Sub2.css");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(testSassImportSub2CssAssetVirtualPath))
				.Returns(false)
				;


			IVirtualFileSystemWrapper virtualFileSystemWrapper = virtualFileSystemMock.Object;

			var sassAndScssTranslator = new SassAndScssTranslator(virtualFileSystemWrapper, 
				_relativePathResolver, _sassAndScssConfig);

			const string assetContent = @"@import ""Colors""
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
			string assetUrl = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH, "TestSass.sass");
			SassAndScssStylesheet stylesheet = sassAndScssTranslator.PreprocessStylesheet(assetContent, assetUrl);
			var dependencies = new DependencyCollection();

			// Act
			sassAndScssTranslator.FillDependencies(assetUrl, stylesheet, dependencies);
			
			// Assert
			Assert.AreEqual(7, dependencies.Count);

			Dependency partialColorsSassAsset = dependencies[0];
			Dependency partialMixinsSassAsset = dependencies[1];
			Dependency testSassImportSassAsset = dependencies[2];
			Dependency testSassImportSub1SassAsset = dependencies[3];
			Dependency androidIconSassAsset = dependencies[4];
			Dependency batteryIconScssAsset = dependencies[5];
			Dependency testSassImportSub2SassAsset = dependencies[6];

			Assert.AreEqual(partialColorsSassAssetVirtualPath, partialColorsSassAsset.Url);
			Assert.AreEqual(true, partialColorsSassAsset.IsObservable);

			Assert.AreEqual(partialMixinsSassAssetVirtualPath, partialMixinsSassAsset.Url);
			Assert.AreEqual(true, partialMixinsSassAsset.IsObservable);

			Assert.AreEqual(testSassImportSassAssetVirtualPath, testSassImportSassAsset.Url);
			Assert.AreEqual(true, testSassImportSassAsset.IsObservable);

			Assert.AreEqual(testSassImportSub1SassAssetVirtualPath, testSassImportSub1SassAsset.Url);
			Assert.AreEqual(true, testSassImportSub1SassAsset.IsObservable);

			Assert.AreEqual(androidIconSassAssetVirtualPath, androidIconSassAsset.Url);
			Assert.AreEqual(true, androidIconSassAsset.IsObservable);

			Assert.AreEqual(batteryIconScssAssetVirtualPath, batteryIconScssAsset.Url);
			Assert.AreEqual(true, batteryIconScssAsset.IsObservable);

			Assert.AreEqual(testSassImportSub2SassAssetVirtualPath, testSassImportSub2SassAsset.Url);
			Assert.AreEqual(true, testSassImportSub2SassAsset.IsObservable);
		}

		[Test]
		public void FillingOfScssDependenciesIsCorrect()
		{
			// Arrange
			var virtualFileSystemMock = new Mock<IVirtualFileSystemWrapper>();


			string colorsScssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"Colors.scss");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(colorsScssAssetVirtualPath))
				.Returns(false)
				;
			
			string partialColorsScssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"_Colors.scss");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(partialColorsScssAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(partialColorsScssAssetVirtualPath))
				.Returns(@"$bg-color: #7AC0DA;
$caption-color: #FFFFFF;
$alt-bg-color: #CE4DD6;")
				;

			string colorsSassAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"Colors.sass");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(colorsSassAssetVirtualPath))
				.Returns(false)
				;

			string partialColorsSassAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"_Colors.sass");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(partialColorsSassAssetVirtualPath))
				.Returns(false)
				;

			string colorsCssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"Colors.css");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(colorsCssAssetVirtualPath))
				.Returns(false)
				;


			string mixinsScssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"Mixins.scss");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(mixinsScssAssetVirtualPath))
				.Returns(false)
				;

			string partialMixinsScssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"_Mixins.scss");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(partialMixinsScssAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(partialMixinsScssAssetVirtualPath))
				.Returns(@"// Border Radius
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
}")
				;

			string mixinsSassAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"Mixins.sass");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(mixinsSassAssetVirtualPath))
				.Returns(false)
				;

			string partialMixinsSassAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"_Mixins.sass");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(partialMixinsSassAssetVirtualPath))
				.Returns(false)
				;

			string mixinsCssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"Mixins.css");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(mixinsCssAssetVirtualPath))
				.Returns(false)
				;


			string testScssImportScssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"TestScssImport.scss");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(testScssImportScssAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(testScssImportScssAssetVirtualPath))
				.Returns(@"@charset ""UTF-8"";

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
// @import ""TestScssImport.Sub8.scss""; @import ""TestScssImport.Sub9.scss"";")
				;

			string testScssImportSassAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"TestScssImport.sass");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(testScssImportSassAssetVirtualPath))
				.Returns(false)
				;

			string testScssImportCssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"TestScssImport.css");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(testScssImportCssAssetVirtualPath))
				.Returns(false)
				;


			string testScssImportSub1ScssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"TestScssImport.Sub1.scss");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(testScssImportSub1ScssAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(testScssImportSub1ScssAssetVirtualPath))
				.Returns(@"$border-color: #CE4DD6;

.translators #scss
{
	border-color: $border-color;
}

@import ""GitIcon"", 'HourglassIcon', ""ImageIcon"", url(JsonIcon.css);")
				;

			string testScssImportSub1SassAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"TestScssImport.Sub1.sass"); 
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(testScssImportSub1SassAssetVirtualPath))
				.Returns(false)
				;

			string testScssImportSub1CssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"TestScssImport.Sub1.css");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(testScssImportSub1CssAssetVirtualPath))
				.Returns(false)
				;


			string gitIconScssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"GitIcon.scss");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(gitIconScssAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(gitIconScssAssetVirtualPath))
				.Returns(@".icon-git
{
	display: inline;
	background-image: url(""git.png"") !important;
}")
				;

			string gitIconSassAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"GitIcon.sass");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(gitIconSassAssetVirtualPath))
				.Returns(false)
				;

			string gitIconCssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"GitIcon.css");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(gitIconCssAssetVirtualPath))
				.Returns(false)
				;


			string hourglassIconScssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"HourglassIcon.scss");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(hourglassIconScssAssetVirtualPath))
				.Returns(false)
				;

			string hourglassIconSassAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"HourglassIcon.sass");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(hourglassIconSassAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(hourglassIconSassAssetVirtualPath))
				.Returns(@".icon-hourglass
	display: inline
	background-image: url(""hourglass.png"") !important")
				;

			string hourglassIconCssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"HourglassIcon.css");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(hourglassIconCssAssetVirtualPath))
				.Returns(false)
				;


			string imageIconScssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"ImageIcon.scss");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(imageIconScssAssetVirtualPath))
				.Returns(false)
				;

			string imageIconSassAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"ImageIcon.sass");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(imageIconSassAssetVirtualPath))
				.Returns(false)
				;

			string imageIconCssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"ImageIcon.css");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(imageIconCssAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(imageIconCssAssetVirtualPath))
				.Returns(@".icon-image
{
	display: inline;
	background-image: url(""image.png"") !important;
}")
				;


			string testScssImportSub2ScssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"TestScssImport.Sub2.scss");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(testScssImportSub2ScssAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(testScssImportSub2ScssAssetVirtualPath))
				.Returns(@"@import 'http://fonts.googleapis.com/css?family=Limelight&subset=latin,latin-ext';
@import url('KeyIcon.css');
@import 'LayoutIcon.css' screen and (orientation:landscape);")
				;

			string testScssImportSub2SassAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"TestScssImport.Sub2.sass");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(testScssImportSub2SassAssetVirtualPath))
				.Returns(false)
				;

			string testScssImportSub2CssAssetVirtualPath = UrlHelpers.Combine(STYLES_DIRECTORY_VIRTUAL_PATH,
				"TestScssImport.Sub2.css");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(testScssImportSub2CssAssetVirtualPath))
				.Returns(false)
				;


			IVirtualFileSystemWrapper virtualFileSystemWrapper = virtualFileSystemMock.Object;

			var sassAndScssTranslator = new SassAndScssTranslator(virtualFileSystemWrapper,
				_relativePathResolver, _sassAndScssConfig);

			const string assetContent = @"@import ""Colors"";
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
			string assetUrl = UrlHelpers.Combine(STYLES_DIRECTORY_URL, "TestScss.scss");
			SassAndScssStylesheet stylesheet = sassAndScssTranslator.PreprocessStylesheet(assetContent, assetUrl);
			var dependencies = new DependencyCollection();

			// Act
			sassAndScssTranslator.FillDependencies(assetUrl, stylesheet, dependencies);

			// Assert
			Assert.AreEqual(7, dependencies.Count);

			Dependency partialColorsScssAsset = dependencies[0];
			Dependency partialMixinsScssAsset = dependencies[1];
			Dependency testScssImportScssAsset = dependencies[2];
			Dependency testScssImportSub1ScssAsset = dependencies[3];
			Dependency gitIconScssAsset = dependencies[4];
			Dependency hourglassIconSassAsset = dependencies[5];
			Dependency testScssImportSub2ScssAsset = dependencies[6];

			Assert.AreEqual(partialColorsScssAssetVirtualPath, partialColorsScssAsset.Url);
			Assert.AreEqual(true, partialColorsScssAsset.IsObservable);

			Assert.AreEqual(partialMixinsScssAssetVirtualPath, partialMixinsScssAsset.Url);
			Assert.AreEqual(true, partialMixinsScssAsset.IsObservable);

			Assert.AreEqual(testScssImportScssAssetVirtualPath, testScssImportScssAsset.Url);
			Assert.AreEqual(true, testScssImportScssAsset.IsObservable);

			Assert.AreEqual(testScssImportSub1ScssAssetVirtualPath, testScssImportSub1ScssAsset.Url);
			Assert.AreEqual(true, testScssImportSub1ScssAsset.IsObservable);

			Assert.AreEqual(gitIconScssAssetVirtualPath, gitIconScssAsset.Url);
			Assert.AreEqual(true, gitIconScssAsset.IsObservable);

			Assert.AreEqual(hourglassIconSassAssetVirtualPath, hourglassIconSassAsset.Url);
			Assert.AreEqual(true, hourglassIconSassAsset.IsObservable);

			Assert.AreEqual(testScssImportSub2ScssAssetVirtualPath, testScssImportSub2ScssAsset.Url);
			Assert.AreEqual(true, testScssImportSub2ScssAsset.IsObservable);
		}

		[TestFixtureTearDown]
		public void TearDown()
		{
			_relativePathResolver = null;
			_sassAndScssConfig = null;
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