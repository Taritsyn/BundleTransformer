

   ----------------------------------------------------------------------
       README file for Bundle Transformer: Sass and SCSS 1.9.81 Beta 1

   ----------------------------------------------------------------------

      Copyright (c) 2012-2015 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.SassAndScss contains translator-adapter
   `SassAndScssTranslator`. This adapter makes translation of Sass- and
   SCSS-code to CSS-code by using the LibSass Host for .NET
   (http://github.com/Taritsyn/LibSassHost) version 0.3.1 (supports
   libSass version 3.3.1). Also contains debugging HTTP-handler
   `SassAndScssAssetHandler`, which is responsible for text output of
   translated Sass- or SCSS-asset.

   For correct working of the LibSass Host require assemblies
   `msvcp120.dll` and `msvcr120.dll` from the Visual C++ Redistributable
   Packages for Visual Studio 2013.

   =============
   RELEASE NOTES
   =============
   1. Ruby Sass was replaced by libSass;
   2. Now this module requires assemblies `msvcp120.dll` and
      `msvcr120.dll` from the Visual C++ Redistributable Packages for
      Visual Studio 2013;
   3. From configuration settings removed two properties -
      `TraceSelectors` and `DebugInfo`;
   4. In configuration settings `LineNumbers` property has been renamed
      to `SourceComments`;
   5. In configuration settings was added 4 new properties: `IndentType`
      (default `Space`), `IndentWidth` (default `2`), `LineFeedType`
      (default `CrLf`) and `Precision` (default `5`);
   6. Due to the transition to libSass has been significantly increased
      performance of this module;
   7. Now this module supports the string interpolation in file paths;
   8. This module does not resolve paths of the client components
      (images, fonts and CSS files).

   ====================
   POST-INSTALL ACTIONS
   ====================
   If in your system does not assemblies `msvcp120.dll` and
   `msvcr120.dll`, then download and install the Visual C++
   Redistributable Packages for Visual Studio 2013
   (http://www.microsoft.com/en-us/download/details.aspx?id=40784).

   To use a debugging HTTP-handlers in the IIS Classic mode, you need add
   to the `/configuration/system.web/httpHandlers` element of the
   Web.config file a following code:

   <add
	path="*.sass" verb="GET"
	type="BundleTransformer.SassAndScss.HttpHandlers.SassAndScssAssetHandler, BundleTransformer.SassAndScss" />
   <add
	path="*.scss" verb="GET"
	type="BundleTransformer.SassAndScss.HttpHandlers.SassAndScssAssetHandler, BundleTransformer.SassAndScss" />

   =============
   DOCUMENTATION
   =============
   See documentation on CodePlex -
   http://bundletransformer.codeplex.com/documentation