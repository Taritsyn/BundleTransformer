

   --------------------------------------------------------------------------------
                README file for Bundle Transformer: TypeScript v1.12.17

   --------------------------------------------------------------------------------

           Copyright (c) 2012-2020 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.TypeScript contains one translator-adapter -
   `TypeScriptTranslator` (supports the TypeScript (http://www.typescriptlang.org)
   version 3.9.7). This adapter makes translation of TypeScript code to JS code.
   Also contains the `TypeScriptAssetHandler` debugging HTTP handler, which is
   responsible for text output of translated TypeScript asset.

   BundleTransformer.TypeScript does not support external modules (CommonJS, AMD,
   SystemJS, UMD and ES6 modules).

   As a JS engine is used the JavaScript Engine Switcher library
   (https://github.com/Taritsyn/JavaScriptEngineSwitcher).

   =============
   RELEASE NOTES
   =============
   Added support of the TypeScript version 3.9.7.

   ====================
   POST-INSTALL ACTIONS
   ====================
   For correct working of this module, you need to install one of the following
   NuGet packages: JavaScriptEngineSwitcher.Msie (only in the Chakra “Edge” JsRT
   mode), JavaScriptEngineSwitcher.V8 or JavaScriptEngineSwitcher.ChakraCore.
   After package is installed and JS engine is registered
   (https://github.com/Taritsyn/JavaScriptEngineSwitcher/wiki/Registration-of-JS-engines),
   need set a name of JS engine (for example, `MsieJsEngine`) to the `name`
   attribute of `/configuration/bundleTransformer/typeScript/jsEngine` configuration
   element in the `Web.config` file.

   To use a debugging HTTP handler in the IIS Classic mode, you need add to the
   `/configuration/system.web/httpHandlers` element of the `Web.config` file a
   following code:

   <add
	path="*.ts" verb="GET"
	type="BundleTransformer.TypeScript.HttpHandlers.TypeScriptAssetHandler, BundleTransformer.TypeScript" />

   =============
   DOCUMENTATION
   =============
   See documentation on GitHub - https://github.com/Taritsyn/BundleTransformer/wiki