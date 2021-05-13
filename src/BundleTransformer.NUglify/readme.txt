

   --------------------------------------------------------------------------------
                  README file for Bundle Transformer: NUglify v1.12.34

   --------------------------------------------------------------------------------

           Copyright (c) 2012-2021 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.NUglify contains two minifier-adapters: `NUglifyCssMinifier`
   (for minification of CSS code) and `NUglifyJsMinifier` (for minification of JS
   code). These adapters perform minification by using the NUglify
   (https://github.com/trullock/NUglify).

   =============
   RELEASE NOTES
   =============
   Added support of the NUglify version 1.13.10.

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