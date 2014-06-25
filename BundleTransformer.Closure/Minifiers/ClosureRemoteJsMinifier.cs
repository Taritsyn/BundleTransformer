namespace BundleTransformer.Closure.Minifiers
{
	using System;
	using System.Collections.Generic;
	using System.Globalization;
	using System.Linq;
	using System.Net.Http;
	using System.Text;

	using Newtonsoft.Json.Linq;

	using Core;
	using Core.Assets;
	using Core.Minifiers;
	using Core.Utilities;
	using CoreStrings = Core.Resources.Strings;

	using Configuration;
	using Http;
	using Resources;
	using FormItem = System.Collections.Generic.KeyValuePair<string, string>;

	/// <summary>
	/// Minifier, which produces minifiction of JS-code 
	/// by using Google Closure Compiler Service API
	/// </summary>
	public sealed class ClosureRemoteJsMinifier : ClosureJsMinifierBase
	{
		/// <summary>
		/// Name of minifier
		/// </summary>
		const string MINIFIER_NAME = "Closure Remote JS-minifier";

		/// <summary>
		/// Name of code type
		/// </summary>
		const string CODE_TYPE = "JS";

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
		/// Constructs instance of Closure Remote JS-minifier
		/// </summary>
		public ClosureRemoteJsMinifier()
			: this(BundleTransformerContext.Current.Configuration.GetClosureSettings())
		{ }

		/// <summary>
		/// Constructs instance of Closure Remote JS-minifier
		/// </summary>
		/// <param name="closureConfig">Configuration settings of Closure Minifier</param>
		public ClosureRemoteJsMinifier(ClosureSettings closureConfig)
		{
			RemoteJsMinifierSettings remoteJsMinifierConfig = closureConfig.Js.Remote;
			ClosureCompilerServiceApiUrl = remoteJsMinifierConfig.ClosureCompilerServiceApiUrl;
			CompilationLevel = remoteJsMinifierConfig.CompilationLevel;
			PrettyPrint = remoteJsMinifierConfig.PrettyPrint;
			ExcludeDefaultExterns = remoteJsMinifierConfig.ExcludeDefaultExterns;
			Severity = remoteJsMinifierConfig.Severity;
		}


		/// <summary>
		/// Produces code minifiction of JS-asset by using Google Closure Compiler Service API
		/// </summary>
		/// <param name="asset">JS-asset</param>
		/// <returns>JS-asset with minified text content</returns>
		public override IAsset Minify(IAsset asset)
		{
			if (asset == null)
			{
				throw new ArgumentException(CoreStrings.Common_ValueIsEmpty, "asset");
			}

			if (asset.Minified)
			{
				return asset;
			}

			InnerMinify(asset);

			return asset;
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

			var assetsToProcessing = assets.Where(a => a.IsScript && !a.Minified).ToList();
			if (assetsToProcessing.Count == 0)
			{
				return assets;
			}

			if (string.IsNullOrWhiteSpace(ClosureCompilerServiceApiUrl))
			{
				throw new EmptyValueException(Strings.Minifiers_ClosureCompilerServiceApiUrlNotSpecified);
			}

			foreach (var asset in assetsToProcessing)
			{
				InnerMinify(asset);
			}

			return assets;
		}

		private void InnerMinify(IAsset asset)
		{
			string newContent;
			string assetUrl = asset.Url;
			string serviceUrl = ClosureCompilerServiceApiUrl;
			int severity = Severity;
			
			var formItems = new List<FormItem>();
			formItems.Add(new FormItem("compilation_level", ConvertCompilationLevelEnumValueToCode(CompilationLevel)));
			formItems.Add(new FormItem("js_code", asset.Content));
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

			HttpContent httpContent = new CustomFormUrlEncodedContent(formItems);

			using (var client = new HttpClient())
			{
				HttpResponseMessage response;
				try
				{
					response = client
						.PostAsync(new Uri(serviceUrl), httpContent)
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
							throw new AssetMinificationException(
								string.Format(Strings.Minifiers_ClosureRemoteMinificationHttpRequestError, serviceUrl));
						}

						throw new AssetMinificationException(
							string.Format(CoreStrings.Minifiers_MinificationFailed,
								CODE_TYPE, assetUrl, MINIFIER_NAME, innerException.Message), innerException);
					}

					throw;
				}
				catch (Exception e)
				{
					throw new AssetMinificationException(
						string.Format(CoreStrings.Minifiers_MinificationFailed,
							CODE_TYPE, assetUrl, MINIFIER_NAME, e.Message), e);
				}

				if (response.IsSuccessStatusCode)
				{
					var result = response.Content.ReadAsStringAsync().Result;
					var json = JObject.Parse(result);

					var serverErrors = json["serverErrors"] != null ? json["serverErrors"] as JArray : null;
					if (serverErrors != null && serverErrors.Count > 0)
					{
						throw new AssetMinificationException(
							string.Format(CoreStrings.Minifiers_MinificationFailed,
								CODE_TYPE, assetUrl, MINIFIER_NAME,
								FormatErrorDetails(serverErrors[0], ErrorType.ServerError, assetUrl)));
					}

					var errors = json["errors"] != null ? json["errors"] as JArray : null;
					if (errors != null && errors.Count > 0)
					{
						throw new AssetMinificationException(
							string.Format(CoreStrings.Minifiers_MinificationSyntaxError,
								CODE_TYPE, assetUrl, MINIFIER_NAME,
								FormatErrorDetails(errors[0], ErrorType.Error, assetUrl)));
					}

					if (severity > 0)
					{
						var warnings = json["warnings"] != null ? json["warnings"] as JArray : null;
						if (warnings != null && warnings.Count > 0)
						{
							throw new AssetMinificationException(
								string.Format(CoreStrings.Minifiers_MinificationSyntaxError,
									CODE_TYPE, assetUrl, MINIFIER_NAME,
									FormatErrorDetails(warnings[0], ErrorType.Warning, assetUrl)));
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

			asset.Content = newContent;
			asset.Minified = true;
		}

		/// <summary>
		/// Generates a detailed error message
		/// </summary>
		/// <param name="errorDetails">Error details</param>
		/// <param name="errorType">Error type</param>
		/// <param name="filePath">File path</param>
		/// <returns>Detailed error message</returns>
		private static string FormatErrorDetails(JToken errorDetails, ErrorType errorType, string filePath)
		{
			var errorMessage = new StringBuilder();
			if (errorType == ErrorType.ServerError || errorType == ErrorType.Error)
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Message,
					errorDetails.Value<string>("error"));
			}
			else if (errorType == ErrorType.Warning)
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Message,
					errorDetails.Value<string>("warning"));
			}
			if (errorDetails["code"] != null)
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_ErrorCode,
					errorDetails.Value<string>("code"));
			}
			if (errorDetails["type"] != null)
			{
				errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_Subcategory, 
					errorDetails.Value<string>("type"));
			}
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_File, filePath);
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_LineNumber,
				errorDetails.Value<int>("lineno").ToString(CultureInfo.InvariantCulture));
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_ColumnNumber,
				errorDetails.Value<int>("charno").ToString(CultureInfo.InvariantCulture));
			errorMessage.AppendFormatLine("{0}: {1}", CoreStrings.ErrorDetails_LineSource,
				errorDetails.Value<string>("line"));

			return errorMessage.ToString();
		}
	}
}