using System;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;

using AdvancedStringBuilder;
using JavaScriptEngineSwitcher.Core;
using JavaScriptEngineSwitcher.Core.Helpers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

using BundleTransformer.Core.Utilities;
using CoreStrings = BundleTransformer.Core.Resources.Strings;

using UglifyStrings = BundleTransformer.UglifyJs.Resources.Strings;

namespace BundleTransformer.UglifyJs.Internal
{
	/// <summary>
	/// JS uglifier
	/// </summary>
	internal sealed class JsUglifier : IDisposable
	{
		/// <summary>
		/// Namespace for resources
		/// </summary>
		private const string RESOURCES_NAMESPACE = "BundleTransformer.UglifyJs.Resources";

		/// <summary>
		/// Name of file, which contains a UglifyJS library
		/// </summary>
		private const string UGLIFY_JS_LIBRARY_FILE_NAME = "uglify-combined.min.js";

		/// <summary>
		/// Name of file, which contains a UglifyJS minifier helper
		/// </summary>
		private const string UGLIFY_JS_HELPER_FILE_NAME = "uglifyJsHelper.min.js";

		/// <summary>
		/// Template of function call, which is responsible for uglification
		/// </summary>
		private const string UGLIFICATION_FUNCTION_CALL_TEMPLATE = @"uglifyJsHelper.minify({0}, {1});";

		/// <summary>
		/// JS engine
		/// </summary>
		private IJsEngine _jsEngine;

		/// <summary>
		/// Uglification options
		/// </summary>
		private readonly UglificationOptions _options;

		/// <summary>
		/// String representation of the uglification options
		/// </summary>
		private readonly string _optionsString;

		/// <summary>
		/// Regular expression for working with strings of the form SYMBOL[=value]
		/// </summary>
		private static readonly Regex _symbolValueRegex =
			new Regex(@"^(?<symbol>[a-zA-Z_\$][a-zA-Z_\$0-9]*)(=(?<value>.*))?$");

		/// <summary>
		/// Regular expression for working with names
		/// </summary>
		private static readonly Regex _nameRegex = new Regex(@"^[a-zA-Z\$_][a-zA-Z\$_0-9]*$");

		/// <summary>
		/// Regular expression for working with string values
		/// </summary>
		private static readonly Regex _stringValueRegex = new Regex(@"^(?<quote>'|"")(?<value>.*)(\k<quote>)$");

		/// <summary>
		/// Regular expression for working with integer values
		/// </summary>
		private static readonly Regex _integerValueRegex = new Regex(@"^(\+|\-)?[0-9]+$");

		/// <summary>
		/// Regular expression for working with float values
		/// </summary>
		private static readonly Regex _floatValueRegex = new Regex(@"^(\+|\-)?[0-9]*\.[0-9]+(e(\+|\-)?[0-9]+)?$");

		/// <summary>
		/// List of inbuilt constants of JS language
		/// </summary>
		private static readonly string[] _jsInbuiltConstants = { "false", "null", "true", "undefined" };

		/// <summary>
		/// Regular expression for working with the string representation of error
		/// </summary>
		private static readonly Regex _errorStringRegex =
			new Regex(@"^(?<message>.*?)\s*" +
				@"\[[\w \-+.:,;/?&=%~#$@()\[\]{}]*:(?<lineNumber>\d+),\s*(?<columnNumber>\d+)\]$");

		/// <summary>
		/// Synchronizer of JS uglifier initialization
		/// </summary>
		private readonly object _initializationSynchronizer = new object();

		/// <summary>
		/// Flag that JS uglifier is initialized
		/// </summary>
		private bool _initialized;

		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private InterlockedStatedFlag _disposedFlag = new InterlockedStatedFlag();


		/// <summary>
		/// Constructs a instance of JS uglifier
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JS engine</param>
		/// <param name="options">Uglification options</param>
		public JsUglifier(Func<IJsEngine> createJsEngineInstance, UglificationOptions options)
		{
			_jsEngine = createJsEngineInstance();
			_options = options ?? new UglificationOptions();
			_optionsString = ConvertUglificationOptionsToJson(_options).ToString();
		}


		/// <summary>
		/// Initializes JS uglifier
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

				Assembly assembly = GetType().Assembly;

				_jsEngine.ExecuteResource(RESOURCES_NAMESPACE + "." + UGLIFY_JS_LIBRARY_FILE_NAME, assembly);
				_jsEngine.ExecuteResource(RESOURCES_NAMESPACE + "." + UGLIFY_JS_HELPER_FILE_NAME, assembly);

				_initialized = true;
			}
		}

		/// <summary>
		/// "Uglifies" a JS code by using UglifyJS
		/// </summary>
		/// <param name="content">Text content of JS asset</param>
		/// <param name="path">Path to JS file</param>
		/// <returns>Minified text content of JS asset</returns>
		public string Uglify(string content, string path)
		{
			Initialize();

			string newContent;

			try
			{
				var result = _jsEngine.Evaluate<string>(
					string.Format(UGLIFICATION_FUNCTION_CALL_TEMPLATE,
						JsonConvert.SerializeObject(content), _optionsString));

				var json = JObject.Parse(result);

				var errors = json["errors"] != null ? json["errors"] as JArray : null;
				if (errors != null && errors.Count > 0)
				{
					throw new JsUglificationException(FormatErrorDetails(errors[0], true, content, path));
				}

				if (_options.Severity > 0)
				{
					var warnings = json["warnings"] != null ? json["warnings"] as JArray : null;
					if (warnings != null && warnings.Count > 0)
					{
						throw new JsUglificationException(FormatErrorDetails(warnings[0], false, content, path));
					}
				}

				newContent = json.Value<string>("minifiedCode");
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

				throw new JsUglificationException(errorMessage);
			}

			return newContent;
		}

		/// <summary>
		/// Converts a uglification options to JSON
		/// </summary>
		/// <param name="options">Uglification options</param>
		/// <returns>Uglification options in JSON format</returns>
		private static JObject ConvertUglificationOptionsToJson(UglificationOptions options)
		{
			ParsingOptions parsingOptions = options.ParsingOptions;
			CompressionOptions compressionOptions = options.CompressionOptions;
			ManglingOptions manglingOptions = options.ManglingOptions;
			CodeGenerationOptions codeGenerationOptions = options.CodeGenerationOptions;

			var optionsJson = new JObject(
				new JProperty("warnings", options.Severity > 0
			));

			optionsJson.Add("parse", new JObject(
				new JProperty("bare_returns", parsingOptions.BareReturns),
				new JProperty("shebang", false),
				new JProperty("strict", parsingOptions.Strict)
			));

			if (compressionOptions.Compress)
			{
				optionsJson.Add("compress", new JObject(
					new JProperty("angular", compressionOptions.Angular),
					new JProperty("booleans", compressionOptions.Booleans),
					new JProperty("cascade", compressionOptions.Cascade),
					new JProperty("collapse_vars", compressionOptions.CollapseVars),
					new JProperty("comparisons", compressionOptions.Comparisons),
					new JProperty("conditionals", compressionOptions.Conditionals),
					new JProperty("dead_code", compressionOptions.DeadCode),
					new JProperty("drop_console", compressionOptions.DropConsole),
					new JProperty("drop_debugger", compressionOptions.DropDebugger),
					new JProperty("evaluate", compressionOptions.Evaluate),
					new JProperty("global_defs",
						ParseGlobalDefinitions(compressionOptions.GlobalDefinitions)),
					new JProperty("hoist_funs", compressionOptions.HoistFunctions),
					new JProperty("hoist_vars", compressionOptions.HoistVars),
					new JProperty("if_return", compressionOptions.IfReturn),
					new JProperty("join_vars", compressionOptions.JoinVars),
					new JProperty("keep_fargs", compressionOptions.KeepFunctionArgs),
					new JProperty("keep_fnames", options.KeepFunctionNames),
					new JProperty("keep_infinity", compressionOptions.KeepInfinity),
					new JProperty("loops", compressionOptions.Loops),
					new JProperty("negate_iife", compressionOptions.NegateIife),
					new JProperty("passes", compressionOptions.Passes),
					new JProperty("properties", compressionOptions.PropertiesDotNotation),
					new JProperty("pure_getters", compressionOptions.PureGetters),
					new JProperty("pure_funcs",
						ConvertCommaSeparatedListToJson(compressionOptions.PureFunctions)),
					new JProperty("reduce_vars", compressionOptions.ReduceVars),
					new JProperty("screw_ie8", options.ScrewIe8),
					new JProperty("sequences", compressionOptions.Sequences),
					new JProperty("toplevel", compressionOptions.TopLevel),
					new JProperty("top_retain",
						ConvertCommaSeparatedListToJson(compressionOptions.TopRetain, new JArray())),
					new JProperty("unsafe", compressionOptions.Unsafe),
					new JProperty("unsafe_math", compressionOptions.UnsafeMath),
					new JProperty("unsafe_proto", compressionOptions.UnsafeProto),
					new JProperty("unsafe_regexp", compressionOptions.UnsafeRegExp),
					new JProperty("unused", compressionOptions.Unused)
				));
			}
			else
			{
				optionsJson.Add("compress", false);
			}


			if (manglingOptions.Mangle)
			{
				optionsJson.Add("mangle", new JObject(
					new JProperty("eval", manglingOptions.Eval),
					new JProperty("except",
						ConvertCommaSeparatedListToJson(manglingOptions.Except, new JArray())),
					new JProperty("keep_fnames", options.KeepFunctionNames),
					new JProperty("screw_ie8", options.ScrewIe8),
					new JProperty("toplevel", manglingOptions.TopLevel)
				));
			}
			else
			{
				optionsJson.Add("mangle", false);
			}

			optionsJson.Add("output", new JObject(
				new JProperty("ascii_only", codeGenerationOptions.AsciiOnly),
				new JProperty("beautify", codeGenerationOptions.Beautify),
				new JProperty("bracketize", codeGenerationOptions.Bracketize),
				new JProperty("comments", codeGenerationOptions.Comments),
				new JProperty("indent_level", codeGenerationOptions.IndentLevel),
				new JProperty("indent_start", codeGenerationOptions.IndentStart),
				new JProperty("inline_script", codeGenerationOptions.InlineScript),
				new JProperty("keep_quoted_props", codeGenerationOptions.KeepQuotedProperties),
				new JProperty("max_line_len", codeGenerationOptions.MaxLineLength),
				new JProperty("preserve_line", codeGenerationOptions.PreserveLine),
				new JProperty("quote_keys", codeGenerationOptions.QuoteKeys),
				new JProperty("quote_style", codeGenerationOptions.QuoteStyle),
				new JProperty("screw_ie8", options.ScrewIe8),
				new JProperty("semicolons", codeGenerationOptions.Semicolons),
				new JProperty("shebang", false),
				new JProperty("space_colon", codeGenerationOptions.SpaceColon),
				new JProperty("unescape_regexps", codeGenerationOptions.UnescapeRegexps),
				new JProperty("width", codeGenerationOptions.Width),
				new JProperty("wrap_iife", codeGenerationOptions.WrapIife)
			));

			return optionsJson;
		}

		/// <summary>
		/// Parses a string representation of the global definitions to object
		/// </summary>
		/// <param name="globalDefsString">String representation of the global definitions</param>
		/// <returns>Global definitions object in JSON format</returns>
		private static JObject ParseGlobalDefinitions(string globalDefsString)
		{
			var globalDefs = new JObject();
			var symbolValueList = Utils.ConvertToStringCollection(globalDefsString, ',',
				trimItemValues: true, removeEmptyItems: true);

			foreach (string symbolValue in symbolValueList)
			{
				Match symbolValueMatch = _symbolValueRegex.Match(symbolValue);
				if (symbolValueMatch.Length == 0)
				{
					throw new FormatException(
						string.Format(UglifyStrings.GlobalDefsParsing_InvalidSymbolValueFormat, globalDefsString));
				}

				GroupCollection symbolValueGroups = symbolValueMatch.Groups;
				var symbol = symbolValueGroups["symbol"].Value;
				if (_jsInbuiltConstants.Contains(symbol))
				{
					throw new FormatException(
						string.Format(UglifyStrings.GlobalDefsParsing_SymbolNameIsForbidden, symbol));
				}

				string rawValue = string.Empty;
				if (symbolValueGroups["value"].Success)
				{
					rawValue = symbolValueGroups["value"].Value;
				}

				if (rawValue.Length > 0)
				{
					if (_stringValueRegex.IsMatch(rawValue))
					{
						var match = _stringValueRegex.Match(rawValue);
						var groups = match.Groups;

						string stringValue = groups["value"].Success ?
							groups["value"].Value : string.Empty;
						globalDefs.Add(symbol, stringValue);
					}
					else if (_integerValueRegex.IsMatch(rawValue))
					{
						long integerValue;
						if (!long.TryParse(rawValue, out integerValue))
						{
							throw new InvalidCastException(
								string.Format(UglifyStrings.GlobalDefsParsing_CannotConvertValue,
									rawValue, symbol, typeof(long)));
						}

						globalDefs.Add(symbol, integerValue);
					}
					else if (_floatValueRegex.IsMatch(rawValue))
					{
						double floatValue;
						if (!double.TryParse(rawValue.Replace(".", ","), out floatValue))
						{
							throw new InvalidCastException(
								string.Format(UglifyStrings.GlobalDefsParsing_CannotConvertValue,
									rawValue, symbol, typeof(double)));
						}

						globalDefs.Add(symbol, floatValue);
					}
					else if (_nameRegex.IsMatch(rawValue))
					{
						switch (rawValue)
						{
							case "true":
								globalDefs.Add(symbol, true);
								break;
							case "false":
								globalDefs.Add(symbol, false);
								break;
							case "null":
								globalDefs.Add(symbol, null);
								break;
							default:
								globalDefs.Add(symbol, new JRaw(rawValue));
								break;
						}
					}
					else
					{
						throw new FormatException(
							string.Format(UglifyStrings.GlobalDefsParsing_CannotParseValue, rawValue, symbol));
					}
				}
			}

			if (globalDefs.Count == 0)
			{
				globalDefs = null;
			}

			return globalDefs;
		}

		private static JArray ConvertCommaSeparatedListToJson(string commaSeparatedList,
			JArray defaultValue = null)
		{
			JArray result = defaultValue;
			string[] arr = Utils.ConvertToStringCollection(commaSeparatedList, ',',
				trimItemValues: true, removeEmptyItems: true);

			if (arr.Length > 0)
			{
				result = new JArray(arr.Select(i => new JValue(i)));
			}

			return result;
		}

		/// <summary>
		/// Generates a detailed error message
		/// </summary>
		/// <param name="errorDetails">Error details</param>
		/// <param name="isError">Flag indicating that this issue is a error</param>
		/// <param name="sourceCode">Source code</param>
		/// <param name="currentFilePath">Path to current JS file</param>
		/// <returns>Detailed error message</returns>
		private static string FormatErrorDetails(JToken errorDetails, bool isError, string sourceCode,
			string currentFilePath)
		{
			string message;
			string file = currentFilePath;
			int lineNumber = 0;
			int columnNumber = 0;

			var errorString = errorDetails.Value<string>("message");
			Match errorStringMatch = _errorStringRegex.Match(errorString);

			if (errorStringMatch.Success)
			{
				GroupCollection errorStringGroups = errorStringMatch.Groups;

				message = errorStringGroups["message"].Value;
				lineNumber = int.Parse(errorStringGroups["lineNumber"].Value);
				columnNumber = int.Parse(errorStringGroups["columnNumber"].Value) + 1;
			}
			else
			{
				message = errorString;
				if (isError)
				{
					lineNumber = errorDetails.Value<int>("lineNumber");
					columnNumber = errorDetails.Value<int>("columnNumber");
				}
			}

			string sourceFragment = SourceCodeNavigator.GetSourceFragment(sourceCode,
				new SourceCodeNodeCoordinates(lineNumber, columnNumber));

			var stringBuilderPool = StringBuilderPool.Shared;
			StringBuilder errorMessageBuilder = stringBuilderPool.Rent();
			errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_ErrorType,
				isError ? CoreStrings.ErrorType_Error : CoreStrings.ErrorType_Warning);
			errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Message, message);
			if (!string.IsNullOrWhiteSpace(file))
			{
				errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_File, file);
			}
			if (lineNumber > 0)
			{
				errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_LineNumber,
					lineNumber.ToString(CultureInfo.InvariantCulture));
			}
			if (columnNumber > 0)
			{
				errorMessageBuilder.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_ColumnNumber,
					columnNumber.ToString(CultureInfo.InvariantCulture));
			}
			if (!string.IsNullOrWhiteSpace(sourceFragment))
			{
				errorMessageBuilder.AppendFormatLine("{1}:{0}{0}{2}", Environment.NewLine,
					CoreStrings.ErrorDetails_SourceError, sourceFragment);
			}

			string errorMessage = errorMessageBuilder.ToString();
			stringBuilderPool.Return(errorMessageBuilder);

			return errorMessage;
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