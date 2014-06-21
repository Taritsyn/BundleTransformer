namespace BundleTransformer.Tests
{
	using Moq;
	using NUnit.Framework;

	using BundleTransformer.Core;
	using BundleTransformer.Core.Assets;

	using CoffeeScriptAssetTypeCodes = BundleTransformer.CoffeeScript.Constants.AssetTypeCode;
	using CoreAssetTypeCodes = BundleTransformer.Core.Constants.AssetTypeCode;
	using HandlebarsAssetTypeCodes = BundleTransformer.Handlebars.Constants.AssetTypeCode;
	using LessAssetTypeCodes = BundleTransformer.Less.Constants.AssetTypeCode;
	using SassAndScssAssetTypeCodes = BundleTransformer.SassAndScss.Constants.AssetTypeCode;
	using TypeScriptAssetTypeCodes = BundleTransformer.TypeScript.Constants.AssetTypeCode;

	[SetUpFixture]
	public class ApplicationSetup
	{
		[SetUp]
		public void Initialize()
		{
			var styleContextMock = new Mock<IAssetContext>();
			styleContextMock
				.Setup(s => s.FileExtensionMappings)
				.Returns(new FileExtensionMappingCollection
					{
						{ ".css", CoreAssetTypeCodes.Css },
						{ ".less", LessAssetTypeCodes.Less },
						{ ".sass", SassAndScssAssetTypeCodes.Sass },
						{ ".scss", SassAndScssAssetTypeCodes.Scss }
					}
				)
				;

			var scriptContextMock = new Mock<IAssetContext>();
			scriptContextMock
				.Setup(s => s.FileExtensionMappings)
				.Returns(new FileExtensionMappingCollection
					{
						{ ".js", CoreAssetTypeCodes.JavaScript },
						{ ".coffee", CoffeeScriptAssetTypeCodes.CoffeeScript },
						{ ".litcoffee", CoffeeScriptAssetTypeCodes.LiterateCoffeeScript },
						{ ".coffee.md", CoffeeScriptAssetTypeCodes.LiterateCoffeeScript },
						{ ".ts", TypeScriptAssetTypeCodes.TypeScript },
						{ ".handlebars", HandlebarsAssetTypeCodes.Handlebars },
						{ ".hbs", HandlebarsAssetTypeCodes.Handlebars }
					}
				)
				;

			var bundleTransformerContextMock = new Mock<IBundleTransformerContext>();
			bundleTransformerContextMock
				.Setup(b => b.Styles)
				.Returns(styleContextMock.Object)
				;
			bundleTransformerContextMock
				.Setup(b => b.Scripts)
				.Returns(scriptContextMock.Object)
				;

			BundleTransformerContext.Current = bundleTransformerContextMock.Object;
		}

		[TearDown]
		public void Terminate()
		{
			BundleTransformerContext.Current = null;
		}
	}
}