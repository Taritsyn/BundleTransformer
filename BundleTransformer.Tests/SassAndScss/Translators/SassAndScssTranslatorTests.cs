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
		private const string STYLES_DIRECTORY_URL = @"/Content/";

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
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(STYLES_DIRECTORY_PATH, "TestSassImport.sass")))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(Path.Combine(STYLES_DIRECTORY_PATH, "TestSassImport.sass")))
				.Returns(@"$alt-bg-color: #CE4DD6

.translators #sass
	background-color: $alt-bg-color
	border-color: $alt-bg-color

@import ""TestSassImport.Sub1.sass"", 'TestSassImport.Sub2', TestSassImport.Sub3
@import ""TestSassImport.Sub4""")
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(STYLES_DIRECTORY_PATH, "TestSassImport.scss")))
				.Returns(false)
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(STYLES_DIRECTORY_PATH, "TestSassImport.Sub1.sass")))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(Path.Combine(STYLES_DIRECTORY_PATH, "TestSassImport.Sub1.sass")))
				.Returns(@"$bg-color: brown

.translators #sass
	background-color: $bg-color")
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(STYLES_DIRECTORY_PATH, "TestSassImport.Sub1.scss")))
				.Returns(false)
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(STYLES_DIRECTORY_PATH, "TestSassImport.Sub2.sass")))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(Path.Combine(STYLES_DIRECTORY_PATH, "TestSassImport.Sub2.sass")))
				.Returns(@"$border-color: green

.translators #sass
	border-color: $border-color")
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(STYLES_DIRECTORY_PATH, "TestSassImport.Sub2.scss")))
				.Returns(false)
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(STYLES_DIRECTORY_PATH, "TestSassImport.Sub3.sass")))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(Path.Combine(STYLES_DIRECTORY_PATH, "TestSassImport.Sub3.sass")))
				.Returns(@"$font-style: italic

.translators #sass
	font-style: $font-style")
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(STYLES_DIRECTORY_PATH, "TestSassImport.Sub3.scss")))
				.Returns(false)
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(STYLES_DIRECTORY_PATH, "TestSassImport.Sub4.scss")))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(Path.Combine(STYLES_DIRECTORY_PATH, "TestSassImport.Sub4.scss")))
				.Returns(@".translators #sass
{
	border-style: dashed;
}")
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(STYLES_DIRECTORY_PATH, "TestSassImport.Sub4.sass")))
				.Returns(false)
				;

			IFileSystemWrapper fileSystemWrapper = fileSystemMock.Object;

			var sassAndScssTranslator = new SassAndScssTranslator(_httpContext, fileSystemWrapper, 
				_cssRelativePathResolver, _sassAndScssConfig);

			const string assetContent = @"$bg-color: #7AC0DA
$caption-color: #FFFFFF

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
	@include rounded-corners(5px)

@import ""TestSassImport.sass""";
			string assetUrl = Utils.CombineUrls(STYLES_DIRECTORY_URL, "TestSass.sass");
			var importedFilePaths = new List<string>();

			// Act
			sassAndScssTranslator.FillImportedFilePaths(assetContent, assetUrl, importedFilePaths);

			// Assert
			Assert.AreEqual(5, importedFilePaths.Count);
			Assert.AreEqual(Path.Combine(STYLES_DIRECTORY_PATH, "TestSassImport.sass"), importedFilePaths[0]);
			Assert.AreEqual(Path.Combine(STYLES_DIRECTORY_PATH, "TestSassImport.Sub1.sass"), importedFilePaths[1]);
			Assert.AreEqual(Path.Combine(STYLES_DIRECTORY_PATH, "TestSassImport.Sub2.sass"), importedFilePaths[2]);
			Assert.AreEqual(Path.Combine(STYLES_DIRECTORY_PATH, "TestSassImport.Sub3.sass"), importedFilePaths[3]);
			Assert.AreEqual(Path.Combine(STYLES_DIRECTORY_PATH, "TestSassImport.Sub4.scss"), importedFilePaths[4]);
		}

		[Test]
		public void FillingOfImportedScssFilePathsIsCorrect()
		{
			// Arrange
			var fileSystemMock = new Mock<IFileSystemWrapper>();
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(STYLES_DIRECTORY_PATH, "TestScssImport.scss")))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(Path.Combine(STYLES_DIRECTORY_PATH, "TestScssImport.scss")))
				.Returns(@"$alt-bg-color: #CE4DD6;

.translators #scss
{
	background-color: $alt-bg-color;
	border-color: $alt-bg-color;
}

@import""TestScssImport.Sub1.scss"", 'TestScssImport.Sub2',""TestScssImport.Sub3.scss"";
@import ""TestScssImport.Sub4.sass"";")
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(STYLES_DIRECTORY_PATH, "TestScssImport.sass")))
				.Returns(false)
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(STYLES_DIRECTORY_PATH, "TestScssImport.Sub1.scss")))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(Path.Combine(STYLES_DIRECTORY_PATH, "TestScssImport.Sub1.scss")))
				.Returns(@"$bg-color: blue;

.translators #scss
{
	background-color: $bg-color;
}")
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(STYLES_DIRECTORY_PATH, "TestScssImport.Sub1.sass")))
				.Returns(false)
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(STYLES_DIRECTORY_PATH, "TestScssImport.Sub2.scss")))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(Path.Combine(STYLES_DIRECTORY_PATH, "TestScssImport.Sub2.scss")))
				.Returns(@"$border-color: yellow;

.translators #scss
{
	border-color: $border-color;
}")
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(STYLES_DIRECTORY_PATH, "TestScssImport.Sub2.sass")))
				.Returns(false)
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(STYLES_DIRECTORY_PATH, "TestScssImport.Sub3.scss")))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(Path.Combine(STYLES_DIRECTORY_PATH, "TestScssImport.Sub3.scss")))
				.Returns(@"$text-decoration: underline;

.translators #scss
{
	text-decoration: $text-decoration;
}")
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(STYLES_DIRECTORY_PATH, "TestScssImport.Sub3.sass")))
				.Returns(false)
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(STYLES_DIRECTORY_PATH, "TestScssImport.Sub4.sass")))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(Path.Combine(STYLES_DIRECTORY_PATH, "TestScssImport.Sub4.sass")))
				.Returns(@".translators #scss
	border-style: dotted")
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(STYLES_DIRECTORY_PATH, "TestScssImport.Sub4.scss")))
				.Returns(false)
				;

			IFileSystemWrapper fileSystemWrapper = fileSystemMock.Object;

			var sassAndScssTranslator = new SassAndScssTranslator(_httpContext, fileSystemWrapper,
				_cssRelativePathResolver, _sassAndScssConfig);

			const string assetContent = @"$bg-color: #7AC0DA;
$caption-color: #FFFFFF;

@mixin visible
{
	display: block;
}

@mixin rounded-corners ($radius: 5px)
{
	border-radius: $radius;
	-webkit-border-radius: $radius;
	-moz-border-radius: $radius;
}

.translators #scss
{
	float: left;
	@include visible;
	padding: 0.2em 0.5em 0.2em 0.5em;
	background-color: $bg-color;
	color: $caption-color;
	font-weight: bold;
	border: 1px solid $bg-color;
	@include rounded-corners(5px);
}

@import ""TestScssImport.scss"";";
			string assetUrl = Utils.CombineUrls(STYLES_DIRECTORY_URL, "TestScss.scss");
			var importedFilePaths = new List<string>();

			// Act
			sassAndScssTranslator.FillImportedFilePaths(assetContent, assetUrl, importedFilePaths);

			// Assert
			Assert.AreEqual(5, importedFilePaths.Count);
			Assert.AreEqual(Path.Combine(STYLES_DIRECTORY_PATH, "TestScssImport.scss"), importedFilePaths[0]);
			Assert.AreEqual(Path.Combine(STYLES_DIRECTORY_PATH, "TestScssImport.Sub1.scss"), importedFilePaths[1]);
			Assert.AreEqual(Path.Combine(STYLES_DIRECTORY_PATH, "TestScssImport.Sub2.scss"), importedFilePaths[2]);
			Assert.AreEqual(Path.Combine(STYLES_DIRECTORY_PATH, "TestScssImport.Sub3.scss"), importedFilePaths[3]);
			Assert.AreEqual(Path.Combine(STYLES_DIRECTORY_PATH, "TestScssImport.Sub4.sass"), importedFilePaths[4]);
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