namespace BundleTransformer.CoffeeScript.Compilers
{
	using System;
	using System.Text;

	using MsieJavaScriptEngine;
	using MsieJavaScriptEngine.ActiveScript;

	using Core;
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
		/// Name of function, which is responsible for CoffeeScript-compilation
		/// </summary>
		const string COMPILATION_FUNCTION_NAME = "coffeeScriptCompile";

		/// <summary>
		/// MSIE JS engine
		/// </summary>
		private readonly MsieJsEngine _jsEngine;

		/// <summary>
		/// Synchronizer of compilation
		/// </summary>
		private readonly object _compilationSynchronizer = new object();

		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private bool _disposed;


		/// <summary>
		/// Constructs instance of CoffeeScript-compiler
		/// </summary>
		public CoffeeScriptCompiler()
		{
			_jsEngine = new MsieJsEngine(true);
			_jsEngine.ExecuteResource(COFFEESCRIPT_LIBRARY_RESOURCE_NAME, GetType());
			_jsEngine.Execute(
				string.Format(@"var {0} = function(code) {{ 
	return CoffeeScript.compile(code, {{ bare: true }});
}}", COMPILATION_FUNCTION_NAME));
		}

		/// <summary>
		/// Destructs instance of CoffeeScript-compiler
		/// </summary>
		~CoffeeScriptCompiler()
		{
			Dispose(false /* disposing */);
		}


		/// <summary>
		/// "Compiles" CoffeeScript-code to JS-code
		/// </summary>
		/// <param name="content">Text content written on CoffeeScript</param>
		/// <param name="assetPath">Path to CoffeeScript-file</param>
		/// <returns>Translated CoffeeScript-code</returns>
		public string Compile(string content, string assetPath)
		{
			string newContent;

			lock (_compilationSynchronizer)
			{
				try
				{
					newContent = _jsEngine.CallFunction<string>(COMPILATION_FUNCTION_NAME, content);
				}
				catch (ActiveScriptException e)
				{
					throw new CoffeeScriptCompilingException(FormatErrorDetails(e, assetPath));
				}
			}

			return newContent;
		}

		/// <summary>
		/// Generates a detailed error message
		/// </summary>
		/// <param name="activeScriptException">Active script exception</param>
		/// <param name="filePath">File path</param>
		/// <returns>Detailed error message</returns>
		private static string FormatErrorDetails(ActiveScriptException activeScriptException, string filePath)
		{
			var errorMessage = new StringBuilder();
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Message, 
				activeScriptException.Message);
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_ErrorCode,
				activeScriptException.ErrorCode);
			if (activeScriptException.ErrorWCode != 0)
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_ErrorWCode,
					activeScriptException.ErrorWCode);
			}
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Subcategory,
				activeScriptException.Subcategory);
			if (!string.IsNullOrWhiteSpace(activeScriptException.HelpLink))
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_HelpKeyword,
					activeScriptException.HelpLink);
			}
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_File, filePath);
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_LineNumber,
				activeScriptException.LineNumber);
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_ColumnNumber,
				activeScriptException.ColumnNumber);
			if (!string.IsNullOrWhiteSpace(activeScriptException.SourceError))
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_SourceError,
					activeScriptException.SourceError);
			}

			return errorMessage.ToString();
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
