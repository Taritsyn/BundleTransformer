

   --------------------------------------------------------------------------------
                  README file for Bundle Transformer: Packer v1.10.0

   --------------------------------------------------------------------------------

           Copyright (c) 2012-2018 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.Packer contains one minifier-adapter for minification of
   JS code - `EdwardsJsMinifier`. `EdwardsJsMinifier` is based on the Dean Edwards'
   Packer (http://dean.edwards.name/packer/) version 3.0.

   As a JS engine is used the JavaScript Engine Switcher library
   (https://github.com/Taritsyn/JavaScriptEngineSwitcher).

   =============
   RELEASE NOTES
   =============
   JavaScript Engine Switcher was updated to version 3.0.0.

   ====================
   POST-INSTALL ACTIONS
   ====================
   For correct working of this module, you need to install one of the following
   NuGet packages: JavaScriptEngineSwitcher.Msie, JavaScriptEngineSwitcher.V8 or
   JavaScriptEngineSwitcher.ChakraCore.
   After package is installed and JS engine is registered
   (https://github.com/Taritsyn/JavaScriptEngineSwitcher/wiki/Registration-of-JS-engines),
   need set a name of JS engine (for example, `MsieJsEngine`) to the `name`
   attribute of `/configuration/bundleTransformer/packer/jsEngine` configuration
   element in the `Web.config` file.

   To make `EdwardsJsMinifier` is the default JS minifier, you need to make changes
   to the `Web.config` file. In the `defaultMinifier` attribute of
   `/configuration/bundleTransformer/core/js` element must be set value equal to
   `EdwardsJsMinifier`.

   =============
   DOCUMENTATION
   =============
   See documentation on GitHub - https://github.com/Taritsyn/BundleTransformer/wiki