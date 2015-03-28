namespace BundleTransformer.Closure
{
	/// <summary>
	/// Remote JavaScript compilation options
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
		/// Constructs a instance of the remote JavaScript compilation options
		/// </summary>
		public RemoteJsCompilationOptions()
		{
			ExcludeDefaultExterns = false;
			Language = LanguageSpec.EcmaScript3;
		}
	}
}