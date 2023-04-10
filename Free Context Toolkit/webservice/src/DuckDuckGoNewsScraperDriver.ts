import { DataIndexResults, InputSchema, OutputConfiguration, ServiceDefinition, WebServiceError } from '@sirensolutions/web-service-interface';
import DDG = require('duck-duck-scrape');
import { matching } from './matchingObject';
import crypto from 'crypto';
import validator from 'email-validator';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

interface Matches {
    [key: string]: string[];
}

export default class DuckDuckGoNewsScraperDriver extends ServiceDefinition {
    readonly name = 'duckduckgo-news-scraper';

    readonly inputSchema: InputSchema = {
        query: { type: 'text', required: true },
        cropNumber: { type: 'text', required: true },
        numPages: { type: 'text', required: false },
        exact_search: { type: 'text', required: false },
        site_search: { type: 'text', required: false },
        timeType: { type: 'text', required: false }
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
        timeType?: string
    }): Promise<DataIndexResults> {
        const { query, cropNumber, exact_search, site_search } = inputs;
        // Wrap query in double quotes if exact_search is true
        const splitregex = /\s|\./g;
        const searchQuery = inputs.exact_search === 'true' ? `+${inputs.query.split(splitregex).join(' AND +')} AND +"${inputs.query}"` : inputs.query;

        // Append site search string if provided
        const siteQuery = inputs.site_search ? ` AND site:${inputs.site_search}` : '';
        const searchTimeType = inputs.timeType as DDG.SearchTimeType || DDG.SearchTimeType.ALL;
        const searchOptions: DDG.NewsSearchOptions = { offset: 0, vqd: '', time: searchTimeType };
        const results = await DDG.searchNews(searchQuery + siteQuery, { offset: 0, vqd: '' }).catch(err => Promise.reject(err.response && err.response.status < 500 ? new WebServiceError(err.response.data) : err));
        const numPages = inputs.numPages ?? '20';
        for (let i = 2; i <= Number.parseInt(numPages); i++ && results.results.length < Number.parseInt(cropNumber)) {
            const currentSearchOptions: DDG.NewsSearchOptions = {
                ...searchOptions,
                offset: results.results.length,
                time: searchTimeType
            };
            try {
                const currentResults = await await DDG.searchNews(searchQuery + siteQuery, currentSearchOptions)
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
            const snippet = result.title + " " + result.url + " " + result.excerpt.replace(htmlRegex, "");
            const rawDescription = '';
            const icon = '';
            const image = result.image;
            let pattern_matches: Matches = {};
            matching.forEach((match) => {
                let matchArray = snippet.match(match.pattern);
                if (matchArray) {
                    Object.assign(pattern_matches, { [match.name]: matchArray });
                }
            });
            for (const key in pattern_matches) {
                pattern_matches[key] = [...new Set(pattern_matches[key])].sort();
            }
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
            const elasticDate = result.relativeTime && new Date(result.date * 1000).toISOString();
            return {
                id: crypto.createHash('sha256')
                    .update(`${inputs.query}|${url}`)
                    .digest('hex'),
                query: inputs.query,
                title,
                url,
                snippet,
                syndicate: result.syndicate,
                image,
                pattern_matches,
                retrievedAt: new Date().toISOString(),
                rawDescription,
                position: index + 1,
                relativeTime: elasticDate
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
