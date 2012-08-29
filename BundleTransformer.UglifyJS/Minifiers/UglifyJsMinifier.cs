namespace BundleTransformer.UglifyJs.Minifiers
{
	using System;
	using System.Collections.Generic;
	using System.Text.RegularExpressions;
	using System.Linq;

	using Core;
	using Core.Assets;
	using Core.Minifiers;
	using CoreStrings = Core.Resources.Strings;

	using Configuration;
	using Uglifiers;
	using UglifyStrings = Resources.Strings;

	/// <summary>
	/// Minifier, which produces minifiction of JS-code 
	/// by using Uglify JS-Minifier
	/// </summary>
	public sealed class UglifyJsMinifier : IMinifier
	{
		/// <summary>
		/// Regular expression for working with strings of the form SYMBOL[=value]
		/// </summary>
		private static readonly Regex _symbolValueRegex =
			new Regex(@"^(?<symbol>[a-z_\$][a-z_\$0-9]*)(=(?<value>.*))?$", 
				RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Regular expression for working with names
		/// </summary>
		private static readonly Regex _nameRegex =
			new Regex(@"^[a-z\$_][a-z\$_0-9]*$", RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Regular expression for working with string values
		/// </summary>
		private static readonly Regex _stringValueRegex =
			new Regex(@"^(?<quote>'|"")(?<value>.*)(\k<quote>)$", RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Regular expression for working with integer values
		/// </summary>
		private static readonly Regex _integerValueRegex =
			new Regex(@"^(\+|\-)?[0-9]+$", RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// Regular expression for working with float values
		/// </summary>
		private static readonly Regex _floatValueRegex =
			new Regex(@"^(\+|\-)?[0-9]*\.[0-9]+(e(\+|\-)?[0-9]+)?$", RegexOptions.IgnoreCase | RegexOptions.Compiled);

		/// <summary>
		/// List of inbuilt constants of JavaScript language
		/// </summary>
		private static readonly string[] _jsInbuiltConstants = new[] { "false", "null", "true", "undefined" };

		/// <summary>
		/// Settings of the parser
		/// </summary>
		public ParserInstanceSettings ParserSettings
		{
			get;
			set;
		}

		/// <summary>
		/// Settings of the mangler
		/// </summary>
		public ManglerInstanceSettings ManglerSettings
		{
			get;
			set;
		}

		/// <summary>
		/// Settings of the squeezer
		/// </summary>
		public SqueezerInstanceSettings SqueezerSettings
		{
			get;
			set;
		}

		/// <summary>
		/// Settings of the code generator
		/// </summary>
		public CodeGeneratorInstanceSettings CodeGeneratorSettings
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs instance of Uglify JS-Minifier
		/// </summary>
		public UglifyJsMinifier() 
			: this(BundleTransformerContext.Current.GetUglifyJsConfiguration())
		{ }

		/// <summary>
		/// Constructs instance of Uglify JS-Minifier
		/// </summary>
		/// <param name="uglifyConfig">Configuration settings of Uglify Minifier</param>
		public UglifyJsMinifier(UglifySettings uglifyConfig)
		{
			ParserSettings parserConfig = uglifyConfig.Js.Parser;
			ManglerSettings manglerConfig = uglifyConfig.Js.Mangler;
			SqueezerSettings squeezerConfig = uglifyConfig.Js.Squeezer;
			CodeGeneratorSettings codeGeneratorConfig = uglifyConfig.Js.CodeGenerator;

			ParserSettings = new ParserInstanceSettings
			{
				StrictSemicolons = parserConfig.StrictSemicolons
			};

			ManglerSettings = new ManglerInstanceSettings
			{
				Mangle = manglerConfig.Mangle,
				TopLevel = manglerConfig.TopLevel,
				Defines = manglerConfig.Defines,
				Except = manglerConfig.Except,
				NoFunctions = manglerConfig.NoFunctions
			};

			SqueezerSettings = new SqueezerInstanceSettings
			{
			    MakeSequences = squeezerConfig.MakeSequences,
				DeadCode = squeezerConfig.DeadCode,
				Unsafe = squeezerConfig.Unsafe
			};

			CodeGeneratorSettings = new CodeGeneratorInstanceSettings
			{
				Beautify = codeGeneratorConfig.Beautify,
				IndentStart = codeGeneratorConfig.IndentStart,
				IndentLevel = codeGeneratorConfig.IndentLevel,
				QuoteKeys = codeGeneratorConfig.QuoteKeys,
				SpaceColon = codeGeneratorConfig.SpaceColon,
				AsciiOnly = codeGeneratorConfig.AsciiOnly
			};
		}

		/// <summary>
		/// Produces code minifiction of JS-assets by using Uglify JS-Minifier
		/// </summary>
		/// <param name="assets">Set of JS-assets</param>
		/// <returns>Set of JS-assets with minified text content</returns>
		public IList<IAsset> Minify(IList<IAsset> assets)
		{
			if (assets == null)
			{
				throw new ArgumentException(CoreStrings.Common_ValueIsEmpty, "assets");
			}

			if (assets.Count == 0)
			{
				return assets;
			}

			var options = GenerateUglifyJsOptions();

			using (var jsUglifier = new JsUglifier(options))
			{
				foreach (var asset in assets.Where(a => a.IsScript && !a.Minified))
				{
					string newContent;
					string assetPath = asset.Path;

					try
					{
						newContent = jsUglifier.Uglify(asset.Content, assetPath);
					}
					catch (JsUglifyingException e)
					{
						throw new AssetMinificationException(
							string.Format(UglifyStrings.Minifiers_UglifyJsMinificationSyntaxError, 
								assetPath, e.Message));
					}
					catch (Exception e)
					{
						throw new AssetMinificationException(
							string.Format(UglifyStrings.Minifiers_UglifyJsMinificationFailed,
								assetPath, e.Message));
					}

					asset.Content = newContent;
					asset.Minified = true;
				}
			}

			return assets;
		}

		/// <summary>
		/// Generates a UglifyJS options
		/// </summary>
		/// <returns>UglifyJS options</returns>
		private object GenerateUglifyJsOptions()
		{
			var options = new
			{
				strict_semicolons = ParserSettings.StrictSemicolons,
				mangle_options = new
				{
					mangle = ManglerSettings.Mangle,
					toplevel = ManglerSettings.TopLevel,
					defines = ParseDefines(ManglerSettings.Defines),
					except = ParseExcept(ManglerSettings.Except),
					no_functions = ManglerSettings.NoFunctions
				},
				squeeze_options = new
				{
					make_seqs = SqueezerSettings.MakeSequences,
					dead_code = SqueezerSettings.DeadCode,
					@unsafe = SqueezerSettings.Unsafe,
				},
				gen_options = new
				{
					beautify = CodeGeneratorSettings.Beautify,
					indent_start = CodeGeneratorSettings.IndentStart,
					indent_level = CodeGeneratorSettings.IndentLevel,
					quote_keys = CodeGeneratorSettings.QuoteKeys,
					space_colon = CodeGeneratorSettings.SpaceColon,
					ascii_only = CodeGeneratorSettings.AsciiOnly
				}
			};

			return options;
		}

		/// <summary>
		/// Parses a string representation of the "Defines" to dictionary
		/// </summary>
		/// <param name="definesString">String representation of the "Defines"</param>
		/// <returns>"Defines" object as a dictionary</returns>
		private static Dictionary<string, object> ParseDefines(string definesString)
		{
			var defines = new Dictionary<string, object>();
			var symbolValueList = Utils.ConvertToStringCollection(definesString, ',', true);

			foreach (string symbolValue in symbolValueList)
			{
				Match symbolValueMatch = _symbolValueRegex.Match(symbolValue);
				if (symbolValueMatch.Length == 0)
				{
					throw new FormatException(UglifyStrings.DefinesParsing_InvalidSymbolValueFormat);
				}

				var symbol = symbolValueMatch.Groups["symbol"].Value;
				if (_jsInbuiltConstants.Contains(symbol))
				{
					throw new FormatException(
						string.Format(UglifyStrings.DefinesParsing_SymbolNameIsForbidden, symbol));
				}

				string rawValue = string.Empty;
				if (symbolValueMatch.Groups["value"].Success)
				{
					rawValue = symbolValueMatch.Groups["value"].Value;
				}
				object value;

				if (rawValue.Length > 0)
				{
					if (_stringValueRegex.IsMatch(rawValue))
					{
						var match = _stringValueRegex.Match(rawValue);
						if (match.Groups["value"].Success)
						{
							value = new[] { "string", match.Groups["value"].Value };
						}
						else
						{
							value = new[] { "string", string.Empty };
						}
					}
					else if (_integerValueRegex.IsMatch(rawValue))
					{
						int integerValue;
						if (!Int32.TryParse(rawValue, out integerValue))
						{
							throw new InvalidCastException(
								string.Format(UglifyStrings.DefinesParsing_CannotConvertValue, 
									rawValue, symbol, typeof(Int32)));
						}

						value = new object[] { "num", integerValue };
					}
					else if (_floatValueRegex.IsMatch(rawValue))
					{
						double floatValue;
						if (!Double.TryParse(rawValue.Replace(".", ","), out floatValue))
						{
							throw new InvalidCastException(
								string.Format(UglifyStrings.DefinesParsing_CannotConvertValue,
									rawValue, symbol, typeof(Double)));
						}

						value = new object[] { "num", floatValue };
					}
					else if (_nameRegex.IsMatch(rawValue))
					{
						value = new[] { "name", rawValue };
					}
					else
					{
						throw new FormatException(
							string.Format(UglifyStrings.DefinesParsing_CannotParseValue, rawValue, symbol));
					}
				}
				else
				{
					value = new[] { "name", "true" };
				}

				defines.Add(symbol, value);
			}

			if (defines.Keys.Count == 0)
			{
				defines = null;
			}

			return defines;
		}

		/// <summary>
		/// Parses a string representation of the "Except" (reserved names) to list
		/// </summary>
		/// <param name="exceptString">String representation of the "Except"</param>
		/// <returns>"Except" as a list</returns>
		private static List<string> ParseExcept(string exceptString)
		{
			var except = Utils.ConvertToStringCollection(exceptString, ',', true).ToList();
			if (except.Count == 0)
			{
				except = null;
			}

			return except;
		}
	}
}
