BundleTransformer.TypeScript contains one translator-adapter - `TypeScriptTranslator` (supports the [TypeScript](https://www.typescriptlang.org) version 5.4.5).
This adapter makes translation of TypeScript code to JS code.
Also contains the `TypeScriptAssetHandler` debugging HTTP handler, which is responsible for text output of translated TypeScript asset.

BundleTransformer.TypeScript does not support external modules (CommonJS, AMD, SystemJS, UMD and ES6 modules).

As a JS engine is used the [JavaScript Engine Switcher](https://github.com/Taritsyn/JavaScriptEngineSwitcher) library.
For correct working of this module, you need to install one of the following NuGet packages:

 * [JavaScriptEngineSwitcher.ChakraCore](https://www.nuget.org/packages/JavaScriptEngineSwitcher.ChakraCore)
 * [JavaScriptEngineSwitcher.Jint](https://www.nuget.org/packages/JavaScriptEngineSwitcher.Jint)
 * [JavaScriptEngineSwitcher.Msie](https://www.nuget.org/packages/JavaScriptEngineSwitcher.Msie) (only in the Chakra modes)
 * [JavaScriptEngineSwitcher.V8](https://www.nuget.org/packages/JavaScriptEngineSwitcher.V8)

After installing the packages, you will need to register the default JS engine (https://github.com/Taritsyn/JavaScriptEngineSwitcher/wiki/Registration-of-JS-engines).