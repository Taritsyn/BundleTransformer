namespace BundleTransformer.Closure.Compilers
{
	using System;
	using System.Collections.Generic;
	using System.Globalization;
	using System.Net.Http;
	using System.Text;
	using System.Text.RegularExpressions;

	using Newtonsoft.Json.Linq;

	using Core.Assets;
	using Core.Minifiers;
	using Core.Utilities;
	using CoreStrings = Core.Resources.Strings;

	using Http;
	using Resources;
	using FormItem = System.Collections.Generic.KeyValuePair<string, string>;

	/// <summary>
	/// Remote Closure Compiler
	/// </summary>
	internal sealed class ClosureRemoteJsCompiler : ClosureJsCompilerBase
	{
		/// <summary>
		/// URL of Google Closure Compiler Service API
		/// </summary>
		private readonly string _closureCompilerServiceUrl;

		/// <summary>
		/// Default compilation options
		/// </summary>
		private readonly RemoteJsCompilationOptions _defaultOptions;

		/// <summary>
		/// Default compilation options as a form items
		/// </summary>
		private readonly IList<FormItem> _defaultOptionsFormItems;

		/// <summary>
		/// Regular expression for working with the error file path
		/// </summary>
		private static readonly Regex _errorFileRegex = new Regex(@"^(?<fileType>Input|Externs)_(?<fileIndex>\d+)$",
			RegexOptions.IgnoreCase);


		/// <summary>
		/// Constructs a instance of remote Closure Compiler
		/// </summary>
		/// <param name="closureCompilerServiceUrl">URL of Google Closure Compiler Service API</param>
		/// <param name="commonExternsDependencies">List of common JS-externs dependencies</param>
		/// <param name="defaultOptions">Default compilation options</param>
		public ClosureRemoteJsCompiler(string closureCompilerServiceUrl,
			DependencyCollection commonExternsDependencies,
			RemoteJsCompilationOptions defaultOptions)
			: base(commonExternsDependencies)
		{
			_closureCompilerServiceUrl = closureCompilerServiceUrl;
			_defaultOptions = defaultOptions;
			_defaultOptionsFormItems = (defaultOptions != null)
				? ConvertCompilationOptionsToFormItems(_defaultOptions) : new List<FormItem>();
		}


		/// <summary>
		/// "Compiles" a JS-code
		/// </summary>
		/// <param name="content">Text content written on JavaScript</param>
		/// <param name="path">Path to JS-file</param>
		/// <param name="externsDependencies">List of JS-externs dependencies</param>
		/// <param name="options">Compilation options</param>
		/// <returns>Compiled JS-code</returns>
		public string Compile(string content, string path, DependencyCollection externsDependencies,
			RemoteJsCompilationOptions options = null)
		{
			string newContent;
			DependencyCollection allExternsDependencies = new DependencyCollection();
			RemoteJsCompilationOptions currentOptions;
			IList<FormItem> currentOptionsFormItems;

			if (options != null)
			{
				currentOptions = options;
				currentOptionsFormItems = ConvertCompilationOptionsToFormItems(currentOptions);
			}
			else
			{
				currentOptions = _defaultOptions;
				currentOptionsFormItems = _defaultOptionsFormItems;
			}

			var formItems = new List<FormItem>();
			formItems.Add(new FormItem("js_code", content));
			if (currentOptions.CompilationLevel == CompilationLevel.Advanced
				&& (_commonExternsDependencies.Count > 0 || externsDependencies.Count > 0))
			{
				allExternsDependencies.AddRange(_commonExternsDependencies);

				foreach (Dependency externsDependency in externsDependencies)
				{
					if (!_commonExternsDependencies.ContainsUrl(externsDependency.Url))
					{
						allExternsDependencies.Add(externsDependency);
					}
				}

				foreach (Dependency externsDependency in allExternsDependencies)
				{
					formItems.Add(new FormItem("js_externs", externsDependency.Content));
				}
			}
			formItems.AddRange(currentOptionsFormItems);

			HttpContent httpContent = new CustomFormUrlEncodedContent(formItems);

			using (var client = new HttpClient())
			{
				HttpResponseMessage response;
				try
				{
					response = client
						.PostAsync(new Uri(_closureCompilerServiceUrl), httpContent)
						.Result
						;
				}
				catch (AggregateException e)
				{
					Exception innerException = e.InnerException;
					if (innerException != null)
					{
						if (innerException is HttpRequestException)
						{
							throw new Exception(
								string.Format(Strings.Minifiers_ClosureRemoteMinificationHttpRequestError,
									_closureCompilerServiceUrl),
								innerException);
						}

						throw innerException;
					}

					throw;
				}

				if (response.IsSuccessStatusCode)
				{
					var result = response.Content.ReadAsStringAsync().Result;
					var json = JObject.Parse(result);

					var serverErrors = json["serverErrors"] != null ? json["serverErrors"] as JArray : null;
					if (serverErrors != null && serverErrors.Count > 0)
					{
						throw new ClosureCompilingException(
							FormatErrorDetails(serverErrors[0], ErrorType.ServerError, path, allExternsDependencies)
						);
					}

					var errors = json["errors"] != null ? json["errors"] as JArray : null;
					if (errors != null && errors.Count > 0)
					{
						throw new ClosureCompilingException(
							FormatErrorDetails(errors[0], ErrorType.Error, path, allExternsDependencies)
						);
					}

					if (currentOptions.Severity > 0)
					{
						var warnings = json["warnings"] != null ? json["warnings"] as JArray : null;
						if (warnings != null && warnings.Count > 0)
						{
							throw new ClosureCompilingException(
								FormatErrorDetails(warnings[0], ErrorType.Warning, path, allExternsDependencies)
							);
						}
					}

					newContent = json.Value<string>("compiledCode");
				}
				else
				{
					throw new AssetMinificationException(
						string.Format(Strings.Minifiers_ClosureRemoteMinificationInvalidHttpStatus,
							response.StatusCode));
				}
			}

			return newContent;
		}

		/// <summary>
		/// Converts a compilation options to form items
		/// </summary>
		/// <param name="options">Compilation options</param>
		/// <returns>Form items</returns>
		private static IList<FormItem> ConvertCompilationOptionsToFormItems(RemoteJsCompilationOptions options)
		{
			int severity = options.Severity;

			var formItems = new List<FormItem>();
			formItems.Add(new FormItem("output_format", "json"));
			formItems.Add(new FormItem("output_info", "compiled_code"));
			formItems.Add(new FormItem("output_info", "errors"));
			if (!string.IsNullOrWhiteSpace(options.Charset))
			{
				formItems.Add(new FormItem("charset", options.Charset));
			}
			formItems.Add(new FormItem("compilation_level", ConvertCompilationLevelEnumValueToCode(options.CompilationLevel)));
			formItems.Add(new FormItem("exclude_default_externs", options.ExcludeDefaultExterns.ToString().ToLowerInvariant()));
			if (options.Language != LanguageSpec.None)
			{
				formItems.Add(new FormItem("language", ConvertLanguageSpecEnumValueToCode(options.Language)));
			}
			if (options.PrettyPrint)
			{
				formItems.Add(new FormItem("formatting", "PRETTY_PRINT"));
			}
			formItems.Add(new FormItem("use_types_for_optimization", options.UseTypesForOptimization.ToString().ToLowerInvariant()));
			if (severity > 0)
			{
				formItems.Add(new FormItem("output_info", "warnings"));

				switch (severity)
				{
					case 1:
						formItems.Add(new FormItem("warning_level", "QUIET"));
						break;
					case 2:
						formItems.Add(new FormItem("warning_level", "DEFAULT"));
						break;
					case 3:
						formItems.Add(new FormItem("warning_level", "VERBOSE"));
						break;
				}
			}

			return formItems;
		}

		/// <summary>
		/// Converts a compilation level enum value to code
		/// </summary>
		/// <param name="compilationLevel">Compilation level enum value</param>
		/// <returns>Compilation level code</returns>
		internal static string ConvertCompilationLevelEnumValueToCode(CompilationLevel compilationLevel)
		{
			string code;

			switch (compilationLevel)
			{
				case CompilationLevel.WhitespaceOnly:
					code = "WHITESPACE_ONLY";
					break;
				case CompilationLevel.Simple:
					code = "SIMPLE_OPTIMIZATIONS";
					break;
				case CompilationLevel.Advanced:
					code = "ADVANCED_OPTIMIZATIONS";
					break;
				default:
					throw new InvalidCastException(string.Format(CoreStrings.Common_EnumValueToCodeConversionFailed,
						compilationLevel.ToString(), typeof(CompilationLevel)));
			}

			return code;
		}

		/// <summary>
		/// Converts a language spec enum value to code
		/// </summary>
		/// <param name="languageSpec">Language spec enum value</param>
		/// <returns>Language spec code</returns>
		internal static string ConvertLanguageSpecEnumValueToCode(LanguageSpec languageSpec)
		{
			string code;

			switch (languageSpec)
			{
				case LanguageSpec.EcmaScript3:
					code = "ECMASCRIPT3";
					break;
				case LanguageSpec.EcmaScript5:
					code = "ECMASCRIPT5";
					break;
				case LanguageSpec.EcmaScript5Strict:
					code = "ECMASCRIPT5_STRICT";
					break;
				default:
					throw new InvalidCastException(string.Format(CoreStrings.Common_EnumValueToCodeConversionFailed,
						languageSpec.ToString(), typeof(LanguageSpec)));
			}

			return code;
		}

		/// <summary>
		/// Generates a detailed error message
		/// </summary>
		/// <param name="errorDetails">Error details</param>
		/// <param name="errorType">Error type</param>
		/// <param name="currentFilePath">Current file path</param>
		/// <param name="externsDependencies">List of JS-externs dependencies</param>
		/// <returns>Detailed error message</returns>
		private static string FormatErrorDetails(JToken errorDetails, ErrorType errorType, string currentFilePath,
			DependencyCollection externsDependencies)
		{
			var errorMessageBuilder = new StringBuilder();
			if (errorType == ErrorType.ServerError || errorType == ErrorType.Error)
			{
				errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Message,
					errorDetails.Value<string>("error"));
			}
			else if (errorType == ErrorType.Warning)
			{
				errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Message,
					errorDetails.Value<string>("warning"));
			}
			if (errorDetails["code"] != null)
			{
				errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_ErrorCode,
					errorDetails.Value<string>("code"));
			}
			if (errorDetails["type"] != null)
			{
				errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Subcategory,
					errorDetails.Value<string>("type"));
			}
			if (errorDetails["file"] != null)
			{
				string filePath = null;
				string file = errorDetails.Value<string>("file");
				Match errorFileMatch = _errorFileRegex.Match(file);

				if (errorFileMatch.Success)
				{
					GroupCollection errorFileGroups = errorFileMatch.Groups;

					string fileType = errorFileGroups["fileType"].Value;
					int fileIndex = int.Parse(errorFileGroups["fileIndex"].Value);

					if (string.Equals(fileType, "Externs", StringComparison.OrdinalIgnoreCase))
					{
						Dependency externsDependency;

						try
						{
							externsDependency = externsDependencies[fileIndex];
						}
						catch (ArgumentOutOfRangeException)
						{
							externsDependency = null;
						}

						if (externsDependency != null)
						{
							filePath = externsDependency.Url;
						}
					}
				}

				if (string.IsNullOrEmpty(filePath))
				{
					filePath = currentFilePath;
				}

				errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_File, filePath);
			}
			if (errorDetails["lineno"] != null)
			{
				errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_LineNumber,
					errorDetails.Value<int>("lineno").ToString(CultureInfo.InvariantCulture));
			}
			if (errorDetails["charno"] != null)
			{
				errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_ColumnNumber,
					errorDetails.Value<int>("charno").ToString(CultureInfo.InvariantCulture));
			}
			if (errorDetails["line"] != null)
			{
				errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_LineSource,
					errorDetails.Value<string>("line"));
			}

			return errorMessageBuilder.ToString();
		}
	}
}