namespace BundleTransformer.Csso.Optimizers
{
	using System;

	using JavaScriptEngineSwitcher.Core;
	using JavaScriptEngineSwitcher.Core.Helpers;
	using Newtonsoft.Json;
	using Newtonsoft.Json.Linq;

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
		const string CSSO_LIBRARY_RESOURCE_NAME = "BundleTransformer.Csso.Resources.csso-combined.min.js";

		/// <summary>
		/// Name of resource, which contains a CSSO-minifier helper
		/// </summary>
		const string CSSO_HELPER_RESOURCE_NAME = "BundleTransformer.Csso.Resources.cssoHelper.min.js";

		/// <summary>
		/// Template of function call, which is responsible for CSS-optimization
		/// </summary>
		const string OPTIMIZATION_FUNCTION_CALL_TEMPLATE = @"cssoHelper.minify({0}, {1});";

		/// <summary>
		/// JS engine
		/// </summary>
		private IJsEngine _jsEngine;

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
				Type type = GetType();

				_jsEngine.ExecuteResource(CSSO_LIBRARY_RESOURCE_NAME, type);
				_jsEngine.ExecuteResource(CSSO_HELPER_RESOURCE_NAME, type);

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
					var result = _jsEngine.Evaluate<string>(
						string.Format(OPTIMIZATION_FUNCTION_CALL_TEMPLATE,
							JsonConvert.SerializeObject(content),
							JsonConvert.SerializeObject(disableRestructuring)));

					var json = JObject.Parse(result);

					var errors = json["errors"] != null ? json["errors"] as JArray : null;
					if (errors != null && errors.Count > 0)
					{
						throw new CssOptimizingException(errors[0].Value<string>());
					}

					newContent = json.Value<string>("minifiedCode");

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
					_jsEngine = null;
				}
			}
		}
	}
}