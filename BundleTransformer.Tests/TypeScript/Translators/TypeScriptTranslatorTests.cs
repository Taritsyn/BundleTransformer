namespace BundleTransformer.Tests.TypeScript.Translators
{
	using System.Collections.Generic;

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
		private const string SCRIPTS_DIRECTORY_VIRTUAL_PATH = "/Scripts/";
		private const string SCRIPTS_DIRECTORY_URL = "/Scripts/";

		[Test]
		public void FillingOfDependenciesIsCorrect()
		{
			// Arrange
			var virtualFileSystemMock = new Mock<IVirtualFileSystemWrapper>();


			string jqueryTsAssetVirtualPath = Utils.CombineUrls(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"jquery.d.ts");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(jqueryTsAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(jqueryTsAssetVirtualPath))
				.Returns("")
				;


			string iTranslatorBadgeTsAssetVirtualPath = Utils.CombineUrls(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"ITranslatorBadge.d.ts");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(iTranslatorBadgeTsAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(iTranslatorBadgeTsAssetVirtualPath))
				.Returns(@"interface ITranslatorBadge {
    getText(): string;
    setText(text: string): void;
    show(): void;
    hide(): void;
}")
				;


			string translatorBadgeTsAssetVirtualPath = Utils.CombineUrls(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"TranslatorBadge.ts");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(translatorBadgeTsAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(translatorBadgeTsAssetVirtualPath))
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


			string coloredTranslatorBadgeTsAssetVirtualPath = Utils.CombineUrls(SCRIPTS_DIRECTORY_VIRTUAL_PATH,
				"ColoredTranslatorBadge.ts");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(coloredTranslatorBadgeTsAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(coloredTranslatorBadgeTsAssetVirtualPath))
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


			IVirtualFileSystemWrapper virtualFileSystemWrapper = virtualFileSystemMock.Object;
			var relativePathResolver = new MockRelativePathResolver();
			var tsConfig = new TypeScriptSettings();

			var tsTranslator = new TypeScriptTranslator(virtualFileSystemWrapper, 
				relativePathResolver, tsConfig);

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
			Assert.AreEqual(jqueryTsAssetVirtualPath, dependencies[0].VirtualPath);
			Assert.AreEqual(iTranslatorBadgeTsAssetVirtualPath, dependencies[1].VirtualPath);
			Assert.AreEqual(translatorBadgeTsAssetVirtualPath, dependencies[2].VirtualPath);
			Assert.AreEqual(coloredTranslatorBadgeTsAssetVirtualPath, dependencies[3].VirtualPath);
		}

		private class MockRelativePathResolver : IRelativePathResolver
		{
			public string ResolveRelativePath(string basePath, string relativePath)
			{
				return Utils.CombineUrls(SCRIPTS_DIRECTORY_URL, relativePath);
			}
		}
	}
}