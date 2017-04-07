namespace BundleTransformer.CleanCss.Internal
{
	/// <summary>
	/// CSS cleaning options
	/// </summary>
	internal sealed class CleaningOptions
	{
		/// <summary>
		/// Gets or sets a compatibility mode:
		///		"*" (default) - Internet Explorer 10+ compatibility mode;
		///		"ie9" - Internet Explorer 9+ compatibility mode;
		///		"ie8" - Internet Explorer 8+ compatibility mode;
		///		"ie7" - Internet Explorer 7+ compatibility mode.
		/// </summary>
		public string Compatibility
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a output CSS formatting options
		/// </summary>
		public FormattingOptions FormattingOptions
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a optimization level
		/// </summary>
		public OptimizationLevel Level
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a level 1 optimization options
		/// </summary>
		public Level1OptimizationOptions Level1OptimizationOptions
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a level 2 optimization options
		/// </summary>
		public Level2OptimizationOptions Level2OptimizationOptions
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a severity level of errors:
		///		0 - only error messages;
		///		1 - only error messages and warnings.
		/// </summary>
		public int Severity
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of the CSS cleaning options
		/// </summary>
		public CleaningOptions()
		{
			Compatibility = "*";
			FormattingOptions = new FormattingOptions();
			Level = OptimizationLevel.One;
			Level1OptimizationOptions = new Level1OptimizationOptions();
			Level2OptimizationOptions = new Level2OptimizationOptions();
			Severity = 0;
		}
	}
}