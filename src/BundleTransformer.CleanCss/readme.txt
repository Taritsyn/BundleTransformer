

   --------------------------------------------------------------------------------
                 README file for Bundle Transformer: Clean-css v1.12.44

   --------------------------------------------------------------------------------

           Copyright (c) 2012-2023 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.CleanCss contains one minifier-adapter for minification of
   CSS code - `CleanCssMinifier`. `CleanCssMinifier` is based on the Clean-css
   (https://github.com/clean-css/clean-css) version 4.1.11.

   As a JS engine is used the JavaScript Engine Switcher library
   (https://github.com/Taritsyn/JavaScriptEngineSwitcher).

   =============
   RELEASE NOTES
   =============
   Enabled a SourceLink.

   ====================
   POST-INSTALL ACTIONS
   ====================
   For correct working of this module, you need to install one of the following
   NuGet packages:

    * JavaScriptEngineSwitcher.ChakraCore
    * JavaScriptEngineSwitcher.Jint
    * JavaScriptEngineSwitcher.Msie (only in the Chakra modes)
    * JavaScriptEngineSwitcher.V8

   After package is installed and JS engine is registered
   (https://github.com/Taritsyn/JavaScriptEngineSwitcher/wiki/Registration-of-JS-engines),
   need set a name of JS engine (for example, `MsieJsEngine`) to the `name`
   attribute of `/configuration/bundleTransformer/clean/jsEngine` configuration
   element in the `Web.config` file.

   To make `CleanCssMinifier` is the default CSS minifier, you need to make changes
   to the `Web.config` file. In the `defaultMinifier` attribute of
   `/configuration/bundleTransformer/core/css` element must be set value equal to
   `CleanCssMinifier`.

   =============
   DOCUMENTATION
   =============
   See documentation on GitHub - https://github.com/Taritsyn/BundleTransformer/wiki