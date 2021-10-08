

   --------------------------------------------------------------------------------
               README file for Bundle Transformer: CoffeeScript v1.12.40

   --------------------------------------------------------------------------------

           Copyright (c) 2012-2021 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.CoffeeScript contains one translator-adapter -
   `CoffeeScriptTranslator` (supports the CoffeeScript (http://coffeescript.org)
   version 2.6.1). This adapter makes translation of CoffeeScript code to JS code.
   Also contains the `CoffeeScriptAssetHandler` debugging HTTP handler, which is
   responsible for text output of translated CoffeeScript asset.

   As a JS engine is used the JavaScript Engine Switcher library
   (https://github.com/Taritsyn/JavaScriptEngineSwitcher).

   =============
   RELEASE NOTES
   =============
   Added support of CoffeeScript version 2.6.1.

   ====================
   POST-INSTALL ACTIONS
   ====================
   For correct working of this module, you need to install one of the following
   NuGet packages: JavaScriptEngineSwitcher.Msie, JavaScriptEngineSwitcher.V8 or
   JavaScriptEngineSwitcher.ChakraCore.
   After package is installed and JS engine is registered
   (https://github.com/Taritsyn/JavaScriptEngineSwitcher/wiki/Registration-of-JS-engines),
   need set a name of JS engine (for example, `MsieJsEngine`) to the `name`
   attribute of `/configuration/bundleTransformer/coffeeScript/jsEngine`
   configuration element in the `Web.config` file.

   To use a debugging HTTP handlers in the IIS Classic mode, you need add to the
   `/configuration/system.web/httpHandlers` element of the `Web.config` file a
   following code:

   <add
	path="*.coffee" verb="GET"
	type="BundleTransformer.CoffeeScript.HttpHandlers.CoffeeScriptAssetHandler, BundleTransformer.CoffeeScript" />
   <add
	path="*.litcoffee" verb="GET"
	type="BundleTransformer.CoffeeScript.HttpHandlers.CoffeeScriptAssetHandler, BundleTransformer.CoffeeScript" />
   <add
	path="*.coffee.md" verb="GET"
	type="BundleTransformer.CoffeeScript.HttpHandlers.CoffeeScriptAssetHandler, BundleTransformer.CoffeeScript" />

   =============
   DOCUMENTATION
   =============
   See documentation on GitHub - https://github.com/Taritsyn/BundleTransformer/wiki