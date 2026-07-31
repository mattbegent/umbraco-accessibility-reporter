# Define the project file and configuration
$mainProjectFile = "./AccessibilityReporter/AccessibilityReporter.csproj"
$coreProjectFile = "./AccessibilityReporter.Core/AccessibilityReporter.Core.csproj"
$servicesProjectFile = "./AccessibilityReporter.Services/AccessibilityReporter.Services.csproj"

$configuration = "Release"
#$configuration = "Debug"
$outputDirectory = "./build.out"
$version = "4.4.0"

## Perhaps need to do a build of the client after updating the version in the source file
$packageJsonPath = "./AccessibilityReporter/wwwroot/App_Plugins/AccessibilityReporter/umbraco-package.json"

# Delete all files in the output directory
if (Test-Path $outputDirectory) {
    Remove-Item "$outputDirectory/*"
}

# Update the version in umbraco.package.json
if (Test-Path $packageJsonPath) {
    $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
    $packageJson.version = $version
    $packageJson | ConvertTo-Json -Depth 32 | Set-Content $packageJsonPath
} else {
    Write-Output "The file $packageJsonPath does not exist."
}

# Build the client assets first to ensure static web assets are generated
Write-Output "Building client assets..."
Set-Location "./AccessibilityReporter/client"
Write-Output "Installing npm dependencies..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Output "npm install failed."
    exit $LASTEXITCODE
}
Write-Output "Building client..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Output "Client build failed."
    exit $LASTEXITCODE
}
Set-Location "../.."

# Build the main project first to generate static web assets manifest
Write-Output "Building projects..."
dotnet build $mainProjectFile --configuration $configuration
if ($LASTEXITCODE -ne 0) {
    Write-Output "Build failed."
    exit $LASTEXITCODE
}

# Pack the project into a NuGet package
dotnet pack $servicesProjectFile --configuration $configuration --output $outputDirectory /p:Version=$version
dotnet pack $coreProjectFile --configuration $configuration --output $outputDirectory /p:Version=$version
dotnet pack $mainProjectFile --configuration $configuration --output $outputDirectory /p:Version=$version

# Check if the pack was successful
if ($LASTEXITCODE -eq 0) {
    Write-Output "Pack successful."
} else {
    Write-Output "Pack failed."
    exit $LASTEXITCODE
}
