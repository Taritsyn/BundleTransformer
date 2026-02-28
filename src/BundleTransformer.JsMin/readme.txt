

   --------------------------------------------------------------------------------
                   README file for Bundle Transformer: JSMin v1.14.0

   --------------------------------------------------------------------------------

           Copyright (c) 2012-2026 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.JsMin contains one minifier-adapter - `CrockfordJsMinifier`.
   This adapter performs minification of JS code by using the JSMin for .NET
   (https://github.com/Taritsyn/JSMin.NET) version 2.2.0 (supports the Douglas
   Crockford's JSMin (https://github.com/douglascrockford/JSMin) version of
   February 25, 2026).

   =============
   RELEASE NOTES
   =============
   Added support for the JSMin version of February 25, 2026.

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