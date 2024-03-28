# Accessibility Reporter For Umbraco

![Accessibility Reporter logo](https://raw.githubusercontent.com/mattbegent/umbraco-accessibility-reporter/main/logos/logo64.png)

## What is it?

Accessibility Reporter for Umbraco is a dashboard and a content app that helps you test the accessibility of your website against common accessibility standards, including the Web Content Accessibility Guidelines (WCAG), Section 508 and best practices, directly in Umbraco.

## Main features

- Test your website against the Web Content Accessibility Guidelines (WCAG), Section 508 and best practices directly within Umbraco.
- Test your entire website for accessibility issues.
- A dashboard that displays the test results, including statistics and charts showing pages with the most issues and the most common violations.
- A content app displays the test results of your current page when editing content.
- A detail view containing information on the location of issues in the code and how to fix them.
- A page scoring system.
- A manual testing checklist.

## Screenshots

### Dashboard of results

![Dashboard showing the results of a multipage accessibility test](https://raw.githubusercontent.com/mattbegent/umbraco-accessibility-reporter/main/screenshots/dashboard.png)

### Single page result

![Dashboard of accessibility test results for a single page](https://raw.githubusercontent.com/mattbegent/umbraco-accessibility-reporter/main/screenshots/results.png)

## Why should I use it?

You want to help make your Umbraco website more accessible by testing it against WCAG success criteria.

## How does it work?

It runs an accessibility audit against the current published version of the page that you are editing and displays a report in a tab called 'Accessibility'. The tests are run in an iframe directly in Umbraco or optionally using an Azure function.

## How do I install it?

You can install Accessibility Reporter using Nuget `https://www.nuget.org/packages/Umbraco.Community.AccessibilityReporter`. Once installed when you build your project the files needed for Accessibility Reporter will be copied into your App_Plugins folder. That's it!

## Options

You can run Accessibility Reporter without adding any configuration options, as it has some sensible defaults. However, you can configure how it runs by adding an `AccessibilityReporter` section to your `appsettings.json` file.

### Available options

- **ApiUrl** - This is the URL of the API that will run the tests. By default the tests are run in an iframe within Umbraco, however if you website is on a different domain to your Umbraco instance to get around iframe security issues, you can host an API on an Azure function by forking `https://github.com/mattbegent/azure-function-accessibility-reporter` and deploying it to Azure.  
- **TestBaseUrl** (optional) - If you run Umbraco in a headless way or Accessibility Reporter is having trouble finding the domain to test against, set this to the base URL of your wesbite. If not set Accessibility Reporter will try to infer this from available information in Umbraco.
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
            "editor",
            "writer",
            "translator", 
            "sensitiveData"
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

## Limitations

The accessibility report runs on the current published page URL you are editing.

Automated accessibility testing is no substitute for manual testing and testing using real users. In a [UK government blog article](https://accessibility.blog.gov.uk/2017/02/24/what-we-found-when-we-tested-tools-on-the-worlds-least-accessible-webpage/) they created a test page with 143 accessibility issues on it and the best automated tool only discovered 37% of the issues. However, automated accessibility testing does help to find common issues and technical failures.

## Roadmap

- History. This will mean the dashboard is automatically populated.
- Scheduling.
- Support for multisite setups.
- Manual test recommendations.
- Localization - if anyone speaks any languages other than English it would be super to get some help.

## Contributors

- [Matt Begent](https://github.com/mattbegent)
- [Jack Durcan](https://github.com/jdurcan)

## License

Copyright © [Matt Begent](https://mattbegent.co.uk/).

All source code is licensed under the [Mozilla Public License](https://github.com/mattbegent/azure-function-accessibility-reporter/blob/main/LICENSE).

## Third party licensing

[axe-core](https://github.com/dequelabs/axe-core) is licensed under the [Mozilla Public License 2.0](https://www.mozilla.org/en-US/MPL/2.0/).

[Chart.js](https://github.com/chartjs/Chart.js) is licensed under the [MIT License](https://github.com/chartjs/Chart.js/blob/master/LICENSE.md).

[SheetJS Community Edition](https://docs.sheetjs.com/) is licensed under the [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0).

[patternomaly](https://github.com/ashiguruma/patternomaly) is licensed under the [MIT License](https://github.com/ashiguruma/patternomaly/blob/master/LICENSE).