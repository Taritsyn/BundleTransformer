namespace BundleTransformer.Tests.TypeScript.Translators
{
	using System.Collections.Generic;
	using System.IO;
	using System.Web;

	using Moq;
	using NUnit.Framework;

	using BundleTransformer.Core;
	using BundleTransformer.Core.Assets;
	using BundleTransformer.Core.FileSystem;
	using BundleTransformer.TypeScript.Configuration;
	using BundleTransformer.TypeScript.Translators;

	[TestFixture]
	public class TypeScriptTranslatorTests
	{
		private const string APPLICATION_ROOT_PATH =
			@"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\";
		private const string SCRIPTS_DIRECTORY_PATH =
			@"D:\Projects\BundleTransformer\BundleTransformer.Example.Mvc\Scripts\";
		private const string SCRIPTS_DIRECTORY_URL = @"/Scripts/";

		[Test]
		public void FillingOfDependenciesIsCorrect()
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
				.Setup(fs => fs.FileExists(Path.Combine(SCRIPTS_DIRECTORY_PATH, "jquery.d.ts")))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(Path.Combine(SCRIPTS_DIRECTORY_PATH, "jquery.d.ts")))
				.Returns(@"")
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(SCRIPTS_DIRECTORY_PATH, "ITranslatorBadge.d.ts")))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(Path.Combine(SCRIPTS_DIRECTORY_PATH, "ITranslatorBadge.d.ts")))
				.Returns(@"interface ITranslatorBadge {
    getText(): string;
    setText(text: string): void;
    show(): void;
    hide(): void;
}")
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(SCRIPTS_DIRECTORY_PATH, "TranslatorBadge.ts")))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(Path.Combine(SCRIPTS_DIRECTORY_PATH, "TranslatorBadge.ts")))
				.Returns(@"/// <reference path=""jquery.d.ts"" />
/// <reference path=""ITranslatorBadge.d.ts"" />

class TranslatorBadge implements ITranslatorBadge {
    public $badgeElem: any;
    public $linkElem: any;

    constructor (public elementId: string) {
        this.$badgeElem = jQuery(""#"" + elementId);
        this.$linkElem = this.$badgeElem.find(""A:first"");
    }

    public getText(): string {
        return this.$linkElem.text();
    }

    public setText(text: string): void {
        this.$linkElem.text(text);
    }

    public show(): void {
        this.$badgeElem.show(0);
    }

    public hide(): void {
        this.$badgeElem.hide(0);
    }
}")
				;
			fileSystemMock
				.Setup(fs => fs.FileExists(Path.Combine(SCRIPTS_DIRECTORY_PATH, "ColoredTranslatorBadge.ts")))
				.Returns(true)
				;
			fileSystemMock
				.Setup(fs => fs.GetFileTextContent(Path.Combine(SCRIPTS_DIRECTORY_PATH, "ColoredTranslatorBadge.ts")))
				.Returns(@"/// <reference path=""jquery.d.ts"" />
/// <reference path=""TranslatorBadge.ts"" />

class ColoredTranslatorBadge extends TranslatorBadge {
    public getTextColor(): string {
        return this.$linkElem.css(""color"");
    }

    public setTextColor(color: string): void {
        this.$linkElem.css(""color"", color);
    }

    public getBorderColor(): string {
        return this.$badgeElem.css(""border-color"");
    }

    public setBorderColor(color: string) {
        this.$badgeElem.css(""border-color"", color);
    }
}")
				;

			IFileSystemWrapper fileSystemWrapper = fileSystemMock.Object;
			var jsRelativePathResolver = new MockJsRelativePathResolver();
			var tsConfig = new TypeScriptSettings();

			var tsTranslator = new TypeScriptTranslator(httpContext, fileSystemWrapper, 
				jsRelativePathResolver, tsConfig);

			const string assetContent = @"/// <reference path=""ColoredTranslatorBadge.ts"" />
var TS_BADGE_TEXT = ""TypeScript"";
var TS_BADGE_COLOR = ""#0074C1"";

var tsBadge = new ColoredTranslatorBadge(""ts"");
tsBadge.setText(TS_BADGE_TEXT);
tsBadge.setTextColor(TS_BADGE_COLOR);
tsBadge.setBorderColor(TS_BADGE_COLOR);";
			string assetUrl = Utils.CombineUrls(SCRIPTS_DIRECTORY_URL, "TestTypeScript.ts");
			var dependencies = new List<Dependency>();

			// Act
			tsTranslator.FillDependencies(assetUrl, assetContent, assetUrl, dependencies);

			// Assert
			Assert.AreEqual(4, dependencies.Count);
			Assert.AreEqual(Path.Combine(SCRIPTS_DIRECTORY_PATH, "jquery.d.ts"),
				dependencies[0].Path);
			Assert.AreEqual(Path.Combine(SCRIPTS_DIRECTORY_PATH, "ITranslatorBadge.d.ts"),
				dependencies[1].Path);
			Assert.AreEqual(Path.Combine(SCRIPTS_DIRECTORY_PATH, "TranslatorBadge.ts"), 
				dependencies[2].Path);
			Assert.AreEqual(Path.Combine(SCRIPTS_DIRECTORY_PATH, "ColoredTranslatorBadge.ts"),
				dependencies[3].Path);
		}

		private class MockHttpServerUtility : HttpServerUtilityBase
		{
			public override string MapPath(string path)
			{
				return Path.Combine(APPLICATION_ROOT_PATH, Utils.RemoveFirstSlashFromUrl(path.Replace("/", @"\")));
			}
		}

		private class MockJsRelativePathResolver : IJsRelativePathResolver
		{
			public string ResolveRelativePath(string basePath, string relativePath)
			{
				return Utils.CombineUrls(SCRIPTS_DIRECTORY_URL, relativePath);
			}
		}
	}
}