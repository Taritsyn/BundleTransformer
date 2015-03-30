namespace BundleTransformer.Core.Helpers
{
	/// <summary>
	/// Interval
	/// </summary>
	internal struct Interval
	{
		/// <summary>
		/// Start value
		/// </summary>
		private int _start;

		/// <summary>
		/// End value
		/// </summary>
		private int _end;

		/// <summary>
		/// Gets or sets a start value
		/// </summary>
		public int Start
		{
			get { return _start; }
			set { _start = value; }
		}

		/// <summary>
		/// Gets or sets a end value
		/// </summary>
		public int EndPosition
		{
			get { return _end; }
			set { _end = value; }
		}


		/// <summary>
		/// Constructs a instance of interval
		/// </summary>
		/// <param name="start">Start value</param>
		/// <param name="end">End value</param>
		public Interval(int start, int end)
		{
			_start = start;
			_end = end;
		}


		/// <summary>
		/// Checks whether a value is included in the interval
		/// </summary>
		/// <param name="value">Value</param>
		/// <returns>Result of check (true - is included; false - is not included)</returns>
		public bool IsIncluded(int value)
		{
			bool result = (value >= _start && value <= _end);

			return result;
		}
	}
}