

   --------------------------------------------------------------------------------
                 README file for Bundle Transformer: WebGrease v1.10.0

   --------------------------------------------------------------------------------

           Copyright (c) 2012-2022 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.WG contains one minifier-adapter for minification of CSS code -
   `WgCssMinifier`. `WgCssMinifier` is based on the WebGrease Semantic CSS minifier
   (https://www.nuget.org/packages/WebGrease) version 1.6.0.

   ====================
   POST-INSTALL ACTIONS
   ====================
   To make `WgCssMinifier` is the default CSS minifier, you need to make changes to
   the `Web.config` file. In the `defaultMinifier` attribute of
   `/configuration/bundleTransformer/core/css` element must be set value equal to
   `WgCssMinifier`.

   =============
   DOCUMENTATION
   =============
   See documentation on GitHub - https://github.com/Taritsyn/BundleTransformer/wiki