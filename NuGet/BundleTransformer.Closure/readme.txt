

   ----------------------------------------------------------------------
             README file for Bundle Transformer: Closure 1.9.51
 
   ----------------------------------------------------------------------

      Copyright (c) 2012-2015 Andrey Taritsyn - http://www.taritsyn.ru


   ===========
   DESCRIPTION
   ===========
   BundleTransformer.Closure contains 2 minifier-adapters for 
   minification of JS-code: `ClosureRemoteJsMinifier` and 
   `ClosureLocalJsMinifier`. 
   
   `ClosureRemoteJsMinifier` is based on the 
   Google Closure Compiler Service API
   (https://developers.google.com/closure/compiler/docs/gettingstarted_api) 
   and requires a permanent connection to the Internet.
   `ClosureLocalJsMinifier` is based on the Google Closure Compiler Application 
   (https://developers.google.com/closure/compiler/docs/gettingstarted_app) 
   and for their work requires the latest version of file compiler.jar.
   
   =============
   RELEASE NOTES
   =============
   1. Added the ability to specify the externs files;
   2. In configuration settings of Closure Remote JS-minifier was
      added 3 new properties: `Charset` (default is empty), `Language`
	  (default `EcmaScript3`) and `UseTypesForOptimization`
	  (default `false`);
   3. In configuration settings of Closure Local JS-minifier was renamed
      one property - `LanguageSpec` to `LanguageInput`, and added 16 new
	  properties: `AcceptConstKeyword` (default `false`), `AllowEs6Output`
	  (default `false`), `AngularPass` (default `false`), `Charset`
	  (default is empty), `DefinitionList` (default is empty),
	  `ErrorList` (default is empty), `ExportLocalPropertyDefinitions`
	  (default `false`), `ExtraAnnotationNameList` (default is empty),
	  `GenerateExports` (default `false`), `LanguageOutput`
	  (default `None`), `SingleQuotes` (default `false`), `TranspileOnly`
      (default `false`), `TurnOffWarningClassList` (default is empty),
	  `UseOnlyCustomExterns` (default `false`), `UseTypesForOptimization`
	  (default `false`) and `WarningList` (default is empty).

   ====================
   POST-INSTALL ACTIONS
   ====================
   To make `ClosureRemoteJsMinifier` or `ClosureLocalJsMinifier` is the 
   default JS-minifier, you need to make changes to the Web.config 
   file. In the `defaultMinifier` attribute of
   `\configuration\bundleTransformer\core\js` element must be set value 
   equal to `ClosureRemoteJsMinifier` or `ClosureLocalJsMinifier`.
   
   To start using `ClosureLocalJsMinifier` need to make the following 
   preliminary work:
   1. On your computer must be installed Java 6 or higher. Latest version 
   of Java can be downloaded at the following link - 
   http://www.java.com/download/.
   2. You need to download the latest version of the Google Closure 
   Compiler Application, which is located on the link - 
   http://dl.google.com/closure-compiler/compiler-latest.zip.
   3. Unzip the downloaded archive and copy the file compiler.jar in 
   some directory on disk of your computer.
   4. In Web.config file find the 
   `configuration/bundleTransformer/closure/local` element, then set 
   the `javaVirtualMachinePath` attribute to a value equal to the path 
   to executable file of the Java Virtual Machine (java.exe), and 
   set the `closureCompilerApplicationPath` attribute to a value equal to 
   the path to JAR-file of the Google Closure Compiler Application 
   (compiler.jar).
   
   =============
   DOCUMENTATION
   =============
   See documentation on CodePlex - 
   http://bundletransformer.codeplex.com/documentation