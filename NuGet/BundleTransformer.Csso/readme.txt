

   ----------------------------------------------------------------------
              README file for Bundle Transformer: CSSO 1.8.7
 
   ----------------------------------------------------------------------

          Copyright 2013 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.Csso contains one minifier-adapter for 
   minification of CSS-code - `KryzhanovskyCssMinifier`. 
   `KryzhanovskyCssMinifier` is based on the Sergey Kryzhanovsky's 
   CSSO (http://github.com/css/csso) version 1.3.9.
   
   As a JS-engine is used the JavaScript Engine Switcher library 
   (http://github.com/Taritsyn/JavaScriptEngineSwitcher). For correct 
   working of this module is recommended to install the following 
   NuGet package - JavaScriptEngineSwitcher.V8.
   
   =============
   RELEASE NOTES
   =============
   Added support of CSSO version 1.3.9.
   
   ====================
   POST-INSTALL ACTIONS
   ====================
   For correct working of this module is recommended to install the 
   following NuGet package - JavaScriptEngineSwitcher.V8. After package 
   is installed, need set a name of JavaScript engine (for example, 
   `V8JsEngine`) to the `name` attribute of 
   `/configuration/bundleTransformer/csso/jsEngine` configuration 
   element.
   
   To make `KryzhanovskyCssMinifier` is the default CSS-minifier, you need 
   to make changes to the Web.config file. In the `defaultMinifier` 
   attribute of `\configuration\bundleTransformer\core\css` element must 
   be set value equal to `KryzhanovskyCssMinifier`.
   
   =============
   DOCUMENTATION
   =============
   See documentation on CodePlex - 
   http://bundletransformer.codeplex.com/documentation