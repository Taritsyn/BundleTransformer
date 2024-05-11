BundleTransformer.Less contains one translator-adapter - `LessTranslator` (supports the [LESS](https://lesscss.org) version 3.9.0).
This adapter makes translation of LESS code to CSS code.
Also contains the `LessAssetHandler` debugging HTTP handler, which is responsible for text output of translated LESS asset.

BundleTransformer.Less does not support loading of plugins.

As a JS engine is used the [JavaScript Engine Switcher](https://github.com/Taritsyn/JavaScriptEngineSwitcher) library.
For correct working of this module, you need to install one of the following NuGet packages:

 * [JavaScriptEngineSwitcher.ChakraCore](https://www.nuget.org/packages/JavaScriptEngineSwitcher.ChakraCore)
 * [JavaScriptEngineSwitcher.Jint](https://www.nuget.org/packages/JavaScriptEngineSwitcher.Jint)
 * [JavaScriptEngineSwitcher.Msie](https://www.nuget.org/packages/JavaScriptEngineSwitcher.Msie) (only in the Chakra modes)
 * [JavaScriptEngineSwitcher.V8](https://www.nuget.org/packages/JavaScriptEngineSwitcher.V8)

After installing the packages, you will need to [register the default JS engine](https://github.com/Taritsyn/JavaScriptEngineSwitcher/wiki/Registration-of-JS-engines).