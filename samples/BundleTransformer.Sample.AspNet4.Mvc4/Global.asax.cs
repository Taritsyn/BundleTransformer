using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

using JavaScriptEngineSwitcher.Core;

namespace BundleTransformer.Sample.AspNet4.Mvc4
{
	public class MvcApplication : HttpApplication
	{
		protected void Application_Start()
		{
			AreaRegistration.RegisterAllAreas();

			FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
			RouteConfig.RegisterRoutes(RouteTable.Routes);
			JsEngineSwitcherConfig.Configure(JsEngineSwitcher.Current);
			BundleConfig.RegisterBundles(BundleTable.Bundles);
		}
	}
}