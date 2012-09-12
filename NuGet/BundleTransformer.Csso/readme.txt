

   ----------------------------------------------------------------------
             README file for Bundle Transformer: CSSO 1.0.0
 
   ----------------------------------------------------------------------

          Copyright 2012 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.Csso contains one minifier-adapter for 
   minification of CSS-code - KryzhanovskyCssMinifier. KryzhanovskyCssMinifier is based 
   on the Sergey Kryzhanovsky's CSSO (http://github.com/css/csso) 
   version 1.2.17.
   
   ====================
   POST-INSTALL ACTIONS
   ====================
   To make KryzhanovskyCssMinifier is the default CSS-minifier, you need to 
   make changes to the Web.config file. In the defaultMinifier attribute 
   of the \configuration\bundleTransformer\core\css element must be set 
   value equal to KryzhanovskyCssMinifier.
   
   =============
   DOCUMENTATION
   =============
   See documentation on CodePlex - 
   http://bundletransformer.codeplex.com/documentation