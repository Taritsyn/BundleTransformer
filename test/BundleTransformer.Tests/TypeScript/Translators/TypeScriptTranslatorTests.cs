using System;
using System.Collections.Generic;

using JavaScriptEngineSwitcher.Core;
using Moq;
using Xunit;

using BundleTransformer.Core.Assets;
using BundleTransformer.Core.FileSystem;
using BundleTransformer.Core.Helpers;
using BundleTransformer.Core.Utilities;

using BundleTransformer.TypeScript.Configuration;
using BundleTransformer.TypeScript.Translators;

namespace BundleTransformer.Tests.TypeScript.Translators
{
	public class TypeScriptTranslatorTests : IClassFixture<ApplicationSetupFixture>
	{
		private const string SCRIPTS_DIRECTORY_VIRTUAL_PATH = "/Scripts/";


		[Fact]
		public void FillingOfDependenciesIsCorrect()
		{
			// Arrange
			var virtualFileSystemMock = new Mock<IVirtualFileSystemWrapper>();
			virtualFileSystemMock
				.Setup(fs => fs.ToAbsolutePath("~/"))
				.Returns("/")
				;


			string testTypeScriptTsAssetVirtualPath = UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH,
				"TestTypeScript.ts");
			virtualFileSystemMock
				.Setup(fs => fs.ToAbsolutePath(testTypeScriptTsAssetVirtualPath))
				.Returns(testTypeScriptTsAssetVirtualPath)
				;
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(testTypeScriptTsAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(testTypeScriptTsAssetVirtualPath))
				.Returns(@"/// <reference path=""ColoredTranslatorBadge.ts"" />

module TranslatorBadges {
	var TS_BADGE_TEXT: string = ""TypeScript"";
	var TS_BADGE_COLOR: string = ""#0074C1"";

	export function createTsTranslatorBadge() {
		var tsBadge: IColoredTranslatorBadge = new ColoredTranslatorBadge(""ts"");
		tsBadge.setText(TS_BADGE_TEXT);
		tsBadge.setTextColor(TS_BADGE_COLOR);
		tsBadge.setBorderColor(TS_BADGE_COLOR);
		tsBadge.show();
	}
}

TranslatorBadges.createTsTranslatorBadge();")
				;


			string jqueryTsAssetVirtualPath = UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH,
				"jquery.d.ts");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(jqueryTsAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(jqueryTsAssetVirtualPath))
				.Returns(Utils.GetResourceAsString("BundleTransformer.Tests.Resources.jquery.d.ts", GetType().Assembly))
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
	isVisible(): boolean;
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
/// <reference path=""ITranslatorBadge.d.ts"" />

module TranslatorBadges {
	export class TranslatorBadge implements ITranslatorBadge {
		$badgeElem: JQuery;
		$linkElem: JQuery;

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

		public isVisible() : boolean {
			return this.$badgeElem.is("":visible"");
		}
	}
}")
				;


			string iColoredTranslatorBadgeTsAssetVirtualPath = UrlHelpers.Combine(SCRIPTS_DIRECTORY_VIRTUAL_PATH,
				"IColoredTranslatorBadge.d.ts");
			virtualFileSystemMock
				.Setup(fs => fs.FileExists(iColoredTranslatorBadgeTsAssetVirtualPath))
				.Returns(true)
				;
			virtualFileSystemMock
				.Setup(fs => fs.GetFileTextContent(iColoredTranslatorBadgeTsAssetVirtualPath))
				.Returns(@"/// <reference path=""ITranslatorBadge.d.ts"" />

interface IColoredTranslatorBadge extends ITranslatorBadge {
	getTextColor(): string;
	setTextColor(color: string): void;
	getBorderColor(): string;
	setBorderColor(color: string): void;
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
/// <reference path=""./IColoredTranslatorBadge.d.ts"" />
/// <reference path=""TranslatorBadge.ts"" />

module TranslatorBadges {
	export class ColoredTranslatorBadge
		extends TranslatorBadge
	{
		public getTextColor(): string {
			return this.$linkElem.css(""color"");
		}

		public setTextColor(color: string): void {
			this.$linkElem.css(""color"", color);
		}

		public getBorderColor(): string {
			return this.$badgeElem.css(""border-color"");
		}

		public setBorderColor(color: string): void {
			this.$badgeElem.css(""border-color"", color);
		}
	}
}")
				;

			Func<IJsEngine> createJsEngineInstance =
				() => JsEngineSwitcher.Instance.CreateDefaultEngine();
			IVirtualFileSystemWrapper virtualFileSystemWrapper = virtualFileSystemMock.Object;
			var tsConfig = new TypeScriptSettings();

			var tsTranslator = new TypeScriptTranslator(createJsEngineInstance, virtualFileSystemWrapper,
				tsConfig);
			IAsset asset = new Asset(testTypeScriptTsAssetVirtualPath, virtualFileSystemWrapper);

			// Act
			asset = tsTranslator.Translate(asset);
			IList<string> dependencies = asset.VirtualPathDependencies;

			// Assert
			Assert.Equal(5, dependencies.Count);

			Assert.Equal(coloredTranslatorBadgeTsAssetVirtualPath, dependencies[0]);
			Assert.Equal(jqueryTsAssetVirtualPath, dependencies[1]);
			Assert.Equal(iColoredTranslatorBadgeTsAssetVirtualPath, dependencies[2]);
			Assert.Equal(iTranslatorBadgeTsAssetVirtualPath, dependencies[3]);
			Assert.Equal(translatorBadgeTsAssetVirtualPath, dependencies[4]);
		}
	}
}