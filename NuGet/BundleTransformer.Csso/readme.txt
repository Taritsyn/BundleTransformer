

   --------------------------------------------------------------------------------
                   README file for Bundle Transformer: CSSO v1.9.144

   --------------------------------------------------------------------------------

           Copyright (c) 2012-2017 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.Csso contains one minifier-adapter for minification of
   CSS-code - `KryzhanovskyCssMinifier`. `KryzhanovskyCssMinifier` is based on the
   Sergey Kryzhanovsky's CSSO (https://github.com/css/csso) version 2.3.1.

   As a JS-engine is used the JavaScript Engine Switcher library
   (https://github.com/Taritsyn/JavaScriptEngineSwitcher). For correct working of
   this module is recommended to install one of the following NuGet packages:
   JavaScriptEngineSwitcher.Msie (only in the Chakra JsRT modes),
   JavaScriptEngineSwitcher.V8 or JavaScriptEngineSwitcher.ChakraCore.

   =============
   RELEASE NOTES
   =============
   Added support of CSSO version 2.3.1.

   ====================
   POST-INSTALL ACTIONS
   ====================
   For correct working of this module is recommended to install one of the
   following NuGet packages: JavaScriptEngineSwitcher.Msie (only in the Chakra JsRT
   modes), JavaScriptEngineSwitcher.V8 or JavaScriptEngineSwitcher.ChakraCore.
   After package is installed and JS-engine is registered
   (https://github.com/Taritsyn/JavaScriptEngineSwitcher/wiki/Registration-of-JS-engines),
   need set a name of JavaScript engine (for example, `MsieJsEngine`) to the `name`
   attribute of `/configuration/bundleTransformer/csso/jsEngine` configuration
   element.

   To make `KryzhanovskyCssMinifier` is the default CSS-minifier, you need to make
   changes to the Web.config file. In the `defaultMinifier` attribute of
   `\configuration\bundleTransformer\core\css` element must be set value equal to
   `KryzhanovskyCssMinifier`.

   =============
   DOCUMENTATION
   =============
   See documentation on GitHub - https://github.com/Taritsyn/BundleTransformer/wiki