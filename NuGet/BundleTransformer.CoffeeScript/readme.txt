

   ----------------------------------------------------------------------
           README file for Bundle Transformer: CoffeeScript 1.8.7

   ----------------------------------------------------------------------

          Copyright 2013 Andrey Taritsyn - http://www.taritsyn.ru
		  

   ===========
   DESCRIPTION
   ===========
   BundleTransformer.CoffeeScript contains translator-adapter 
   `CoffeeScriptTranslator` (supports CoffeeScript (http://coffeescript.org) 
   version 1.6.3). This adapter makes translation of CoffeeScript-code 
   to JS-code. Also contains debugging HTTP-handler 
   `CoffeeScriptAssetHandler`, which is responsible for text output of 
   translated CoffeeScript-asset.
   
   As a JS-engine is used the JavaScript Engine Switcher library 
   (http://github.com/Taritsyn/JavaScriptEngineSwitcher). For correct 
   working of this module is recommended to install one of the following 
   NuGet packages: JavaScriptEngineSwitcher.Msie or 
   JavaScriptEngineSwitcher.V8.
   
   =============
   RELEASE NOTES
   =============
   CoffeeScript was updated to commit 581af4540a.
   
   ====================
   POST-INSTALL ACTIONS
   ====================
   For correct working of this module is recommended to install one of 
   the following NuGet packages: JavaScriptEngineSwitcher.Msie or 
   JavaScriptEngineSwitcher.V8. After package is installed, need set a 
   name of JavaScript engine (for example, `MsieJsEngine`) to the `name`
   attribute of `/configuration/bundleTransformer/coffeeScript/jsEngine` 
   configuration element.   
   
   =============
   DOCUMENTATION
   =============
   See documentation on CodePlex - 
   http://bundletransformer.codeplex.com/documentation