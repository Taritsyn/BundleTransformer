Bundle Transformer [![NuGet version](http://img.shields.io/nuget/v/BundleTransformer.Core.svg)](https://www.nuget.org/packages/BundleTransformer.Core/)  [![Download count](https://img.shields.io/nuget/dt/BundleTransformer.Core.svg)](https://www.nuget.org/packages/BundleTransformer.Core/)
==================

<img src="https://raw.githubusercontent.com/Taritsyn/BundleTransformer/master/images/BundleTransformer_Logo.png" width="435" height="128" alt="Bundle Transformer logo" />

Bundle Transformer - a modular extension for the [System.Web.Optimization](https://github.com/aspnet/AspNetWebOptimization) (also known as the Microsoft ASP.NET Web Optimization Framework).
`StyleTransformer` and `ScriptTransformer` classes, included in the core of Bundle Transformer and implement the `IBundleTransform` interface.
They are intended to replace the standard classes: `CssMinify` and `JsMinify`.

The main differences of the `StyleTransformer` and `ScriptTransformer` classes from a standard implementations: ability to exclude unnecessary assets when adding assets from a directory, does not produce the re-minification of pre-minified assets, support automatic transformation of relative paths to absolute in CSS code (by using the `UrlRewritingCssPostProcessor`), etc.
These classes do not produce the minification of code in runtime, but this feature can be added by installing of minifier-modules (now available modules based on [Microsoft Ajax Minifier](https://github.com/microsoft/ajaxmin), [YUI Compressor for .NET](https://github.com/YUICompressor-NET/YUICompressor.NET), [NUglify](https://github.com/trullock/NUglify), [Google Closure Compiler](https://developers.google.com/closure/compiler/), Douglas Crockford's [JSMin](https://github.com/douglascrockford/JSMin), Dean Edwards' [Packer](http://dean.edwards.name/packer/), Mihai Bazon's [UglifyJS](https://github.com/mishoo/UglifyJS), Sergey Kryzhanovsky's [CSSO](https://github.com/css/csso) (CSS Optimizer), [WebGrease](https://www.nuget.org/packages/WebGrease) and [Clean-css](https://github.com/clean-css/clean-css)).
In addition, you can also install translator-modules, that implement the translation of code on intermediate languages ([LESS](https://lesscss.org/), [Sass](https://sass-lang.com/), [SCSS](https://sass-lang.com/), [CoffeeScript](https://coffeescript.org/), [TypeScript](https://www.typescriptlang.org/), [Mustache](https://mustache.github.io/) (by using [Hogan](https://twitter.github.io/hogan.js/)) and [Handlebars](https://handlebarsjs.com/)).
Apart from this, in the Bundle Transformer there is a third type of modules - postprocessors. Postprocessors runs after translators and before minifiers.
Now available following postprocessors: URL rewriting CSS postprocessor (included in core) and postprocessor-module based on the Andrey Sitnik's [Autoprefixer](https://github.com/postcss/autoprefixer).

This extension will help your web applications successfully pass a most part of the tests in [Google PageSpeed](https://pagespeed.web.dev/).

## NuGet Packages

### Core
 * [Bundle Transformer: Core](https://www.nuget.org/packages/BundleTransformer.Core)
 * [Bundle Transformer: IntelliSense](https://www.nuget.org/packages/BundleTransformer.ConfigurationIntelliSense)

### Translators
 * [Bundle Transformer: LESS](https://www.nuget.org/packages/BundleTransformer.Less)
 * [Bundle Transformer: Sass and SCSS](https://www.nuget.org/packages/BundleTransformer.SassAndScss)
 * [Bundle Transformer: CoffeeScript](https://www.nuget.org/packages/BundleTransformer.CoffeeScript)
 * [Bundle Transformer: TypeScript](https://www.nuget.org/packages/BundleTransformer.TypeScript)
 * [Bundle Transformer: Hogan](https://www.nuget.org/packages/BundleTransformer.Hogan)
 * [Bundle Transformer: Handlebars](https://www.nuget.org/packages/BundleTransformer.Handlebars)

### Postprocessors
 * [Bundle Transformer: Autoprefixer](https://www.nuget.org/packages/BundleTransformer.Autoprefixer)

### Minifiers
 * [Bundle Transformer: Microsoft Ajax](https://www.nuget.org/packages/BundleTransformer.MicrosoftAjax)
 * [Bundle Transformer: YUI](https://www.nuget.org/packages/BundleTransformer.Yui)
 * [Bundle Transformer: NUglify](https://www.nuget.org/packages/BundleTransformer.NUglify)
 * [Bundle Transformer: Closure](https://www.nuget.org/packages/BundleTransformer.Closure)
 * [Bundle Transformer: JSMin](https://www.nuget.org/packages/BundleTransformer.JsMin)
 * [Bundle Transformer: Packer](https://www.nuget.org/packages/BundleTransformer.Packer)
 * [Bundle Transformer: UglifyJS](https://www.nuget.org/packages/BundleTransformer.UglifyJs)
 * [Bundle Transformer: CSSO](https://www.nuget.org/packages/BundleTransformer.Csso)
 * [Bundle Transformer: WebGrease](https://www.nuget.org/packages/BundleTransformer.WG)
 * [Bundle Transformer: Clean-css](https://www.nuget.org/packages/BundleTransformer.CleanCss)

### Unofficial modules
 * [AngularBundle](https://www.nuget.org/packages/AngularBundle) by Andreas Hjortland
 * [BundleTransformer.TypeScript.Unofficial](https://www.nuget.org/packages/BundleTransformer.TypeScript.Unofficial) by Alexey Kushnikov

## Documentation
Documentation is located on the [wiki](https://github.com/Taritsyn/BundleTransformer/wiki) of this Repo.

## Release History
See the [changelog](CHANGELOG.md).

## Who's Using Bundle Transformer
If you use Bundle Transformer in some project, please send me a message so I can include it in this list:

### Software
 * [ASP.NET MVC5 with Bootstrap 3.3.4 LESS](https://marketplace.visualstudio.com/items?itemName=KrzysztofOsowicki.ASPNETMVC5withBootstrap334LESS) by Krzysztof Osowicki
 * [Dynamic Bundles for ASP.NET MVC](https://www.nuget.org/packages/DynamicBundles/) by Matt Perdeck
 * [Equ Umbraco Bootstrap](https://www.nuget.org/packages/Equ.Umbraco.Bootstrap)
 * [LearnAngular](https://github.com/LeviBotelho/LearnAngular) by Levi Botelho
 * [ModernSkins](https://github.com/samsalisbury/modern-skins) by Sam Salisbury
 * [Open Government Data Initiative v6](https://github.com/openlab/OGDI-DataLab)
 * [ProteanCMS](https://github.com/Eonic/ProteanCMS) by Trevor Spink
 * [Sassy](https://our.umbraco.com/packages/backoffice-extensions/sassy) by Warren Buckley
 * [Vault MVC Library](https://www.nuget.org/packages/Vault.MVC.V) by Admir Tuzovic, Josip Dusper, Mirza Dervisevic and Fedja Omeragic
 * [Web Performance Helpers for ASP.NET MVC](https://github.com/benembery/dotnet-mvc-web-optimisation-helpers) by Ben Embery

Bundle Transformer was created and is maintained by Andrey Taritsyn.