namespace BundleTransformer.Tests
{
	public class ApplicationSetupFixture
	{
		public ApplicationSetupFixture()
		{
			JsEngineSwitcherInitializer.Initialize();
			BundleTransformerContextInitializer.Initialize();
		}
	}
}