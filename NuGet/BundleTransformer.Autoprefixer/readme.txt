

   ----------------------------------------------------------------------
           README file for Bundle Transformer: Autoprefixer 1.9.41
 
   ----------------------------------------------------------------------

      Copyright (c) 2012-2015 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.Autoprefixer contains one postprocessor-adapter for
   postprocessing of CSS-code - `AutoprefixCssPostProcessor`.
   `AutoprefixCssPostProcessor` is based on the Andrey Sitnik's
   Autoprefixer (http://github.com/postcss/autoprefixer) version 5.0.0.3.

   As a JS-engine is used the JavaScript Engine Switcher library
   (http://github.com/Taritsyn/JavaScriptEngineSwitcher). For correct
   working of this module is recommended to install the following NuGet
   packages: JavaScriptEngineSwitcher.V8 or JavaScriptEngineSwitcher.Msie
   (only in the `ChakraJsRt` mode).
   
   =============
   RELEASE NOTES
   =============
   Added support of Autoprefixer version 5.0.0.3.
   
   ====================
   POST-INSTALL ACTIONS
   ====================
   For correct working of this module is recommended to install the 
   following NuGet packages: JavaScriptEngineSwitcher.V8 or 
   JavaScriptEngineSwitcher.Msie (only in the `ChakraJsRt` mode). After 
   package is installed, need set a name of JavaScript engine (for 
   example, `V8JsEngine`) to the `name` attribute of 
   `/configuration/bundleTransformer/autoprefixer/jsEngine` configuration 
   element.
   
   To make `AutoprefixCssPostProcessor` is one of the default
   CSS-postprocessors, you need to make changes to the Web.config file.
   In the `defaultPostProcessors` attribute of
   `\configuration\bundleTransformer\core\css` element must be add
   `AutoprefixCssPostProcessor` to end of comma-separated list (for
   example, `UrlRewritingCssPostProcessor,AutoprefixCssPostProcessor`).
   
   =============
   DOCUMENTATION
   =============
   See documentation on CodePlex - 
   http://bundletransformer.codeplex.com/documentation