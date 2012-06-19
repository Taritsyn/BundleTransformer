

   ----------------------------------------------------------------------
         README file for Bundle Transformer: LESS Lite 1.4.1 Beta 3

   ----------------------------------------------------------------------

          Copyright 2012 Andrey Taritsyn - http://www.taritsyn.ru
		  

   ===========
   DESCRIPTION
   ===========
   BundleTransformer.LessLite contains translator-adapter LessTranslator. 
   This adapter makes translation of LESS-code to CSS-code. Also contains 
   HTTP-handler LessAssetHandler, which is responsible for text output 
   of translated LESS-asset.
   
   Uses NuGet-package the DotlessClientOnly (http://nuget.org/packages/DotlessClientOnly).
   
   =============
   RELEASE NOTES
   =============
   1. Added support of dotless 1.3.0.4
   2. Added support of the file cache dependencies based on the list of 
      LESS-files, that were added to a LESS-asset by using the @import 
      directive
   
   =============
   DOCUMENTATION
   =============
   See documentation on CodePlex - 
   http://bundletransformer.codeplex.com/documentation