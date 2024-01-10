using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Text;

using AdvancedStringBuilder;
using AutoprefixerHost;
using AutoprefixerHost.Helpers;
using CssAutoprefixer = AutoprefixerHost.Autoprefixer;
using AhFlexboxMode = AutoprefixerHost.FlexboxMode;
using AhGridMode = AutoprefixerHost.GridMode;
using JavaScriptEngineSwitcher.Core;

using BundleTransformer.Core;
using BundleTransformer.Core.Assets;
using BundleTransformer.Core.FileSystem;
using BundleTransformer.Core.PostProcessors;
using BundleTransformer.Core.Utilities;
using CoreStrings = BundleTransformer.Core.Resources.Strings;

using BundleTransformer.Autoprefixer.Configuration;
using BtFlexboxMode = BundleTransformer.Autoprefixer.FlexboxMode;
using BtGridMode = BundleTransformer.Autoprefixer.GridMode;

namespace BundleTransformer.Autoprefixer.PostProcessors
{
	/// <summary>
	/// Postprocessor that actualizes a vendor prefixes in CSS code
	/// by using Andrey Sitnik's Autoprefixer
	/// </summary>
	public sealed class AutoprefixCssPostProcessor : PostProcessorBase
	{
		/// <summary>
		/// Name of postprocessor
		/// </summary>
		const string POSTPROCESSOR_NAME = "Autoprefix CSS postprocessor";

		/// <summary>
		/// Name of code type
		/// </summary>
		const string CODE_TYPE = "CSS";

		/// <summary>
		/// Delegate that creates an instance of JS engine
		/// </summary>
		private readonly Func<IJsEngine> _createJsEngineInstance;

		/// <summary>
		/// Virtual file system wrapper
		/// </summary>
		private readonly IVirtualFileSystemWrapper _virtualFileSystemWrapper;

		/// <summary>
		/// Gets or sets a list of browser conditional expressions
		/// </summary>
		public IList<string> Browsers
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to create nice visual cascade of prefixes
		/// </summary>
		public bool Cascade
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to add new prefixes
		/// </summary>
		public bool Add
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to remove outdated prefixes
		/// </summary>
		public bool Remove
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to add prefixes for <code>@supports</code> parameters
		/// </summary>
		public bool Supports
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a mode that defines should Autoprefixer add prefixes for flexbox properties
		/// </summary>
		public FlexboxMode Flexbox
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a mode that defines should Autoprefixer add IE 10-11 prefixes for Grid Layout properties
		/// </summary>
		public GridMode Grid
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to do not raise error on unknown browser version in
		/// the <code>Browsers</code> property
		/// </summary>
		public bool IgnoreUnknownVersions
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a virtual path to file, that contains custom usage statistics for
		/// <code>&gt; 10% in my stats</code> browsers query
		/// </summary>
		public string Stats
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of Andrey Sitnik's Autoprefix CSS postprocessor
		/// </summary>
		public AutoprefixCssPostProcessor()
			: this(null,
				BundleTransformerContext.Current.FileSystem.GetVirtualFileSystemWrapper(),
				BundleTransformerContext.Current.Configuration.GetAutoprefixerSettings())
		{ }

		/// <summary>
		/// Constructs a instance of Andrey Sitnik's Autoprefix CSS postprocessor
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JS engine</param>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		/// <param name="autoprefixerConfig">Configuration settings of Andrey Sitnik's Autoprefix CSS postprocessor</param>
		public AutoprefixCssPostProcessor(Func<IJsEngine> createJsEngineInstance,
			IVirtualFileSystemWrapper virtualFileSystemWrapper,
			AutoprefixerSettings autoprefixerConfig)
		{
			_virtualFileSystemWrapper = virtualFileSystemWrapper;

			Browsers = autoprefixerConfig.Browsers
				.Cast<BrowserConditionalExpression>()
				.Select(b => b.ConditionalExpression)
				.ToList()
				;
			Cascade = autoprefixerConfig.Cascade;
			Add = autoprefixerConfig.Add;
			Remove = autoprefixerConfig.Remove;
			Supports = autoprefixerConfig.Supports;
			Flexbox = autoprefixerConfig.Flexbox;
			Grid = autoprefixerConfig.Grid;
			IgnoreUnknownVersions = autoprefixerConfig.IgnoreUnknownVersions;
			Stats = autoprefixerConfig.Stats;

			if (createJsEngineInstance == null)
			{
				string jsEngineName = autoprefixerConfig.JsEngine.Name;
				if (string.IsNullOrWhiteSpace(jsEngineName))
				{
					throw new ConfigurationErrorsException(
						string.Format(CoreStrings.Configuration_JsEngineNotSpecified,
							"autoprefixer",
							@"
  * JavaScriptEngineSwitcher.ChakraCore
  * JavaScriptEngineSwitcher.Jint
  * JavaScriptEngineSwitcher.Msie (only in the Chakra JsRT modes)
  * JavaScriptEngineSwitcher.V8",
							"MsieJsEngine")
					);
				}

				createJsEngineInstance = () => JsEngineSwitcher.Current.CreateEngine(jsEngineName);
			}
			_createJsEngineInstance = createJsEngineInstance;
		}


		/// <summary>
		/// Actualizes a vendor prefixes in CSS asset by using Andrey Sitnik's Autoprefixer
		/// </summary>
		/// <param name="asset">CSS asset</param>
		/// <returns>Processed CSS asset</returns>
		public override IAsset PostProcess(IAsset asset)
		{
			if (asset == null)
			{
				throw new ArgumentNullException(
					nameof(asset),
					string.Format(CoreStrings.Common_ArgumentIsNull, nameof(asset))
				);
			}

			ProcessingOptions options = CreateProcessingOptions();

			using (var cssAutoprefixer = new CssAutoprefixer(_createJsEngineInstance, options))
			{
				InnerPostProcess(asset, cssAutoprefixer);
			}

			return asset;
		}

		/// <summary>
		/// Actualizes a vendor prefixes in CSS assets by using Andrey Sitnik's Autoprefixer
		/// </summary>
		/// <param name="assets">Set of CSS assets</param>
		/// <returns>Set of processed CSS assets</returns>
		public override IList<IAsset> PostProcess(IList<IAsset> assets)
		{
			if (assets == null)
			{
				throw new ArgumentNullException(
					nameof(assets),
					string.Format(CoreStrings.Common_ArgumentIsNull, nameof(assets))
				);
			}

			if (assets.Count == 0)
			{
				return assets;
			}

			var assetsToProcessing = assets.Where(a => a.IsStylesheet).ToList();
			if (assetsToProcessing.Count == 0)
			{
				return assets;
			}

			ProcessingOptions options = CreateProcessingOptions();

			using (var cssAutoprefixer = new CssAutoprefixer(_createJsEngineInstance, options))
			{
				foreach (var asset in assetsToProcessing)
				{
					InnerPostProcess(asset, cssAutoprefixer);
				}
			}

			return assets;
		}

		private void InnerPostProcess(IAsset asset, CssAutoprefixer cssAutoprefixer)
		{
			string content = asset.Content;
			string newContent;
			string assetUrl = asset.Url;
			IList<string> dependencies;

			try
			{
				newContent = !string.IsNullOrWhiteSpace(content) ?
					cssAutoprefixer.Process(content, assetUrl).ProcessedContent
					:
					content ?? string.Empty
					;
				dependencies = GetIncludedFilePaths(Stats);
			}
			catch (AutoprefixerProcessingException e)
			{
				string errorDetails = AutoprefixerErrorHelpers.GenerateErrorDetails(e, true);

				var stringBuilderPool = StringBuilderPool.Shared;
				StringBuilder errorMessageBuilder = stringBuilderPool.Rent();
				errorMessageBuilder.AppendLine(e.Message);
				errorMessageBuilder.AppendLine();
				errorMessageBuilder.Append(errorDetails);

				string errorMessage = errorMessageBuilder.ToString();
				stringBuilderPool.Return(errorMessageBuilder);

				throw new AssetPostProcessingException(
					string.Format(CoreStrings.PostProcessors_PostprocessingSyntaxError,
						CODE_TYPE, assetUrl, POSTPROCESSOR_NAME, errorMessage));
			}
			catch (Exception e)
			{
				throw new AssetPostProcessingException(
					string.Format(CoreStrings.PostProcessors_PostprocessingFailed,
						CODE_TYPE, assetUrl, POSTPROCESSOR_NAME, e.Message), e);
			}

			asset.Content = newContent;
			asset.VirtualPathDependencies = asset.VirtualPathDependencies.Union(dependencies).ToList();
		}

		/// <summary>
		/// Creates a processing options
		/// </summary>
		/// <returns>Processing options</returns>
		private ProcessingOptions CreateProcessingOptions()
		{
			var options = new ProcessingOptions
			{
				Browsers = PrepareBrowsers(Browsers),
				Cascade = Cascade,
				Add = Add,
				Remove = Remove,
				Supports = Supports,
				Flexbox = Utils.GetEnumFromOtherEnum<BtFlexboxMode, AhFlexboxMode>(Flexbox),
				Grid = Utils.GetEnumFromOtherEnum<BtGridMode, AhGridMode>(Grid),
				IgnoreUnknownVersions = IgnoreUnknownVersions,
				Stats = GetCustomStatisticsFromFile(Stats)
			};

			return options;
		}

		/// <summary>
		/// Prepares a list of browser conditional expressions for using by the Autoprefixer Host library
		/// </summary>
		/// <param name="browsers">List of browser conditional expressions</param>
		/// <returns>Prepared list of browser conditional expressions</returns>
		private IList<string> PrepareBrowsers(IList<string> browsers)
		{
			IList<string> processedBrowsers = browsers;
			if (processedBrowsers.Count > 0)
			{
				if (processedBrowsers[0].Equals("none", StringComparison.OrdinalIgnoreCase))
				{
					processedBrowsers = new List<string>();
				}
			}
			else
			{
				processedBrowsers = null;
			}

			return processedBrowsers;
		}

		/// <summary>
		/// Gets a custom statistics from specified file
		/// </summary>
		/// <param name="path">Virtual path to file, that contains custom statistics</param>
		/// <returns>Custom statistics in JSON format</returns>
		private string GetCustomStatisticsFromFile(string path)
		{
			if (string.IsNullOrWhiteSpace(path))
			{
				return null;
			}

			if (!_virtualFileSystemWrapper.FileExists(path))
			{
				throw new FileNotFoundException(string.Format(CoreStrings.Common_FileNotExist, path));
			}

			string statistics = _virtualFileSystemWrapper.GetFileTextContent(path);

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
	}
}