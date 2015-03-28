namespace BundleTransformer.Closure.Compilers
{
	using System.Diagnostics;
	using System.Text;

	/// <summary>
	/// Builds a text content from standard streams
	/// </summary>
	internal sealed class StdContentBuilder
	{
		/// <summary>
		/// Text content builder
		/// </summary>
		private readonly StringBuilder _result = new StringBuilder();

		/// <summary>
		/// Synchronizer
		/// </summary>
		private readonly object _synchronizer = new object();

		/// <summary>
		/// Gets a text content
		/// </summary>
		public string Content
		{
			get
			{
				lock (_synchronizer)
				{
					return _result.ToString();
				}
			}
		}


		/// <summary>
		/// Implements the method that will handle the
		/// <see cref="System.Diagnostics.Process.OutputDataReceived"/> event or
		/// <see cref="System.Diagnostics.Process.ErrorDataReceived"/> event of a
		/// <see cref="System.Diagnostics.Process"/>
		/// </summary>
		/// <param name="sender">Source of the event</param>
		/// <param name="e">A <see cref="System.Diagnostics.DataReceivedEventArgs"/>
		/// that contains the event data</param>
		public void OnDataReceived(object sender, DataReceivedEventArgs e)
		{
			if (e.Data != null)
			{
				lock (_synchronizer)
				{
					_result.AppendLine(e.Data);
				}
			}
		}
	}
}