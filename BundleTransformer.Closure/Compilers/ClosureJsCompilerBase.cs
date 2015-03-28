namespace BundleTransformer.Closure.Compilers
{
	using Core.Assets;

	/// <summary>
	/// Base class of Closure Compiler
	/// </summary>
	internal abstract class ClosureJsCompilerBase
	{
		/// <summary>
		/// List of common JS-externs dependencies
		/// </summary>
		protected readonly DependencyCollection _commonExternsDependencies;


		/// <summary>
		/// Constructs a instance of Closure Compiler
		/// </summary>
		/// <param name="commonExternsDependencies">List of common JS-externs dependencies</param>
		protected ClosureJsCompilerBase(DependencyCollection commonExternsDependencies)
		{
			_commonExternsDependencies = commonExternsDependencies;
		}
	}
}