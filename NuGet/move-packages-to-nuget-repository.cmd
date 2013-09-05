set packages_directory="C:\Projects\BundleTransformer\NuGet"
set repository_directory="C:\NuGet Repository"

move %packages_directory%\BundleTransformer.Core\*.nupkg %repository_directory% 
move %packages_directory%\BundleTransformer.Less\*.nupkg %repository_directory% 
move %packages_directory%\BundleTransformer.SassAndScss\*.nupkg %repository_directory% 
move %packages_directory%\BundleTransformer.CoffeeScript\*.nupkg %repository_directory% 
move %packages_directory%\BundleTransformer.TypeScript\*.nupkg %repository_directory% 
move %packages_directory%\BundleTransformer.MicrosoftAjax\*.nupkg %repository_directory% 
move %packages_directory%\BundleTransformer.Yui\*.nupkg %repository_directory% 
move %packages_directory%\BundleTransformer.Closure\*.nupkg %repository_directory% 
move %packages_directory%\BundleTransformer.JsMin\*.nupkg %repository_directory% 
move %packages_directory%\BundleTransformer.UglifyJs\*.nupkg %repository_directory% 
move %packages_directory%\BundleTransformer.Packer\*.nupkg %repository_directory% 
move %packages_directory%\BundleTransformer.Csso\*.nupkg %repository_directory% 
move %packages_directory%\BundleTransformer.WG\*.nupkg %repository_directory% 