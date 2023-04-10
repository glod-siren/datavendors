# Context Toolkit

## Overview

The Context Toolkit is a web service that provides additional information from search results, summaries, translations, and scraped pages using publicly accessible APIs and projects. The toolkit can be used to leverage free tools and APIs to search the web and extract information from the results.

This project is a public accessible sandbox for experimental data source connections to Siren platform. It is not officially supported by Siren Solutions and everything provided here is open source using publicly accessible APIs and projects. 

## Installation

1. Run `npm run package` to create a zip file of the toolkit.
2. Run `bin/investigate-plugin install file:////path/to/context-toolkit/target/context-toolkit.zip` to install the toolkit into the Siren Platform.

## Usage

After installing the Context Toolkit into the Siren Platform, it can be invoked using the Siren API. Here is an example of invoking the toolkit using the Siren API:

```javascript
const config = {
    titleText: "Search DuckDuck Go Top 20",
    destination: "DuckDuckGo",
    WSName: 'context-toolkit',
    WSType: 'duckduckgo-scraper',
    WSStoreData: true,
    WSReturnData: true,
    bannerUrl: 'https://duckduckgo.com/_next/static/media/logo-horizontal-dark.53712807.svg',
}

let invocation = await sirenapi.invokeWebService(
  config.WSName,
  config.WSType,
  {
    query: variable //replace variable with whatever is getting the query such as a modal
    numPages: 1 // put in the number of pages you want to return, pages are usually 20-30 results each
  },
  { storeData: config.WSStoreData, returnData: config.WSReturnData }
);
```

## Modifying Pattern Matching

The `matchingObject.ts` file contains an array of objects that define pattern matches for various types of data. To modify the pattern matching, edit the regular expressions defined in the `matching` array

```typescript
export const matching = [
    {
        name: 'phoneRegex',
        pattern: /(\+\d{1,3}\s?)?(\(\d{1,4}\)|\d{1,4})\s?\d{1,4}[\s.-]?\d{1,4}(\s?(x|ext)\s?\d{1,4})?/g
    },
    {
        name: 'emailRegex',
        pattern: /\w+@\w+\.\w+/g
    },
    {
        name: 'urlRegex',
        pattern: /(?:http|https):\/\/[^\s/$.?#].[^\s]*/g
    },
    {
        name: 'ipRegex',
        pattern: /(\d{1,3}\.){3}\d{1,3}/g
    },
    {
        name: 'personRegex',
        pattern: /(?<!\w)([A-Z][a-zA-ZÀ-ÖØ-öø-ÿ]+(?:\s+[A-Z][a-zA-ZÀ-ÖØ-öø-ÿ]+)+)(?!\w)/g
    },
    {
        name: 'vinRegex',
        pattern: /[A-HJ-NPR-Za-hj-npr-z\d]{8}[\dX][A-HJ-NPR-Za-hj-npr-z\d]{2}\d{6}/g
    },
    {
        name: 'socialSecurityRegex',
        pattern: /\b\d{3}-?\d{2}-?\d{4}\b/g
    },
    {
        name: 'domainRegex',
        pattern: /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+)\.([a-zA-Z]{2,63})(?:\/\S*)?/gi
    },
[...]
]
```