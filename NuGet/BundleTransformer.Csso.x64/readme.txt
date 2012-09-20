

   ----------------------------------------------------------------------
             README file for Bundle Transformer: CSSO 1.6.1 (x64)
 
   ----------------------------------------------------------------------

          Copyright 2012 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.Csso.x64 contains one minifier-adapter for 
   minification of CSS-code - KryzhanovskyCssMinifier. 
   KryzhanovskyCssMinifier is based on the Sergey Kryzhanovsky's 
   CSSO (http://github.com/css/csso) version 1.2.18.
   
   As a JS-engine is used the Noesis Javascript .NET 
   (http://javascriptdotnet.codeplex.com). For correct working of the 
   Noesis Javascript .NET require assemblies msvcp100.dll and 
   msvcr100.dll from the Microsoft Visual C++ 2010.
   
   =============
   RELEASE NOTES
   =============
   1. Added support of CSSO version 1.2.18;
   2. Fixed a bug, that occurred when processing of large CSS-files, 
      by replacing the EcmaScript.Net on the Noesis Javascript. NET;
   3. BundleTransformer.Csso was divided into 2 libraries: 
      BundleTransformer.Csso.x86 and BundleTransformer.Csso.x64.
   
   ====================
   POST-INSTALL ACTIONS
   ====================
   If in your system does not assemblies msvcp100.dll and msvcr100.dll, 
   then download and install the Microsoft Visual C++ 2010 
   Redistributable Package (x64), which is available at the following 
   link - http://www.microsoft.com/en-us/download/details.aspx?id=14632.
   
   =============
   DOCUMENTATION
   =============
   See documentation on CodePlex - 
   http://bundletransformer.codeplex.com/documentation