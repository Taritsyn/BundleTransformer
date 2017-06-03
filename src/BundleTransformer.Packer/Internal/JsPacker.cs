namespace BundleTransformer.Packer.Internal
{
	using System;
	using System.Reflection;

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
		/// Packing options
		/// </summary>
		private readonly PackingOptions _options;

		/// <summary>
		/// Flag that JS-packer is initialized
		/// </summary>
		private InterlockedStatedFlag _initializedFlag = new InterlockedStatedFlag();

		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private InterlockedStatedFlag _disposedFlag = new InterlockedStatedFlag();


		/// <summary>
		/// Constructs a instance of JS-packer
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JavaScript engine</param>
		/// <param name="options">Packing options</param>
		public JsPacker(Func<IJsEngine> createJsEngineInstance, PackingOptions options)
		{
			_jsEngine = createJsEngineInstance();
			_options = options;
		}


		/// <summary>
		/// Initializes JS-packer
		/// </summary>
		private void Initialize()
		{
			if (_initializedFlag.Set())
			{
				_jsEngine.ExecuteResource(RESOURCES_NAMESPACE + "." + PACKER_LIBRARY_FILE_NAME, GetType().Assembly);
				_jsEngine.Execute(
					string.Format(@"var {0} = function(code, base62Encode, shrinkVariables) {{
	var packer = new Packer();

	return packer.pack(code, base62Encode, shrinkVariables);
}}", PACKING_FUNCTION_NAME));
			}
		}

		/// <summary>
		/// "Packs" a JS-code by using Dean Edwards' Packer
		/// </summary>
		/// <param name="content">Text content of JS-asset</param>
		/// <returns>Minified text content of JS-asset</returns>
		public string Pack(string content)
		{
			Initialize();

			string newContent;

			try
			{
				newContent = _jsEngine.CallFunction<string>(PACKING_FUNCTION_NAME,
					content, _options.Base62Encode, _options.ShrinkVariables);
			}
			catch (JsRuntimeException e)
			{
				throw new JsPackingException(JsErrorHelpers.Format(e));
			}

			return newContent;
		}

		/// <summary>
		/// Destroys object
		/// </summary>
		public void Dispose()
		{
			if (_disposedFlag.Set())
			{
				if (_jsEngine != null)
				{
					_jsEngine.Dispose();
					_jsEngine = null;
				}
			}
		}
	}
}