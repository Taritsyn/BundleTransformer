namespace BundleTransformer.Core.Transformers
{
	using System;
	using System.Collections.Generic;
	using System.Collections.ObjectModel;
	using System.Web.Optimization;

	using Configuration;
	using Minifiers;
	using PostProcessors;
	using Translators;

	/// <summary>
	/// Obsolete transformer that responsible for processing of script assets
	/// </summary>
	[Obsolete("Use class `ScriptTransformer`")]
	public sealed class JsTransformer : ITransformer, IBundleTransform
	{
		/// <summary>
		/// Script transformer
		/// </summary>
		private readonly ScriptTransformer _scriptTransformer;

		/// <summary>
		/// Gets a list of translators
		/// </summary>
		public ReadOnlyCollection<ITranslator> Translators
		{
			get
			{
				return _scriptTransformer.Translators;
			}
		}

		/// <summary>
		/// Gets a list of postprocessors
		/// </summary>
		public ReadOnlyCollection<IPostProcessor> PostProcessors
		{
			get
			{
				return _scriptTransformer.PostProcessors;
			}
		}

		/// <summary>
		/// Gets a minifier
		/// </summary>
		public IMinifier Minifier
		{
			get
			{
				return _scriptTransformer.Minifier;
			}
		}


		/// <summary>
		/// Constructs a instance of JS-transformer
		/// </summary>
		public JsTransformer()
			: this(null, null, null, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of JS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		public JsTransformer(IMinifier minifier)
			: this(minifier, null, null, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of JS-transformer
		/// </summary>
		/// <param name="translators">List of translators</param>
		public JsTransformer(IList<ITranslator> translators)
			: this(null, translators, null, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of JS-transformer
		/// </summary>
		/// <param name="postProcessors">List of postprocessors</param>
		public JsTransformer(IList<IPostProcessor> postProcessors)
			: this(null, null, postProcessors, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of JS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		public JsTransformer(IMinifier minifier, IList<ITranslator> translators)
			: this(minifier, translators, null, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of JS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="postProcessors">List of postprocessors</param>
		public JsTransformer(IMinifier minifier, IList<IPostProcessor> postProcessors)
			: this(minifier, null, postProcessors, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of JS-transformer
		/// </summary>
		/// <param name="translators">List of translators</param>
		/// <param name="postProcessors">List of postprocessors</param>
		public JsTransformer(IList<ITranslator> translators, IList<IPostProcessor> postProcessors)
			: this(null, translators, postProcessors, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of JS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		/// <param name="postProcessors">List of postprocessors</param>
		public JsTransformer(IMinifier minifier, IList<ITranslator> translators, IList<IPostProcessor> postProcessors)
			: this(minifier, translators, postProcessors, new string[0])
		{ }

		/// <summary>
		/// Constructs a instance of JS-transformer
		/// </summary>
		/// <param name="ignorePatterns">List of patterns of files and directories that 
		/// should be ignored when processing</param>
		public JsTransformer(string[] ignorePatterns)
			: this(null, null, null, ignorePatterns)
		{ }

		/// <summary>
		/// Constructs a instance of JS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		/// <param name="postProcessors">List of postprocessors</param>
		/// <param name="ignorePatterns">List of patterns of files and directories that 
		/// should be ignored when processing</param>
		public JsTransformer(IMinifier minifier, IList<ITranslator> translators, IList<IPostProcessor> postProcessors,
			string[] ignorePatterns)
			: this(minifier, translators, postProcessors, ignorePatterns,
				BundleTransformerContext.Current.Configuration.GetCoreSettings())
		{ }

		/// <summary>
		/// Constructs a instance of JS-transformer
		/// </summary>
		/// <param name="minifier">Minifier</param>
		/// <param name="translators">List of translators</param>
		/// <param name="postProcessors">List of postprocessors</param>
		/// <param name="ignorePatterns">List of patterns of files and directories that 
		/// should be ignored when processing</param>
		/// <param name="coreConfig">Configuration settings of core</param>
		public JsTransformer(IMinifier minifier, IList<ITranslator> translators, IList<IPostProcessor> postProcessors,
			string[] ignorePatterns, CoreSettings coreConfig)
		{
			_scriptTransformer = new ScriptTransformer(minifier, translators, postProcessors, ignorePatterns, coreConfig);
		}


		/// <summary>
		/// Starts a processing of assets
		/// </summary>
		/// <param name="context">Object BundleContext</param>
		/// <param name="response">Object BundleResponse</param>
		public void Process(BundleContext context, BundleResponse response)
		{
			_scriptTransformer.Process(context, response);
		}
	}
}