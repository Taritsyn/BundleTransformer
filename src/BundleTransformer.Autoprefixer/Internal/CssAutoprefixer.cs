using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Reflection;
using System.Text;

using JavaScriptEngineSwitcher.Core;
using JavaScriptEngineSwitcher.Core.Helpers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

using BundleTransformer.Core.FileSystem;
using BundleTransformer.Core.Utilities;
using CoreStrings = BundleTransformer.Core.Resources.Strings;

namespace BundleTransformer.Autoprefixer.Internal
{
	/// <summary>
	/// CSS autoprefixer
	/// </summary>
	internal sealed class CssAutoprefixer : IDisposable
	{
		/// <summary>
		/// Name of file, which contains a Autoprefixer library
		/// </summary>
		private const string AUTOPREFIXER_LIBRARY_FILE_NAME = "autoprefixer-combined.min.js";

		/// <summary>
		/// Name of file, which contains a Autoprefixer helper
		/// </summary>
		private const string AUTOPREFIXER_HELPER_FILE_NAME = "autoprefixerHelper.min.js";

		/// <summary>
		/// Template of function call, which is responsible for autoprefixing
		/// </summary>
		private const string AUTOPREFIXING_FUNCTION_CALL_TEMPLATE = @"autoprefixerHelper.process({0}, {1});";

		/// <summary>
		/// Name of variable, which contains a country statistics service
		/// </summary>
		private const string COUNTRY_STATISTICS_SERVICE_VARIABLE_NAME = "CountryStatisticsService";

		/// <summary>
		/// JS engine
		/// </summary>
		private IJsEngine _jsEngine;

		/// <summary>
		/// Virtual file system wrapper
		/// </summary>
		private IVirtualFileSystemWrapper _virtualFileSystemWrapper;

		/// <summary>
		/// Autoprefixing options
		/// </summary>
		private readonly AutoprefixingOptions _options;

		/// <summary>
		/// String representation of the autoprefixing options
		/// </summary>
		private readonly string _optionsString;

		/// <summary>
		/// Flag that CSS autoprefixer is initialized
		/// </summary>
		private InterlockedStatedFlag _initializedFlag = new InterlockedStatedFlag();

		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private InterlockedStatedFlag _disposedFlag = new InterlockedStatedFlag();


		/// <summary>
		/// Constructs a instance of CSS autoprefixer
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JS engine</param>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		/// <param name="options">Autoprefixing options</param>
		public CssAutoprefixer(Func<IJsEngine> createJsEngineInstance,
			IVirtualFileSystemWrapper virtualFileSystemWrapper,
			AutoprefixingOptions options)
		{
			_jsEngine = createJsEngineInstance();
			_virtualFileSystemWrapper = virtualFileSystemWrapper;
			_options = options ?? new AutoprefixingOptions();
			_optionsString = ConvertAutoprefixingOptionsToJson(_options).ToString();
		}


		/// <summary>
		/// Initializes CSS autoprefixer
		/// </summary>
		private void Initialize()
		{
			if (_initializedFlag.Set())
			{
				_jsEngine.EmbedHostObject(COUNTRY_STATISTICS_SERVICE_VARIABLE_NAME, CountryStatisticsService.Instance);

				Assembly assembly = GetType().Assembly;

				_jsEngine.ExecuteResource(ResourceHelpers.GetResourceName(AUTOPREFIXER_LIBRARY_FILE_NAME), assembly);
				_jsEngine.ExecuteResource(ResourceHelpers.GetResourceName(AUTOPREFIXER_HELPER_FILE_NAME), assembly);
			}
		}

		/// <summary>
		/// Actualizes a vendor prefixes in CSS code by using Andrey Sitnik's Autoprefixer
		/// </summary>
		/// <param name="content">Text content of CSS asset</param>
		/// <param name="path">Path to CSS asset</param>
		/// <returns>Autoprefixing result</returns>
		public AutoprefixingResult Process(string content, string path)
		{
			Initialize();

			AutoprefixingResult autoprefixingResult;

			try
			{
				var result = _jsEngine.Evaluate<string>(
					string.Format(AUTOPREFIXING_FUNCTION_CALL_TEMPLATE,
						JsonConvert.SerializeObject(content), _optionsString));

				var json = JObject.Parse(result);

				var errors = json["errors"] != null ? json["errors"] as JArray : null;
				if (errors != null && errors.Count > 0)
				{
					throw new CssAutoprefixingException(FormatErrorDetails(errors[0], content, path));
				}

				autoprefixingResult = new AutoprefixingResult
				{
					ProcessedContent = json.Value<string>("processedCode"),
					IncludedFilePaths = GetIncludedFilePaths(_options.Stats)
				};
			}
			catch (JsRuntimeException e)
			{
				throw new CssAutoprefixingException(JsErrorHelpers.Format(e));
			}

			return autoprefixingResult;
		}

		/// <summary>
		/// Converts a autoprefixing options to JSON
		/// </summary>
		/// <param name="options">Autoprefixing options</param>
		/// <returns>Autoprefixing options in JSON format</returns>
		private JObject ConvertAutoprefixingOptionsToJson(AutoprefixingOptions options)
		{
			var optionsJson = new JObject(
				new JProperty("browsers", new JArray(options.Browsers)),
				new JProperty("cascade", options.Cascade),
				new JProperty("add", options.Add),
				new JProperty("remove", options.Remove),
				new JProperty("supports", options.Supports),
				new JProperty("flexbox", options.Flexbox),
				new JProperty("grid", options.Grid),
				new JProperty("stats", GetCustomStatisticsFromFile(options.Stats))
			);

			return optionsJson;
		}

		/// <summary>
		/// Gets a custom statistics from specified file
		/// </summary>
		/// <param name="path">Virtual path to file, that contains custom statistics</param>
		/// <returns>Custom statistics in JSON format</returns>
		private JObject GetCustomStatisticsFromFile(string path)
		{
			if (string.IsNullOrWhiteSpace(path))
			{
				return null;
			}

			if (!_virtualFileSystemWrapper.FileExists(path))
			{
				throw new FileNotFoundException(string.Format(CoreStrings.Common_FileNotExist, path));
			}

			JObject statistics = JObject.Parse(_virtualFileSystemWrapper.GetFileTextContent(path));

			return statistics;
		}

		/// <summary>
		/// Gets a list of included files
		/// </summary>
		/// <param name="path">Virtual path to file, that contains custom statistics</param>
		/// <returns>List of included files</returns>
		private IList<string> GetIncludedFilePaths(string path)
		{
			var includedFilePaths = new List<string>();
			if (!string.IsNullOrWhiteSpace(path))
			{
				includedFilePaths.Add(_virtualFileSystemWrapper.ToAbsolutePath(path));
			}

			return includedFilePaths;
		}

		/// <summary>
		/// Generates a detailed error message
		/// </summary>
		/// <param name="errorDetails">Error details</param>
		/// <param name="sourceCode">Source code</param>
		/// <param name="currentFilePath">Path to current CSS file</param>
		/// <returns>Detailed error message</returns>
		private static string FormatErrorDetails(JToken errorDetails, string sourceCode,
			string currentFilePath)
		{
			var message = errorDetails.Value<string>("message");
			string file = currentFilePath;
			var lineNumber = errorDetails.Value<int>("lineNumber");
			var columnNumber = errorDetails.Value<int>("columnNumber");
			string sourceFragment = SourceCodeNavigator.GetSourceFragment(sourceCode,
				new SourceCodeNodeCoordinates(lineNumber, columnNumber));

			var errorMessage = new StringBuilder();
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Message, message);
			if (!string.IsNullOrWhiteSpace(file))
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_File, file);
			}
			if (lineNumber > 0)
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_LineNumber,
					lineNumber.ToString(CultureInfo.InvariantCulture));
			}
			if (columnNumber > 0)
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_ColumnNumber,
					columnNumber.ToString(CultureInfo.InvariantCulture));
			}
			if (!string.IsNullOrWhiteSpace(sourceFragment))
			{
				errorMessage.AppendFormatLine("{1}:{0}{0}{2}", Environment.NewLine,
					CoreStrings.ErrorDetails_SourceError, sourceFragment);
			}

			return errorMessage.ToString();
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
					_jsEngine.RemoveVariable(COUNTRY_STATISTICS_SERVICE_VARIABLE_NAME);

					_jsEngine.Dispose();
					_jsEngine = null;
				}

				_virtualFileSystemWrapper = null;
			}
		}
	}
}