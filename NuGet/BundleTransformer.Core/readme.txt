

   ----------------------------------------------------------------------
           README file for Bundle Transformer: Core 1.9.0 Beta 1

   ----------------------------------------------------------------------

          Copyright 2014 Andrey Taritsyn - http://www.taritsyn.ru
		  
		  
   ===========
   DESCRIPTION
   ===========   
   Bundle Transformer - a modular extension for System.Web.Optimization 
   (aka Microsoft ASP.NET Web Optimization Framework). Classes 
   `CssTransformer` and `JsTransformer`, included in the core of Bundle 
   Transformer, implement interface `IBundleTransform`. They are intended 
   to replace the standard classes `CssMinify` and `JsMinify`.

   The main differences classes `CssTransformer` and `JsTransformer` from 
   standard implementations: ability to exclude unnecessary assets when 
   adding assets from a directory, does not produce the re-minification 
   of code of pre-minified assets, support automatic transformation of 
   relative paths to absolute in CSS-code (for `CssTransformer`), etc. 
   These classes do not produce the minification of code in runtime, but 
   this feature can be added by installing of minifier-adapter (now 
   available adapters based on Microsoft Ajax Minifier, YUI Compressor 
   for .NET, Google Closure Compiler, Douglas Crockford's JSMin, Dean 
   Edwards' Packer, Mihai Bazon's UglifyJS, Sergey Kryzhanovsky's CSSO 
   (CSS Optimizer), WebGrease and Clean-css). In addition, you can also 
   install translator-adapters that implement the translation of code on 
   intermediate languages (LESS, Sass, SCSS, CoffeeScript and TypeScript).

   This extension will help your web applications successfully pass a 
   most part of the tests in YSlow.
   
   =============
   RELEASE NOTES
   =============
   1. Appeared a new type of modules - postprocessor (runs after
      translators and before minifier);
   2. Debugging HTTP-handlers can now apply a item transformations,
      postprocessors and other configuration settings from bundles.

   ====================
   POST-INSTALL ACTIONS
   ====================
   For debugging HTTP-handlers to use a configuration settings from
   bundles need to add in the `RegisterBundles` method of
   `App_Start/BundleConfig.cs` file the following code:

   BundleResolver.Current = new CustomBundleResolver();
   
   To use a debugging HTTP-handlers in the IIS Classic mode, you need add
   to the `/configuration/system.web/httpHandlers` element of the 
   Web.config file a following code:
   
   <add
	path="*.css" verb="GET"
	type="BundleTransformer.Core.HttpHandlers.CssAssetHandler, BundleTransformer.Core" />
   <add
	path="*.js" verb="GET"
	type="BundleTransformer.Core.HttpHandlers.JsAssetHandler, BundleTransformer.Core" />
   
   =============
   DOCUMENTATION
   =============
   See documentation on CodePlex - 
   http://bundletransformer.codeplex.com/documentation