namespace BundleTransformer.UglifyJs.Uglifiers
{
	using System;
	using System.Web.Script.Serialization;

	using MsieJavaScriptEngine;
	using MsieJavaScriptEngine.ActiveScript;

	using CoreStrings = Core.Resources.Strings;
	
	/// <summary>
	/// JS-uglifier
	/// </summary>
	internal sealed class JsUglifier : IDisposable
	{
		/// <summary>
		/// Name of resource, which contains a UglifyJS library
		/// </summary>
		const string UGLIFY_JS_LIBRARY_RESOURCE_NAME 
			= "BundleTransformer.UglifyJs.Resources.uglify-combined.min.js";

		/// <summary>
		/// Template of function call, which is responsible for uglification
		/// </summary>
		const string UGLIFICATION_FUNCTION_CALL_TEMPLATE = @"UglifyJS.uglify({0}, {1});";

		/// <summary>
		/// String representation of the UglifyJS default options
		/// </summary>
		private readonly string _defaultOptionsString;

		/// <summary>
		/// MSIE JS engine
		/// </summary>
		private readonly MsieJsEngine _jsEngine;

		/// <summary>
		/// Synchronizer of uglification
		/// </summary>
		private readonly object _uglificationSynchronizer = new object();

		/// <summary>
		/// JS-serializer
		/// </summary>
		private readonly JavaScriptSerializer _jsSerializer;

		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private bool _disposed;


		/// <summary>
		/// Constructs instance of JS-uglifier
		/// </summary>
		public JsUglifier() : this(null)
		{ }

		/// <summary>
		/// Constructs instance of JS-uglifier
		/// </summary>
		/// <param name="defaultOptions">UglifyJS default options</param>
		public JsUglifier(object defaultOptions)
		{
			_jsSerializer = new JavaScriptSerializer();
			_defaultOptionsString = _jsSerializer.Serialize(defaultOptions);

			_jsEngine = new MsieJsEngine(true);
			_jsEngine.ExecuteResource(UGLIFY_JS_LIBRARY_RESOURCE_NAME, GetType());
		}

		/// <summary>
		/// Destructs instance of JS-uglifier
		/// </summary>
		~JsUglifier()
		{
			Dispose(false /* disposing */);
		}


		/// <summary>
		/// "Uglifies" JS-code by using UglifyJS
		/// </summary>
		/// <param name="content">Text content of JS-asset</param>
		/// <param name="options">UglifyJS options</param>
		/// <returns>Minified text content of JS-asset</returns>
		public string Uglify(string content, object options = null)
		{
			string newContent;
			string optionsString;
			if (options != null)
			{
				optionsString = _jsSerializer.Serialize(options);
			}
			else
			{
				optionsString = _defaultOptionsString;
			}

			lock (_uglificationSynchronizer)
			{
				try
				{
					newContent = _jsEngine.Evaluate<string>(
						string.Format(UGLIFICATION_FUNCTION_CALL_TEMPLATE,
							_jsSerializer.Serialize(content), optionsString));
				}
				catch (ActiveScriptException e)
				{
					throw new JsUglifyingException(
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
