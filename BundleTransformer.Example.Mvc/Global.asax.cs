namespace BundleTransformer.Example.Mvc
{
	using System.Web.Http;
	using System.Web.Mvc;
	using System.Web.Optimization;
	using System.Web.Routing;

	using Core.Orderers;
	using Core.Transformers;

	public class MvcApplication : System.Web.HttpApplication
	{
		public static void RegisterGlobalFilters(GlobalFilterCollection filters)
		{
			filters.Add(new HandleErrorAttribute());
		}

		public static void RegisterRoutes(RouteCollection routes)
		{
			routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

			routes.MapHttpRoute(
				name: "DefaultApi",
				routeTemplate: "api/{controller}/{id}",
				defaults: new { id = RouteParameter.Optional }
			);

			routes.MapRoute(
				name: "Default",
				url: "{controller}/{action}/{id}",
				defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
			);
		}

		protected void Application_Start()
		{
			AreaRegistration.RegisterAllAreas();

			RegisterGlobalFilters(GlobalFilters.Filters);
			RegisterRoutes(RouteTable.Routes);

			BundleTable.Bundles.EnableDefaultBundles();

			var cssTransformer = new CssTransformer();
			var jsTransformer = new JsTransformer();
			var nullOrderer = new NullOrderer();

			var commonStylesBundle = new Bundle("~/CommonStyles", cssTransformer);
			commonStylesBundle.AddFile("~/Content/Site.css");
			commonStylesBundle.AddFile("~/AlternativeContent/css/TestCssComponentsPaths.css");
			commonStylesBundle.AddFile("~/Content/themes/base/jquery.ui.core.css");
			commonStylesBundle.AddFile("~/Content/themes/base/jquery.ui.theme.css");
			commonStylesBundle.AddFile("~/Content/themes/base/jquery.ui.resizable.css");
			commonStylesBundle.AddFile("~/Content/themes/base/jquery.ui.button.css");
			commonStylesBundle.AddFile("~/Content/themes/base/jquery.ui.dialog.css");
			commonStylesBundle.AddFile("~/Content/TestTranslators.css");
			commonStylesBundle.AddFile("~/Content/TestLess.less");
			commonStylesBundle.AddFile("~/Content/TestSass.sass");
			commonStylesBundle.AddFile("~/Content/TestScss.scss");
			commonStylesBundle.Orderer = nullOrderer;

			BundleTable.Bundles.Add(commonStylesBundle);

			var modernizrBundle = new Bundle("~/Modernizr", jsTransformer);
			modernizrBundle.AddFile("~/Scripts/modernizr-2.0.6-development-only.js");
			modernizrBundle.Orderer = nullOrderer;

			BundleTable.Bundles.Add(modernizrBundle);

			var commonScriptsBundle = new Bundle("~/CommonScripts", jsTransformer);
			commonScriptsBundle.AddFile("~/Scripts/MicrosoftAjax.js");
			commonScriptsBundle.AddFile("~/Scripts/jquery-1.6.2.js");
			commonScriptsBundle.AddFile("~/Scripts/jquery-ui-1.8.11.js");
			commonScriptsBundle.AddFile("~/Scripts/jquery.validate.js");
			commonScriptsBundle.AddFile("~/Scripts/jquery.validate.unobtrusive.js");
			commonScriptsBundle.AddFile("~/Scripts/jquery.unobtrusive-ajax.js");
			commonScriptsBundle.AddFile("~/Scripts/knockout-2.0.0.js");
			commonScriptsBundle.AddFile("~/Scripts/AjaxLogin.js");
			commonScriptsBundle.AddFile("~/Scripts/TestCoffeeScript.coffee");
			commonScriptsBundle.Orderer = nullOrderer;

			BundleTable.Bundles.Add(commonScriptsBundle);

			var jqueryUiStylesDirectoryBundle = new Bundle("~/JqueryUiStylesDirectoryTrace", new CssTransformer(
				new[] { "*.all.css", "jquery.ui.base.css" }));
			jqueryUiStylesDirectoryBundle.AddDirectory("~/Content/themes/base/", "*.css");

			BundleTable.Bundles.Add(jqueryUiStylesDirectoryBundle);

			var scriptsDirectoryBundle = new Bundle("~/ScriptsDirectoryTrace", new JsTransformer(
				new[] { "*-vsdoc.js", "*.all.js", "_references.js" }));
			scriptsDirectoryBundle.AddDirectory("~/Scripts/", "*.js");

			BundleTable.Bundles.Add(scriptsDirectoryBundle);
		}
	}
}