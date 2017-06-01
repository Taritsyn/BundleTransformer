

   --------------------------------------------------------------------------------
                  README file for Bundle Transformer: Hogan v1.9.138

   --------------------------------------------------------------------------------

           Copyright (c) 2012-2016 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.Hogan contains translator-adapter `HoganTranslator` (supports
   Hogan (http://twitter.github.io/hogan.js) version 3.0.2). This adapter makes
   translation of Mustache-templates to JS-code. Also contains debugging
   HTTP-handler `HoganAssetHandler`, which is responsible for text output of
   translated Mustache-asset.

   As a JS-engine is used the JavaScript Engine Switcher library
   (https://github.com/Taritsyn/JavaScriptEngineSwitcher). For correct working of
   this module is recommended to install one of the following NuGet packages:
   JavaScriptEngineSwitcher.Msie, JavaScriptEngineSwitcher.V8 or
   JavaScriptEngineSwitcher.ChakraCore.

   =============
   RELEASE NOTES
   =============
   Now all calls of the `ExecuteResource` method takes the assembly as second
   parameter.

   ====================
   POST-INSTALL ACTIONS
   ====================
   For correct working of this module is recommended to install one of the
   following NuGet packages: JavaScriptEngineSwitcher.Msie,
   JavaScriptEngineSwitcher.V8 or JavaScriptEngineSwitcher.ChakraCore.
   After package is installed and JS-engine is registered
   (https://github.com/Taritsyn/JavaScriptEngineSwitcher/wiki/Registration-of-JS-engines),
   need set a name of JavaScript engine (for example, `MsieJsEngine`) to the `name`
   attribute of `/configuration/bundleTransformer/hogan/jsEngine` configuration
   element.

   To use a debugging HTTP-handlers in the IIS Classic mode, you need add to the
   `/configuration/system.web/httpHandlers` element of the Web.config file a
   following code:

   <add
      path="*.mustache" verb="GET"
      type="BundleTransformer.Hogan.HttpHandlers.HoganAssetHandler, BundleTransformer.Hogan" />

   =============
   DOCUMENTATION
   =============
   See documentation on GitHub - https://github.com/Taritsyn/BundleTransformer/wiki