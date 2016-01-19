namespace BundleTransformer.Autoprefixer.PostProcessors
{
	using System;
	using System.Collections.Generic;
	using System.Configuration;
	using System.Linq;

	using JavaScriptEngineSwitcher.Core;

	using Core;
	using Core.Assets;
	using Core.FileSystem;
	using Core.PostProcessors;
	using CoreStrings = Core.Resources.Strings;

	using AutoPrefixers;
	using Configuration;

	/// <summary>
	/// Postprocessor that actualizes a vendor prefixes in CSS-code
	/// by using Andrey Sitnik's Autoprefixer
	/// </summary>
	public sealed class AutoprefixCssPostProcessor : PostProcessorBase
	{
		/// <summary>
		/// Name of postprocessor
		/// </summary>
		const string POSTPROCESSOR_NAME = "Autoprefix CSS-postprocessor";

		/// <summary>
		/// Name of code type
		/// </summary>
		const string CODE_TYPE = "CSS";

		/// <summary>
		/// Delegate that creates an instance of JavaScript engine
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
		/// Gets or sets a flag for whether to add prefixes for flexbox properties.
		/// With "no-2009" value Autoprefixer will add prefixes only for final and IE versions of specification.
		/// </summary>
		public object Flexbox
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to add IE prefixes for Grid Layout properties
		/// </summary>
		public bool Grid
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
		/// Constructs a instance of Andrey Sitnik's Autoprefix CSS-postprocessor
		/// </summary>
		public AutoprefixCssPostProcessor()
			: this(null,
				BundleTransformerContext.Current.FileSystem.GetVirtualFileSystemWrapper(),
				BundleTransformerContext.Current.Configuration.GetAutoprefixerSettings())
		{ }

		/// <summary>
		/// Constructs a instance of Andrey Sitnik's Autoprefix CSS-postprocessor
		/// </summary>
		/// <param name="createJsEngineInstance">Delegate that creates an instance of JavaScript engine</param>
		/// <param name="virtualFileSystemWrapper">Virtual file system wrapper</param>
		/// <param name="autoprefixerConfig">Configuration settings of Andrey Sitnik's Autoprefix CSS-postprocessor</param>
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
			Flexbox = ParseFlexboxProperty(autoprefixerConfig.Flexbox);
			Grid = autoprefixerConfig.Grid;
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
  * JavaScriptEngineSwitcher.Msie
  * JavaScriptEngineSwitcher.V8",
							"MsieJsEngine")
					);
				}

				createJsEngineInstance = () =>
					JsEngineSwitcher.Current.CreateJsEngineInstance(jsEngineName);
			}
			_createJsEngineInstance = createJsEngineInstance;
		}


		/// <summary>
		/// Parses a string representation of the <code>Flexbox</code> property
		/// </summary>
		/// <param name="flexboxString">String representation of the <code>Flexbox</code> property</param>
		/// <returns>Parsed value of the <code>Flexbox</code> property</returns>
		private static object ParseFlexboxProperty(string flexboxString)
		{
			object result = flexboxString;
			bool flexboxBoolean;

			if (bool.TryParse(flexboxString, out flexboxBoolean))
			{
				result = flexboxBoolean;
			}

			return result;
		}

		/// <summary>
		/// Actualizes a vendor prefixes in CSS-asset by using Andrey Sitnik's Autoprefixer
		/// </summary>
		/// <param name="asset">CSS-asset</param>
		/// <returns>Processed CSS-asset</returns>
		public override IAsset PostProcess(IAsset asset)
		{
			if (asset == null)
			{
				throw new ArgumentException(CoreStrings.Common_ValueIsEmpty, "asset");
			}

			AutoprefixingOptions options = CreateAutoprefixingOptions();

			using (var cssAutoprefixer = new CssAutoprefixer(_createJsEngineInstance, _virtualFileSystemWrapper, options))
			{
				InnerPostProcess(asset, cssAutoprefixer);
			}

			return asset;
		}

		/// <summary>
		/// Actualizes a vendor prefixes in CSS-assets by using Andrey Sitnik's Autoprefixer
		/// </summary>
		/// <param name="assets">Set of CSS-assets</param>
		/// <returns>Set of processed CSS-assets</returns>
		public override IList<IAsset> PostProcess(IList<IAsset> assets)
		{
			if (assets == null)
			{
				throw new ArgumentException(CoreStrings.Common_ValueIsEmpty, "assets");
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

			AutoprefixingOptions options = CreateAutoprefixingOptions();

			using (var cssAutoprefixer = new CssAutoprefixer(_createJsEngineInstance, _virtualFileSystemWrapper, options))
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
			string newContent;
			string assetUrl = asset.Url;

			try
			{
				newContent = cssAutoprefixer.Process(asset.Content, asset.Url);
			}
			catch (CssAutoprefixingException e)
			{
				throw new AssetPostProcessingException(
					string.Format(CoreStrings.PostProcessors_PostprocessingSyntaxError,
						CODE_TYPE, assetUrl, POSTPROCESSOR_NAME, e.Message));
			}
			catch (Exception e)
			{
				throw new AssetPostProcessingException(
					string.Format(CoreStrings.PostProcessors_PostprocessingFailed,
						CODE_TYPE, assetUrl, POSTPROCESSOR_NAME, e.Message), e);
			}

			asset.Content = newContent;
		}

		/// <summary>
		/// Creates a autoprefixing options
		/// </summary>
		/// <returns>Autoprefixing options</returns>
		private AutoprefixingOptions CreateAutoprefixingOptions()
		{
			var options = new AutoprefixingOptions
			{
				Browsers = Browsers,
				Cascade = Cascade,
				Add = Add,
				Remove = Remove,
				Supports = Supports,
				Flexbox = Flexbox,
				Grid = Grid,
				Stats = Stats
			};

			return options;
		}
	}
}