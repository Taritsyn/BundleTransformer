namespace BundleTransformer.Packer.Internal
{
	/// <summary>
	/// JS packing options
	/// </summary>
	internal sealed class PackingOptions
	{
		/// <summary>
		/// Gets or sets a flag for whether to shrink variables
		/// </summary>
		public bool ShrinkVariables
		{
			get;
			set;
		}

		/// <summary>
		/// Gets or sets a flag for whether to Base62 encode
		/// </summary>
		public bool Base62Encode
		{
			get;
			set;
		}


		/// <summary>
		/// Constructs a instance of the JS packing options
		/// </summary>
		public PackingOptions()
		{
			ShrinkVariables = true;
			Base62Encode = false;
		}
	}
}