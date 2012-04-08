

   ----------------------------------------------------------------------
             README file for Bundle Transformer Core 1.2.1 Beta

   ----------------------------------------------------------------------

          Copyright 2012 Andrey Taritsyn - http://www.taritsyn.ru

   ===========
   DESCRIPTION
   ===========   
   Bundle Transformer - a modular extension for System.Web.Optimization 
   (aka ASP.NET Bundling and Minification). Classes CssTransformer and 
   JsTransformer, included in the core of Bundle Transformer, implement 
   interface IBundleTransform. They are intended to replace the standard 
   classes CssMinify and JsMinify.

   The main differences classes CssTransformer and JsTransformer from 
   standard implementations: support for debugging (in debug mode disabled 
   code minification), automatic removal of duplicate assets, ability to 
   exclude unnecessary assets when adding assets from a directory, support 
   processing of JS-files with *.debug.js extensions, does not produce 
   the re-minification of code of pre-minified assets, support automatic 
   transformation of relative paths to absolute in CSS-code (for 
   CssTransformer), etc. These classes do not produce the minification 
   of code in runtime, but this feature can be added by installing of 
   minifier-adapter (now available adapters based on Microsoft Ajax 
   Minifier and YUI Compressor for .NET). In addition, you can also install 
   translator-adapters that implement the translation of code on 
   intermediate languages (LESS, Sass, SCSS and CoffeeScript).

   This extension will help your web applications successfully pass a most 
   part of the tests in YSlow.
   
   =============
   RELEASE NOTES
   =============   
   1. Added support of IntelliSense when editing settings of Bundle 
      Transformer in the Web.config file
   2. From the Web.config file has been removed settings of Bundle 
      Transformer, which are default settings
   3. In list of JS-files with Microsoft-style extensions appeared wildcard 
      for version number of JS-library ($version$)
   
   ====================
   POST-INSTALL ACTIONS
   ====================
   After you install this library, you must modify Web.config file. 
   In jsFilesWithMicrosoftStyleExtensions attribute of element 
   \configuration\bundleTransformer\core must be set value equal to 
   "MicrosoftAjax.js,MicrosoftMvcAjax.js,MicrosoftMvcValidation.js,knockout-$version$.js".
   
   =============
   DOCUMENTATION
   =============
   See documentation on CodePlex - 
   http://bundletransformer.codeplex.com/documentation