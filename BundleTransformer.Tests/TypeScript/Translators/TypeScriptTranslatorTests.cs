namespace BundleTransformer.Tests.TypeScript.Translators
{
	using System;

	using JavaScriptEngineSwitcher.Core;
	using Moq;
	using NUnit.Framework;

	using BundleTransformer.Core.Assets;
	using BundleTransformer.Core.FileSystem;
	using BundleTransformer.Core.Helpers;

	using BundleTransformer.TypeScript;
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


			string jqueryTsAssetVirtualPath = UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"jquery.d.ts");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(jqueryTsAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(jqueryTsAssetVirtualPath))
				.Returns("")
				;


			string iTranslatorBadgeTsAssetVirtualPath = UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
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


			string translatorBadgeTsAssetVirtualPath = UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH, 
				"TranslatorBadge.ts");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(translatorBadgeTsAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(translatorBadgeTsAssetVirtualPath))
				.Returns(@"/// <reference path=""jquery.d.ts"" />
/*
/// <reference path=""typings/knockout/knockout.d.ts"" />
*/
/// <reference path=""//netdna.bootstrapcdn.com/bootstrap/3.0.0/typings/bootstrap.d.ts"" />
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


			string coloredTranslatorBadgeTsAssetVirtualPath = UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH,
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


			Func<IJsEngine> createJsEngineInstance = () => (new Mock<IJsEngine>()).Object;
			IVirtualFileSystemWrapper virtualFileSystemWrapper = virtualFileSystemMock.Object;
			var relativePathResolver = new MockRelativePathResolver();
			var tsConfig = new TypeScriptSettings();

			var tsTranslator = new TypeScriptTranslator(createJsEngineInstance,
				virtualFileSystemWrapper, relativePathResolver, tsConfig);

			const string assetContent = @"/// <reference path=""ColoredTranslatorBadge.ts"" />
var TS_BADGE_TEXT = ""TypeScript"";
var TS_BADGE_COLOR = ""#0074C1"";

var tsBadge = new ColoredTranslatorBadge(""ts"");
tsBadge.setText(TS_BADGE_TEXT);
tsBadge.setTextColor(TS_BADGE_COLOR);
tsBadge.setBorderColor(TS_BADGE_COLOR);";
			string assetUrl = UrlHelpers.Combine(SCRIPTS_DIRECTORY_URL, "TestTypeScript.ts");
			TypeScriptScript script = tsTranslator.PreprocessScript(assetContent, assetUrl);
			var dependencies = new DependencyCollection();

			// Act
			tsTranslator.FillDependencies(assetUrl, script, dependencies);

			// Assert
			Assert.AreEqual(4, dependencies.Count);

			Dependency coloredTranslatorBadgeTsAsset = dependencies[0];
			Dependency jqueryTsAsset = dependencies[1];
			Dependency translatorBadgeTsAsset = dependencies[2];
			Dependency iTranslatorBadgeTsAsset = dependencies[3];

			Assert.AreEqual(coloredTranslatorBadgeTsAssetVirtualPath, coloredTranslatorBadgeTsAsset.Url);
			Assert.AreEqual(true, coloredTranslatorBadgeTsAsset.IsObservable);

			Assert.AreEqual(jqueryTsAssetVirtualPath, jqueryTsAsset.Url);
			Assert.AreEqual(true, jqueryTsAsset.IsObservable);

			Assert.AreEqual(translatorBadgeTsAssetVirtualPath, translatorBadgeTsAsset.Url);
			Assert.AreEqual(true, translatorBadgeTsAsset.IsObservable);

			Assert.AreEqual(iTranslatorBadgeTsAssetVirtualPath, iTranslatorBadgeTsAsset.Url);
			Assert.AreEqual(true, iTranslatorBadgeTsAsset.IsObservable);
		}

		private class MockRelativePathResolver : IRelativePathResolver
		{
			public string ResolveRelativePath(string basePath, string relativePath)
			{
				return UrlHelpers.Combine(SCRIPTS_DIRECTORY_URL, relativePath);
			}
		}
	}
}