

   --------------------------------------------------------------------------------
                   README file for Bundle Transformer: JSMin v1.11.1

   --------------------------------------------------------------------------------

           Copyright (c) 2012-2019 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.JsMin contains one minifier-adapter for minification of
   JS code - `CrockfordJsMinifier`. `CrockfordJsMinifier` is based on the C# port
   of Douglas Crockford's JSMin (https://github.com/douglascrockford/JSMin) version
   of March 29, 2013.

   =============
   RELEASE NOTES
   =============
   JSMin for .NET was updated to version 2.0.0.

   ====================
   POST-INSTALL ACTIONS
   ====================
   To make `CrockfordJsMinifier` is the default JS minifier, you need to make
   changes to the `Web.config` file. In the `defaultMinifier` attribute of
   `/configuration/bundleTransformer/core/js` element must be set value equal to
   `CrockfordJsMinifier`.

   =============
   DOCUMENTATION
   =============
   See documentation on GitHub - https://github.com/Taritsyn/BundleTransformer/wiki