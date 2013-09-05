namespace BundleTransformer.Csso.Optimizers
{
	using System;

	using JavaScriptEngineSwitcher.Core;
	using JavaScriptEngineSwitcher.Core.Helpers;

	using CoreStrings = Core.Resources.Strings;

	using CssoStrings = Resources.Strings;

	/// <summary>
	/// CSS-optimizer
	/// </summary>
	internal sealed class CssOptimizer : IDisposable
	{
		/// <summary>
		/// Name of resource, which contains a Sergey Kryzhanovsky's CSSO-library
		/// </summary>
		const string CSSO_LIBRARY_RESOURCE_NAME = "BundleTransformer.Csso.Resources.csso.web.min.js";

		/// <summary>
		/// Name of function, which is responsible for CSS-optimization
		/// </summary>
		const string OPTIMIZATION_FUNCTION_NAME = "cssoJustDoIt";

		/// <summary>
		/// JS engine
		/// </summary>
		private readonly IJsEngine _jsEngine;

		/// <summary>
		/// Synchronizer of optimization
		/// </summary>
		private readonly object _optimizationSynchronizer = new object();

		/// <summary>
		/// Flag that optimizer is initialized
		/// </summary>
		private bool _initialized;

		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private bool _disposed;


		/// <summary>
		/// Constructs instance of CSS-optimizer
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JavaScript engine</param>
		public CssOptimizer(Func<IJsEngine> createJsEngineInstance)
		{
			_jsEngine = createJsEngineInstance();
		}


		/// <summary>
		/// Initializes optimizer
		/// </summary>
		private void Initialize()
		{
			if (!_initialized)
			{
				_jsEngine.ExecuteResource(CSSO_LIBRARY_RESOURCE_NAME, GetType());
				_jsEngine.Execute(string.Format(@"function {0}(code, disableRestructuring) {{
	var compressor = new CSSOCompressor(),
		translator = new CSSOTranslator();

	return translator.translate(cleanInfo(compressor.compress(srcToCSSP(code, 'stylesheet', true), disableRestructuring)));
}}", OPTIMIZATION_FUNCTION_NAME));

				_initialized = true;
			}
		}

		/// <summary>
		/// "Optimizes" CSS-code by using Sergey Kryzhanovsky's CSSO
		/// </summary>
		/// <param name="content">Text content of CSS-asset</param>
		/// <param name="disableRestructuring">Flag for whether to disable structure minification</param>
		/// <returns>Minified text content of CSS-asset</returns>
		public string Optimize(string content, bool disableRestructuring = false)
		{
			string newContent;

			lock (_optimizationSynchronizer)
			{
				Initialize();

				try
				{
					newContent = _jsEngine.CallFunction<string>(OPTIMIZATION_FUNCTION_NAME,
						content, disableRestructuring);
				}
				catch (JsRuntimeException e)
				{
					throw new CssOptimizingException(
						JsRuntimeErrorHelpers.Format(e));
				}
			}

			return newContent;
		}

		/// <summary>
		/// Destroys object
		/// </summary>
		public void Dispose()
		{
			if (!_disposed)
			{
				_disposed = true;

				if (_jsEngine != null)
				{
					_jsEngine.Dispose();
				}
			}
		}
	}
}