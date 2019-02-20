Bundle Transformer [![NuGet version](http://img.shields.io/nuget/v/BundleTransformer.Core.svg)](https://www.nuget.org/packages/BundleTransformer.Core/)  [![Download count](https://img.shields.io/nuget/dt/BundleTransformer.Core.svg)](https://www.nuget.org/packages/BundleTransformer.Core/)
==================

<img src="https://raw.githubusercontent.com/Taritsyn/BundleTransformer/master/images/BundleTransformer_Logo.png" width="435" height="128" alt="Bundle Transformer logo" />

Bundle Transformer - a modular extension for the [System.Web.Optimization](http://aspnetoptimization.codeplex.com/) (also known as the Microsoft ASP.NET Web Optimization Framework). `StyleTransformer` and `ScriptTransformer` classes, included in the core of Bundle Transformer and implement the `IBundleTransform` interface. They are intended to replace the standard classes: `CssMinify` and `JsMinify`.

The main differences of the `StyleTransformer` and `ScriptTransformer` classes from a standard implementations: ability to exclude unnecessary assets when adding assets from a directory, does not produce the re-minification of pre-minified assets, support automatic transformation of relative paths to absolute in CSS code (by using the `UrlRewritingCssPostProcessor`), etc. These classes do not produce the minification of code in runtime, but this feature can be added by installing of minifier-modules (now available modules based on [Microsoft Ajax Minifier](http://ajaxmin.codeplex.com/), [YUI Compressor for .NET](http://github.com/PureKrome/YUICompressor.NET), [NUglify](https://github.com/xoofx/NUglify), [Google Closure Compiler](https://developers.google.com/closure/compiler/), [Douglas Crockford's JSMin](http://github.com/douglascrockford/JSMin), [Dean Edwards' Packer](http://dean.edwards.name/packer/), [Mihai Bazon's UglifyJS](http://github.com/mishoo/UglifyJS2), [Sergey Kryzhanovsky's CSSO](http://github.com/css/csso) (CSS Optimizer), [WebGrease](http://webgrease.codeplex.com/) and [Clean-css](http://github.com/jakubpawlowicz/clean-css)). In addition, you can also install translator-modules, that implement the translation of code on intermediate languages ([LESS](http://lesscss.org/), [Sass](http://sass-lang.com/), [SCSS](http://sass-lang.com/), [CoffeeScript](http://coffeescript.org/), [TypeScript](http://www.typescriptlang.org/), [Mustache](http://mustache.github.io/) (by using [Hogan](http://twitter.github.io/hogan.js/)) and [Handlebars](http://handlebarsjs.com/)). Apart from this, in the Bundle Transformer there is a third type of modules - postprocessors. Postprocessors runs after translators and before minifiers. Now available following postprocessors: URL rewriting CSS postprocessor (included in core) and postprocessor-module based on the [Andrey Sitnik's Autoprefixer](http://github.com/postcss/autoprefixer).

This extension will help your web applications successfully pass a most part of the tests in [Google PageSpeed](https://developers.google.com/speed/pagespeed/insights/).

## NuGet Packages

### Core
 * [Bundle Transformer: Core](http://nuget.org/packages/BundleTransformer.Core)
 * [Bundle Transformer: IntelliSense](http://nuget.org/packages/BundleTransformer.ConfigurationIntelliSense)

### Translators
 * [Bundle Transformer: LESS](http://nuget.org/packages/BundleTransformer.Less)
 * [Bundle Transformer: Sass and SCSS](http://nuget.org/packages/BundleTransformer.SassAndScss)
 * [Bundle Transformer: CoffeeScript](http://nuget.org/packages/BundleTransformer.CoffeeScript)
 * [Bundle Transformer: TypeScript](http://nuget.org/packages/BundleTransformer.TypeScript)
 * [Bundle Transformer: Hogan](http://nuget.org/packages/BundleTransformer.Hogan)
 * [Bundle Transformer: Handlebars](http://nuget.org/packages/BundleTransformer.Handlebars)

### Postprocessors
 * [Bundle Transformer: Autoprefixer](http://nuget.org/packages/BundleTransformer.Autoprefixer)

### Minifiers
 * [Bundle Transformer: Microsoft Ajax](http://nuget.org/packages/BundleTransformer.MicrosoftAjax)
 * [Bundle Transformer: YUI](http://nuget.org/packages/BundleTransformer.Yui)
 * [Bundle Transformer: NUglify](http://nuget.org/packages/BundleTransformer.NUglify)
 * [Bundle Transformer: Closure](http://nuget.org/packages/BundleTransformer.Closure)
 * [Bundle Transformer: JSMin](http://nuget.org/packages/BundleTransformer.JsMin)
 * [Bundle Transformer: Packer](http://nuget.org/packages/BundleTransformer.Packer)
 * [Bundle Transformer: UglifyJS](http://nuget.org/packages/BundleTransformer.UglifyJs)
 * [Bundle Transformer: CSSO](http://nuget.org/packages/BundleTransformer.Csso)
 * [Bundle Transformer: WebGrease](http://nuget.org/packages/BundleTransformer.WG)
 * [Bundle Transformer: Clean-css](http://nuget.org/packages/BundleTransformer.CleanCss)

### Unofficial modules
 * [AngularBundle](http://nuget.org/packages/AngularBundle) by Andreas Hjortland
 * [BundleTransformer.TypeScript.Unofficial](http://nuget.org/packages/BundleTransformer.TypeScript.Unofficial) by Alexey Kushnikov

## Documentation
Documentation is located on the [wiki](https://github.com/Taritsyn/BundleTransformer/wiki) of this Repo.

## Release History
See the [changelog](CHANGELOG.md).

## Old Project Site
Old project site are located on [CodePlex](https://bundletransformer.codeplex.com/).

## Who's Using Bundle Transformer
If you use Bundle Transformer in some project, please send me a message so I can include it in this list:

### Software
 * [ASP.NET MVC5 with Bootstrap 3.1.1 LESS](http://visualstudiogallery.msdn.microsoft.com/5ed81082-fc81-458a-a30c-0d15b6e8386f) by Krzysztof Osowicki
 * [bootlessmvc](http://bitbucket.org/jdubrownik/bootlessmvc-seed) by Jarek Dubrownik
 * [Bundle Transformer LESS Theme Builders](http://bundletransformer-theme-builder.azurewebsites.net/) by Ben Embery
 * [Dynamic Bundles for ASP.NET MVC](http://getdynamicbundles.com/) by Matt Perdeck
 * [Equ Umbraco Bootstrap](http://nuget.org/packages/Equ.Umbraco.Bootstrap)
 * [LearnAngular](http://github.com/LeviBotelho/LearnAngular) by Levi Botelho
 * [ModernSkins](http://github.com/samsalisbury/modern-skins) by Sam Salisbury
 * [Open Government Data Initiative v6](http://github.com/openlab/OGDI-DataLab)
 * [Optimus](http://our.umbraco.org/projects/developer-tools/optimus) by Tim Geyssens
 * [ProteanCMS](https://github.com/Eonic/ProteanCMS) by Trevor Spink
 * [Sassy](http://our.umbraco.org/projects/backoffice-extensions/sassy) by Warren Buckley
 * [SmartStore.NET](http://www.smartstore.com)
 * [Vault MVC Library](http://nuget.org/packages/Vault.MVC.V) by Admir Tuzovic, Josip Dusper, Mirza Dervisevic and Fedja Omeragic
 * [VMware AirWatch MDM Server 8.0](http://www.air-watch.com/)
 * [Web Performance Helpers for ASP.NET MVC](http://github.com/benembery/dotnet-mvc-web-optimisation-helpers) by Ben Embery

### Websites
 * [Customer's Canvas](http://customerscanvas.com/)
 * [Latvia Dance Sport Federation (LSDF)](http://www.lsdf.lv/)
 * [Member.buzz](https://www.member.buzz)
 * [NextGear Capital](https://nextgearcapital.co.uk/)
 * [TIKSN Development](http://www.tiksn.com/en-US/Home)

Bundle Transformer was created and is maintained by Andrey Taritsyn.