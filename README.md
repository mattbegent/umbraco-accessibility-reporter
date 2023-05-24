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

## Limitations

The accessibility report runs on the current page URL you are editing. This means that if the URL is not publicly available, or the front-end of website is on a different domain it will not return results, unless you set the domain in Culture and Hostnames.

Automated accessibility testing is no substitute for manual testing and testing using real users. In a [UK government blog article](https://accessibility.blog.gov.uk/2017/02/24/what-we-found-when-we-tested-tools-on-the-worlds-least-accessible-webpage/) they created a test page with 143 accessibility issues on it and the best automated tool only discovered 37% of the issues. However, automated accessibility testing does help to find common issues and technical failures.

## Roadmap

- Work out a nice way of running the report for Umbraco setups where Umbraco is on a different domain to the front-end of the website.
- Add options so that users can choose what WCAG level to run the tests against.
- Localization - if anyone speaks any languages other than English it would be super to get some help.

## License

Copyright © [Matt Begent](https://mattbegent.co.uk/).

All source code is licensed under the [Mozilla Public License](https://github.com/mattbegent/azure-function-accessibility-reporter/blob/main/LICENSE).

## Third party licensing

[axe-core](https://github.com/dequelabs/axe-core) is licensed under the [Mozilla Public License 2.0](https://www.mozilla.org/en-US/MPL/2.0/).

[SheetJS Community Edition](https://docs.sheetjs.com/) is licensed under the [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0).