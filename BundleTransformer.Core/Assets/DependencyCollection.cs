namespace BundleTransformer.Core.Assets
{
	using System.Collections.Generic;
	using System.Linq;

	/// <summary>
	/// List of dependencies
	/// </summary>
	public sealed class DependencyCollection : List<Dependency>
	{
		/// <summary>
		/// Determines whether the list of dependencies contains the specified URL
		/// </summary>
		/// <param name="url">URL of dependency</param>
		/// <returns>Result of checking (true – contains; false – not contains)</returns>
		public bool ContainsUrl(string url)
		{
			string urlInUpperCase = url.ToUpperInvariant();
			bool result = (this.Count(d => d.Url.ToUpperInvariant() == urlInUpperCase) > 0);

			return result;
		}

		/// <summary>
		/// Gets a dependency by URL
		/// </summary>
		/// <param name="url">URL of dependency</param>
		/// <returns>Dependency</returns>
		public Dependency GetByUrl(string url)
		{
			string urlInUpperCase = url.ToUpperInvariant();
			Dependency dependency = this.SingleOrDefault(d => d.Url.ToUpperInvariant() == urlInUpperCase);

			return dependency;
		}
	}
}