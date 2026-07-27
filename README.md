# Accessibility Reporter For Umbraco

![Accessibility Reporter logo](https://raw.githubusercontent.com/mattbegent/umbraco-accessibility-reporter/main/logos/logo64.png)

[![Downloads](https://img.shields.io/nuget/dt/Umbraco.Community.AccessibilityReporter?color=cc9900)](https://www.nuget.org/packages/Umbraco.Community.AccessibilityReporter/)
[![NuGet](https://img.shields.io/nuget/vpre/Umbraco.Community.AccessibilityReporter?color=0273B3)](https://www.nuget.org/packages/Umbraco.Community.AccessibilityReporter)

## What is it?

Accessibility Reporter for Umbraco is an award winning content app/workspace view and dashboard that helps you test the accessibility of your website against common accessibility standards, including the Web Content Accessibility Guidelines (WCAG), Section 508 and best practices, directly in Umbraco.

## Why should I use it?

You want to help make your Umbraco website more accessible by testing it against WCAG success criteria.

## How does it work?

It runs an accessibility audit against the current published version of the page that you are editing and displays a report in a tab called 'Accessibility'. The tests are run in an iframe directly in Umbraco or optionally using an Azure function.

## How do I install it?

You can install Accessibility Reporter using Nuget `https://www.nuget.org/packages/Umbraco.Community.AccessibilityReporter`. Once installed when you build your project the files needed for Accessibility Reporter will be copied into your App_Plugins folder. That's it!

## What version should I use?

If you are running Umbraco 17+ use the latest version of Accessibility Reporter, which is version 4 onwards. If you are running Umbraco 10-13, use version 3.5.1.

## Options

You can run Accessibility Reporter without adding any configuration options, as it has some sensible defaults. However, you can configure how it runs by adding an `AccessibilityReporter` section to your `appsettings.json` file.

### Available options

- **ApiUrl** - This is the URL of the API that will run the tests. By default the tests are run in an iframe within Umbraco, however if you website is on a different domain to your Umbraco instance to get around iframe security issues, you can host an API on an Azure function by forking `https://github.com/mattbegent/azure-function-accessibility-reporter` and deploying it to Azure.  
- **TestBaseUrl** (optional) - If you run Umbraco in a headless way or Accessibility Reporter is having trouble finding the domain to test against, set this to the base URL of your wesbite. If not set Accessibility Reporter will try to infer this from available information in Umbraco. In a multisite install this is used as a fallback only for root nodes that don't have a domain bound and aren't covered by `SiteBaseUrls` below - prefer `SiteBaseUrls` when you have more than one site.
- **SiteBaseUrls** (optional) - Per-site base URL overrides for multisite/headless installs where different root nodes don't have Umbraco domains bound to them. Keyed by each root node's Key (the Guid shown on that node's Info tab), so a different base URL can be used per site instead of forcing every site onto the single `TestBaseUrl`. Not needed if your root nodes already have domains configured in Umbraco - those are resolved automatically per site.
- **TestsToRun** (optional) - This sets which axe-core rules should be run. For example, you may want to test your website against `wcag2a` only. A full list of supported tags can be found in the [axe-core documentation](https://www.deque.com/axe/core-documentation/api-documentation/#axe-core-tags). If not set Accessibility Reporter defaults to WCAG A and AA tests. 
- **UserGroups** (optional) - Use this option if you want to restrict which user groups can see Accessibility Reporter. By default users with admin, editor or writer permissions can see it.
- **ExcludedDocTypes** (optional) - Use this option if you want to exclude Accessibility Reporter from showing on certain document types.
- **RunTestsAutomatically** (optional) - By default Accessibility Reporter runs as soon as you open up a content node. If you instead want Accessibility Reporter to run on demand via a button click, set this option to false.
- **IncludeIfNoTemplate** (optional) - By default Accessibility Reporter does not run on content without templates. However, if you are using Umbraco in a headless way you will was to set this to true.
- **MaxPages** (optional) - This sets the maximum number of pages that the dashboard will test against. The default is set to 50.

### Example options

    "AccessibilityReporter": {
        "ApiUrl": "https://api.example.com/api/audit",
        "TestBaseUrl": "https://example.com",
        "SiteBaseUrls": {
            "b1a2c3d4-e5f6-7890-abcd-ef1234567890": "https://site-two.example.com"
        },
        "TestsToRun": [
            "wcag2a", 
            "wcag2aa", 
            "wcag21a", 
            "wcag21aa", 
            "wcag22aa"
        ],
        "UserGroups": [
            "admin",
            "editor",
            "writer"
        ],
        "ExcludedDocTypes": [
            "excludedPage"
        ],
        "RunTestsAutomatically": false,
        "MaxPages": 20
    }

### Defaults

All options are completely optional and if you don't set them, they default to the following:

    "AccessibilityReporter": {
        "ApiUrl": "",
        "TestBaseUrl": "",
        "SiteBaseUrls": {},
        "TestsToRun": [
            "wcag2a", 
            "wcag2aa", 
            "wcag21a", 
            "wcag21aa", 
            "wcag22aa",
            "best-practice"
        ],
        "UserGroups": [
            "admin",
            "administrators",
            "editor",
            "editors",
            "writer",
            "writers",
            "translator",
            "translators", 
            "sensitiveData",
            "sensitive data"
        ],
        "RunTestsAutomatically": true,
        "IncludeIfNoTemplate": false,
        "MaxPages": 50
    }

## How to use with a headless setup

If you use Umbraco in a headless way and you do not have a way of previewing the published page within Umbraco, you will have to setup an azure function in order to get Accessibility Reporter working. This is due to cross domain security restrictions within iframes.

To do this deploying the following azure function https://github.com/mattbegent/azure-function-accessibility-reporter and update your websites `appsettings.json` file. Here is an example:

    "AccessibilityReporter": {
        "ApiUrl": "https://api.example.com/api/audit/", // your azure function
        "TestBaseUrl": "https://www.example.com", // base url of your website
        "RunTestsAutomatically": false, // as running in a function costs a small amount you might not to run automatically
        "IncludeIfNoTemplate": true // headless content probably doesn't have a template
    }

It's worth noting that if you are using Accessibility Reporter in this way the tests will take much longer than if you run Umbraco in a non headless way.

## Multisite

Accessibility Reporter supports Umbraco installs with more than one root content node ("site"):

- The dashboard tests pages from every site, allocating the `MaxPages` limit fairly across them rather than letting one large site use up the whole budget.
- If a selected language isn't supported by a particular site, that site's pages are skipped for that run rather than tested with a broken URL.
- Dashboard results and exports show which site each page belongs to whenever more than one site is present in the results.
- If your root nodes have domains bound to them in Umbraco, per-site URLs are resolved automatically - no configuration needed.
- If you run a headless multisite install with no domains bound to root nodes, use `SiteBaseUrls` (see Options above) to set a base URL per site instead of `TestBaseUrl`.
- If a site's public domain is genuinely different to your Umbraco backoffice's own domain, in-browser testing on the content workspace view can't cross that boundary for browser security reasons (the same restriction described in "How to use with a headless setup"). You'll see an explicit error telling you to configure `ApiUrl` for that site rather than the test silently running against the wrong page.

## Limitations

The accessibility report runs on the current published page URL you are editing.

Automated accessibility testing is no substitute for manual testing and testing using real users. In a [UK government blog article](https://accessibility.blog.gov.uk/2017/02/24/what-we-found-when-we-tested-tools-on-the-worlds-least-accessible-webpage/) they created a test page with 143 accessibility issues on it and the best automated tool only discovered 37% of the issues. However, automated accessibility testing does help to find common issues and technical failures.

## Roadmap

- History. This will mean the dashboard is automatically populated.
- Scheduling.
- Manual test recommendations.
- Localization - if anyone speaks any languages other than English it would be super to get some help.

## Contributors

- [Matt Begent](https://github.com/mattbegent)
- [Jack Durcan](https://github.com/jdurcan)
- [Warren Buckley](https://github.com/warrenbuckley)

## License

Copyright © [Matt Begent](https://mattbegent.co.uk/).

All source code is licensed under the [Mozilla Public License](https://github.com/mattbegent/azure-function-accessibility-reporter/blob/main/LICENSE).

## Third party licensing

[axe-core](https://github.com/dequelabs/axe-core) is licensed under the [Mozilla Public License 2.0](https://www.mozilla.org/en-US/MPL/2.0/).

[Chart.js](https://github.com/chartjs/Chart.js) is licensed under the [MIT License](https://github.com/chartjs/Chart.js/blob/master/LICENSE.md).

[SheetJS Community Edition](https://docs.sheetjs.com/) is licensed under the [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0).

[patternomaly](https://github.com/ashiguruma/patternomaly) is licensed under the [MIT License](https://github.com/ashiguruma/patternomaly/blob/master/LICENSE).
