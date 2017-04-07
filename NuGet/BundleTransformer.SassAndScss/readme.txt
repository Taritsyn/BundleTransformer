

   --------------------------------------------------------------------------------
              README file for Bundle Transformer: Sass and SCSS v1.9.153

   --------------------------------------------------------------------------------

           Copyright (c) 2012-2017 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.SassAndScss contains translator-adapter `SassAndScssTranslator`.
   This adapter makes translation of Sass- and SCSS-code to CSS-code by using the
   LibSass Host for .NET (http://github.com/Taritsyn/LibSassHost) version 1.0.3
   (supports LibSass version 3.4.4). Also contains debugging HTTP-handler
   `SassAndScssAssetHandler`, which is responsible for text output of translated
   Sass- or SCSS-asset.

   This package does not contain the native implementations of LibSass for Windows.
   Therefore, you need to choose and install the most appropriate package(s) for
   your platform. The following packages are available:

    * LibSassHost.Native.win-x86
    * LibSassHost.Native.win-x64

   For correct working of the LibSass Host requires `msvcp140.dll` assembly from
   the Visual C++ Redistributable for Visual Studio 2015.

   =============
   RELEASE NOTES
   =============
   Added support of LibSass version 3.4.4.

   ====================
   POST-INSTALL ACTIONS
   ====================
   If in your system does not `msvcp140.dll` assembly, then download and install
   the Visual C++ Redistributable for Visual Studio 2015
   (http://www.microsoft.com/en-us/download/details.aspx?id=48145).

   To use a debugging HTTP-handlers in the IIS Classic mode, you need add to the
   `/configuration/system.web/httpHandlers` element of the Web.config file a
   following code:

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