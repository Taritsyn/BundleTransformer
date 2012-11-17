namespace BundleTransformer.Csso.Optimizers
{
	using System;
	using System.IO;
	using System.Reflection;

	/// <summary>
	/// Wrapper to work with the Noesis JS engine
	/// </summary>
	internal class JavascriptEngine : IDisposable
	{
		/// <summary>
		/// Full name of JS Engine assembly
		/// </summary>
		private const string JS_ENGINE_ASSEMBLY_FULL_NAME 
			= "Noesis.Javascript, Version=0.0.0.0, Culture=neutral, PublicKeyToken=ae36d046c7f89f85";

		/// <summary>
		/// Name of JS Engine type
		/// </summary>
		private const string JS_ENGINE_TYPE_NAME = "Noesis.Javascript.JavascriptContext";

		/// <summary>
		/// Assembly, which contains JS Engine
		/// </summary>
		private static readonly Assembly _jsEngineAssembly;

		/// <summary>
		/// Type of JS Engine
		/// </summary>
		private Type _jsEngineType;

		/// <summary>
		/// Instance of JS Engine
		/// </summary>
		private object _jsEngineObject;

		/// <summary>
		/// Information about the method "Run"
		/// </summary>
		private MethodInfo _runMethodInfo;

		/// <summary>
		/// Information about the method "GetParameter"
		/// </summary>
		private MethodInfo _getParameterMethodInfo;

		/// <summary>
		/// Information about the method "SetParameter"
		/// </summary>
		private MethodInfo _setParameterMethodInfo;

		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private bool _disposed;


		/// <summary>
		/// Loads assembly, which contains JS Engine
		/// </summary>
		static JavascriptEngine()
		{
			Assembly assembly;

			string platform = (IntPtr.Size == 4) ? "x86" : "x64";
			string binDirectoryPath = AppDomain.CurrentDomain.SetupInformation.PrivateBinPath;
			string assemblyPath = Path.Combine(binDirectoryPath,
				string.Format(@"../App_Data/Noesis.Javascript/{0}/Noesis.Javascript.dll", platform));

			if (File.Exists(assemblyPath))
			{
				assembly = Assembly.LoadFile(assemblyPath);
			}
			else
			{
				assembly = Assembly.Load(JS_ENGINE_ASSEMBLY_FULL_NAME);
			}
			
			_jsEngineAssembly = assembly;
		}

		/// <summary>
		/// Constructs instance of JS Engine
		/// </summary>
		public JavascriptEngine()
		{
			_jsEngineType = _jsEngineAssembly.GetType(JS_ENGINE_TYPE_NAME);
			_jsEngineObject = _jsEngineAssembly.CreateInstance(JS_ENGINE_TYPE_NAME);

			_runMethodInfo = _jsEngineType.GetMethod("Run", new[] { typeof(string) });
			_getParameterMethodInfo = _jsEngineType.GetMethod("GetParameter", new[] { typeof(string) });
			_setParameterMethodInfo = _jsEngineType.GetMethod("SetParameter", 
				new[] { typeof(string), typeof(object) });
		}

		/// <summary>
		/// Destructs instance of JS Engine
		/// </summary>
		~JavascriptEngine()
		{
			Dispose(false /* disposing */);
		}


		/// <summary>
		/// Runs JS-code
		/// </summary>
		/// <param name="sourceCode">JS-code</param>
		public void Run(string sourceCode)
		{
			_runMethodInfo.Invoke(_jsEngineObject, new[] { sourceCode });
		}

		/// <summary>
		/// Gets a value of parameter
		/// </summary>
		/// <param name="name">Name of parameter</param>
		/// <returns>Value of parameter</returns>
		public object GetParameter(string name)
		{
			var value = _getParameterMethodInfo.Invoke(_jsEngineObject, new[] { name });

			return value;
		}

		/// <summary>
		/// Sets a value of parameter
		/// </summary>
		/// <param name="name">Name of parameter</param>
		/// <param name="value">Value of parameter</param>
		public void SetParameter(string name, object value)
		{
			_setParameterMethodInfo.Invoke(_jsEngineObject, new[] { name, value });
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

				_runMethodInfo = null;
				_getParameterMethodInfo = null;
				_setParameterMethodInfo = null;

				if (_jsEngineObject != null && _jsEngineType != null)
				{
					var disposeMethodInfo = _jsEngineType.GetMethod("Dispose");
					disposeMethodInfo.Invoke(_jsEngineObject, new object[0]);

					_jsEngineObject = null;
					_jsEngineType = null;
				}
			}
		}
	}
}
