namespace BundleTransformer.Csso.Optimizers
{
	using System;
	using System.IO;
	using System.Reflection;
	using System.Text;

	using Noesis.Javascript;

	using Core;
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
		/// JS context
		/// </summary>
		private JavascriptContext _jsContext;

		/// <summary>
		/// Synchronizer of optimization
		/// </summary>
		private readonly object _optimizationSynchronizer = new object();

		/// <summary>
		/// Flag that object is initialized
		/// </summary>
		private bool _initialized;

		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private bool _disposed;


		/// <summary>
		/// Destructs instance of CSS-optimizer
		/// </summary>
		~CssOptimizer()
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
				_jsContext = new JavascriptContext();
				_jsContext.Run(Utils.GetResourceAsString(CSSO_LIBRARY_RESOURCE_NAME, 
					Assembly.GetExecutingAssembly()));
				_jsContext.Run(string.Format(@"function {0}(code, disableRestructuring) {{
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
					_jsContext.SetParameter("code", content);
					_jsContext.SetParameter("disableRestructuring", disableRestructuring);
					_jsContext.Run(string.Format(
						"var result = {0}(code, disableRestructuring);", OPTIMIZATION_FUNCTION_NAME));

					newContent = (string)_jsContext.GetParameter("result");
				}
				catch (JavascriptException e)
				{
					throw new CssOptimizingException(FormatErrorDetails(e));
				}
			}

			return newContent;
		}

		/// <summary>
		/// Generates a detailed error message
		/// </summary>
		/// <param name="javascriptException">JavaScript exception</param>
		/// <returns>Detailed error message</returns>
		private static string FormatErrorDetails(JavascriptException javascriptException)
		{
			var errorMessage = new StringBuilder();
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Message,
				javascriptException.Message);
			if (!string.IsNullOrWhiteSpace(javascriptException.HelpLink))
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_HelpKeyword,
					javascriptException.HelpLink);
			}
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_LineNumber,
				javascriptException.Line.ToString());
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_StartColumn,
				javascriptException.StartColumn.ToString());
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_EndColumn,
				javascriptException.EndColumn.ToString());
			if (!string.IsNullOrWhiteSpace(javascriptException.Source))
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_SourceError,
					javascriptException.Source);
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

				if (_jsContext != null)
				{
					_jsContext.Dispose();
				}
			}
		}
	}
}