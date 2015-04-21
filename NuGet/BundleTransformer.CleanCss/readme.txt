

   ----------------------------------------------------------------------
             README file for Bundle Transformer: Clean-css 1.9.59
 
   ----------------------------------------------------------------------

      Copyright (c) 2012-2015 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.CleanCss contains one minifier-adapter for 
   minification of CSS-code - `CleanCssMinifier`. `CleanCssMinifier` is 
   based on the Clean-css (http://github.com/jakubpawlowicz/clean-css)
   version 3.2.2.
   
   As a JS-engine is used the JavaScript Engine Switcher library 
   (http://github.com/Taritsyn/JavaScriptEngineSwitcher). For correct 
   working of this module is recommended to install the following 
   NuGet packages: JavaScriptEngineSwitcher.V8 or 
   JavaScriptEngineSwitcher.Msie (only in the `ChakraJsRt` mode).
   
   =============
   RELEASE NOTES
   =============
   Added support of Clean-css version 3.2.2.

   ====================
   POST-INSTALL ACTIONS
   ====================
   For correct working of this module is recommended to install the 
   following NuGet packages: JavaScriptEngineSwitcher.V8 or 
   JavaScriptEngineSwitcher.Msie (only in the `ChakraJsRt` mode). After 
   package is installed, need set a name of JavaScript engine (for 
   example, `V8JsEngine`) to the `name` attribute of 
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