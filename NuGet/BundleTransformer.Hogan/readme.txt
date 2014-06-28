

   ----------------------------------------------------------------------
              README file for Bundle Transformer: Hogan 1.0.0

   ----------------------------------------------------------------------

          Copyright 2014 Andrey Taritsyn - http://www.taritsyn.ru
		  

   ===========
   DESCRIPTION
   ===========
   BundleTransformer.Hogan contains translator-adapter `HoganTranslator`
   (supports Hogan (http://twitter.github.io/hogan.js) version 3.0.2).
   This adapter makes translation of Mustache-templates to JS-code. Also
   contains debugging HTTP-handler `HoganAssetHandler`, which is
   responsible for text output of translated Mustache-asset.
   
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
   attribute of `/configuration/bundleTransformer/hogan/jsEngine` 
   configuration element.
   
   To use a debugging HTTP-handlers in the IIS Classic mode, you need add
   to the `/configuration/system.web/httpHandlers` element of the 
   Web.config file a following code:
   
   <add
      path="*.mustache" verb="GET"
      type="BundleTransformer.Hogan.HttpHandlers.HoganAssetHandler, BundleTransformer.Hogan" />
   
   =============
   DOCUMENTATION
   =============
   See documentation on CodePlex - 
   http://bundletransformer.codeplex.com/documentation