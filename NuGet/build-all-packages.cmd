set packages_directory="C:\Projects\BundleTransformer-prerelease\NuGet"

cd %packages_directory%\BundleTransformer.Core
call build-package.cmd

cd %packages_directory%\BundleTransformer.Less
call build-package.cmd

cd %packages_directory%\BundleTransformer.LessLite
call build-package.cmd

cd %packages_directory%\BundleTransformer.SassAndScss
call build-package.cmd

cd %packages_directory%\BundleTransformer.CoffeeScript
call build-package.cmd

cd %packages_directory%\BundleTransformer.TypeScript
call build-package.cmd

cd %packages_directory%\BundleTransformer.MicrosoftAjax
call build-package.cmd

cd %packages_directory%\BundleTransformer.Yui
call build-package.cmd

cd %packages_directory%\BundleTransformer.Closure
call build-package.cmd

cd %packages_directory%\BundleTransformer.JsMin
call build-package.cmd

cd %packages_directory%\BundleTransformer.UglifyJs
call build-package.cmd

cd %packages_directory%\BundleTransformer.Packer
call build-package.cmd

cd %packages_directory%\BundleTransformer.Csso
call build-package.cmd

cd %packages_directory%\BundleTransformer.WG
call build-package.cmd