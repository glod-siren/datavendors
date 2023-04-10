import { DataIndexResults, InputSchema, OutputConfiguration, ServiceDefinition, WebServiceError } from '@sirensolutions/web-service-interface';
import DDG = require('duck-duck-scrape');
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { matching } from './matchingObject';
import validator from 'email-validator';
import crypto from 'crypto';

interface Matches {
  [key: string]: string[];
}

export default class DuckDuckGoScraperDriver extends ServiceDefinition {
  readonly name = 'duckduckgo-scraper';

  readonly inputSchema: InputSchema = {
    query: { type: 'text', required: true },
    cropNumber: { type: 'text', required: true },
    numPages: { type: 'text', required: false },
    exact_search: { type: 'text', required: false },
    site_search: { type: 'text', required: false },

  };

  readonly outputConfiguration: OutputConfiguration = {
    structured_content: {
      phoneNumbers: 'keyword',
      ipAddresses: 'keyword',
      retrievedAt: 'date'
    },
    debug: { resultCount: 'long' }
  };

  async invoke(inputs: {
    query: string,
    cropNumber: string
    numPages?: string,
    exact_search?: string,
    site_search?: string,
  }): Promise<DataIndexResults> {
    const { query, cropNumber, exact_search, site_search } = inputs;
    // Wrap query in double quotes if exact_search is true
    const searchQuery = inputs.exact_search === 'true' ? `+${inputs.query.split(' ').join(' AND +')} AND "${inputs.query}"` : inputs.query;
  
    // Append site search string if provided
    const siteQuery = inputs.site_search ? ` AND site:${inputs.site_search}` : '';
    const searchOptions: DDG.SearchOptions = {offset: 0, vqd: ''};
    const results = await DDG.search(searchQuery + siteQuery, {offset: 0, vqd: ''}).catch(err => Promise.reject(err.response && err.response.status < 500 ? new WebServiceError(err.response.data) : err));
    const numPages = inputs.numPages ?? '20';
    for (let i = 2; i <= Number.parseInt(numPages); i++ && results.results.length < Number.parseInt(cropNumber)) {
      const currentSearchOptions: DDG.SearchOptions = {
        ...searchOptions,
        offset: results.results.length
      };
      try {
        const currentResults = await DDG.search(searchQuery + siteQuery, currentSearchOptions)
          .catch(err => Promise.reject(err.response && err.response.status < 500 ? new WebServiceError(err.response.data) : err));
        results.results.push.apply(currentResults.results);
      } catch {
        break;
      }
    }
    let htmlRegex = /<[^>]*>/g;
    const croppedResults = results.results.slice(0, Number.parseInt(cropNumber));

    const structured_content = croppedResults.map((result, index) => {
      const title = result.title;
      const url = result.url;
      const snippet = result.title + " " + result.url + " " + result.description.replace(htmlRegex, "");
      const rawDescription = result.rawDescription.replace(htmlRegex, "");
      const icon = result.icon;
      let pattern_matches: Matches = {};
      matching.forEach((match) => {
        let matchArray = snippet.match(match.pattern);
        if (matchArray) {
          Object.assign(pattern_matches, { [match.name]: matchArray });
        }
      });
      const defaultCountry = 'US';
      const removeNonNumeric = (str?: string) => str ? str.replace(/\D/g, '') : '';
      if (pattern_matches.hasOwnProperty('phoneRegex')) {
        const phoneNumbers = pattern_matches.phoneRegex
          .filter(phoneNumberString => phoneNumberString) // filter out undefined values
          .map((phoneNumberString) => {
            phoneNumberString = removeNonNumeric(phoneNumberString);
            // Remove the number 1 if it's the first digit
            if (phoneNumberString.charAt(0) === '1') {
              phoneNumberString = phoneNumberString.slice(1);
            }
            const phoneNumber = parsePhoneNumberFromString(phoneNumberString, defaultCountry);
            if (phoneNumber && phoneNumber.isValid()) {
              // Return the formatted phone number
              return phoneNumber.formatInternational();
            }
          })
          .filter(Boolean); // Remove null values from the phoneNumbers array
        Object.assign(pattern_matches, { validatedPhoneNumbers: phoneNumbers });
      }

      if (pattern_matches.hasOwnProperty('emailRegex')) {
        const emailsValidated = pattern_matches.emailRegex
          .filter(email => validator.validate(email));
        Object.assign(pattern_matches, { emailsValidated });
      }
      for (const key in pattern_matches) {
        if (key === 'domainRegex') {
          pattern_matches[key] = pattern_matches[key].map((url) => {
            const domainRegex = /^https?:\/\/(?:www\.)?([a-zA-Z0-9-]+)\.([a-zA-Z]{2,63})(?:\/|$)/i;
            const match = url.match(domainRegex);
            if (match) {
              return match[1] + '.' + match[2];
            } else {
              return url;
            }
          });
          pattern_matches[key] = [...new Set(pattern_matches[key])].sort();
        } else {
          pattern_matches[key] = [...new Set(pattern_matches[key])].sort();
        }
      }

      for (const key in pattern_matches) {
        pattern_matches[key] = [...new Set(pattern_matches[key])].sort();
      }
      return {
        id: crypto.createHash('sha256')
        .update(`${inputs.query}|${url}`)
        .digest('hex'),
        query: inputs.query,
        title,
        url,
        snippet,
        icon,
        pattern_matches,
        retrievedAt: new Date().toISOString(),
        rawDescription,
        position: index + 1
      };
    });
    return {
      structured_content,
      debug: [{
        resultCount: croppedResults.length
      }]
    };
  }
}