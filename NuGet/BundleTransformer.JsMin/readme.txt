

   ----------------------------------------------------------------------
              README file for Bundle Transformer: JSMin 1.5.0
 
   ----------------------------------------------------------------------

          Copyright 2012 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.JsMin contains one minifier-adapter for minification 
   of JS-code - CrockfordJsMinifier. CrockfordJsMinifier is based on 
   the C# port of Douglas Crockford's JSMin 
   (http://www.crockford.com/javascript/jsmin.html).

   ====================
   POST-INSTALL ACTIONS
   ====================
   To make CrockfordJsMinifier is the default JS-minifier, you need to 
   make changes to the Web.config file. In the defaultMinifier attribute 
   of the \configuration\bundleTransformer\core\js element must be set 
   value equal to CrockfordJsMinifier.
   
   =============
   DOCUMENTATION
   =============
   See documentation on CodePlex - 
   http://bundletransformer.codeplex.com/documentation