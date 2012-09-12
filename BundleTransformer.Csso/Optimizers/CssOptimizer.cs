namespace BundleTransformer.Csso.Optimizers
{
	using System;
	using System.IO;
	using System.Reflection;
	using System.Text;

	using EcmaScript.NET;

	using Core;
	using CoreStrings = Core.Resources.Strings;

	using CssoStrings = Resources.Strings;

	/// <summary>
	/// CSS-optimizer
	/// </summary>
	internal sealed class CssOptimizer : IDisposable
	{
		/// <summary>
		/// Name of resource, which contains a ECMAScript 5 Polyfill
		/// </summary>
		const string ES5_POLYFILL_RESOURCE_NAME = "BundleTransformer.Csso.Resources.ES5.min.js";

		/// <summary>
		/// Name of resource, which contains a Sergey Kryzhanovsky's CSSO-library
		/// </summary>
		const string CSSO_LIBRARY_RESOURCE_NAME = "BundleTransformer.Csso.Resources.csso.web.min.js";

		/// <summary>
		/// JS context
		/// </summary>
		private readonly Context _jsContext;

		/// <summary>
		/// JS scope
		/// </summary>
		private readonly IScriptable _jsScope;

		/// <summary>
		/// Function, which is responsible for optimization
		/// </summary>
		private readonly IFunction _jsFunction;

		/// <summary>
		/// Synchronizer of optimization
		/// </summary>
		private readonly object _optimizationSynchronizer = new object();

		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private bool _disposed;


		/// <summary>
		/// Constructs instance of CSS-optimizer
		/// </summary>
		public CssOptimizer()
		{
			_jsContext = Context.Enter();
			_jsScope = _jsContext.InitStandardObjects();

			IScript es5Polyfill = _jsContext.CompileString(
				GetResourceAsString(ES5_POLYFILL_RESOURCE_NAME, GetType()), "ES5.js", 1, null);
			es5Polyfill.Exec(_jsContext, _jsScope);

			IScript cssoLibrary = _jsContext.CompileString(
				GetResourceAsString(CSSO_LIBRARY_RESOURCE_NAME, GetType()), "csso.web.js", 1, null);
			cssoLibrary.Exec(_jsContext, _jsScope);

			_jsFunction = _jsContext.CompileFunction(_jsScope, @"function cssoOptimize(code, disableRestructuring) {
	var parser = new CSSOParser(),
		compressor = new CSSOCompressor(),
		translator = new CSSOTranslator();

	return translator.translate(cleanInfo(compressor.compress(parser.parse(code, 'stylesheet'), disableRestructuring)));
}", "cssoHelper", 1, null);
		}

		/// <summary>
		/// Destructs instance of CSS-optimizer
		/// </summary>
		~CssOptimizer()
		{
			Dispose(false /* disposing */);
		}


		/// <summary>
		/// "Optimizes" CSS-code by using Sergey Kryzhanovsky's CSSO
		/// </summary>
		/// <param name="content">Text content of CSS-asset</param>
		/// <param name="assetPath">Path to CSS-asset file</param>
		/// <param name="disableRestructuring">Flag for whether to disable structure minification</param>
		/// <returns>Minified text content of CSS-asset</returns>
		public string Optimize(string content, string assetPath, bool disableRestructuring = false)
		{
			string newContent;

			lock (_optimizationSynchronizer)
			{
				try
				{
					newContent = (string)_jsFunction.Call(_jsContext, _jsScope, null, new object[] {content, disableRestructuring});
				}
				catch (EcmaScriptError e)
				{
					throw new CssOptimizingException(FormatErrorDetails(e, assetPath));
				}
				catch (EcmaScriptRuntimeException e)
				{
					throw new CssOptimizingException(FormatErrorDetails(e, assetPath));
				}
				catch (EcmaScriptThrow e)
				{
					throw new CssOptimizingException(FormatErrorDetails(e, assetPath));
				}
				catch (EcmaScriptException e)
				{
					throw new CssOptimizingException(FormatErrorDetails(e, assetPath));
				}
			}

			return newContent;
		}

		/// <summary>
		/// Gets a content of the embedded resource as string
		/// </summary>
		/// <param name="resourceName">Resource name</param>
		/// <param name="type">Type from assembly that containing an embedded resource</param>
		/// <returns>Сontent of the embedded resource as string</returns>
		public static string GetResourceAsString(string resourceName, Type type)
		{
			Assembly assembly = type.Assembly;

			using (Stream stream = assembly.GetManifestResourceStream(resourceName))
			{
				if (stream == null)
				{
					throw new NullReferenceException(
						string.Format(CssoStrings.Resources_ResourceIsNull, resourceName));
				}

				using (var reader = new StreamReader(stream))
				{
					return reader.ReadToEnd();
				}
			}
		}

		/// <summary>
		/// Generates a detailed error message
		/// </summary>
		/// <param name="ecmaScriptException">ECMAScript exception</param>
		/// <param name="filePath">File path</param>
		/// <returns>Detailed error message</returns>
		private static string FormatErrorDetails(EcmaScriptException ecmaScriptException, string filePath)
		{
			var errorMessage = new StringBuilder();
			if (ecmaScriptException is EcmaScriptError)
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Name,
					((EcmaScriptError)ecmaScriptException).Name);
			}
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Message,
				ecmaScriptException.Message);
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Subcategory,
				(ecmaScriptException is EcmaScriptRuntimeException) ? "ECMAScript runtime error" : "ECMAScript error");

			if (!string.IsNullOrWhiteSpace(ecmaScriptException.HelpLink))
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_HelpKeyword,
					ecmaScriptException.HelpLink);
			}
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_File, filePath);
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_LineNumber,
				ecmaScriptException.LineNumber);
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_ColumnNumber,
				ecmaScriptException.ColumnNumber);
			if (!string.IsNullOrWhiteSpace(ecmaScriptException.LineSource))
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_LineSource,
					ecmaScriptException.LineSource);
			}
			if (!string.IsNullOrWhiteSpace(ecmaScriptException.SourceName))
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_SourceName,
					ecmaScriptException.SourceName);
			}
			if (!string.IsNullOrWhiteSpace(ecmaScriptException.ScriptStackTrace))
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_ScriptStackTrace,
					ecmaScriptException.ScriptStackTrace);
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

				Context.Exit();
			}
		}
	}
}