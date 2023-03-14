# Accessibility Reporter For Umbraco

![Accessibility Reporter logo](https://raw.githubusercontent.com/mattbegent/umbraco-accessibility-reporter/main/logos/logo64.png)

## What is it?

Accessibility Reporter for Umbraco is a content app that helps you to make your website accessible.

## Why should I use it?

You want to help make your Umbraco website more accessible by testing it against Web Content Accessibility Guidelines success criteria.

## How does it work?

It runs an accessibility audit against the current live version of the page that you are editing and displays a report in a tab called 'Accessibility'.

## How do I install it?

You can install Accessibility Reporter using Nuget `https://www.nuget.org/packages/Umbraco.Community.AccessibilityReporter`. Once installed when you build your project the files needed for Accessibility Reporter will be copied into your App_Plugins folder. That's it!.

## Options

You can configure how Accessibility Reporter runs by adding an `AccessibilityReporter` section to your `appsettings.json` file.

### Available options

- **ApiUrl** - This is the URL of the API that will run the tests. By default this is `https://api.accessibilityreporter.com/api/audit`, however you can host your own Azure function by forking `https://github.com/mattbegent/azure-function-accessibility-reporter` and deploying it to Azure.  
- **TestBaseUrl** (optional) - If you have a single website in your Umbraco instance this sets the base URL to test against. If not set Accessibility Reporter will try to infer this from available information in Umbraco.
- **TestUrlsMap** (optional) - If you have multiple websites in your Umbraco instance use this to set the test URL for each website. The name should match the node name in Umbraco.
- **Tags** (optional) - This sets which axe-core rules should be run. For example, you may want to test your website against `wcag2a` only. A full list of supported tags can be found in the [axe-core documentation](https://www.deque.com/axe/core-documentation/api-documentation/#axe-core-tags). If not set Accessibility Reporter defaults to the axe-core defaults. 
- **UserGroups** (optional) - Use this option if you want to restrict which user groups can see Accessibility Reporter.
- **RunOnButton** (optional) - Use this option if you want Accessibility Reporter to run only when users click on the button in the content app, rather than the default, which is when you open up a content node.

### Example options

    "AccessibilityReporter": {
        "ApiUrl": "https://api.accessibilityreporter.com/api/audit",
        "TestBaseUrl": "https://example.com",
        "TestUrlsMap": [
            {
                "Name": "Website 1",
                "Url": "https://website1.com"
            },
            {
                "Name": "Website 2",
                "Url": "https://website2.com"
            },
            {
                "name": "Website 3",
                "Url": "https://website3.com"
            },
            {
                "name": "Website 4",
                "Url": "https://website4.com"
            }
        ],
        "Tags": [
            "wcag2a",
            "wcag2aa"
        ],
        "UserGroups": [
            "admin"
        ],
        "RunOnButton": false
    }

## Limitations

The accessibility report runs on the current page URL you are editing. This means that if the URL is not publicly available it will not return results.

Automated accessibility testing is no substitute for manual testing and testing using real users. In a [UK government blog article](https://accessibility.blog.gov.uk/2017/02/24/what-we-found-when-we-tested-tools-on-the-worlds-least-accessible-webpage/) they created a test page with 143 accessibility issues on it and the best automated tool only discovered 37% of the issues. However, automated accessibility testing does help to find common issues and technical failures.

## Roadmap

- Manual test recommendations.
- Localization - if anyone speaks any languages other than English it would be super to get some help.

## License

Copyright © [Matt Begent](https://mattbegent.co.uk/).

All source code is licensed under the [Mozilla Public License](https://github.com/mattbegent/azure-function-accessibility-reporter/blob/main/LICENSE).