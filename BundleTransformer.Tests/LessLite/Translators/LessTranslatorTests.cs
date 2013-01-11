namespace BundleTransformer.Tests.LessLite.Translators
{
	using System;
	using System.Collections.Generic;
	using System.IO;
	using System.Web;

	using Moq;
	using NUnit.Framework;

	using BundleTransformer.Core;
	using BundleTransformer.Core.FileSystem;
	using BundleTransformer.LessLite.Configuration;
	using BundleTransformer.LessLite.Translators;

	[TestFixture]
	public class LessTranslatorTests
	{
		private const string APPLICATION_ROOT_PATH =
			@"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\";
		private const string STYLES_DIRECTORY_PATH =
			@"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\Content\";
		private const string STYLES_DIRECTORY_URL = @"/Content/";

		[Test]
		public void FillingOfImportedLessFilePathsIsCorrect()
		{
			// Arrange
			var httpServerUtility = new MockHttpServerUtility();
			var httpContextMock = new Mock<HttpContextBase>();
			httpContextMock
				.SetupGet(p => p.Server)
				.Returns(httpServerUtility)
				;
			HttpContextBase httpContext = httpContextMock.Object;

			var fileSystemMock = new Mock<IFileSystemWrapper>();
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(STYLES_DIRECTORY_PATH, "Mixins.less")))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(Path.Combine(STYLES_DIRECTORY_PATH, "Mixins.less")))
				.Returns(@"// Border Radius
.border-radius(@radius) {
  -webkit-border-radius: @radius;
     -moz-border-radius: @radius;
          border-radius: @radius;
}

// Visible
.visible()
{
	display: block;
}")
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(STYLES_DIRECTORY_PATH, "TestLessImport.less")))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(Path.Combine(STYLES_DIRECTORY_PATH, "TestLessImport.less")))
				.Returns(@"@alt-bg-color: #143352;

.translators #less
{
	background-color: @alt-bg-color;
	border-color: @alt-bg-color;
}

@import url(""TestLessImport.Sub1.less"");
@import 'TestLessImport.Sub2';")
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(STYLES_DIRECTORY_PATH, "TestLessImport.Sub1.less")))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(Path.Combine(STYLES_DIRECTORY_PATH, "TestLessImport.Sub1.less")))
				.Returns(@"@new-bg-color: black;

.translators #less
{
	background-color: @new-bg-color;
}")
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(STYLES_DIRECTORY_PATH, "TestLessImport.Sub2.less")))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(Path.Combine(STYLES_DIRECTORY_PATH, "TestLessImport.Sub2.less")))
				.Returns(@"@border-color: blue;

.translators #less
{
	border-color: @border-color;
}")
				;

			IFileSystemWrapper fileSystemWrapper = fileSystemMock.Object;
			var cssRelativePathResolver = new MockCssRelativePathResolver();
			var lessConfig = new LessLiteSettings();

			var lessTranslator = new LessTranslator(httpContext, fileSystemWrapper, 
				cssRelativePathResolver, lessConfig);

			const string assetContent = @"@import-once ""/Content/Mixins.less"";

@bg-color: #7AC0DA;
@caption-color: #FFFFFF; 

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

@import ""/Content/TestLessImport.less"";";
			var importedFilePaths = new List<string>();

			// Act
			lessTranslator.FillImportedFilePaths(assetContent, null, importedFilePaths);

			// Assert
			Assert.AreEqual(4, importedFilePaths.Count);
			Assert.AreEqual(Path.Combine(STYLES_DIRECTORY_PATH, "Mixins.less"), importedFilePaths[0]);
			Assert.AreEqual(Path.Combine(STYLES_DIRECTORY_PATH, "TestLessImport.less"), importedFilePaths[1]);
			Assert.AreEqual(Path.Combine(STYLES_DIRECTORY_PATH, "TestLessImport.Sub1.less"), importedFilePaths[2]);
			Assert.AreEqual(Path.Combine(STYLES_DIRECTORY_PATH, "TestLessImport.Sub2.less"), importedFilePaths[3]);
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