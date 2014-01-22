

   ----------------------------------------------------------------------
         README file for Bundle Transformer: WebGrease 1.8.18 Beta 1 
 
   ----------------------------------------------------------------------

          Copyright 2014 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.WG contains one minifier-adapter for minification 
   of CSS-code - `WgCssMinifier`. `WgCssMinifier` is based on the 
   WebGrease Semantic CSS-minifier (http://webgrease.codeplex.com) 
   version 1.5.2.

   ====================
   POST-INSTALL ACTIONS
   ====================
   To make `WgCssMinifier` is the default CSS-minifier, you need to 
   make changes to the Web.config file. In the `defaultMinifier` attribute 
   of `\configuration\bundleTransformer\core\css` element must be set 
   value equal to `WgCssMinifier`.
   
   =============
   DOCUMENTATION
   =============
   See documentation on CodePlex - 
   http://bundletransformer.codeplex.com/documentation