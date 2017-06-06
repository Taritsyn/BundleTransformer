using JavaScriptEngineSwitcher.Core;
using JavaScriptEngineSwitcher.Msie;

namespace BundleTransformer.Sample.AspNet4.Mvc4
{
	public class JsEngineSwitcherConfig
	{
		public static void Configure(JsEngineSwitcher engineSwitcher)
		{
			engineSwitcher.EngineFactories
				.AddMsie()
				;
		}
	}
}