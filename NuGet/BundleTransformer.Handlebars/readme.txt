

   --------------------------------------------------------------------------------
                README file for Bundle Transformer: Handlebars v1.9.134

   --------------------------------------------------------------------------------

           Copyright (c) 2012-2016 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.Handlebars contains translator-adapter `HandlebarsTranslator`
   (supports Handlebars (http://handlebarsjs.com) version 4.0.6). This adapter
   makes translation of Handlebars-templates to JS-code. Also contains debugging
   HTTP-handler `HandlebarsAssetHandler`, which is responsible for text output of
   translated Handlebars-asset.

   As a JS-engine is used the JavaScript Engine Switcher library
   (http://github.com/Taritsyn/JavaScriptEngineSwitcher). For correct working of
   this module is recommended to install one of the following NuGet packages:
   JavaScriptEngineSwitcher.Msie, JavaScriptEngineSwitcher.V8 or
   JavaScriptEngineSwitcher.ChakraCore.

   =============
   RELEASE NOTES
   =============
   Added support of Handlebars version 4.0.6.

   ====================
   POST-INSTALL ACTIONS
   ====================
   For correct working of this module is recommended to install one of the
   following NuGet packages: JavaScriptEngineSwitcher.Msie,
   JavaScriptEngineSwitcher.V8 or JavaScriptEngineSwitcher.ChakraCore.
   After package is installed and JS-engine is registered
   (http://github.com/Taritsyn/JavaScriptEngineSwitcher/wiki/Registration-of-JS-engines),
   need set a name of JavaScript engine (for example, `MsieJsEngine`) to the `name`
   attribute of `/configuration/bundleTransformer/handlebars/jsEngine`
   configuration element.

   To use a debugging HTTP-handlers in the IIS Classic mode, you need add to the
   `/configuration/system.web/httpHandlers` element of the Web.config file a
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
   See documentation on CodePlex -
   http://bundletransformer.codeplex.com/documentation