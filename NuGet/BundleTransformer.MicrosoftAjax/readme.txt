

   ----------------------------------------------------------------------
       README file for Bundle Transformer: Microsoft Ajax 1.4.3 Beta 3
 
   ----------------------------------------------------------------------

          Copyright 2012 Andrey Taritsyn - http://www.taritsyn.ru
		  

   ===========
   DESCRIPTION
   ===========
   BundleTransformer.MicrosoftAjax contains 2 minifier-adapters: 
   MicrosoftAjaxCssMinifier (for minification of CSS-code) and 
   MicrosoftAjaxJsMinifier (for minification of JS-code). These adapters 
   perform minification using the Microsoft Ajax Minifier 
   (http://ajaxmin.codeplex.com).
   
   =============
   RELEASE NOTES
   =============
   Added support of Microsoft Ajax Minifier 4.59.

   ====================
   POST-INSTALL ACTIONS
   ====================
   To make MicrosoftAjaxCssMinifier is the default CSS-minifier and 
   MicrosoftAjaxJsMinifier is the default JS-minifier, you need to make
   changes to the Web.config file. 
   In defaultMinifier attribute of element 
   \configuration\bundleTransformer\core\css must be set value equal to 
   MicrosoftAjaxCssMinifier, and in same attribute of element 
   \configuration\bundleTransformer\core\js - MicrosoftAjaxJsMinifier.
   
   =============
   DOCUMENTATION
   =============
   See documentation on CodePlex - 
   http://bundletransformer.codeplex.com/documentation