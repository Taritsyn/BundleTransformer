BundleTransformer.CleanCss contains one minifier-adapter for minification of CSS code - `CleanCssMinifier`.
`CleanCssMinifier` is based on the [Clean-css](https://github.com/clean-css/clean-css) version 4.1.11.

As a JS engine is used the [JavaScript Engine Switcher](https://github.com/Taritsyn/JavaScriptEngineSwitcher) library.
For correct working of this module, you need to install one of the following NuGet packages:

 * [JavaScriptEngineSwitcher.ChakraCore](https://www.nuget.org/packages/JavaScriptEngineSwitcher.ChakraCore)
 * [JavaScriptEngineSwitcher.Msie](https://www.nuget.org/packages/JavaScriptEngineSwitcher.Msie)
 * [JavaScriptEngineSwitcher.V8](https://www.nuget.org/packages/JavaScriptEngineSwitcher.V8)

After installing the packages, you will need to [register the default JS engine](https://github.com/Taritsyn/JavaScriptEngineSwitcher/wiki/Registration-of-JS-engines).