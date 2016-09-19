

   ----------------------------------------------------------------------
           README file for Bundle Transformer: Clean-css v1.9.122

   ----------------------------------------------------------------------

      Copyright (c) 2012-2016 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.CleanCss contains one minifier-adapter for
   minification of CSS-code - `CleanCssMinifier`. `CleanCssMinifier` is
   based on the Clean-css (http://github.com/jakubpawlowicz/clean-css)
   version 3.4.19.

   As a JS-engine is used the JavaScript Engine Switcher library
   (http://github.com/Taritsyn/JavaScriptEngineSwitcher). For correct
   working of this module is recommended to install the following
   NuGet packages: JavaScriptEngineSwitcher.Msie,
   JavaScriptEngineSwitcher.V8 or JavaScriptEngineSwitcher.ChakraCore.

   =============
   RELEASE NOTES
   =============
   JavaScript Engine Switcher was updated to version 2.0.0.

   ====================
   POST-INSTALL ACTIONS
   ====================
   For correct working of this module is recommended to install the
   following NuGet packages: JavaScriptEngineSwitcher.Msie,
   JavaScriptEngineSwitcher.V8 or JavaScriptEngineSwitcher.ChakraCore.
   After package is installed, need set a name of JavaScript engine (for
   example, `MsieJsEngine`) to the `name` attribute of
   `/configuration/bundleTransformer/clean/jsEngine` configuration
   element.

   To make `CleanCssMinifier` is the default CSS-minifier, you need
   to make changes to the Web.config file. In the `defaultMinifier`
   attribute of `\configuration\bundleTransformer\core\css` element must
   be set value equal to `CleanCssMinifier`.

   =============
   DOCUMENTATION
   =============
   See documentation on CodePlex -
   http://bundletransformer.codeplex.com/documentation