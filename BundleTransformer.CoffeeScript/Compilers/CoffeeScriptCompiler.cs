namespace BundleTransformer.CoffeeScript.Compilers
{
	using System;
	using System.Web.Script.Serialization;

	using MsieJavaScriptEngine;
	using MsieJavaScriptEngine.ActiveScript;

	using CoreStrings = Core.Resources.Strings;

	/// <summary>
	/// CoffeeScript-compiler
	/// </summary>
	internal sealed class CoffeeScriptCompiler : IDisposable
	{
		/// <summary>
		/// Name of resource, which contains a CoffeeScript-library
		/// </summary>
		const string COFFEESCRIPT_LIBRARY_RESOURCE_NAME 
			= "BundleTransformer.CoffeeScript.Resources.coffeescript-combined.min.js";

		/// <summary>
		/// Template of function call, which is responsible for compilation
		/// </summary>
		const string COMPILATION_FUNCTION_CALL_TEMPLATE = @"CoffeeScript.compile({0}, {1});";

		/// <summary>
		/// MSIE JS engine
		/// </summary>
		private MsieJsEngine _jsEngine;

		/// <summary>
		/// Synchronizer of compilation
		/// </summary>
		private readonly object _compilationSynchronizer = new object();

		/// <summary>
		/// JS-serializer
		/// </summary>
		private readonly JavaScriptSerializer _jsSerializer;

		/// <summary>
		/// Flag that compiler is initialized
		/// </summary>
		private bool _initialized;

		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private bool _disposed;



		/// <summary>
		/// Constructs instance of CoffeeScript-compiler
		/// </summary>
		public CoffeeScriptCompiler()
		{
			_jsSerializer = new JavaScriptSerializer();
		}

		/// <summary>
		/// Destructs instance of CoffeeScript-compiler
		/// </summary>
		~CoffeeScriptCompiler()
		{
			Dispose(false /* disposing */);
		}


		/// <summary>
		/// Initializes compiler
		/// </summary>
		private void Initialize()
		{
			if (!_initialized)
			{
				_jsEngine = new MsieJsEngine(true);
				_jsEngine.ExecuteResource(COFFEESCRIPT_LIBRARY_RESOURCE_NAME, GetType());

				_initialized = true;
			}
		}

		/// <summary>
		/// "Compiles" CoffeeScript-code to JS-code
		/// </summary>
		/// <param name="content">Text content written on CoffeeScript</param>
		/// <param name="isLiterate">Flag for whether to enable "literate" mode</param>
		/// <returns>Translated CoffeeScript-code</returns>
		public string Compile(string content, bool isLiterate = false)
		{
			string newContent;
			var options = new
			{
				bare = true,
				literate = isLiterate
			};

			lock (_compilationSynchronizer)
			{
				Initialize();

				try
				{
					newContent = _jsEngine.Evaluate<string>(
						string.Format(COMPILATION_FUNCTION_CALL_TEMPLATE,
							_jsSerializer.Serialize(content),
							_jsSerializer.Serialize(options)));
				}
				catch (ActiveScriptException e)
				{
					throw new CoffeeScriptCompilingException(
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
