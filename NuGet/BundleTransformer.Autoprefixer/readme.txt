

   --------------------------------------------------------------------------------
               README file for Bundle Transformer: Autoprefixer v1.9.150

   --------------------------------------------------------------------------------

           Copyright (c) 2012-2017 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.Autoprefixer contains one postprocessor-adapter for
   postprocessing of CSS-code - `AutoprefixCssPostProcessor`.
   `AutoprefixCssPostProcessor` is based on the Andrey Sitnik's Autoprefixer
   (http://github.com/postcss/autoprefixer) version 6.7.4.

   As a JS-engine is used the JavaScript Engine Switcher library
   (http://github.com/Taritsyn/JavaScriptEngineSwitcher). For correct working of
   this module is recommended to install one of the following NuGet packages:
   JavaScriptEngineSwitcher.Msie, JavaScriptEngineSwitcher.V8 or
   JavaScriptEngineSwitcher.ChakraCore.

   =============
   RELEASE NOTES
   =============
   Added support of Autoprefixer version 6.7.4.

   ====================
   POST-INSTALL ACTIONS
   ====================
   For correct working of this module is recommended to install one of the
   following NuGet packages: JavaScriptEngineSwitcher.Msie,
   JavaScriptEngineSwitcher.V8 or JavaScriptEngineSwitcher.ChakraCore.
   After package is installed and JS-engine is registered
   (http://github.com/Taritsyn/JavaScriptEngineSwitcher/wiki/Registration-of-JS-engines),
   need set a name of JavaScript engine (for example, `MsieJsEngine`) to the `name`
   attribute of `/configuration/bundleTransformer/autoprefixer/jsEngine`
   configuration element.

   To make `AutoprefixCssPostProcessor` is one of the default CSS-postprocessors,
   you need to make changes to the Web.config file.
   In the `defaultPostProcessors` attribute of
   `\configuration\bundleTransformer\core\css` element must be add
   `AutoprefixCssPostProcessor` to end of comma-separated list (for example,
   `UrlRewritingCssPostProcessor,AutoprefixCssPostProcessor`).

   =============
   DOCUMENTATION
   =============
   See documentation on CodePlex -
   http://bundletransformer.codeplex.com/documentation