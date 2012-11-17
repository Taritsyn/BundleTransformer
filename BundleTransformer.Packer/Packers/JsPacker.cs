namespace BundleTransformer.Packer.Packers
{
	using System;

	using MsieJavaScriptEngine;
	using MsieJavaScriptEngine.ActiveScript;

	using CoreStrings = Core.Resources.Strings;

	/// <summary>
	/// JS-packer
	/// </summary>
	internal sealed class JsPacker : IDisposable
	{
		/// <summary>
		/// Name of resource, which contains a Dean Edwards' Packer-library
		/// </summary>
		const string PACKER_LIBRARY_RESOURCE_NAME = "BundleTransformer.Packer.Resources.packer-combined.min.js";

		/// <summary>
		/// Name of function, which is responsible for packing
		/// </summary>
		const string PACKING_FUNCTION_NAME = "packerPack";

		/// <summary>
		/// MSIE JS engine
		/// </summary>
		private MsieJsEngine _jsEngine;

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
		/// Destructs instance of JS-packer
		/// </summary>
		~JsPacker()
		{
			Dispose(false /* disposing */);
		}


		/// <summary>
		/// Initializes JS-packer
		/// </summary>
		private void Initialize()
		{
			if (!_initialized)
			{
				_jsEngine = new MsieJsEngine(false);
				_jsEngine.ExecuteResource(PACKER_LIBRARY_RESOURCE_NAME, GetType());
				_jsEngine.Execute(
					string.Format(@"var {0} = function(code, base62Encode, shrinkVariables) {{
	var packer = new Packer();	
 
	return packer.pack(code, base62Encode, shrinkVariables);
}}", PACKING_FUNCTION_NAME));

				_initialized = true;
			}
		}

		/// <summary>
		/// "Packs" JS-code by using Dean Edwards' Packer
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
				catch (ActiveScriptException e)
				{
					throw new JsPackingException(
						ActiveScriptErrorFormatter.Format(e));
				}
			}

			return newContent;
		}

		/// <summary>
		/// Destroys object
		/// </summary>
		public void Dispose()
		{
			Dispose(true /* disposing */);
			GC.SuppressFinalize(this);
		}

		/// <summary>
		/// Destroys object
		/// </summary>
		/// <param name="disposing">Flag, allowing destruction of 
		/// managed objects contained in fields of class</param>
		private void Dispose(bool disposing)
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