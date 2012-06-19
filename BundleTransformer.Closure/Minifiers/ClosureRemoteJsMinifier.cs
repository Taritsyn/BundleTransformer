namespace BundleTransformer.Closure.Minifiers
{
	using System;
	using System.Collections.Generic;
	using System.Json;
	using System.Linq;
	using System.Net.Http;
	using System.Text;

	using Core;
	using Core.Assets;
	using Core.Minifiers;
	using CoreStrings = Core.Resources.Strings;

	using Configuration;
	using Resources;
	using FormItem = System.Collections.Generic.KeyValuePair<string, string>;

	/// <summary>
	/// Minifier, which produces minifiction of JS-code 
	/// by using Google Closure Compiler Service API
	/// </summary>
	public sealed class ClosureRemoteJsMinifier : ClosureJsMinifierBase
	{
		/// <summary>
		/// Flag that object is destroyed
		/// </summary>
		private bool _disposed;

		/// <summary>
		/// Configuration settings of Closure Minifier
		/// </summary>
		private readonly ClosureSettings _closureConfig;

		/// <summary>
		/// Gets or sets a URL of Google Closure Compiler Service API
		/// </summary>
		public string ClosureCompilerServiceApiUrl
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to exclude common externs 
		/// such as document and all its methods
		/// </summary>
		public bool ExcludeDefaultExterns
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs instance of Closure remote JS-minifier
		/// </summary>
		public ClosureRemoteJsMinifier()
			: this(BundleTransformerContext.Current.GetClosureConfiguration())
		{ }

		/// <summary>
		/// Constructs instance of Closure remote JS-minifier
		/// </summary>
		/// <param name="closureConfig">Configuration settings of Closure Minifier</param>
		public ClosureRemoteJsMinifier(ClosureSettings closureConfig)
		{
			_closureConfig = closureConfig;

			RemoteJsMinifierSettings remoteJsMinifierConfig = _closureConfig.Js.Remote;
			ClosureCompilerServiceApiUrl = remoteJsMinifierConfig.ClosureCompilerServiceApiUrl;
			CompilationLevel = remoteJsMinifierConfig.CompilationLevel;
			PrettyPrint = remoteJsMinifierConfig.PrettyPrint;
			ExcludeDefaultExterns = remoteJsMinifierConfig.ExcludeDefaultExterns;
			Severity = remoteJsMinifierConfig.Severity;
		}

		/// <summary>
		/// Destructs instance of Closure remote JS-minifier
		/// </summary>
		~ClosureRemoteJsMinifier()
		{
			Dispose(false /* disposing */);
		}


		/// <summary>
		/// Produces code minifiction of JS-assets by using Google Closure Compiler Service API
		/// </summary>
		/// <param name="assets">Set of JS-assets</param>
		/// <returns>Set of JS-assets with minified text content</returns>
		public override IList<IAsset> Minify(IList<IAsset> assets)
		{
			if (assets == null)
			{
				throw new ArgumentException(CoreStrings.Common_ValueIsEmpty, "assets");
			}

			if (assets.Count == 0)
			{
				return assets;
			}

			if (string.IsNullOrWhiteSpace(ClosureCompilerServiceApiUrl))
			{
				throw new EmptyValueException(Strings.Minifiers_ClosureCompilerServiceApiUrlNotSpecified);
			}

			foreach (var asset in assets.Where(a => a.IsScript && !a.Minified))
			{
				string newContent = Compile(asset.Content, asset.Path);

				asset.Content = newContent;
				asset.Minified = true;
			}

			return assets;
		}
		
		/// <summary>
		/// "Compiles" JS-code by using Google Closure Compiler Service API
		/// </summary>
		/// <param name="content">Text content of JS-asset</param>
		/// <param name="assetPath">Path to JS-asset file</param>
		/// <returns>Minified text content of JS-asset</returns>
		private string Compile(string content, string assetPath)
		{
			string newContent = string.Empty;
			string serviceUrl = ClosureCompilerServiceApiUrl;
			int severity = Severity;
			
			var formItems = new List<FormItem>();
			formItems.Add(new FormItem("compilation_level", ConvertCompilationLevelEnumValueToCode(CompilationLevel)));
			formItems.Add(new FormItem("js_code", content));
			formItems.Add(new FormItem("output_format", "json"));
			formItems.Add(new FormItem("output_info", "compiled_code"));
			formItems.Add(new FormItem("output_info", "errors"));
			if (severity > 0)
			{
				formItems.Add(new FormItem("output_info", "warnings"));
			}
			if (PrettyPrint)
			{
				formItems.Add(new FormItem("formatting", "pretty_print"));
			}
			formItems.Add(new FormItem("exclude_default_externs", ExcludeDefaultExterns.ToString().ToLowerInvariant()));
			if (severity > 0)
			{
				if (severity == 1)
				{
					formItems.Add(new FormItem("warning_level", "QUIET"));
				}
				else if (severity == 2)
				{
					formItems.Add(new FormItem("warning_level", "DEFAULT"));
				}
				else if (severity == 3)
				{
					formItems.Add(new FormItem("warning_level", "VERBOSE"));
				}
			}

			using (var client = new HttpClient())
			{
				HttpResponseMessage response;
				try
				{
					response = client
						.PostAsync(new Uri(serviceUrl), new FormUrlEncodedContent(formItems))
						.Result
						;
				}
				catch(Exception)
				{
					throw new AssetMinificationException(
						string.Format(Strings.Minifiers_ClosureRemoteMinificationHttpRequestError, serviceUrl));
				}

				if (response.IsSuccessStatusCode)
				{
					var result = response.Content.ReadAsStringAsync().Result;
					var json = JsonValue.Parse(result);

					var serverErrors = json.ContainsKey("serverErrors") ? 
						json["serverErrors"] as JsonArray : null;
					if (serverErrors != null && serverErrors.Count > 0)
					{
						throw new AssetMinificationException(
							string.Format(Strings.Minifiers_ClosureRemoteMinificationFailed,
								FormatErrorDetails(serverErrors[0], ErrorType.ServerError, assetPath)));
					}

					var errors = json.ContainsKey("errors") ? 
						json["errors"] as JsonArray : null;
					if (errors != null && errors.Count > 0)
					{
						throw new AssetMinificationException(
							string.Format(Strings.Minifiers_ClosureRemoteMinificationSyntaxError,
								FormatErrorDetails(errors[0], ErrorType.Error, assetPath)));
					}

					if (severity > 0)
					{
						var warnings = json.ContainsKey("warnings") ? 
							json["warnings"] as JsonArray : null;
						if (warnings != null && warnings.Count > 0)
						{
							throw new AssetMinificationException(
								string.Format(Strings.Minifiers_ClosureRemoteMinificationSyntaxError,
									FormatErrorDetails(warnings[0], ErrorType.Warning, assetPath)));
						}
					}

					newContent = json["compiledCode"].ReadAs<string>();
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
		/// Generates a detailed error message
		/// </summary>
		/// <param name="errorDetails">Error details</param>
		/// <param name="errorType">Error type</param>
		/// <param name="filePath">File path</param>
		/// <returns>Detailed error message</returns>
		internal static string FormatErrorDetails(JsonValue errorDetails, ErrorType errorType, string filePath)
		{
			var errorMessage = new StringBuilder();
			if (errorType == ErrorType.ServerError || errorType == ErrorType.Error)
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Message, 
					errorDetails["error"].ReadAs<string>());
			}
			else if (errorType == ErrorType.Warning)
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Message, 
					errorDetails["warning"].ReadAs<string>());
			}
			if (errorDetails.ContainsKey("code"))
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_ErrorCode, 
					errorDetails["code"].ReadAs<string>());
			}
			if (errorDetails.ContainsKey("type"))
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Subcategory, 
					errorDetails["type"].ReadAs<string>());
			}
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_File, filePath);
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_LineNumber, 
				errorDetails["lineno"].ReadAs<int>().ToString());
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_ColumnNumber, 
				errorDetails["charno"].ReadAs<int>().ToString());
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_SourceError,
				errorDetails["line"].ReadAs<string>());

			return errorMessage.ToString();
		}

		/// <summary>
		/// Destroys object
		/// </summary>
		public override void Dispose()
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
			}
		}
	}
}