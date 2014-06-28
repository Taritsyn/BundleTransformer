namespace BundleTransformer.Example.Mvc
{
	using System.Web.Optimization;

	using Core.Builders;
	using Core.Bundles;
	using Core.Orderers;
	using Core.Resolvers;
	using Core.Transformers;

	public class BundleConfig
	{
		// For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
		public static void RegisterBundles(BundleCollection bundles)
		{
			bundles.UseCdn = true;

			var nullBuilder = new NullBuilder();
			var nullOrderer = new NullOrderer();

			// Replace a default bundle resolver in order to the debugging HTTP-handler
			// can use transformations of the corresponding bundle
			BundleResolver.Current = new CustomBundleResolver();

			var commonStylesBundle = new CustomStyleBundle("~/Bundles/CommonStyles");
			commonStylesBundle.Include(
				"~/Content/Fonts.css",
				"~/Content/Site.css",
				"~/Content/BundleTransformer.css",
				"~/AlternativeContent/css/TestCssComponentsPaths.css",
				"~/Content/themes/base/jquery.ui.core.css",
				"~/Content/themes/base/jquery.ui.theme.css",
				"~/Content/themes/base/jquery.ui.resizable.css",
				"~/Content/themes/base/jquery.ui.button.css",
				"~/Content/themes/base/jquery.ui.dialog.css",
				"~/Content/TestTranslators.css",
				"~/Content/less/TestLess.less",
				"~/Content/sass/TestSass.sass",
				"~/Content/scss/TestScss.scss");
			commonStylesBundle.Orderer = nullOrderer;
			bundles.Add(commonStylesBundle);

			var modernizrBundle = new CustomScriptBundle("~/Bundles/Modernizr");
			modernizrBundle.Include("~/Scripts/modernizr-2.*");
			modernizrBundle.Orderer = nullOrderer;
			bundles.Add(modernizrBundle);

			var jQueryBundle = new CustomScriptBundle("~/Bundles/Jquery",
				"http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.11.1.min.js");
			jQueryBundle.Include("~/Scripts/jquery-{version}.js");
			jQueryBundle.Orderer = nullOrderer;
			jQueryBundle.CdnFallbackExpression = "window.jquery";
			bundles.Add(jQueryBundle);

			var commonScriptsBundle = new CustomScriptBundle("~/Bundles/CommonScripts");
			commonScriptsBundle.Include(
				"~/Scripts/MicrosoftAjax.js",
				"~/Scripts/jquery-ui-{version}.js",
				"~/Scripts/jquery.validate.js",
				"~/Scripts/jquery.validate.unobtrusive.js",
				"~/Scripts/jquery.unobtrusive-ajax.js",
				"~/Scripts/knockout-3.*",
				"~/Scripts/coffee/TestCoffeeScript.coffee",
				"~/Scripts/coffee/TestLiterateCoffeeScript.litcoffee",
				"~/Scripts/coffee/TestCoffeeScriptMarkdown.coffee.md",
				"~/Scripts/ts/TranslatorBadge.ts",
				"~/Scripts/ts/ColoredTranslatorBadge.ts",
				"~/Scripts/ts/TestTypeScript.ts");
			commonScriptsBundle.Orderer = nullOrderer;
			bundles.Add(commonScriptsBundle);

			var сommonTemplatesBundle = new CustomScriptBundle("~/Bundles/CommonTemplates");
			сommonTemplatesBundle.Include(
				"~/Scripts/hogan/template-{version}.js",
				"~/Scripts/hogan/HoganTranslatorBadge.mustache",
				"~/Scripts/hogan/TestHogan.js",
				"~/Scripts/handlebars/handlebars.runtime.js",
				"~/Scripts/handlebars/HandlebarsHelpers.js",
				"~/Scripts/handlebars/HandlebarsTranslatorBadge.handlebars",
				"~/Scripts/handlebars/TestHandlebars.js");
			сommonTemplatesBundle.Orderer = nullOrderer;
			bundles.Add(сommonTemplatesBundle);
			
			var jqueryUiStylesDirectoryBundle = new Bundle("~/Bundles/JqueryUiStylesDirectory")
			{
				Builder = nullBuilder
			};
			jqueryUiStylesDirectoryBundle.IncludeDirectory("~/Content/themes/base/", "*.css");
			jqueryUiStylesDirectoryBundle.Transforms.Add(new StyleTransformer(
				new[] { "*.all.css", "jquery.ui.base.css" }));
			bundles.Add(jqueryUiStylesDirectoryBundle);

			var scriptsDirectoryBundle = new Bundle("~/Bundles/ScriptsDirectory")
			{
				Builder = nullBuilder
			};
			scriptsDirectoryBundle.IncludeDirectory("~/Scripts/", "*.js", true);
			scriptsDirectoryBundle.Transforms.Add(new ScriptTransformer(
				new[] { "*.all.js", "_references.js" }));
			bundles.Add(scriptsDirectoryBundle);
		}
	}
}