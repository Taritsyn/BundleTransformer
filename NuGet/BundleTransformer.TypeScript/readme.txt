

   ----------------------------------------------------------------------
            README file for Bundle Transformer: TypeScript 1.9.24

   ----------------------------------------------------------------------

          Copyright 2014 Andrey Taritsyn - http://www.taritsyn.ru
		  

   ===========
   DESCRIPTION
   ===========
   BundleTransformer.TypeScript contains translator-adapter 
   `TypeScriptTranslator` (supports TypeScript
   (http://www.typescriptlang.org) version 1.1 CTP). This adapter makes 
   translation of TypeScript-code to JS-code. Also contains debugging
   HTTP-handler `TypeScriptAssetHandler`, which is responsible for text 
   output of translated TypeScript-asset.
       
   BundleTransformer.TypeScript does not support external modules 
   (CommonJS and AMD modules).
   
   As a JS-engine is used the JavaScript Engine Switcher library 
   (http://github.com/Taritsyn/JavaScriptEngineSwitcher). For correct 
   working of this module is recommended to install one of the following 
   NuGet packages: JavaScriptEngineSwitcher.Msie or 
   JavaScriptEngineSwitcher.V8.
   
   =============
   RELEASE NOTES
   =============
   1. Added support of TypeScript version 1.1 CTP (please note: 
      The 1.1 CTP release is also called '1.1.0.1');
   2. From configuration settings of TypeScript-translator removed two
      properties - `PropagateEnumConstants` and `AllowAutomaticSemicolonInsertion`.
   
   ====================
   POST-INSTALL ACTIONS
   ====================
   For correct working of this module is recommended to install one of 
   the following NuGet packages: JavaScriptEngineSwitcher.Msie or 
   JavaScriptEngineSwitcher.V8. After package is installed, need set a 
   name of JavaScript engine (for example, `MsieJsEngine`) to the `name`
   attribute of `/configuration/bundleTransformer/typeScript/jsEngine` 
   configuration element.
   
   To use a debugging HTTP-handler in the IIS Classic mode, you need add
   to the `/configuration/system.web/httpHandlers` element of the 
   Web.config file a following code:
   
   <add
	path="*.ts" verb="GET"
	type="BundleTransformer.TypeScript.HttpHandlers.TypeScriptAssetHandler, BundleTransformer.TypeScript" />

   =============
   DOCUMENTATION
   =============
   See documentation on CodePlex - 
   http://bundletransformer.codeplex.com/documentation