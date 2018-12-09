

   --------------------------------------------------------------------------------
                 README file for Bundle Transformer: UglifyJS v1.9.162

   --------------------------------------------------------------------------------

           Copyright (c) 2012-2017 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.UglifyJs contains one minifier-adapter for minification of
   JS code - `UglifyJsMinifier`. `UglifyJsMinifier` is based on the Mihai Bazon's
   UglifyJS (https://github.com/mishoo/UglifyJS2) version 2.8.29.

   As a JS engine is used the JavaScript Engine Switcher library
   (https://github.com/Taritsyn/JavaScriptEngineSwitcher).

   =============
   RELEASE NOTES
   =============
   1. Added support of UglifyJS version 2.8.29;
   2. In code generation settings was changed a default value of `InlineScript`
      property from `false` to `true`;
   3. In compression settings was changed a default value of `CollapseVars`
      property from `false` to `true`;
   4. In compression settings was added 7 new properties: `KeepInfinity` (default
      `false`), `ReduceVars` (default `true`), `TopLevel` (default `false`),
      `TopRetain` (default empty string), `UnsafeMath` (default `false`),
      `UnsafeProto` (default `false`) and `UnsafeRegExp` (default `false`).

   ====================
   POST-INSTALL ACTIONS
   ====================
   For correct working of this module, you need to install one of the following
   NuGet packages: JavaScriptEngineSwitcher.Msie, JavaScriptEngineSwitcher.V8 or
   JavaScriptEngineSwitcher.ChakraCore.
   After package is installed and JS engine is registered
   (https://github.com/Taritsyn/JavaScriptEngineSwitcher/wiki/Registration-of-JS-engines),
   need set a name of JS engine (for example, `MsieJsEngine`) to the `name`
   attribute of `/configuration/bundleTransformer/uglify/jsEngine` configuration
   element in the `Web.config` file.

   To make `UglifyJsMinifier` is the default JS minifier, you need to make changes
   to the Web.config file. In the `defaultMinifier` attribute of
   `/configuration/bundleTransformer/core/js` element must be set value equal to
   `UglifyJsMinifier`.

   =============
   DOCUMENTATION
   =============
   See documentation on GitHub - https://github.com/Taritsyn/BundleTransformer/wiki