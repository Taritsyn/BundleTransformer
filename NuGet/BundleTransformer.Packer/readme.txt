

   ----------------------------------------------------------------------
             README file for Bundle Transformer: Packer 1.7.21
 
   ----------------------------------------------------------------------

          Copyright 2013 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.Packer contains one minifier-adapter for 
   minification of JS-code - EdwardsJsMinifier. EdwardsJsMinifier is 
   based on the Dean Edwards' Packer (http://dean.edwards.name/packer/) 
   version 3.0.
   
   ====================
   POST-INSTALL ACTIONS
   ====================
   To make EdwardsJsMinifier is the default JS-minifier, you need to 
   make changes to the Web.config file. In the defaultMinifier attribute 
   of the \configuration\bundleTransformer\core\js element must be set 
   value equal to EdwardsJsMinifier.
   
   =============
   DOCUMENTATION
   =============
   See documentation on CodePlex - 
   http://bundletransformer.codeplex.com/documentation