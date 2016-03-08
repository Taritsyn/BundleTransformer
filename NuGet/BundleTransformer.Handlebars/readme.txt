

   ----------------------------------------------------------------------
           README file for Bundle Transformer: Handlebars v1.9.92

   ----------------------------------------------------------------------

      Copyright (c) 2012-2016 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.Handlebars contains translator-adapter
   `HandlebarsTranslator` (supports Handlebars (http://handlebarsjs.com)
   version 4.0.5). This adapter makes translation of Handlebars-templates
   to JS-code. Also contains debugging HTTP-handler
   `HandlebarsAssetHandler`, which is responsible for text output of
   translated Handlebars-asset.

   As a JS-engine is used the JavaScript Engine Switcher library
   (http://github.com/Taritsyn/JavaScriptEngineSwitcher). For correct
   working of this module is recommended to install one of the following
   NuGet packages: JavaScriptEngineSwitcher.Msie,
   JavaScriptEngineSwitcher.V8 or JavaScriptEngineSwitcher.ChakraCore.

   ====================
   POST-INSTALL ACTIONS
   ====================
   For correct working of this module is recommended to install one of
   the following NuGet packages: JavaScriptEngineSwitcher.Msie,
   JavaScriptEngineSwitcher.V8 or JavaScriptEngineSwitcher.ChakraCore.
   After package is installed, need set a name of JavaScript engine (for
   example, `MsieJsEngine`) to the `name` attribute of
   `/configuration/bundleTransformer/handlebars/jsEngine` configuration
   element.

   To use a debugging HTTP-handlers in the IIS Classic mode, you need add
   to the `/configuration/system.web/httpHandlers` element of the
   Web.config file a following code:

   <add
      path="*.handlebars" verb="GET"
      type="BundleTransformer.Handlebars.HttpHandlers.HandlebarsAssetHandler, BundleTransformer.Handlebars" />
   <add
      path="*.hbs" verb="GET"
      type="BundleTransformer.Handlebars.HttpHandlers.HandlebarsAssetHandler, BundleTransformer.Handlebars" />

   =============
   DOCUMENTATION
   =============
   See documentation on CodePlex -
   http://bundletransformer.codeplex.com/documentation