

   --------------------------------------------------------------------------------
                   README file for Bundle Transformer: Core v1.10.0

   --------------------------------------------------------------------------------

           Copyright (c) 2012-2018 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   Bundle Transformer - a modular extension for the System.Web.Optimization (also
   known as the Microsoft ASP.NET Web Optimization Framework). `StyleTransformer`
   and `ScriptTransformer` classes, included in the core of Bundle Transformer and
   implement the `IBundleTransform` interface. They are intended to replace the
   standard classes: `CssMinify` and `JsMinify`.

   The main differences of `StyleTransformer` and `ScriptTransformer` classes from
   a standard implementations: ability to exclude unnecessary assets when adding
   assets from a directory, does not produce the re-minification of pre-minified
   assets, support automatic transformation of relative paths to absolute in CSS
   code (by using the `UrlRewritingCssPostProcessor`), etc. These classes do not
   produce the minification of code in runtime, but this feature can be added by
   installing of minifier-modules (now available modules based on Microsoft Ajax
   Minifier, YUI Compressor for .NET, NUglify, Google Closure Compiler, Douglas
   Crockford's JSMin, Dean Edwards' Packer, Mihai Bazon's UglifyJS, Sergey
   Kryzhanovsky's CSSO (CSS Optimizer), WebGrease and Clean-css). In addition, you
   can also install translator-modules, that implement the translation of code on
   intermediate languages (LESS, Sass, SCSS, CoffeeScript, TypeScript, Mustache (by
   using Hogan) and Handlebars). Apart from this, in the Bundle Transformer there
   is a third type of modules - postprocessors. Postprocessors runs after
   translators and before minifiers. Now available following postprocessors: URL
   rewriting CSS postprocessor (included in core) and postprocessor-module based on
   the Andrey Sitnik's Autoprefixer.

   This extension will help your web applications successfully pass a most part of
   the tests in Google PageSpeed.

   =============
   RELEASE NOTES
   =============
   1. Part of the auxiliary code was replaced by the AdvancedStringBuilder;
   2. Improved a performance of the `SourceCodeNavigator` class;
   3. `InterlockedStatedFlag` and `StatedFlag` classes have been moved to the
      `BundleTransformer.Core.Utilities` namespace.

   ====================
   POST-INSTALL ACTIONS
   ====================
   For the debugging HTTP handlers to use a configuration settings from bundles,
   need to add in the `RegisterBundles` method of `App_Start/BundleConfig.cs` file
   the following code:

   BundleResolver.Current = new CustomBundleResolver();

   In order to these settings can be applied to CSS and JS assets, need to register
   the `CssAssetHandler` and `JsAssetHandler` debugging HTTP handlers in the
   `Web.config` file.

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
   See documentation on GitHub - https://github.com/Taritsyn/BundleTransformer/wiki