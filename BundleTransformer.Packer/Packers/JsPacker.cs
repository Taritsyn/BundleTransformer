namespace BundleTransformer.Packer.Packers
{
	using System;

	using JavaScriptEngineSwitcher.Core;
	using JavaScriptEngineSwitcher.Core.Helpers;

	using CoreStrings = Core.Resources.Strings;

	/// <summary>
	/// JS-packer
	/// </summary>
	internal sealed class JsPacker : IDisposable
	{
		/// <summary>
		/// Namespace for resources
		/// </summary>
		private const string RESOURCES_NAMESPACE = "BundleTransformer.Packer.Resources";

		/// <summary>
		/// Name of file, which contains a Dean Edwards' Packer-library
		/// </summary>
		private const string PACKER_LIBRARY_FILE_NAME = "packer-combined.min.js";

		/// <summary>
		/// Name of function, which is responsible for packing
		/// </summary>
		private const string PACKING_FUNCTION_NAME = "packerPack";

		/// <summary>
		/// JS engine
		/// </summary>
		private IJsEngine _jsEngine;

		/// <summary>
		/// Synchronizer of packing
		/// </summary>
		private readonly object _packingSynchronizer = new object();

		/// <summary>
		/// Flag that JS-packer is initialized
		/// </summary>
		private bool _initialized;

		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private bool _disposed;


		/// <summary>
		/// Constructs a instance of JS-packer
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JavaScript engine</param>
		public JsPacker(Func<IJsEngine> createJsEngineInstance)
		{
			_jsEngine = createJsEngineInstance();
		}


		/// <summary>
		/// Initializes JS-packer
		/// </summary>
		private void Initialize()
		{
			if (!_initialized)
			{
				_jsEngine.ExecuteResource(RESOURCES_NAMESPACE + "." + PACKER_LIBRARY_FILE_NAME, GetType());
				_jsEngine.Execute(
					string.Format(@"var {0} = function(code, base62Encode, shrinkVariables) {{
	var packer = new Packer();

	return packer.pack(code, base62Encode, shrinkVariables);
}}", PACKING_FUNCTION_NAME));

				_initialized = true;
			}
		}

		/// <summary>
		/// "Packs" a JS-code by using Dean Edwards' Packer
		/// </summary>
		/// <param name="content">Text content of JS-asset</param>
		/// <param name="base62Encode">Flag for whether to Base62 encode</param>
		/// <param name="shrinkVariables">Flag for whether to shrink variables</param>
		/// <returns>Minified text content of JS-asset</returns>
		public string Pack(string content, bool base62Encode = false, bool shrinkVariables = false)
		{
			string newContent;

			lock (_packingSynchronizer)
			{
				Initialize();

				try
				{
					newContent = _jsEngine.CallFunction<string>(PACKING_FUNCTION_NAME,
						content, base62Encode, shrinkVariables);
				}
				catch (JsRuntimeException e)
				{
					throw new JsPackingException(
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