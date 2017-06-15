

   --------------------------------------------------------------------------------
                   README file for Bundle Transformer: LESS v1.9.160

   --------------------------------------------------------------------------------

           Copyright (c) 2012-2017 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.Less contains one translator-adapter - `LessTranslator`
   (supports the LESS (http://lesscss.org) version 2.7.2). This adapter makes
   translation of LESS code to CSS code. Also contains the `LessAssetHandler`
   debugging HTTP handler, which is responsible for text output of translated LESS
   asset.

   BundleTransformer.Less does not support loading of plugins.

   As a JS engine is used the JavaScript Engine Switcher library
   (https://github.com/Taritsyn/JavaScriptEngineSwitcher).

   ====================
   POST-INSTALL ACTIONS
   ====================
   For correct working of this module, you need to install one of the following
   NuGet packages: JavaScriptEngineSwitcher.Msie, JavaScriptEngineSwitcher.V8 or
   JavaScriptEngineSwitcher.ChakraCore.
   After package is installed and JS engine is registered
   (https://github.com/Taritsyn/JavaScriptEngineSwitcher/wiki/Registration-of-JS-engines),
   need set a name of JS engine (for example, `MsieJsEngine`) to the `name` 
   attribute of `/configuration/bundleTransformer/less/jsEngine` configuration
   element in the `Web.config` file.

   To use a debugging HTTP handler in the IIS Classic mode, you need add to the
   `/configuration/system.web/httpHandlers` element of the `Web.config` file a
   following code:

   <add
	path="*.less" verb="GET"
	type="BundleTransformer.Less.HttpHandlers.LessAssetHandler, BundleTransformer.Less" />

   =============
   DOCUMENTATION
   =============
   See documentation on GitHub - https://github.com/Taritsyn/BundleTransformer/wiki