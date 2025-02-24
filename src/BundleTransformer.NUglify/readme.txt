

   --------------------------------------------------------------------------------
                  README file for Bundle Transformer: NUglify v1.15.2

   --------------------------------------------------------------------------------

           Copyright (c) 2012-2024 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.NUglify contains two minifier-adapters: `NUglifyCssMinifier`
   (for minification of CSS code) and `NUglifyJsMinifier` (for minification of JS
   code). These adapters perform minification by using the NUglify
   (https://github.com/trullock/NUglify) version 1.21.12.

   =============
   RELEASE NOTES
   =============
   Added support for the NUglify version 1.21.12.

   ====================
   POST-INSTALL ACTIONS
   ====================
   To make `NUglifyCssMinifier` is the default CSS minifier and
   `NUglifyJsMinifier` is the default JS minifier, you need to make
   changes to the `Web.config` file. In `defaultMinifier` attribute of
   `/configuration/bundleTransformer/core/css` element must be set value equal to
   `NUglifyCssMinifier`, and in same attribute of
   `/configuration/bundleTransformer/core/js` element - `NUglifyJsMinifier`.

   =============
   DOCUMENTATION
   =============
   See documentation on GitHub - https://github.com/Taritsyn/BundleTransformer/wiki