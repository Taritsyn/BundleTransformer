

   ----------------------------------------------------------------------
       README file for Bundle Transformer: CoffeeScript 1.9.0 Beta 3

   ----------------------------------------------------------------------

          Copyright 2014 Andrey Taritsyn - http://www.taritsyn.ru
		  

   ===========
   DESCRIPTION
   ===========
   BundleTransformer.CoffeeScript contains translator-adapter 
   `CoffeeScriptTranslator` (supports CoffeeScript (http://coffeescript.org) 
   version 1.7.1). This adapter makes translation of CoffeeScript-code 
   to JS-code. Also contains debugging HTTP-handler 
   `CoffeeScriptAssetHandler`, which is responsible for text output of 
   translated CoffeeScript-asset.
   
   As a JS-engine is used the JavaScript Engine Switcher library 
   (http://github.com/Taritsyn/JavaScriptEngineSwitcher). For correct 
   working of this module is recommended to install one of the following 
   NuGet packages: JavaScriptEngineSwitcher.Msie or 
   JavaScriptEngineSwitcher.V8.
   
   ====================
   POST-INSTALL ACTIONS
   ====================
   For correct working of this module is recommended to install one of 
   the following NuGet packages: JavaScriptEngineSwitcher.Msie or 
   JavaScriptEngineSwitcher.V8. After package is installed, need set a 
   name of JavaScript engine (for example, `MsieJsEngine`) to the `name`
   attribute of `/configuration/bundleTransformer/coffeeScript/jsEngine` 
   configuration element.
   
   To use a debugging HTTP-handlers in the IIS Classic mode, you need add
   to the `/configuration/system.web/httpHandlers` element of the 
   Web.config file a following code:
   
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
   See documentation on CodePlex - 
   http://bundletransformer.codeplex.com/documentation