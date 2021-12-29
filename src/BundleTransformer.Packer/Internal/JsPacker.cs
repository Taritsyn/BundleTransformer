using System;
using System.Text;

using AdvancedStringBuilder;
using JavaScriptEngineSwitcher.Core;
using JavaScriptEngineSwitcher.Core.Helpers;

using BundleTransformer.Core.Utilities;
using CoreStrings = BundleTransformer.Core.Resources.Strings;

namespace BundleTransformer.Packer.Internal
{
	/// <summary>
	/// JS packer
	/// </summary>
	internal sealed class JsPacker : IDisposable
	{
		/// <summary>
		/// Namespace for resources
		/// </summary>
		private const string RESOURCES_NAMESPACE = "BundleTransformer.Packer.Resources";

		/// <summary>
		/// Name of file, which contains a Dean Edwards' Packer library
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
		/// Synchronizer of JS packer initialization
		/// </summary>
		private readonly object _initializationSynchronizer = new object();

		/// <summary>
		/// Flag that JS packer is initialized
		/// </summary>
		private bool _initialized;

		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private InterlockedStatedFlag _disposedFlag = new InterlockedStatedFlag();


		/// <summary>
		/// Constructs a instance of JS packer
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JS engine</param>
		/// <param name="options">Packing options</param>
		public JsPacker(Func<IJsEngine> createJsEngineInstance, PackingOptions options)
		{
			_jsEngine = createJsEngineInstance();
			_options = options;
		}


		/// <summary>
		/// Initializes JS packer
		/// </summary>
		private void Initialize()
		{
			if (_initialized)
			{
				return;
			}

			lock (_initializationSynchronizer)
			{
				if (_initialized)
				{
					return;
				}

				_jsEngine.ExecuteResource(RESOURCES_NAMESPACE + "." + PACKER_LIBRARY_FILE_NAME, GetType().Assembly);
				_jsEngine.Execute(
					string.Format(@"var {0} = function(code, base62Encode, shrinkVariables) {{
	var packer = new Packer();

	return packer.pack(code, base62Encode, shrinkVariables);
}}", PACKING_FUNCTION_NAME));

				_initialized = true;
			}
		}

		/// <summary>
		/// "Packs" a JS code by using Dean Edwards' Packer
		/// </summary>
		/// <param name="content">Text content of JS asset</param>
		/// <returns>Minified text content of JS asset</returns>
		public string Pack(string content)
		{
			Initialize();

			string newContent;

			try
			{
				newContent = _jsEngine.CallFunction<string>(PACKING_FUNCTION_NAME,
					content, _options.Base62Encode, _options.ShrinkVariables);
			}
			catch (JsScriptException e)
			{
				string errorDetails = JsErrorHelpers.GenerateErrorDetails(e, true);

				var stringBuilderPool = StringBuilderPool.Shared;
				StringBuilder errorMessageBuilder = stringBuilderPool.Rent();
				errorMessageBuilder.AppendLine(e.Message);
				errorMessageBuilder.AppendLine();
				errorMessageBuilder.Append(errorDetails);

				string errorMessage = errorMessageBuilder.ToString();
				stringBuilderPool.Return(errorMessageBuilder);

				throw new JsPackingException(errorMessage);
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