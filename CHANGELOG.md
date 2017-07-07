Change log
==========

## v1.9.165 - July 7, 2017
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 7.1.2

## v1.9.164 - July 5, 2017
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 7.1.1.3

## v1.9.163 - June 30, 2017
 * In BundleTransformer.CleanCss added support of Clean-css version 4.1.5

## v1.9.162 - June 29, 2017
 * In BundleTransformer.ConfigurationIntelliSense updated definitions for configuration settings of TypeScript translator and Uglify JS minifier
 * In BundleTransformer.TypeScript:
   * Added support of TypeScript version 2.4 RTM (please note: The 2.4 RTM release is also called '2.4.1')
   * In configuration settings of TypeScript translator was added one new property - `NoStrictGenericChecks` (default `false`)
 * In BundleTransformer.UglifyJs:
   * Added support of UglifyJS version 2.8.29
   * In code generation settings was changed a default value of `InlineScript` property from `false` to `true`
   * In compression settings was changed a default value of `CollapseVars` property from `false` to `true`
   * In compression settings was added 7 new properties: `KeepInfinity` (default `false`), `ReduceVars` (default `true`), `TopLevel` (default `false`), `TopRetain` (default empty string), `UnsafeMath` (default `false`), `UnsafeProto` (default `false`) and `UnsafeRegExp` (default `false`)

## v1.9.161 - June 21, 2017
 * In BundleTransformer.Autoprefixer added a `Array.prototype.fill` polyfill
 * In BundleTransformer.CleanCss added support of Clean-css version 4.1.4

## v1.9.160 - June 15, 2017
 * In BundleTransformer.SassAndScss added support of LibSass version 3.4.5
 * In BundleTransformer.TypeScript added support of TypeScript version 2.3.4
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 7.1.1.2

## v1.9.159 - May 21, 2017
 * In BundleTransformer.Handlebars added support of Handlebars version 4.0.10
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 7.1.1
 * In BundleTransformer.CleanCss added support of Clean-css version 4.1.3