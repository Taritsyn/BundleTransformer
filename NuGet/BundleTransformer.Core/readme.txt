

   ----------------------------------------------------------------------
               README file for Bundle Transformer: Core 1.9.69

   ----------------------------------------------------------------------

      Copyright (c) 2012-2015 Andrey Taritsyn - http://www.taritsyn.ru
		  
		  
   ===========
   DESCRIPTION
   ===========   
   Bundle Transformer - a modular extension for System.Web.Optimization
   (also known as the Microsoft ASP.NET Web Optimization Framework).
   Classes `StyleTransformer` and `ScriptTransformer`, included in the
   core of Bundle Transformer and implement interface `IBundleTransform`.
   They are intended to replace the standard classes `CssMinify` and
   `JsMinify`.

   The main differences of `StyleTransformer` and `ScriptTransformer`
   classes from a standard implementations: ability to exclude
   unnecessary assets when adding assets from a directory, does not
   produce the re-minification of pre-minified assets, support automatic
   transformation of relative paths to absolute in CSS-code (by using
   `UrlRewritingCssPostProcessor`), etc. These classes do not produce the
   minification of code in runtime, but this feature can be added by
   installing of minifier-modules (now available modules based on
   Microsoft Ajax Minifier, YUI Compressor for .NET, Google Closure
   Compiler, Douglas Crockford's JSMin, Dean Edwards' Packer, Mihai
   Bazon's UglifyJS, Sergey Kryzhanovsky's CSSO (CSS Optimizer),
   WebGrease and Clean-css). In addition, you can also install
   translator-modules that implement the translation of code on
   intermediate languages (LESS, Sass, SCSS, CoffeeScript, TypeScript,
   Mustache (by using Hogan) and Handlebars). Apart from this, in the
   Bundle Transformer there is a third type of modules - postprocessors.
   Postprocessors runs after translators and before minifiers. Now
   available following postprocessors: URL rewriting CSS-postprocessor
   (included in core) and postprocessor-module based on the Andrey
   Sitnik's Autoprefixer.

   This extension will help your web applications successfully pass a
   most part of the tests in YSlow.
   
   =============
   RELEASE NOTES
   =============
   Fixed bug #111 “Mime types and data uri function”.

   ====================
   POST-INSTALL ACTIONS
   ====================
   For debugging HTTP-handlers to use a configuration settings from
   bundles need to add in the `RegisterBundles` method of
   `App_Start/BundleConfig.cs` file the following code:

   BundleResolver.Current = new CustomBundleResolver();

   In order to these settings can be applied to CSS- and JS-assets need
   to register the debugging HTTP-handlers `CssAssetHandler` and
   `JsAssetHandler` in Web.config file.

   To do this in the IIS Integrated mode, you need add to the
   `/configuration/system.webServer/handlers` element the following code:
   
   <add name="CssAssetHandler"
      path="*.css" verb="GET"
      type="BundleTransformer.Core.HttpHandlers.CssAssetHandler, BundleTransformer.Core"
      resourceType="File" preCondition="" />
   <add name="JsAssetHandler"
      path="*.js" verb="GET"
      type="BundleTransformer.Core.HttpHandlers.JsAssetHandler, BundleTransformer.Core"
      resourceType="File" preCondition="" />
   
   To do this in the IIS Classic mode, you need add to the
   `/configuration/system.web/httpHandlers` element the following code:
 
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