namespace BundleTransformer.Tests.SassAndScss.Translators
{
	using System;
	using System.Collections.Generic;
	using System.IO;
	using System.Web;

	using Moq;
	using NUnit.Framework;

	using BundleTransformer.Core;
	using BundleTransformer.Core.FileSystem;
	using BundleTransformer.SassAndScss.Configuration;
	using BundleTransformer.SassAndScss.Translators;

	[TestFixture]
	public class SassAndScssTranslatorTests
	{
		private const string APPLICATION_ROOT_PATH =
			@"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\";
		private const string STYLES_DIRECTORY_PATH =
			@"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\Content\";
		private const string STYLES_DIRECTORY_URL = "/Content/";

		private HttpContextBase _httpContext;
		private ICssRelativePathResolver _cssRelativePathResolver;
		private SassAndScssSettings _sassAndScssConfig;

		[TestFixtureSetUp]
		public void SetUp()
		{
			var httpServerUtility = new MockHttpServerUtility();
			var httpContextMock = new Mock<HttpContextBase>();
			httpContextMock
				.SetupGet(p => p.Server)
				.Returns(httpServerUtility)
				;

			_httpContext = httpContextMock.Object;
			_cssRelativePathResolver = new MockCssRelativePathResolver();
			_sassAndScssConfig = new SassAndScssSettings();
		}

		[Test]
		public void FillingOfImportedSassFilePathsIsCorrect()
		{
			// Arrange
			var fileSystemMock = new Mock<IFileSystemWrapper>();

			string colorsSassAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "Colors.sass");
			fileSystemMock
				.Setup(fs => fs.FileExists(colorsSassAssetPath))
				.Returns(false)
				;


			string partialColorsSassAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "_Colors.sass");
			fileSystemMock
				.Setup(fs => fs.FileExists(partialColorsSassAssetPath))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(partialColorsSassAssetPath))
				.Returns(@"$bg-color: #7AC0DA
$border-color: green
$caption-color: #FFFFFF
$alt-bg-color: #CE4DD6")
				;


			string colorsScssAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "Colors.scss");
			fileSystemMock
				.Setup(fs => fs.FileExists(colorsScssAssetPath))
				.Returns(false)
				;


			string partialColorsScssAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "_Colors.scss");
			fileSystemMock
				.Setup(fs => fs.FileExists(partialColorsScssAssetPath))
				.Returns(false)
				;


			string mixinsSassAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "Mixins.sass");
			fileSystemMock
				.Setup(fs => fs.FileExists(mixinsSassAssetPath))
				.Returns(false)
				;


			string partialMixinsSassAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "_Mixins.sass");
			fileSystemMock
				.Setup(fs => fs.FileExists(partialMixinsSassAssetPath))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(partialMixinsSassAssetPath))
				.Returns(@"// Border Radius
@mixin border-radius($radius)
	border-radius: $radius
	-webkit-border-radius: $radius
	-moz-border-radius: $radius

// Visible
@mixin visible
	display: block")
				;


			string mixinsScssAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "Mixins.scss");
			fileSystemMock
				.Setup(fs => fs.FileExists(mixinsScssAssetPath))
				.Returns(false)
				;

			string partialMixinsScssAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "_Mixins.scss");
			fileSystemMock
				.Setup(fs => fs.FileExists(partialMixinsScssAssetPath))
				.Returns(false)
				;


			string testSassImportSassAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "TestSassImport.sass");
			fileSystemMock
				.Setup(fs => fs.FileExists(testSassImportSassAssetPath))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(testSassImportSassAssetPath))
				.Returns(@".translators #sass
	background-color: $alt-bg-color
	border-color: $alt-bg-color

@import ""TestSassImport.Sub1.sass"", 'TestSassImport.Sub2', TestSassImport.Sub3
@import ""TestSassImport.Sub4""")
				;


			string testSassImportScssAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "TestSassImport.scss");
			fileSystemMock
				.Setup(fs => fs.FileExists(testSassImportScssAssetPath))
				.Returns(false)
				;


			string testSassImportSub1SassAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "TestSassImport.Sub1.sass");
			fileSystemMock
				.Setup(fs => fs.FileExists(testSassImportSub1SassAssetPath))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(testSassImportSub1SassAssetPath))
				.Returns(@"$bg-color: brown

.translators #sass
	background-color: $bg-color")
				;


			string testSassImportSub1ScssAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "TestSassImport.Sub1.scss");
			fileSystemMock
				.Setup(fs => fs.FileExists(testSassImportSub1ScssAssetPath))
				.Returns(false)
				;


			string testSassImportSub2SassAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "TestSassImport.Sub2.sass");
			fileSystemMock
				.Setup(fs => fs.FileExists(testSassImportSub2SassAssetPath))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(testSassImportSub2SassAssetPath))
				.Returns(@"
.translators #sass
	border-color: $border-color")
				;


			string testSassImportSub2ScssAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "TestSassImport.Sub2.scss");
			fileSystemMock
				.Setup(fs => fs.FileExists(testSassImportSub2ScssAssetPath))
				.Returns(false)
				;


			string testSassImportSub3SassAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "TestSassImport.Sub3.sass");
			fileSystemMock
				.Setup(fs => fs.FileExists(testSassImportSub3SassAssetPath))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(testSassImportSub3SassAssetPath))
				.Returns(@"$font-style: italic

.translators #sass
	font-style: $font-style")
				;


			string testSassImportSub3ScssAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "TestSassImport.Sub3.scss");
			fileSystemMock
				.Setup(fs => fs.FileExists(testSassImportSub3ScssAssetPath))
				.Returns(false)
				;


			string testSassImportSub4ScssAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "TestSassImport.Sub4.scss");
			fileSystemMock
				.Setup(fs => fs.FileExists(testSassImportSub4ScssAssetPath))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(testSassImportSub4ScssAssetPath))
				.Returns(@".translators #sass
{
	border-style: dashed;
}")
				;


			string testSassImportSub4SassAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "TestSassImport.Sub4.sass");
			fileSystemMock
				.Setup(fs => fs.FileExists(testSassImportSub4SassAssetPath))
				.Returns(false)
				;


			IFileSystemWrapper fileSystemWrapper = fileSystemMock.Object;

			var sassAndScssTranslator = new SassAndScssTranslator(_httpContext,fileSystemWrapper,
				_cssRelativePathResolver, _sassAndScssConfig);

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
			string assetUrl = Utils.CombineUrls(STYLES_DIRECTORY_URL, "TestSass.sass");
			var pathDependencies = new List<string>();

			// Act
			sassAndScssTranslator.FillDependencies(assetContent, assetUrl, pathDependencies);

			// Assert
			Assert.AreEqual(7, pathDependencies.Count);
			Assert.AreEqual(partialColorsSassAssetPath, pathDependencies[0]);
			Assert.AreEqual(partialMixinsSassAssetPath, pathDependencies[1]);
			Assert.AreEqual(testSassImportSassAssetPath, pathDependencies[2]);
			Assert.AreEqual(testSassImportSub1SassAssetPath, pathDependencies[3]);
			Assert.AreEqual(testSassImportSub2SassAssetPath, pathDependencies[4]);
			Assert.AreEqual(testSassImportSub3SassAssetPath, pathDependencies[5]);
			Assert.AreEqual(testSassImportSub4ScssAssetPath, pathDependencies[6]);
		}

		[Test]
		public void FillingOfImportedScssFilePathsIsCorrect()
		{
			// Arrange
			var fileSystemMock = new Mock<IFileSystemWrapper>();


			string colorsScssAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "Colors.scss");
			fileSystemMock
				.Setup(fs => fs.FileExists(colorsScssAssetPath))
				.Returns(false)
				;


			string partialColorsScssAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "_Colors.scss");
			fileSystemMock
				.Setup(fs => fs.FileExists(partialColorsScssAssetPath))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(partialColorsScssAssetPath))
				.Returns(@"$bg-color: #7AC0DA;
$border-color: yellow;
$caption-color: #FFFFFF;
$alt-bg-color: #CE4DD6;")
				;


			string colorsSassAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "Colors.sass");
			fileSystemMock
				.Setup(fs => fs.FileExists(colorsSassAssetPath))
				.Returns(false)
				;


			string partialColorsSassAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "_Colors.sass");
			fileSystemMock
				.Setup(fs => fs.FileExists(partialColorsSassAssetPath))
				.Returns(false)
				;


			string mixinsScssAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "Mixins.scss");
			fileSystemMock
				.Setup(fs => fs.FileExists(mixinsScssAssetPath))
				.Returns(false)
				;

			string partialMixinsScssAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "_Mixins.scss");
			fileSystemMock
				.Setup(fs => fs.FileExists(partialMixinsScssAssetPath))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(partialMixinsScssAssetPath))
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


			string mixinsSassAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "Mixins.sass");
			fileSystemMock
				.Setup(fs => fs.FileExists(mixinsSassAssetPath))
				.Returns(false)
				;


			string partialMixinsSassAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "_Mixins.sass");
			fileSystemMock
				.Setup(fs => fs.FileExists(partialMixinsSassAssetPath))
				.Returns(false)
				;


			string testScssImportScssAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "TestScssImport.scss");
			fileSystemMock
				.Setup(fs => fs.FileExists(testScssImportScssAssetPath))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(testScssImportScssAssetPath))
				.Returns(@".translators #scss
{
	background-color: $alt-bg-color;
	border-color: $alt-bg-color;
}

@import""TestScssImport.Sub1.scss"", 'TestScssImport.Sub2',""TestScssImport.Sub3.scss"";
@import ""TestScssImport.Sub4.sass"";")
				;


			string testScssImportSassAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "TestScssImport.sass");
			fileSystemMock
				.Setup(fs => fs.FileExists(testScssImportSassAssetPath))
				.Returns(false)
				;


			string testScssImportSub1ScssAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "TestScssImport.Sub1.scss");
			fileSystemMock
				.Setup(fs => fs.FileExists(testScssImportSub1ScssAssetPath))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(testScssImportSub1ScssAssetPath))
				.Returns(@"$bg-color: blue;

.translators #scss
{
	background-color: $bg-color;
}")
				;


			string testScssImportSub1SassAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "TestScssImport.Sub1.sass");
			fileSystemMock
				.Setup(fs => fs.FileExists(testScssImportSub1SassAssetPath))
				.Returns(false)
				;


			string testScssImportSub2ScssAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "TestScssImport.Sub2.scss");
			fileSystemMock
				.Setup(fs => fs.FileExists(testScssImportSub2ScssAssetPath))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(testScssImportSub2ScssAssetPath))
				.Returns(@"
.translators #scss
{
	border-color: $border-color;
}")
				;


			string testScssImportSub2SassAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "TestScssImport.Sub2.sass");
			fileSystemMock
				.Setup(fs => fs.FileExists(testScssImportSub2SassAssetPath))
				.Returns(false)
				;


			string testScssImportSub3ScssAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "TestScssImport.Sub3.scss");
			fileSystemMock
				.Setup(fs => fs.FileExists(testScssImportSub3ScssAssetPath))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(testScssImportSub3ScssAssetPath))
				.Returns(@"$text-decoration: underline;

.translators #scss
{
	text-decoration: $text-decoration;
}")
				;


			string testScssImportSub3SassAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "TestScssImport.Sub3.sass");
			fileSystemMock
				.Setup(fs => fs.FileExists(testScssImportSub3SassAssetPath))
				.Returns(false)
				;


			string testScssImportSub4SassAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "TestScssImport.Sub4.sass");
			fileSystemMock
				.Setup(fs => fs.FileExists(testScssImportSub4SassAssetPath))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(testScssImportSub4SassAssetPath))
				.Returns(@".translators #scss
	border-style: dotted")
				;


			string testScssImportSub4ScssAssetPath = Path.Combine(STYLES_DIRECTORY_PATH, "TestScssImport.Sub4.scss");
			fileSystemMock
				.Setup(fs => fs.FileExists(testScssImportSub4ScssAssetPath))
				.Returns(false)
				;


			IFileSystemWrapper fileSystemWrapper = fileSystemMock.Object;

			var sassAndScssTranslator = new SassAndScssTranslator(_httpContext, fileSystemWrapper,
				_cssRelativePathResolver, _sassAndScssConfig);

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
			string assetUrl = Utils.CombineUrls(STYLES_DIRECTORY_URL, "TestScss.scss");
			var pathDependencies = new List<string>();

			// Act
			sassAndScssTranslator.FillDependencies(assetContent, assetUrl, pathDependencies);

			// Assert
			Assert.AreEqual(7, pathDependencies.Count);
			Assert.AreEqual(partialColorsScssAssetPath, pathDependencies[0]);
			Assert.AreEqual(partialMixinsScssAssetPath, pathDependencies[1]);
			Assert.AreEqual(testScssImportScssAssetPath, pathDependencies[2]);
			Assert.AreEqual(testScssImportSub1ScssAssetPath, pathDependencies[3]);
			Assert.AreEqual(testScssImportSub2ScssAssetPath, pathDependencies[4]);
			Assert.AreEqual(testScssImportSub3ScssAssetPath, pathDependencies[5]);
			Assert.AreEqual(testScssImportSub4SassAssetPath, pathDependencies[6]);
		}

		[TestFixtureTearDown]
		public void TearDown()
		{
			_httpContext = null;
			_cssRelativePathResolver = null;
			_sassAndScssConfig = null;
		}

		private class MockHttpServerUtility : HttpServerUtilityBase
		{
			public override string MapPath(string path)
			{
				return Path.Combine(APPLICATION_ROOT_PATH, Utils.RemoveFirstSlashFromUrl(path.Replace("/", @"\")));
			}
		}

		private class MockCssRelativePathResolver : ICssRelativePathResolver
		{
			public string ResolveComponentsRelativePaths(string content, string path)
			{
				throw new NotImplementedException();
			}

			public string ResolveImportsRelativePaths(string content, string path)
			{
				throw new NotImplementedException();
			}

			public string ResolveAllRelativePaths(string content, string path)
			{
				throw new NotImplementedException();
			}

			public string ResolveRelativePath(string basePath, string relativePath)
			{
				return Utils.CombineUrls(STYLES_DIRECTORY_URL, relativePath);
			}
		}
	}
}