

   --------------------------------------------------------------------------------
              README file for Bundle Transformer: Microsoft Ajax v1.10.0

   --------------------------------------------------------------------------------

           Copyright (c) 2012-2018 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.MicrosoftAjax contains two minifier-adapters:
   `MicrosoftAjaxCssMinifier` (for minification of CSS code) and
   `MicrosoftAjaxJsMinifier` (for minification of JS code). These adapters perform
   minification by using the Microsoft Ajax Minifier (https://ajaxmin.codeplex.com).

   ====================
   POST-INSTALL ACTIONS
   ====================
   To make `MicrosoftAjaxCssMinifier` is the default CSS minifier and
   `MicrosoftAjaxJsMinifier` is the default JS minifier, you need to make
   changes to the `Web.config` file. In `defaultMinifier` attribute of
   `/configuration/bundleTransformer/core/css` element must be set value equal to
   `MicrosoftAjaxCssMinifier`, and in same attribute of
   `/configuration/bundleTransformer/core/js` element - `MicrosoftAjaxJsMinifier`.

   =============
   DOCUMENTATION
   =============
   See documentation on GitHub - https://github.com/Taritsyn/BundleTransformer/wiki