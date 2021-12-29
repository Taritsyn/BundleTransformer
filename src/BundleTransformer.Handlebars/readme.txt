

   --------------------------------------------------------------------------------
                README file for Bundle Transformer: Handlebars v1.12.31

   --------------------------------------------------------------------------------

           Copyright (c) 2012-2021 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.Handlebars contains one translator-adapter -
   `HandlebarsTranslator` (supports the Handlebars (http://handlebarsjs.com)
   version 4.7.7). This adapter makes translation of Handlebars templates to JS
   code. Also contains the `HandlebarsAssetHandler` debugging HTTP handler, which
   is responsible for text output of translated Handlebars asset.

   As a JS engine is used the JavaScript Engine Switcher library
   (https://github.com/Taritsyn/JavaScriptEngineSwitcher).

   =============
   RELEASE NOTES
   =============
   Fixed a concurrency errors that occur during initialization.

   ====================
   POST-INSTALL ACTIONS
   ====================
   For correct working of this module, you need to install one of the following
   NuGet packages: JavaScriptEngineSwitcher.Msie, JavaScriptEngineSwitcher.V8 or
   JavaScriptEngineSwitcher.ChakraCore.
   After package is installed and JS engine is registered
   (https://github.com/Taritsyn/JavaScriptEngineSwitcher/wiki/Registration-of-JS-engines),
   need set a name of JS engine (for example, `MsieJsEngine`) to the `name`
   attribute of `/configuration/bundleTransformer/handlebars/jsEngine`
   configuration element in the `Web.config` file.

   To use a debugging HTTP handlers in the IIS Classic mode, you need add to the
   `/configuration/system.web/httpHandlers` element of the `Web.config` file a
   following code:

   <add
      path="*.handlebars" verb="GET"
      type="BundleTransformer.Handlebars.HttpHandlers.HandlebarsAssetHandler, BundleTransformer.Handlebars" />
   <add
      path="*.hbs" verb="GET"
      type="BundleTransformer.Handlebars.HttpHandlers.HandlebarsAssetHandler, BundleTransformer.Handlebars" />

   =============
   DOCUMENTATION
   =============
   See documentation on GitHub - https://github.com/Taritsyn/BundleTransformer/wiki