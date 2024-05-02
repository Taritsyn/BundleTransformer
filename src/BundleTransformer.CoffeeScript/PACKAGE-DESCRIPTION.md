BundleTransformer.CoffeeScript contains one translator-adapter - `CoffeeScriptTranslator` (supports the [CoffeeScript](https://coffeescript.org) version 2.7.0).
This adapter makes translation of CoffeeScript code to JS code.
Also contains the `CoffeeScriptAssetHandler` debugging HTTP handler, which is responsible for text output of translated CoffeeScript asset.

As a JS engine is used the [JavaScript Engine Switcher](https://github.com/Taritsyn/JavaScriptEngineSwitcher) library.
For correct working of this module, you need to install one of the following NuGet packages:

 * [JavaScriptEngineSwitcher.ChakraCore](https://www.nuget.org/packages/JavaScriptEngineSwitcher.ChakraCore)
 * [JavaScriptEngineSwitcher.Msie](https://www.nuget.org/packages/JavaScriptEngineSwitcher.Msie)
 * [JavaScriptEngineSwitcher.V8](https://www.nuget.org/packages/JavaScriptEngineSwitcher.V8)

After installing the packages, you will need to [register the default JS engine](https://github.com/Taritsyn/JavaScriptEngineSwitcher/wiki/Registration-of-JS-engines).