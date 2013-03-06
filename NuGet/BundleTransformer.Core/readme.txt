

   ----------------------------------------------------------------------
               README file for Bundle Transformer: Core 1.6.24

   ----------------------------------------------------------------------

          Copyright 2013 Andrey Taritsyn - http://www.taritsyn.ru
		  
		  
   ===========
   DESCRIPTION
   ===========   
   Bundle Transformer - a modular extension for System.Web.Optimization 
   (aka Microsoft ASP.NET Web Optimization Framework). Classes 
   CssTransformer and JsTransformer, included in the core of Bundle 
   Transformer, implement interface IBundleTransform. They are intended 
   to replace the standard classes CssMinify and JsMinify.

   The main differences classes CssTransformer and JsTransformer from 
   standard implementations: ability to exclude unnecessary assets when 
   adding assets from a directory, does not produce the re-minification 
   of code of pre-minified assets, support automatic transformation of 
   relative paths to absolute in CSS-code (for CssTransformer), etc. 
   These classes do not produce 
   the minification of code in runtime, but this feature can be added 
   by installing of minifier-adapter (now available adapters based on 
   Microsoft Ajax Minifier, YUI Compressor for .NET, Google Closure 
   Compiler, Douglas Crockford's JSMin, Mihai Bazon's UglifyJS, Dean 
   Edwards' Packer, Sergey Kryzhanovsky's CSSO (CSS Optimizer) and 
   WebGrease). In addition, you can also install translator-adapters 
   that implement the translation of code on intermediate languages 
   (LESS, Sass, SCSS, CoffeeScript and TypeScript).

   This extension will help your web applications successfully pass a 
   most part of the tests in YSlow.
   
   =============
   RELEASE NOTES
   =============
   Added support of *.coffee.md file extension (CoffeeScript
   Markdown-files).

   =============
   DOCUMENTATION
   =============
   See documentation on CodePlex - 
   http://bundletransformer.codeplex.com/documentation