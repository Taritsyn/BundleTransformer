

   --------------------------------------------------------------------------------
                   README file for Bundle Transformer: JSMin v1.12.6

   --------------------------------------------------------------------------------

           Copyright (c) 2012-2023 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.JsMin contains one minifier-adapter for minification of
   JS code - `CrockfordJsMinifier`. `CrockfordJsMinifier` is based on the C# port
   of Douglas Crockford's JSMin (https://github.com/douglascrockford/JSMin) version
   of October 30, 2019.

   =============
   RELEASE NOTES
   =============
   Enabled a SourceLink.

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