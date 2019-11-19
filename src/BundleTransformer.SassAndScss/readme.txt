

   --------------------------------------------------------------------------------
               README file for Bundle Transformer: Sass and SCSS v1.12.6

   --------------------------------------------------------------------------------

           Copyright (c) 2012-2019 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.SassAndScss contains one translator-adapter -
   `SassAndScssTranslator`. This adapter makes translation of Sass and SCSS code to
   CSS code by using the LibSass Host for .NET 
   (https://github.com/Taritsyn/LibSassHost) version 1.2.10 (supports the LibSass
   (http://sass-lang.com/libsass) version 3.6.3). Also contains the
   `SassAndScssAssetHandler` debugging HTTP handler, which is responsible for text
   output of translated Sass or SCSS asset.

   This package does not contain the native implementations of LibSass for Windows.
   Therefore, you need to choose and install the most appropriate package(s) for
   your platform. The following packages are available:

    * LibSassHost.Native.win-x86
    * LibSassHost.Native.win-x64

   =============
   RELEASE NOTES
   =============
   Added support of the LibSass version 3.6.3.

   ====================
   POST-INSTALL ACTIONS
   ====================
   To use a debugging HTTP handlers in the IIS Classic mode, you need add to the
   `/configuration/system.web/httpHandlers` element of the `Web.config` file a
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
   See documentation on GitHub - https://github.com/Taritsyn/BundleTransformer/wiki