using JavaScriptEngineSwitcher.Core;
using JavaScriptEngineSwitcher.Msie;

namespace BundleTransformer.Tests
{
	internal static class JsEngineSwitcherInitializer
	{
		private static readonly object _synchronizer = new object();
		private static bool _initialized;


		public static void Initialize()
		{
			if (!_initialized)
			{
				lock (_synchronizer)
				{
					if (!_initialized)
					{
						JsEngineSwitcher engineSwitcher = JsEngineSwitcher.Instance;
						engineSwitcher.EngineFactories
							.AddMsie()
							;
						engineSwitcher.DefaultEngineName = MsieJsEngine.EngineName;

						_initialized = true;
					}
				}
			}
		}
	}
}