BundleTransformer.Autoprefixer contains one postprocessor-adapter for postprocessing of CSS code - `AutoprefixCssPostProcessor`.
This adapter makes actualization of vendor prefixes in CSS code by using the [Autoprefixer Host for .NET](https://github.com/Taritsyn/AutoprefixerHost) version 3.0.35 (supports the Andrey Sitnik's [Autoprefixer](https://github.com/postcss/autoprefixer) version 10.4.19.0).

As a JS engine is used the [JavaScript Engine Switcher](https://github.com/Taritsyn/JavaScriptEngineSwitcher) library.
For correct working of this module, you need to install one of the following NuGet packages:

 * [JavaScriptEngineSwitcher.ChakraCore](https://www.nuget.org/packages/JavaScriptEngineSwitcher.ChakraCore)
 * [JavaScriptEngineSwitcher.Jint](https://www.nuget.org/packages/JavaScriptEngineSwitcher.Jint)
 * [JavaScriptEngineSwitcher.Msie](https://www.nuget.org/packages/JavaScriptEngineSwitcher.Msie) (only in the Chakra JsRT modes)
 * [JavaScriptEngineSwitcher.V8](https://www.nuget.org/packages/JavaScriptEngineSwitcher.V8)

After installing the packages, you will need to [register the default JS engine](https://github.com/Taritsyn/JavaScriptEngineSwitcher/wiki/Registration-of-JS-engines).