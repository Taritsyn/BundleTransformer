

   ----------------------------------------------------------------------
          README file for Bundle Transformer: Sass and SCSS 1.9.13

   ----------------------------------------------------------------------

          Copyright 2014 Andrey Taritsyn - http://www.taritsyn.ru
		  

   ===========
   DESCRIPTION
   ===========
   BundleTransformer.SassAndScss contains translator-adapter 
   `SassAndScssTranslator` (supports Sass (http://sass-lang.com) 
   version 3.3.14). This adapter makes translation of Sass- and 
   SCSS-code to CSS-code. Also contains debugging HTTP-handler
   `SassAndScssAssetHandler`, which is responsible for text output of 
   translated Sass- or SCSS-asset.
   
   BundleTransformer.SassAndScss does not support the string interpolation
   in file paths. 
   
   For execution of Ruby-code is used a IronRuby
   (http://github.com/IronLanguages/main) version 1.1.4.0. Assemblies
   `IronRuby.dll`, `IronRuby.Libraries.dll`, `Microsoft.Dynamic.dll`
   and `Microsoft.Scripting.dll` were builded from source code of the
   IronLanguages project.
   
   =============
   RELEASE NOTES
   =============
   Added support of Sass version 3.3.14.
   
   ====================
   POST-INSTALL ACTIONS
   ====================
   To use a debugging HTTP-handlers in the IIS Classic mode, you need add
   to the `/configuration/system.web/httpHandlers` element of the 
   Web.config file a following code:
   
   <add
	path="*.sass" verb="GET"
	type="BundleTransformer.SassAndScss.HttpHandlers.SassAndScssAssetHandler, BundleTransformer.SassAndScss" />
   <add
	path="*.scss" verb="GET"
	type="BundleTransformer.SassAndScss.HttpHandlers.SassAndScssAssetHandler, BundleTransformer.SassAndScss" />
   
   =============
   DOCUMENTATION
   =============
   See documentation on CodePlex - 
   http://bundletransformer.codeplex.com/documentation