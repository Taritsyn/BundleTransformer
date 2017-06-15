

   --------------------------------------------------------------------------------
                    README file for Bundle Transformer: YUI v1.9.92

   --------------------------------------------------------------------------------

           Copyright (c) 2012-2017 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.Yui contains two minifier-adapters: `YuiCssMinifier` (for
   minification of CSS code) and `YuiJsMinifier` (for minification of JS code).
   These adapters perform minification by using the YUI Compressor for .NET
   (https://github.com/PureKrome/YUICompressor.NET).

   ====================
   POST-INSTALL ACTIONS
   ====================
   To make `YuiCssMinifier` is the default CSS minifier and `YuiJsMinifier` is the
   default JS minifier, you need to make changes to the `Web.config` file. In
   `defaultMinifier` attribute of `/configuration/bundleTransformer/core/css`
   element must be set value equal to `YuiCssMinifier`, and in same attribute of
   `/configuration/bundleTransformer/core/js` element - `YuiJsMinifier`.

   =============
   DOCUMENTATION
   =============
   See documentation on GitHub - https://github.com/Taritsyn/BundleTransformer/wiki