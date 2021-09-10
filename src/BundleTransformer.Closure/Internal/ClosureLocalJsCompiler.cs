﻿using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

using AdvancedStringBuilder;

using BundleTransformer.Core;
using BundleTransformer.Core.Assets;
using BundleTransformer.Core.Utilities;
using CoreStrings = BundleTransformer.Core.Resources.Strings;

namespace BundleTransformer.Closure.Internal
{
	/// <summary>
	/// Local Closure Compiler
	/// </summary>
	internal sealed class ClosureLocalJsCompiler : ClosureJsCompilerBase, IDisposable
	{
		/// <summary>
		/// Path to Java Virtual Machine
		/// </summary>
		private readonly string _javaVmPath;

		/// <summary>
		/// Path to Google Closure Compiler Application
		/// </summary>
		private readonly string _closureCompilerAppPath;

		/// <summary>
		/// Absolute path to directory that contains temporary files
		/// </summary>
		private readonly string _tempDirectoryPath;

		/// <summary>
		/// Absolute path to directory that contains temporary common JS externs files
		/// </summary>
		private string _commonExternsTempDirectoryPath;

		/// <summary>
		/// Flag indicating what the common JS externs temporary directory was created
		/// </summary>
		private bool _commonExternsTempDirectoryCreated;

		/// <summary>
		/// List of absolute paths to temporary common JS externs files
		/// </summary>
		private IList<string> _commonExternsTempFilePaths;

		/// <summary>
		/// Compilation options
		/// </summary>
		private readonly LocalJsCompilationOptions _options;

		/// <summary>
		/// String representation of the compilation options
		/// </summary>
		private readonly string _optionsString;

		/// <summary>
		/// Regular expression for working with the string representation of error
		/// </summary>
		private static readonly Regex _errorStringRegex =
			new Regex(@"(?:(?:stdin|(?<filePath>[a-zA-Z]:\\[^\r\n:?""]+)):(?<lineNumber>\d+): )?" +
				@"(?<errorType>ERROR|WARNING) - " +
				@"(?<message>[\s\S]+?\r?\n(?:[\w ]+[ \t]*:[ \t]+[\s\S]+?\r?\n)*)" +
				@"(?<sourceFragment>[\s\S]+?\r?\n[ \t]*\^\r?\n)?\r?\n");

		/// <summary>
		/// Regular expression for working with the string representation of jscomp error
		/// </summary>
		private static readonly Regex _jscompErrorStringRegex =
			new Regex(@"^com.google.javascript.jscomp.[\w$-]+Exception: (?<message>[\S\s]+?)\r?\n");

		/// <summary>
		/// Regular expression for working with GUID
		/// </summary>
		private static readonly Regex _guidRegex = new Regex("[a-fA-F0-9]{8}(?:-[a-fA-F0-9]{4}){3}-[a-fA-F0-9]{12}");

		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private InterlockedStatedFlag _disposedFlag = new InterlockedStatedFlag();


		/// <summary>
		/// Constructs a instance of local Closure Compiler
		/// </summary>
		/// <param name="javaVmPath">Path to Java Virtual Machine</param>
		/// <param name="closureCompilerAppPath">Path to Google Closure Compiler Application</param>
		/// <param name="tempDirectoryPath">Absolute path to directory that contains temporary files</param>
		/// <param name="commonExternsDependencies">List of common JS externs dependencies</param>
		/// <param name="options">Compilation options</param>
		public ClosureLocalJsCompiler(string javaVmPath, string closureCompilerAppPath,
			string tempDirectoryPath, DependencyCollection commonExternsDependencies,
			LocalJsCompilationOptions options)
			: base(commonExternsDependencies)
		{
			_javaVmPath = javaVmPath;
			_closureCompilerAppPath = closureCompilerAppPath;
			_tempDirectoryPath = tempDirectoryPath;
			_commonExternsTempDirectoryPath = string.Empty;
			_commonExternsTempDirectoryCreated = false;
			_commonExternsTempFilePaths = new List<string>();
			_options = options ?? new LocalJsCompilationOptions();
			_optionsString = ConvertCompilationOptionsToArgs(_options);
		}


		/// <summary>
		/// "Compiles" a JS code
		/// </summary>
		/// <param name="content">Text content written on JS</param>
		/// <param name="path">Path to JS file</param>
		/// <param name="externsDependencies">List of JS externs dependencies</param>
		/// <returns>Compiled JS code</returns>
		public string Compile(string content, string path, DependencyCollection externsDependencies)
		{
			string newContent;
			int commonExternsDependencyCount = _commonExternsDependencies.Count;
			string assetExternsTempDirectoryPath = Path.Combine(_tempDirectoryPath, Guid.NewGuid().ToString());
			bool assetExternsTempDirectoryCreated = false;

			var stringBuilderPool = StringBuilderPool.Shared;
			StringBuilder argsBuilder = stringBuilderPool.Rent();
			argsBuilder.AppendFormat(@"-jar ""{0}"" ", _closureCompilerAppPath);
			if (_options.CompilationLevel == CompilationLevel.Advanced
				&& (commonExternsDependencyCount > 0 || externsDependencies.Count > 0))
			{
				if (!_commonExternsTempDirectoryCreated && commonExternsDependencyCount > 0)
				{
					WriteExternsToTempDirectory(_commonExternsDependencies, out _commonExternsTempDirectoryPath,
						out _commonExternsTempFilePaths);
					_commonExternsTempDirectoryCreated = true;
				}

				DependencyCollection assetExternsDependencies = new DependencyCollection();
				if (commonExternsDependencyCount > 0)
				{
					foreach (Dependency externsDependency in externsDependencies)
					{
						if (!_commonExternsDependencies.ContainsUrl(externsDependency.Url))
						{
							assetExternsDependencies.Add(externsDependency);
						}
					}
				}
				else
				{
					assetExternsDependencies.AddRange(externsDependencies);
				}

				IList<string> assetExternsTempFilePaths = new List<string>();

				if (assetExternsDependencies.Count > 0)
				{
					WriteExternsToTempDirectory(assetExternsDependencies, out assetExternsTempDirectoryPath,
						out assetExternsTempFilePaths);
					assetExternsTempDirectoryCreated = true;
				}

				var allExternsTempFilePaths = new List<string>();
				allExternsTempFilePaths.AddRange(_commonExternsTempFilePaths);
				allExternsTempFilePaths.AddRange(assetExternsTempFilePaths);

				foreach (string externsTempFilePath in allExternsTempFilePaths)
				{
					argsBuilder.AppendFormat(@"--externs ""{0}"" ", externsTempFilePath);
				}
			}
			argsBuilder.Append(_optionsString);

			string args = argsBuilder.ToString();
			stringBuilderPool.Return(argsBuilder);

			var processInfo = new ProcessStartInfo
			{
				FileName = _javaVmPath,
				Arguments = args,
				CreateNoWindow = true,
				WindowStyle = ProcessWindowStyle.Hidden,
				UseShellExecute = false,
				RedirectStandardInput = true,
				RedirectStandardOutput = true,
				RedirectStandardError = true,
			};

			var stdOutputBuilder = new StdContentBuilder();
			var stdErrorBuilder = new StdContentBuilder();
			Process process = null;

			try
			{
				process = new Process
				{
					StartInfo = processInfo
				};
				process.OutputDataReceived += stdOutputBuilder.OnDataReceived;
				process.ErrorDataReceived += stdErrorBuilder.OnDataReceived;

				process.Start();

				using (StreamWriter inputWriter = process.StandardInput)
				{
					inputWriter.Write(content);
					inputWriter.Flush();
				}

				process.BeginErrorReadLine();
				process.BeginOutputReadLine();

				process.WaitForExit();

				process.OutputDataReceived -= stdOutputBuilder.OnDataReceived;
				process.ErrorDataReceived -= stdErrorBuilder.OnDataReceived;

				string errorString = stdErrorBuilder.Content;
				if (!string.IsNullOrWhiteSpace(errorString))
				{
					IList<string> errors;
					IList<string> warnings;

					ParseErrorDetails(errorString, path, out errors, out warnings);

					if (errors.Count > 0 || warnings.Count > 0)
					{
						if (errors.Count > 0)
						{
							throw new ClosureCompilationException(errors[0]);
						}

						if (_options.Severity > 0 && warnings.Count > 0)
						{
							throw new ClosureCompilationException(warnings[0]);
						}
					}
				}

				newContent = stdOutputBuilder.Content;
			}
			finally
			{
				if (process != null)
				{
					process.Dispose();
				}

				stdErrorBuilder.Dispose();
				stdOutputBuilder.Dispose();

				if (assetExternsTempDirectoryCreated && Directory.Exists(assetExternsTempDirectoryPath))
				{
					Directory.Delete(assetExternsTempDirectoryPath, true);
				}
			}

			return newContent;
		}

		/// <summary>
		/// Writes a JS externs to temporary directory
		/// </summary>
		/// <param name="externsDependencies">List of JS externs dependencies</param>
		/// <param name="tempExternsDirectoryPath">Absolute path to directory that contains temporary JS externs files</param>
		/// <param name="tempExternsFilePaths">List of absolute paths to temporary JS externs files</param>
		private void WriteExternsToTempDirectory(DependencyCollection externsDependencies,
			out string tempExternsDirectoryPath,
			out IList<string> tempExternsFilePaths)
		{
			tempExternsDirectoryPath = Path.Combine(_tempDirectoryPath, Guid.NewGuid().ToString());
			Directory.CreateDirectory(tempExternsDirectoryPath);

			tempExternsFilePaths = new List<string>();

			foreach (Dependency externsDependency in externsDependencies)
			{
				string tempExternsFilePath = Path.Combine(tempExternsDirectoryPath,
					externsDependency.Url.TrimStart('/').Replace('/', '\\'));
				string tempExternsSubdirectoryPath = Path.GetDirectoryName(tempExternsFilePath) ?? string.Empty;

				if (!Directory.Exists(tempExternsSubdirectoryPath))
				{
					Directory.CreateDirectory(tempExternsSubdirectoryPath);
				}

				using (var file = new StreamWriter(tempExternsFilePath))
				{
					file.Write(externsDependency.Content);
				}

				tempExternsFilePaths.Add(tempExternsFilePath);
			}
		}

		/// <summary>
		/// Converts a compilation options to command line arguments
		/// </summary>
		/// <param name="options">Compilation options</param>
		/// <returns>Command line arguments</returns>
		private static string ConvertCompilationOptionsToArgs(LocalJsCompilationOptions options)
		{
			var stringBuilderPool = StringBuilderPool.Shared;
			StringBuilder argsBuilder = stringBuilderPool.Rent();

			if (options.AcceptConstKeyword)
			{
				argsBuilder.Append("--accept_const_keyword ");
			}

			if (options.AllowEs6Output)
			{
				argsBuilder.Append("--allow_es6_out ");
			}

			if (options.AngularPass)
			{
				argsBuilder.Append("--angular_pass ");
			}

			if (!string.IsNullOrWhiteSpace(options.Charset))
			{
				argsBuilder.AppendFormat("--charset {0} ", options.Charset);
			}

			argsBuilder.AppendFormat("--compilation_level {0} ", ConvertCompilationLevelEnumValueToCode(options.CompilationLevel));

			IDictionary<string, string> defs = ParseDefinitions(options.DefinitionList);
			if (defs.Count > 0)
			{
				foreach (KeyValuePair<string, string> def in defs)
				{
					string variableName = def.Key;
					string variableValue = def.Value;

					argsBuilder.Append("--define ");
					argsBuilder.Append(variableName);
					if (variableValue != null)
					{
						argsBuilder.AppendFormat("={0}", variableValue);
					}
					argsBuilder.Append(" ");
				}
			}

			string[] errors = Utils.ConvertToStringCollection(options.ErrorList, ',',
				trimItemValues: true, removeEmptyItems: true);
			if (errors.Length > 0)
			{
				foreach (string warningClassName in errors)
				{
					argsBuilder.AppendFormat("--jscomp_error {0} ", warningClassName);
				}
			}

			if (options.ExportLocalPropertyDefinitions)
			{
				argsBuilder.Append("--export_local_property_definitions ");
			}

			string[] extraAnnotationNames = Utils.ConvertToStringCollection(options.ExtraAnnotationNameList, ',',
				trimItemValues: true, removeEmptyItems: true);
			if (extraAnnotationNames.Length > 0)
			{
				foreach (string extraAnnotationName in extraAnnotationNames)
				{
					argsBuilder.AppendFormat("--extra_annotation_name {0} ", extraAnnotationName);
				}
			}

			if (options.GenerateExports)
			{
				argsBuilder.Append("--generate_exports ");
			}

			ExperimentalLanguageSpec languageInput = options.LanguageInput;
			if (languageInput != ExperimentalLanguageSpec.None)
			{
				argsBuilder.AppendFormat("--language_in {0} ", ConvertLanguageSpecEnumValueToCode(languageInput));
			}

			ExperimentalLanguageSpec languageOutput = (options.LanguageOutput != ExperimentalLanguageSpec.None) ?
				options.LanguageOutput : languageInput;
			if (languageOutput != ExperimentalLanguageSpec.None)
			{
				argsBuilder.AppendFormat("--language_out {0} ", ConvertLanguageSpecEnumValueToCode(languageOutput));
			}

			if (options.PrettyPrint)
			{
				argsBuilder.Append("--formatting PRETTY_PRINT ");
			}

			if (options.ProcessClosurePrimitives)
			{
				argsBuilder.Append("--process_closure_primitives ");
			}

			if (options.ProcessJqueryPrimitives)
			{
				argsBuilder.Append("--process_jquery_primitives ");
			}

			if (options.SingleQuotes)
			{
				argsBuilder.Append("--formatting SINGLE_QUOTES ");
			}

			if (options.ThirdParty)
			{
				argsBuilder.Append("--third_party ");
			}

			if (options.TranspileOnly)
			{
				argsBuilder.Append("--transpile_only ");
			}

			string[] turnOffWarningClasses = Utils.ConvertToStringCollection(options.TurnOffWarningClassList, ',',
				trimItemValues: true, removeEmptyItems: true);
			if (turnOffWarningClasses.Length > 0)
			{
				foreach (string warningClassName in turnOffWarningClasses)
				{
					argsBuilder.AppendFormat("--jscomp_off {0} ", warningClassName);
				}
			}

			if (options.UseOnlyCustomExterns)
			{
				argsBuilder.Append("--use_only_custom_externs ");
			}

			if (options.UseTypesForOptimization)
			{
				argsBuilder.Append("--use_types_for_optimization ");
			}

			string[] warnings = Utils.ConvertToStringCollection(options.WarningList, ',',
				trimItemValues: true, removeEmptyItems: true);
			if (warnings.Length > 0)
			{
				foreach (string warningClassName in warnings)
				{
					argsBuilder.AppendFormat("--jscomp_warning {0} ", warningClassName);
				}
			}

			int severity = options.Severity;
			if (severity >= 0 && severity <= 3)
			{
				argsBuilder.Append("--warning_level ");

				switch (severity)
				{
					case 0:
					case 1:
						argsBuilder.Append("QUIET ");
						break;
					case 2:
						argsBuilder.Append("DEFAULT ");
						break;
					case 3:
						argsBuilder.Append("VERBOSE ");
						break;
				}
			}

			string args = argsBuilder.ToString();
			stringBuilderPool.Return(argsBuilder);

			return args;
		}

		/// <summary>
		/// Convert compilation level enum value to code
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
					code = "SIMPLE";
					break;
				case CompilationLevel.Advanced:
					code = "ADVANCED";
					break;
				default:
					throw new InvalidCastException(string.Format(CoreStrings.Common_EnumValueToCodeConversionFailed,
						compilationLevel.ToString(), typeof(CompilationLevel)));
			}

			return code;
		}

		/// <summary>
		/// Convert language spec enum value to code
		/// </summary>
		/// <param name="languageSpec">Language spec enum value</param>
		/// <returns>Language spec code</returns>
		internal static string ConvertLanguageSpecEnumValueToCode(ExperimentalLanguageSpec languageSpec)
		{
			string code;

			switch (languageSpec)
			{
				case ExperimentalLanguageSpec.EcmaScript3:
					code = "ECMASCRIPT3";
					break;
				case ExperimentalLanguageSpec.EcmaScript5:
					code = "ECMASCRIPT5";
					break;
				case ExperimentalLanguageSpec.EcmaScript5Strict:
					code = "ECMASCRIPT5_STRICT";
					break;
				case ExperimentalLanguageSpec.EcmaScript6:
					code = "ECMASCRIPT6";
					break;
				case ExperimentalLanguageSpec.EcmaScript6Strict:
					code = "ECMASCRIPT6_STRICT";
					break;
				case ExperimentalLanguageSpec.EcmaScript6Typed:
					code = "ECMASCRIPT6_TYPED";
					break;
				default:
					throw new InvalidCastException(string.Format(CoreStrings.Common_EnumValueToCodeConversionFailed,
						languageSpec.ToString(), typeof(ExperimentalLanguageSpec)));
			}

			return code;
		}

		/// <summary>
		/// Parses a string representation of the variable list, that overrides the values of
		/// a variables annotated <code>@define</code>
		/// </summary>
		/// <param name="defsString">String representation of the variable list</param>
		/// <returns>Variable list in the form of a dictionary</returns>
		private static IDictionary<string, string> ParseDefinitions(string defsString)
		{
			var defs = new Dictionary<string, string>();
			var nameValueList = Utils.ConvertToStringCollection(defsString, ';',
				trimItemValues: true, removeEmptyItems: true);

			if (nameValueList.Length > 0)
			{
				foreach (string nameValue in nameValueList)
				{
					string name;
					string value;
					int equalSignPosition = nameValue.IndexOf("=", StringComparison.Ordinal);

					if (equalSignPosition != -1)
					{
						name = nameValue.Substring(0, equalSignPosition);
						value = nameValue.Substring(equalSignPosition + 1);
					}
					else
					{
						name = nameValue;
						value = null;
					}

					defs.Add(name, value);
				}
			}

			return defs;
		}

		/// <summary>
		/// Parses a error message
		/// </summary>
		/// <param name="errorDetails">String representation of error</param>
		/// <param name="currentFilePath">Path to current JS file</param>
		/// <param name="errorList">List of errors</param>
		/// <param name="warningList">List of warnings</param>
		private void ParseErrorDetails(string errorDetails, string currentFilePath,
			out IList<string> errorList, out IList<string> warningList)
		{
			errorList = new List<string>();
			warningList = new List<string>();

			MatchCollection errorStringMatches = _errorStringRegex.Matches(errorDetails);

			if (errorStringMatches.Count > 0)
			{
				foreach (Match errorStringMatch in errorStringMatches)
				{
					GroupCollection errorStringGroups = errorStringMatch.Groups;

					string message = errorStringGroups["message"].Value.Trim();
					string errorType = errorStringGroups["errorType"].Value;
					string file = errorStringGroups["filePath"].Success ?
						ConvertExternsTempFilePathToUrl(errorStringGroups["filePath"].Value)
						: currentFilePath;
					int lineNumber = errorStringGroups["lineNumber"].Success
						? int.Parse(errorStringGroups["lineNumber"].Value)
						: 0;
					string sourceFragment = errorStringGroups["sourceFragment"].Success
						? errorStringGroups["sourceFragment"].Value.Trim()
						: string.Empty;

					var stringBuilderPool = StringBuilderPool.Shared;
					StringBuilder errorMessageBuilder = stringBuilderPool.Rent();
					errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Message, message);
					errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_ErrorType,
						errorType.ToLowerInvariant());
					errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_File, file);
					if (lineNumber > 0)
					{
						errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_LineNumber,
							lineNumber);
					}
					if (!string.IsNullOrWhiteSpace(sourceFragment))
					{
						errorMessageBuilder.AppendFormatLine("{1}:{0}{0}{2}", Environment.NewLine,
							CoreStrings.ErrorDetails_SourceError, sourceFragment);
					}

					string errorMessage = errorMessageBuilder.ToString();
					stringBuilderPool.Return(errorMessageBuilder);

					if (string.Equals(errorType, "ERROR", StringComparison.OrdinalIgnoreCase))
					{
						errorList.Add(errorMessage);
					}
					else if (string.Equals(errorType, "WARNING", StringComparison.OrdinalIgnoreCase))
					{
						warningList.Add(errorMessage);
					}
				}

				return;
			}

			Match jscompErrorStringMatch = _jscompErrorStringRegex.Match(errorDetails);

			if (jscompErrorStringMatch.Success)
			{
				string message = jscompErrorStringMatch.Groups["message"].Value.Trim();
				errorList.Add(message);
			}
			else
			{
				errorList.Add(errorDetails);
			}
		}

		/// <summary>
		/// Converts a JS externs temporary file path to URL
		/// </summary>
		/// <param name="path">Path to JS externs temporary file</param>
		/// <returns>URL to JS externs file</returns>
		private string ConvertExternsTempFilePathToUrl(string path)
		{
			string url = path;

			if (path.IndexOf(_tempDirectoryPath, StringComparison.OrdinalIgnoreCase) == 0)
			{
				url = path.Substring(_tempDirectoryPath.Length);
				url = url.Replace(@"\", "/");
				url = url.TrimStart('/');

				Match guidMatch = _guidRegex.Match(url);
				if (guidMatch.Success && guidMatch.Index == 0)
				{
					string guid = guidMatch.Value;
					url = url.Substring(guid.Length);
				}

				if (!url.StartsWith("/"))
				{
					url = "/" + url;
				}
			}

			return url;
		}

		/// <summary>
		/// Destroys object
		/// </summary>
		public void Dispose()
		{
			if (_disposedFlag.Set())
			{
				if (_commonExternsTempDirectoryCreated && Directory.Exists(_commonExternsTempDirectoryPath))
				{
					Directory.Delete(_commonExternsTempDirectoryPath, true);
					_commonExternsTempDirectoryCreated = false;
				}
			}
		}
	}
}