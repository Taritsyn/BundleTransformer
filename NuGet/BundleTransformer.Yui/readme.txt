

   ----------------------------------------------------------------------
               README file for Bundle Transformer: YUI 1.6.10
 
   ----------------------------------------------------------------------

          Copyright 2012 Andrey Taritsyn - http://www.taritsyn.ru
		  

   ===========
   DESCRIPTION
   ===========
   BundleTransformer.Yui contains 2 minifier-adapters: YuiCssMinifier 
   (for minification of CSS-code) and YuiJsMinifier (for minification of 
   JS-code). These adapters perform minification using the YUI Compressor 
   for .NET (http://yuicompressor.codeplex.com).

   ====================
   POST-INSTALL ACTIONS
   ====================
   After installation you need to delete settings of the previous 
   version of BundleTransformer.Yui from the Web.config file 
   (\configuration\bundleTransformer\yui element).
   
   To make YuiCssMinifier is the default CSS-minifier and YuiJsMinifier 
   is the default JS-minifier, you need to make changes to the 
   Web.config file. 
   In defaultMinifier attribute of element 
   \configuration\bundleTransformer\core\css must be set value equal 
   to YuiCssMinifier, and in same attribute of element 
   \configuration\bundleTransformer\core\js - YuiJsMinifier.
   
   =============
   DOCUMENTATION
   =============
   See documentation on CodePlex - 
   http://bundletransformer.codeplex.com/documentation