

   --------------------------------------------------------------------------------
              README file for Bundle Transformer: Sass and SCSS v1.15.3

   --------------------------------------------------------------------------------

           Copyright (c) 2012-2025 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.SassAndScss contains one translator-adapter -
   `SassAndScssTranslator`. This adapter makes translation of Sass and SCSS code to
   CSS code by using the Dart Sass Host for .NET
   (https://github.com/Taritsyn/DartSassHost) version 1.1.0 (supports the Dart Sass
   (https://github.com/sass/dart-sass) version 1.83.4). Also contains the
   `SassAndScssAssetHandler` debugging HTTP handler, which is responsible for text
   output of translated Sass or SCSS asset.

   As a JS engine is used the JavaScript Engine Switcher library
   (https://github.com/Taritsyn/JavaScriptEngineSwitcher).

   =============
   RELEASE NOTES
   =============
   1. Added support for the Dart Sass version 1.83.4;
   2. In configuration settings of the Sass and SCSS translator was added four new
      properties: `FatalDeprecations` (default empty string), `FutureDeprecations`
     (default empty string), `QuietDependencies` (default `false`) and
     `SilenceDeprecations` (default empty string).

   ====================
   POST-INSTALL ACTIONS
   ====================
   For correct working of this module, you need to install one of the following
   NuGet packages:

    * JavaScriptEngineSwitcher.ChakraCore
    * JavaScriptEngineSwitcher.Jint
    * JavaScriptEngineSwitcher.Msie (only in the Chakra “Edge” JsRT mode)
    * JavaScriptEngineSwitcher.V8

   After package is installed and JS engine is registered
   (https://github.com/Taritsyn/JavaScriptEngineSwitcher/wiki/Registration-of-JS-engines),
   need set a name of JS engine (for example, `MsieJsEngine`) to the `name`
   attribute of `/configuration/bundleTransformer/sassAndScss/jsEngine`
   configuration element in the `Web.config` file.

   To use a debugging HTTP handlers in the IIS Classic mode, you need add to the
   `/configuration/system.web/httpHandlers` element of the `Web.config` file a
   following code:

   <add
	path="*.sass" verb="GET"
	type="BundleTransformer.SassAndScss.HttpHandlers.SassAndScssAssetHandler, BundleTransformer.SassAndScss" />
   <add
	path="*.scss" verb="GET"
	type="BundleTransformer.SassAndScss.HttpHandlers.SassAndScssAssetHandler, BundleTransformer.SassAndScss" />

   =============
   DOCUMENTATION
   =============
   See documentation on GitHub - https://github.com/Taritsyn/BundleTransformer/wiki