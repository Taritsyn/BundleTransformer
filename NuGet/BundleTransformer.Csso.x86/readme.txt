

   ----------------------------------------------------------------------
             README file for Bundle Transformer: CSSO 1.6.6 (x86)
 
   ----------------------------------------------------------------------

          Copyright 2012 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.Csso.x86 contains one minifier-adapter for 
   minification of CSS-code - KryzhanovskyCssMinifier. 
   KryzhanovskyCssMinifier is based on the Sergey Kryzhanovsky's 
   CSSO (http://github.com/css/csso) version 1.3.4.
   
   As a JS-engine is used the Noesis Javascript .NET 
   (http://javascriptdotnet.codeplex.com). For correct working of the 
   Noesis Javascript .NET require assemblies msvcp100.dll and 
   msvcr100.dll from the Microsoft Visual C++ 2010.
   
   ====================
   POST-INSTALL ACTIONS
   ====================
   If in your system does not assemblies msvcp100.dll and msvcr100.dll, 
   then download and install the Microsoft Visual C++ 2010 
   Redistributable Package (x86), which is available at the following 
   link - http://www.microsoft.com/en-us/download/details.aspx?id=5555.

   To make KryzhanovskyCssMinifier is the default CSS-minifier, you need to 
   make changes to the Web.config file. In the defaultMinifier attribute 
   of the \configuration\bundleTransformer\core\css element must be set 
   value equal to KryzhanovskyCssMinifier.
   
   =============
   DOCUMENTATION
   =============
   See documentation on CodePlex - 
   http://bundletransformer.codeplex.com/documentation