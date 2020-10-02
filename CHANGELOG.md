Change log
==========

## v1.12.21 - October 2, 2020
 * In BundleTransformer.Autoprefixer added support of the Autoprefixer version 10.0.1.0
 * In BundleTransformer.NUglify added support of the NUglify version 1.9.6

## v1.12.20 - September 23, 2020
 * In BundleTransformer.Autoprefixer added support of the Autoprefixer version 10.0.0.2
 * In BundleTransformer.NUglify added support of the NUglify version 1.9.5

## v1.12.19 - August 25, 2020
 * In BundleTransformer.TypeScript added support of the TypeScript version 4.0 RTM
 * In BundleTransformer.NUglify added support of the NUglify version 1.8.1

## v1.12.18 - August 19, 2020
 * In BundleTransformer.Autoprefixer added support of the Autoprefixer version 9.8.6
 * In BundleTransformer.NUglify added support of the NUglify version 1.6.5

## v1.12.17 - July 17, 2020
 * In BundleTransformer.TypeScript added support of the TypeScript version 3.9.7
 * In BundleTransformer.Autoprefixer added support of the Autoprefixer version 9.8.5

## v1.12.16 - July 8, 2020
 * In BundleTransformer.TypeScript added support of the TypeScript version 3.9.6
 * In BundleTransformer.Autoprefixer added support of the Autoprefixer version 9.8.4
 * In BundleTransformer.NUglify added support of the NUglify version 1.6.4

## v1.12.15 - June 21, 2020
 * In BundleTransformer.Autoprefixer added support of the Autoprefixer version 9.8.1
 * In BundleTransformer.NUglify added support of the NUglify version 1.6.3

## v1.12.14 - June 6, 2020
 * In BundleTransformer.TypeScript added support of the TypeScript version 3.9.5

## v1.12.13 - May 20, 2020
 * In BundleTransformer.TypeScript added support of the TypeScript version 3.9.3
 * In BundleTransformer.Autoprefixer added support of the Autoprefixer version 9.8

## v1.12.12 - May 14, 2020
 * In BundleTransformer.SassAndScss added support of the LibSass version 3.6.4
 * In BundleTransformer.TypeScript added support of the TypeScript version 3.9 RTM

## v1.12.11 - April 15, 2020
 * In BundleTransformer.SassAndScss was updated the LibSass Host to version 1.3.0

## v1.12.10 - April 8, 2020
 * In BundleTransformer.Autoprefixer added support of the Autoprefixer version 9.7.6

## v1.12.9 - March 25, 2020
 * In BundleTransformer.ConfigurationIntelliSense updated definitions for configuration settings of NUglify CSS minifier
 * In BundleTransformer.Autoprefixer added support of the Autoprefixer version 9.7.5
 * In BundleTransformer.NUglify:
   * Added support of the NUglify version 1.5.14
   * In configuration settings of CSS minifier was added one new property - `DecodeEscapes` (default `true`)

## v1.12.8 - March 9, 2020
 * In BundleTransformer.CoffeeScript added support of the CoffeeScript version 2.5.1
 * In BundleTransformer.TypeScript added support of the TypeScript version 3.8.3
 * In BundleTransformer.Handlebars added support of the Handlebars version 4.7.3
 * In BundleTransformer.Autoprefixer added support of the Autoprefixer version 9.7.4

## v1.12.7 - December 6, 2019
 * In BundleTransformer.TypeScript added support of the TypeScript version 3.7.3
 * In BundleTransformer.Autoprefixer added support of the Autoprefixer version 9.7.3

## v1.12.6 - November 19, 2019
 * In BundleTransformer.ConfigurationIntelliSense updated definitions for configuration settings of TypeScript translator
 * In BundleTransformer.SassAndScss added support of the LibSass version 3.6.3
 * In BundleTransformer.TypeScript:
   * Added support of the TypeScript version 3.7 RTM
   * In configuration settings of TypeScript translator was added one new property - `UseDefineForClassFields` (default `false`)
 * In BundleTransformer.Handlebars added support of the Handlebars version 4.5.3
 * In BundleTransformer.Autoprefixer added support of the Autoprefixer version 9.7.2
 * In BundleTransformer.JsMin added support of the JSMin version of October 30, 2019

## v1.12.5 - October 22, 2019
 * In BundleTransformer.TypeScript added support of the TypeScript version 3.6.4
 * In BundleTransformer.Handlebars added support of the Handlebars version 4.4.5
 * In BundleTransformer.Autoprefixer added support of the Autoprefixer version 9.6.5

## v1.12.4 - October 8, 2019
 * In BundleTransformer.SassAndScss added support of the LibSass version 3.6.2
 * In BundleTransformer.Handlebars added support of the Handlebars version 4.4.2
 * In BundleTransformer.Autoprefixer added support of the Autoprefixer version 9.6.4

## v1.12.3 - September 13, 2019
 * In BundleTransformer.TypeScript added support of TypeScript version 3.6.3
 * In BundleTransformer.Handlebars added support of Handlebars version 4.2.0

## v1.12.2 - August 30, 2019
 * In BundleTransformer.ConfigurationIntelliSense updated definitions for configuration settings of TypeScript translator
 * In BundleTransformer.TypeScript added support of TypeScript version 3.6 RTM

## v1.12.1 - August 23, 2019
 * In BundleTransformer.SassAndScss:
   * Added support of the LibSass version 3.6.1
   * MSVC runtime was embedded into the LibSass native assemblies for Windows. Now you do not need to install the Microsoft Visual C++ Redistributable for Visual Studio 2017.
 * In BundleTransformer.Autoprefixer added support of the Autoprefixer version 9.6.1.1

## v1.12.0 - July 15, 2019
 * In BundleTransformer.ConfigurationIntelliSense updated definitions for configuration settings of Autoprefixer postprocessor
 * In BundleTransformer.Autoprefixer:
   * Main functionality of this module was moved to external library - [Autoprefixer Host for .NET](https://github.com/Taritsyn/AutoprefixerHost)
   * In configuration settings was changed type of `Flexbox` property from string to `FlexboxMode` enumeration (default `All`)
 * JavaScript Engine Switcher was updated to version 3.1.0
 * Json.NET was updated to version 12.0.2

## v1.11.9 - July 12, 2019
 * In BundleTransformer.TypeScript added support of TypeScript version 3.5.3

## v1.11.8 - July 6, 2019
 * In BundleTransformer.Autoprefixer added support of the Autoprefixer version 9.6.1

## v1.11.7 - June 18, 2019
 * In BundleTransformer.TypeScript added support of TypeScript version 3.5.2

## v1.11.6 - June 4, 2019
 * In BundleTransformer.Autoprefixer added support of the Autoprefixer version 9.6
 * In BundleTransformer.NUglify added support of the NUglify version 1.5.13

## v1.11.5 - May 31, 2019
 * In BundleTransformer.TypeScript added support of TypeScript version 3.5 RTM

## v1.11.4 - May 7, 2019
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 9.5.1.1

## v1.11.3 - April 30, 2019
 * In BundleTransformer.TypeScript added support of TypeScript version 3.4.5
 * In BundleTransformer.Handlebars added support of Handlebars version 4.1.2

## v1.11.2 - April 11, 2019
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 9.5.1

## v1.11.1 - April 4, 2019
 * In BundleTransformer.ConfigurationIntelliSense updated definitions for configuration settings of TypeScript translator
 * In BundleTransformer.CoffeeScript added support of CoffeeScript version 2.4.0
 * In BundleTransformer.TypeScript added support of TypeScript version 3.4 RTM
 * In BundleTransformer.Handlebars added support of Handlebars version 4.1.1
 * In BundleTransformer.JsMin was updated the JSMin for .NET to version 2.0.0

## v1.11.0 - March 15, 2019
 * In BundleTransformer.ConfigurationIntelliSense updated definitions for configuration settings of Autoprefixer postprocessor
 * In BundleTransformer.Autoprefixer:
   * Added support of Autoprefixer version 9.5
   * In configuration settings was changed type of `Grid` property from boolean to `GridMode` enumeration (default `None`), and added one new property - `IgnoreUnknownVersions` (default `false`)

## v1.10.4 - March 1, 2019
 * In BundleTransformer.Less added support of LESS version 3.9.0
 * In BundleTransformer.SassAndScss was updated the LibSass Host to version 1.2.3
 * In BundleTransformer.CoffeeScript added support of CoffeeScript version 2.3.2
 * In BundleTransformer.Handlebars added support of Handlebars version 4.1.0
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 9.4.9

## v1.10.3 - February 28, 2019
 * In BundleTransformer.ConfigurationIntelliSense updated definitions for configuration settings of TypeScript translator
 * In BundleTransformer.TypeScript:
   * Added support of TypeScript version 3.3.3333
   * In configuration settings of TypeScript translator was added one new property - `StrictBindCallApply` (default `false`)

## v1.10.2 - January 25, 2019
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 9.4.6

## v1.10.1 - January 12, 2019
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 9.4.4

## v1.10.0 - December 26, 2018
 * Part of the auxiliary code was replaced by the [AdvancedStringBuilder](https://github.com/Taritsyn/AdvancedStringBuilder) library
 * Improved a performance of the `SourceCodeNavigator` class
 * `InterlockedStatedFlag` and `StatedFlag` classes have been moved to the `BundleTransformer.Core.Utilities` namespace
 * In BundleTransformer.Less, BundleTransformer.CoffeeScript, BundleTransformer.TypeScript, BundleTransformer.Hogan, BundleTransformer.Handlebars, BundleTransformer.Autoprefixer, BundleTransformer.Packer, BundleTransformer.UglifyJS, BundleTransformer.Csso and BundleTransformer.CleanCss was updated the JavaScript Engine Switcher to [version 3.0.0](https://github.com/Taritsyn/JavaScriptEngineSwitcher/releases/tag/v3.0.0)
 * In BundleTransformer.SassAndScss was updated the LibSass Host to version 1.2.2
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 9.4.3

## v1.10.0 Beta 1 - December 10, 2018
 * Part of the auxiliary code was replaced by the [AdvancedStringBuilder](https://github.com/Taritsyn/AdvancedStringBuilder) library
 * Improved a performance of the `SourceCodeNavigator` class
 * `InterlockedStatedFlag` and `StatedFlag` classes have been moved to the `BundleTransformer.Core.Utilities` namespace
 * In BundleTransformer.Less, BundleTransformer.CoffeeScript, BundleTransformer.TypeScript, BundleTransformer.Hogan, BundleTransformer.Handlebars, BundleTransformer.Autoprefixer, BundleTransformer.Packer, BundleTransformer.UglifyJS, BundleTransformer.Csso and BundleTransformer.CleanCss was updated the JavaScript Engine Switcher to [version 3.0.0 RC 2](https://github.com/Taritsyn/JavaScriptEngineSwitcher/releases/tag/v3.0.0-rc.2)

## v1.9.216 - November 19, 2018
 * In BundleTransformer.SassAndScss:
   * Added support of the LibSass version 3.5.5
   * Now the LibSass for Windows requires the Microsoft Visual C++ Redistributable for Visual Studio 2017

## v1.9.215 - November 11, 2018
 * In BundleTransformer.ConfigurationIntelliSense updated definitions for configuration settings of LESS translator
 * In BundleTransformer.Less:
   * Added support of LESS version 3.8.1
   * In configuration settings of LESS translator the `StrictMath` property has been replaced by the `Math` property (default `Always`)
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 9.3.1

## v1.9.214 - October 16, 2018
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 9.2

## v1.9.213 - October 2, 2018
 * Added module based on the [NUglify](https://github.com/trullock/NUglify)
 * In BundleTransformer.Core optimized a memory usage
 * In BundleTransformer.ConfigurationIntelliSense:
   * Added a definitions for configuration settings of NUglify minifiers
   * Updated a definitions for configuration settings of Microsoft Ajax JS minifier
 * In BundleTransformer.MicrosoftAjax in configuration settings of JS minifier was added one new property - `ScriptVersion` (default `None`)

## v1.9.212 - September 9, 2018
 * In BundleTransformer.Handlebars added support of Handlebars version 4.0.12
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 9.1.4

## v1.9.211 - August 1, 2018
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 9.0.2

## v1.9.210 - June 29, 2018
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 8.6.4

## v1.9.209 - June 21, 2018
 * In BundleTransformer.TypeScript added support of TypeScript version 2.9.2
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 8.6.3

## v1.9.208 - June 13, 2018
 * In BundleTransformer.ConfigurationIntelliSense updated definitions for configuration settings of TypeScript translator
 * In BundleTransformer.TypeScript:
   * Added support of TypeScript version 2.9 RTM
   * In configuration settings of TypeScript translator was added one new property - `KeyofStringsOnly` (default `false`)
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 8.6.2

## v1.9.207 - May 30, 2018
 * In BundleTransformer.CoffeeScript added support of CoffeeScript version 2.3.1
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 8.5.2

## v1.9.206 - May 13, 2018
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 8.5

## v1.9.205 - May 7, 2018
 * In BundleTransformer.Less added support of LESS version 3.0.4

## v1.9.204 - May 2, 2018
 * In BundleTransformer.CoffeeScript added support of CoffeeScript version 2.3.0

## v1.9.203 - April 28, 2018
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 8.4.1

## v1.9.202 - April 26, 2018
 * In BundleTransformer.SassAndScss added support of LibSass version 3.5.4
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 8.3.0.1

## v1.9.201 - April 22, 2018
 * In BundleTransformer.Less added support of LESS version 3.0.2
 * In BundleTransformer.TypeScript added support of TypeScript version 2.8.3

 ## v1.9.200 - April 16, 2018
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 8.3

## v1.9.199 - April 10, 2018
 * In BundleTransformer.CoffeeScript added support of CoffeeScript version 2.2.4
 * In BundleTransformer.TypeScript added support of TypeScript version 2.8 RTM (please note: The 2.8 RTM release is also called '2.8.1')

## v1.9.198 - March 22, 2018
 * In BundleTransformer.SassAndScss added support of LibSass version 3.5.2
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 8.2

## v1.9.197 - March 14, 2018
 * In BundleTransformer.SassAndScss added support of LibSass version 3.5.1
 * In BundleTransformer.CoffeeScript added support of CoffeeScript version 2.2.3

## v1.9.196 - March 9, 2018
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 8.1.0.1

## v1.9.195 - March 7, 2018
 * In BundleTransformer.SassAndScss added support of LibSass version 3.5.0
 * In BundleTransformer.CleanCss added support of Clean-css version 4.1.11

## v1.9.194 - March 4, 2018
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 8.1

## v1.9.193 - February 22, 2018
 * In BundleTransformer.CoffeeScript added support of CoffeeScript version 2.2.2
 * In BundleTransformer.TypeScript added support of TypeScript version 2.7.2

## v1.9.192 - February 15, 2018
 * In BundleTransformer.Less added support of LESS version 3.0.1

## v1.9.191 - February 13, 2018
 * In BundleTransformer.Less added support of LESS version 3.0.0
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 8.0

## v1.9.190 - February 10, 2018
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 7.2.6

## v1.9.189 - February 9, 2018
 * In BundleTransformer.ConfigurationIntelliSense updated definitions for configuration settings of LESS translator
 * In BundleTransformer.Less in configuration settings of LESS translator was added one new property - `IncludePaths` (default empty list)

## v1.9.188 - February 7, 2018
 * In BundleTransformer.SassAndScss added support of LibSass version 3.4.9
 * In BundleTransformer.CoffeeScript added support of CoffeeScript version 2.2.1

## v1.9.187 - February 2, 2018
 * In BundleTransformer.ConfigurationIntelliSense updated definitions for configuration settings of TypeScript translator
 * In BundleTransformer.CoffeeScript added support of CoffeeScript version 2.2.0
 * In BundleTransformer.TypeScript:
   * Added support of TypeScript version 2.7 RTM
   * In configuration settings of TypeScript translator was added one new property - `StrictPropertyInitialization` (default `false`)

## v1.9.186 - January 14, 2018
 * In BundleTransformer.SassAndScss added support of LibSass version 3.4.8
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 7.2.5

## v1.9.185 - January 3, 2018
 * In BundleTransformer.CoffeeScript added support of CoffeeScript version 2.1.1
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 7.2.4

## v1.9.184 - December 17, 2017
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 7.2.3

## v1.9.183 - December 11, 2017
 * In BundleTransformer.SassAndScss added support of LibSass version 3.4.7
 * In BundleTransformer.CoffeeScript added support of CoffeeScript version 2.1.0
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 7.2.2

## v1.9.182 - December 5, 2017
 * In BundleTransformer.CoffeeScript added support of CoffeeScript version 2.0.3
 * In BundleTransformer.TypeScript added support of TypeScript version 2.6.2
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 7.2.1

## v1.9.181 - November 8, 2017
 * In BundleTransformer.ConfigurationIntelliSense updated definitions for configuration settings of TypeScript translator
 * In BundleTransformer.TypeScript:
   * Added support of TypeScript version 2.6 RTM
   * In configuration settings of TypeScript translator was added one new property - `StrictFunctionTypes` (default `false`)

## v1.9.180 - October 27, 2017
 * In BundleTransformer.CoffeeScript added support of CoffeeScript version 2.0.2

## v1.9.179 - October 26, 2017
 * In BundleTransformer.SassAndScss added support of LibSass version 3.4.6
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 7.1.6

## v1.9.178 - October 18, 2017
 * In BundleTransformer.Handlebars added support of Handlebars version 4.0.11
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 7.1.5

## v1.9.177 - September 28, 2017
 * In BundleTransformer.TypeScript added support of TypeScript version 2.5.3
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 7.1.4.1

## v1.9.176 - September 27, 2017
 * In BundleTransformer.CoffeeScript added support of CoffeeScript version 2.0.1

## v1.9.175 - September 24, 2017
 * In BundleTransformer.ConfigurationIntelliSense updated definitions for configuration settings of CSSO CSS minifier
 * In BundleTransformer.Csso:
   * Added support of CSSO version 3.2.0
   * In configuration settings of CSS minifier was added one new property - `ForceMediaMerge` (default `false`)
 * In BundleTransformer.CleanCss added support of Clean-css version 4.1.9

## v1.9.174 - September 7, 2017
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 7.1.4

## v1.9.173 - September 6, 2017
 * In BundleTransformer.CleanCss added support of Clean-css version 4.1.8

## v1.9.172 - September 1, 2017
 * In BundleTransformer.TypeScript added support of TypeScript version 2.5 RTM (please note: The 2.5 RTM release is also called '2.5.2')

## v1.9.171 - August 29, 2017
 * For compatibility with [Mono](http://www.mono-project.com/) was changed a implementation of the `ToAbsolutePath` method of `VirtualFileSystemWrapper` class
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 7.1.3

## v1.9.171 Beta 1 - August 25, 2017
 * Changed a implementation of the `ToAbsolutePath` method of `VirtualFileSystemWrapper` class

## v1.9.170 - August 17, 2017
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 7.1.2.6

## v1.9.169 - August 7, 2017
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 7.1.2.4

## v1.9.168 - August 4, 2017
 * In BundleTransformer.Csso added support of CSSO version 3.1.1

## v1.9.167 - July 21, 2017
 * In BundleTransformer.CoffeeScript added support of CoffeeScript version 1.12.7
 * In BundleTransformer.TypeScript added support of TypeScript version 2.4.2
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 7.1.2.3
 * In BundleTransformer.CleanCss added support of Clean-css version 4.1.7

## v1.9.166 - July 13, 2017
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 7.1.2.2
 * In BundleTransformer.CleanCss added support of Clean-css version 4.1.6

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

## v1.9.158 - May 17, 2017
 * In BundleTransformer.CoffeeScript added support of CoffeeScript version 1.12.6
 * In BundleTransformer.Autoprefixer added support of Autoprefixer version 7.1
 * In BundleTransformer.CleanCss added support of Clean-css version 4.1.2