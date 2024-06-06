BundleTransformer.SassAndScss contains one translator-adapter - `SassAndScssTranslator`.
This adapter makes translation of Sass and SCSS code to CSS code by using the [Dart Sass Host for .NET](https://github.com/Taritsyn/DartSassHost) version 1.0.13 (supports the [Dart Sass](https://github.com/sass/dart-sass) version 1.77.4).
Also contains the `SassAndScssAssetHandler` debugging HTTP handler, which is responsible for text output of translated Sass or SCSS asset.

As a JS engine is used the [JavaScript Engine Switcher](https://github.com/Taritsyn/JavaScriptEngineSwitcher) library.
For correct working of this module, you need to install one of the following NuGet packages:

 * [JavaScriptEngineSwitcher.ChakraCore](https://www.nuget.org/packages/JavaScriptEngineSwitcher.ChakraCore)
 * [JavaScriptEngineSwitcher.Jint](https://www.nuget.org/packages/JavaScriptEngineSwitcher.Jint)
 * [JavaScriptEngineSwitcher.Msie](https://www.nuget.org/packages/JavaScriptEngineSwitcher.Msie) (only in the Chakra “Edge” JsRT mode)
 * [JavaScriptEngineSwitcher.V8](https://www.nuget.org/packages/JavaScriptEngineSwitcher.V8)

After installing the packages, you will need to [register the default JS engine](https://github.com/Taritsyn/JavaScriptEngineSwitcher/wiki/Registration-of-JS-engines).