

   ----------------------------------------------------------------------
               README file for Bundle Transformer: LESS 1.6.19

   ----------------------------------------------------------------------

          Copyright 2013 Andrey Taritsyn - http://www.taritsyn.ru
		  

   ===========
   DESCRIPTION
   ===========
   BundleTransformer.Less contains translator-adapter LessTranslator. 
   This adapter makes translation of LESS-code to CSS-code. Also contains 
   HTTP-handler LessAssetHandler, which is responsible for text output 
   of translated LESS-asset.

   Uses NuGet-package the dotless (http://nuget.org/packages/dotless).
   
   =============
   RELEASE NOTES
   =============
   Fixed bug #22 "Please make lessEngineConfig.DisableUrlRewriting 
   configurable in web.config".
 
   ====================
   POST-INSTALL ACTIONS
   ====================
   To make LessAssetHandler is the default HTTP-handler for LESS-assets, 
   you need to make changes to the Web.config file.
   In the configuration\system.web\httpHandlers element you need to 
   find the following code:
   
   <add path="*.less" verb="GET" 
     type="dotless.Core.LessCssHttpHandler, dotless.Core" />
	 
   And replace it with:

   <add path="*.less" verb="GET" 
     type="BundleTransformer.Less.HttpHandlers.LessAssetHandler, BundleTransformer.Less" />

   Then in the configuration\system.webServer\handlers element you need to 
   find the following code:
   
   <add name="dotless" path="*.less" verb="GET" 
     type="dotless.Core.LessCssHttpHandler,dotless.Core" resourceType="File" 
	 preCondition="" />

   And replace it with:
   
   <add name="LessAssetHandler" path="*.less" verb="GET" 
     type="BundleTransformer.Less.HttpHandlers.LessAssetHandler, BundleTransformer.Less" 
	 resourceType="File" preCondition="" />  
   
   =============
   DOCUMENTATION
   =============
   See documentation on CodePlex - 
   http://bundletransformer.codeplex.com/documentation