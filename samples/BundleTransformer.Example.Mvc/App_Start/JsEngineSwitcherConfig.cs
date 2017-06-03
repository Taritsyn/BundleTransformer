using JavaScriptEngineSwitcher.Core;
using JavaScriptEngineSwitcher.Msie;

namespace BundleTransformer.Example.Mvc
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