namespace BundleTransformer.Closure.Internal
{
	/// <summary>
	/// Remote JS compilation options
	/// </summary>
	internal sealed class RemoteJsCompilationOptions : JsCompilationOptionsBase
	{
		/// <summary>
		/// Gets or sets a flag for whether to exclude common externs
		/// such as <code>document</code> and all its methods
		/// </summary>
		public bool ExcludeDefaultExterns
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a language spec that input sources conform
		/// </summary>
		public LanguageSpec Language
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a language spec the output should conform to.
		/// If omitted, defaults to the value of <code>Language</code>.
		/// </summary>
		public LanguageSpec LanguageOutput
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of the remote JS compilation options
		/// </summary>
		public RemoteJsCompilationOptions()
		{
			ExcludeDefaultExterns = false;
			Language = LanguageSpec.EcmaScript3;
			LanguageOutput = LanguageSpec.None;
		}
	}
}