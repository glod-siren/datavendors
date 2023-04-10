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
    numPages: { type: 'long', required: false },
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
    numPages?: number
  }): Promise<DataIndexResults> {
    const searchOptions: DDG.SearchOptions = {offset: 0, vqd: ''};
    const results = await DDG.search(inputs.query, {offset: 0, vqd: ''}).catch(err => Promise.reject(err.response && err.response.status < 500 ? new WebServiceError(err.response.data) : err));
    const numPages = inputs.numPages ?? 1;
    for (let i = 2; i <= numPages; i++) {
      const currentSearchOptions: DDG.SearchOptions = {
        ...searchOptions,
        offset: results.results.length
      };
      try {
        const currentResults = await DDG.search(inputs.query, currentSearchOptions)
          .catch(err => Promise.reject(err.response && err.response.status < 500 ? new WebServiceError(err.response.data) : err));
        results.results.push(...currentResults.results);
      } catch {
        break;
      }
    }

    let htmlRegex = /<[^>]*>/g;
    const structured_content = await Promise.all(results.results.map(async result => {
      const title = result.title;
      const url = result.url;
      const snippet = result.title + " " + result.url + " " + result.description.replace(htmlRegex, "");;
      const rawDescription = result.rawDescription.replace(htmlRegex, "");;
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
        rawDescription
      };
    }));
    return {
      structured_content,
      debug: [{
        resultCount: results.results.length
      }]
    };
  }
}