namespace BundleTransformer.Example.Mvc
{
	using System.Web.Optimization;

	using Core.Orderers;
	using Core.Transformers;

	public class BundleConfig
	{
		public static void RegisterBundles(BundleCollection bundles)
		{
			BundleTable.EnableOptimizations = true;
	
			bundles.EnableDefaultBundles();

			var cssTransformer = new CssTransformer();
			var jsTransformer = new JsTransformer();
			var nullOrderer = new NullOrderer();

			var commonStylesBundle = new StyleBundle("~/CommonStyles");
			commonStylesBundle.Include(
				"~/Content/Site.css",
				"~/Content/BundleTransformer.css",
				"~/AlternativeContent/css/TestCssComponentsPaths.css",
				"~/Content/themes/base/jquery.ui.core.css",
				"~/Content/themes/base/jquery.ui.theme.css",
				"~/Content/themes/base/jquery.ui.resizable.css",
				"~/Content/themes/base/jquery.ui.button.css",
				"~/Content/themes/base/jquery.ui.dialog.css",
				"~/Content/TestTranslators.css",
				"~/Content/TestLess.less",
				"~/Content/TestSass.sass",
				"~/Content/TestScss.scss");
			commonStylesBundle.Transforms.Add(cssTransformer);
			commonStylesBundle.Orderer = nullOrderer;

			bundles.Add(commonStylesBundle);

			var modernizrBundle = new ScriptBundle("~/Modernizr");
			modernizrBundle.Include("~/Scripts/modernizr-2.5.3.js");
			modernizrBundle.Transforms.Add(jsTransformer);
			modernizrBundle.Orderer = nullOrderer;

			bundles.Add(modernizrBundle);

			var commonScriptsBundle = new ScriptBundle("~/CommonScripts");
			commonScriptsBundle.Include("~/Scripts/MicrosoftAjax.js",
				"~/Scripts/jquery-1.6.2.js",
				"~/Scripts/jquery-ui-1.8.11.js",
				"~/Scripts/jquery.validate.js",
				"~/Scripts/jquery.validate.unobtrusive.js",
				"~/Scripts/jquery.unobtrusive-ajax.js",
				"~/Scripts/knockout-2.1.0.js",
				"~/Scripts/TestCoffeeScript.coffee");
			commonScriptsBundle.Transforms.Add(jsTransformer);
			commonScriptsBundle.Orderer = nullOrderer;

			bundles.Add(commonScriptsBundle);

			var jqueryUiStylesDirectoryBundle = new StyleBundle("~/JqueryUiStylesDirectory");
			jqueryUiStylesDirectoryBundle.IncludeDirectory("~/Content/themes/base/", "*.css");
			jqueryUiStylesDirectoryBundle.Transforms.Add(new CssTransformer(
				new[] { "*.all.css", "jquery.ui.base.css" }));

			bundles.Add(jqueryUiStylesDirectoryBundle);

			var scriptsDirectoryBundle = new ScriptBundle("~/ScriptsDirectory");
			scriptsDirectoryBundle.IncludeDirectory("~/Scripts/", "*.js");
			scriptsDirectoryBundle.Transforms.Add(new JsTransformer(
				new[] { "*.all.js", "_references.js" }));

			bundles.Add(scriptsDirectoryBundle);
		}
	}
}