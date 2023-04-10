"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web_service_interface_1 = require("@sirensolutions/web-service-interface");
const DDG = require("duck-duck-scrape");
const libphonenumber_js_1 = require("libphonenumber-js");
const matchingObject_1 = require("./matchingObject");
const email_validator_1 = __importDefault(require("email-validator"));
const crypto_1 = __importDefault(require("crypto"));
class DuckDuckGoScraperDriver extends web_service_interface_1.ServiceDefinition {
    constructor() {
        super(...arguments);
        this.name = 'duckduckgo-scraper';
        this.inputSchema = {
            query: { type: 'text', required: true },
            cropNumber: { type: 'text', required: true },
            numPages: { type: 'text', required: false },
            exact_search: { type: 'text', required: false },
            site_search: { type: 'text', required: false },
        };
        this.outputConfiguration = {
            structured_content: {
                phoneNumbers: 'keyword',
                ipAddresses: 'keyword',
                retrievedAt: 'date'
            },
            debug: { resultCount: 'long' }
        };
    }
    async invoke(inputs) {
        const { query, cropNumber, exact_search, site_search } = inputs;
        // Wrap query in double quotes if exact_search is true
        const searchQuery = inputs.exact_search === 'true' ? `+${inputs.query.split(' ').join(' AND +')} AND "${inputs.query}"` : inputs.query;
        // Append site search string if provided
        const siteQuery = inputs.site_search ? ` AND site:${inputs.site_search}` : '';
        const searchOptions = { offset: 0, vqd: '' };
        const results = await DDG.search(searchQuery + siteQuery, { offset: 0, vqd: '' }).catch(err => Promise.reject(err.response && err.response.status < 500 ? new web_service_interface_1.WebServiceError(err.response.data) : err));
        const numPages = inputs.numPages ?? '20';
        for (let i = 2; i <= Number.parseInt(numPages); i++ && results.results.length < Number.parseInt(cropNumber)) {
            const currentSearchOptions = {
                ...searchOptions,
                offset: results.results.length
            };
            try {
                const currentResults = await DDG.search(searchQuery + siteQuery, currentSearchOptions)
                    .catch(err => Promise.reject(err.response && err.response.status < 500 ? new web_service_interface_1.WebServiceError(err.response.data) : err));
                results.results.push.apply(currentResults.results);
            }
            catch {
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
            let pattern_matches = {};
            matchingObject_1.matching.forEach((match) => {
                let matchArray = snippet.match(match.pattern);
                if (matchArray) {
                    Object.assign(pattern_matches, { [match.name]: matchArray });
                }
            });
            const defaultCountry = 'US';
            const removeNonNumeric = (str) => str ? str.replace(/\D/g, '') : '';
            if (pattern_matches.hasOwnProperty('phoneRegex')) {
                const phoneNumbers = pattern_matches.phoneRegex
                    .filter(phoneNumberString => phoneNumberString) // filter out undefined values
                    .map((phoneNumberString) => {
                    phoneNumberString = removeNonNumeric(phoneNumberString);
                    // Remove the number 1 if it's the first digit
                    if (phoneNumberString.charAt(0) === '1') {
                        phoneNumberString = phoneNumberString.slice(1);
                    }
                    const phoneNumber = libphonenumber_js_1.parsePhoneNumberFromString(phoneNumberString, defaultCountry);
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
                    .filter(email => email_validator_1.default.validate(email));
                Object.assign(pattern_matches, { emailsValidated });
            }
            for (const key in pattern_matches) {
                if (key === 'domainRegex') {
                    pattern_matches[key] = pattern_matches[key].map((url) => {
                        const domainRegex = /^https?:\/\/(?:www\.)?([a-zA-Z0-9-]+)\.([a-zA-Z]{2,63})(?:\/|$)/i;
                        const match = url.match(domainRegex);
                        if (match) {
                            return match[1] + '.' + match[2];
                        }
                        else {
                            return url;
                        }
                    });
                    pattern_matches[key] = [...new Set(pattern_matches[key])].sort();
                }
                else {
                    pattern_matches[key] = [...new Set(pattern_matches[key])].sort();
                }
            }
            for (const key in pattern_matches) {
                pattern_matches[key] = [...new Set(pattern_matches[key])].sort();
            }
            return {
                id: crypto_1.default.createHash('sha256')
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
exports.default = DuckDuckGoScraperDriver;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9EdWNrRHVja0dvU2NyYXBlckRyaXZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGlGQUErSTtBQUMvSSx3Q0FBeUM7QUFDekMseURBQStEO0FBQy9ELHFEQUE0QztBQUM1QyxzRUFBd0M7QUFDeEMsb0RBQTRCO0FBTTVCLE1BQXFCLHVCQUF3QixTQUFRLHlDQUFpQjtJQUF0RTs7UUFDVyxTQUFJLEdBQUcsb0JBQW9CLENBQUM7UUFFNUIsZ0JBQVcsR0FBZ0I7WUFDbEMsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFO1lBQ3ZDLFVBQVUsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtZQUM1QyxRQUFRLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUU7WUFDM0MsWUFBWSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFO1lBQy9DLFdBQVcsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRTtTQUUvQyxDQUFDO1FBRU8sd0JBQW1CLEdBQXdCO1lBQ2xELGtCQUFrQixFQUFFO2dCQUNsQixZQUFZLEVBQUUsU0FBUztnQkFDdkIsV0FBVyxFQUFFLFNBQVM7Z0JBQ3RCLFdBQVcsRUFBRSxNQUFNO2FBQ3BCO1lBQ0QsS0FBSyxFQUFFLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRTtTQUMvQixDQUFDO0lBbUhKLENBQUM7SUFqSEMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQU1aO1FBQ0MsTUFBTSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxHQUFHLE1BQU0sQ0FBQztRQUNoRSxzREFBc0Q7UUFDdEQsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFlBQVksS0FBSyxNQUFNLENBQUMs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QXNJQyIsImZpbGUiOiJzcmMvRHVja0R1Y2tHb1NjcmFwZXJEcml2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEYXRhSW5kZXhSZXN1bHRzLCBJbnB1dFNjaGVtYSwgT3V0cHV0Q29uZmlndXJhdGlvbiwgU2VydmljZURlZmluaXRpb24sIFdlYlNlcnZpY2VFcnJvciB9IGZyb20gJ0BzaXJlbnNvbHV0aW9ucy93ZWItc2VydmljZS1pbnRlcmZhY2UnO1xuaW1wb3J0IERERyA9IHJlcXVpcmUoJ2R1Y2stZHVjay1zY3JhcGUnKTtcbmltcG9ydCB7IHBhcnNlUGhvbmVOdW1iZXJGcm9tU3RyaW5nIH0gZnJvbSAnbGlicGhvbmVudW1iZXItanMnO1xuaW1wb3J0IHsgbWF0Y2hpbmcgfSBmcm9tICcuL21hdGNoaW5nT2JqZWN0JztcbmltcG9ydCB2YWxpZGF0b3IgZnJvbSAnZW1haWwtdmFsaWRhdG9yJztcbmltcG9ydCBjcnlwdG8gZnJvbSAnY3J5cHRvJztcblxuaW50ZXJmYWNlIE1hdGNoZXMge1xuICBba2V5OiBzdHJpbmddOiBzdHJpbmdbXTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRHVja0R1Y2tHb1NjcmFwZXJEcml2ZXIgZXh0ZW5kcyBTZXJ2aWNlRGVmaW5pdGlvbiB7XG4gIHJlYWRvbmx5IG5hbWUgPSAnZHVja2R1Y2tnby1zY3JhcGVyJztcblxuICByZWFkb25seSBpbnB1dFNjaGVtYTogSW5wdXRTY2hlbWEgPSB7XG4gICAgcXVlcnk6IHsgdHlwZTogJ3RleHQnLCByZXF1aXJlZDogdHJ1ZSB9LFxuICAgIGNyb3BOdW1iZXI6IHsgdHlwZTogJ3RleHQnLCByZXF1aXJlZDogdHJ1ZSB9LFxuICAgIG51bVBhZ2VzOiB7IHR5cGU6ICd0ZXh0JywgcmVxdWlyZWQ6IGZhbHNlIH0sXG4gICAgZXhhY3Rfc2VhcmNoOiB7IHR5cGU6ICd0ZXh0JywgcmVxdWlyZWQ6IGZhbHNlIH0sXG4gICAgc2l0ZV9zZWFyY2g6IHsgdHlwZTogJ3RleHQnLCByZXF1aXJlZDogZmFsc2UgfSxcblxuICB9O1xuXG4gIHJlYWRvbmx5IG91dHB1dENvbmZpZ3VyYXRpb246IE91dHB1dENvbmZpZ3VyYXRpb24gPSB7XG4gICAgc3RydWN0dXJlZF9jb250ZW50OiB7XG4gICAgICBwaG9uZU51bWJlcnM6ICdrZXl3b3JkJyxcbiAgICAgIGlwQWRkcmVzc2VzOiAna2V5d29yZCcsXG4gICAgICByZXRyaWV2ZWRBdDogJ2RhdGUnXG4gICAgfSxcbiAgICBkZWJ1ZzogeyByZXN1bHRDb3VudDogJ2xvbmcnIH1cbiAgfTtcblxuICBhc3luYyBpbnZva2UoaW5wdXRzOiB7XG4gICAgcXVlcnk6IHN0cmluZyxcbiAgICBjcm9wTnVtYmVyOiBzdHJpbmdcbiAgICBudW1QYWdlcz86IHN0cmluZyxcbiAgICBleGFjdF9zZWFyY2g/OiBzdHJpbmcsXG4gICAgc2l0ZV9zZWFyY2g/OiBzdHJpbmcsXG4gIH0pOiBQcm9taXNlPERhdGFJbmRleFJlc3VsdHM+IHtcbiAgICBjb25zdCB7IHF1ZXJ5LCBjcm9wTnVtYmVyLCBleGFjdF9zZWFyY2gsIHNpdGVfc2VhcmNoIH0gPSBpbnB1dHM7XG4gICAgLy8gV3JhcCBxdWVyeSBpbiBkb3VibGUgcXVvdGVzIGlmIGV4YWN0X3NlYXJjaCBpcyB0cnVlXG4gICAgY29uc3Qgc2VhcmNoUXVlcnkgPSBpbnB1dHMuZXhhY3Rfc2VhcmNoID09PSAndHJ1ZScgPyBgKyR7aW5wdXRzLnF1ZXJ5LnNwbGl0KCcgJykuam9pbignIEFORCArJyl9IEFORCBcIiR7aW5wdXRzLnF1ZXJ5fVwiYCA6IGlucHV0cy5xdWVyeTtcbiAgXG4gICAgLy8gQXBwZW5kIHNpdGUgc2VhcmNoIHN0cmluZyBpZiBwcm92aWRlZFxuICAgIGNvbnN0IHNpdGVRdWVyeSA9IGlucHV0cy5zaXRlX3NlYXJjaCA/IGAgQU5EIHNpdGU6JHtpbnB1dHMuc2l0ZV9zZWFyY2h9YCA6ICcnO1xuICAgIGNvbnN0IHNlYXJjaE9wdGlvbnM6IERERy5TZWFyY2hPcHRpb25zID0ge29mZnNldDogMCwgdnFkOiAnJ307XG4gICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IERERy5zZWFyY2goc2VhcmNoUXVlcnkgKyBzaXRlUXVlcnksIHtvZmZzZXQ6IDAsIHZxZDogJyd9KS5jYXRjaChlcnIgPT4gUHJvbWlzZS5yZWplY3QoZXJyLnJlc3BvbnNlICYmIGVyci5yZXNwb25zZS5zdGF0dXMgPCA1MDAgPyBuZXcgV2ViU2VydmljZUVycm9yKGVyci5yZXNwb25zZS5kYXRhKSA6IGVycikpO1xuICAgIGNvbnN0IG51bVBhZ2VzID0gaW5wdXRzLm51bVBhZ2VzID8/ICcyMCc7XG4gICAgZm9yIChsZXQgaSA9IDI7IGkgPD0gTnVtYmVyLnBhcnNlSW50KG51bVBhZ2VzKTsgaSsrICYmIHJlc3VsdHMucmVzdWx0cy5sZW5ndGggPCBOdW1iZXIucGFyc2VJbnQoY3JvcE51bWJlcikpIHtcbiAgICAgIGNvbnN0IGN1cnJlbnRTZWFyY2hPcHRpb25zOiBEREcuU2VhcmNoT3B0aW9ucyA9IHtcbiAgICAgICAgLi4uc2VhcmNoT3B0aW9ucyxcbiAgICAgICAgb2Zmc2V0OiByZXN1bHRzLnJlc3VsdHMubGVuZ3RoXG4gICAgICB9O1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY3VycmVudFJlc3VsdHMgPSBhd2FpdCBEREcuc2VhcmNoKHNlYXJjaFF1ZXJ5ICsgc2l0ZVF1ZXJ5LCBjdXJyZW50U2VhcmNoT3B0aW9ucylcbiAgICAgICAgICAuY2F0Y2goZXJyID0+IFByb21pc2UucmVqZWN0KGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzIDwgNTAwID8gbmV3IFdlYlNlcnZpY2VFcnJvcihlcnIucmVzcG9uc2UuZGF0YSkgOiBlcnIpKTtcbiAgICAgICAgcmVzdWx0cy5yZXN1bHRzLnB1c2guYXBwbHkoY3VycmVudFJlc3VsdHMucmVzdWx0cyk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGxldCBodG1sUmVnZXggPSAvPFtePl0qPi9nO1xuICAgIGNvbnN0IGNyb3BwZWRSZXN1bHRzID0gcmVzdWx0cy5yZXN1bHRzLnNsaWNlKDAsIE51bWJlci5wYXJzZUludChjcm9wTnVtYmVyKSk7XG5cbiAgICBjb25zdCBzdHJ1Y3R1cmVkX2NvbnRlbnQgPSBjcm9wcGVkUmVzdWx0cy5tYXAoKHJlc3VsdCwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IHRpdGxlID0gcmVzdWx0LnRpdGxlO1xuICAgICAgY29uc3QgdXJsID0gcmVzdWx0LnVybDtcbiAgICAgIGNvbnN0IHNuaXBwZXQgPSByZXN1bHQudGl0bGUgKyBcIiBcIiArIHJlc3VsdC51cmwgKyBcIiBcIiArIHJlc3VsdC5kZXNjcmlwdGlvbi5yZXBsYWNlKGh0bWxSZWdleCwgXCJcIik7XG4gICAgICBjb25zdCByYXdEZXNjcmlwdGlvbiA9IHJlc3VsdC5yYXdEZXNjcmlwdGlvbi5yZXBsYWNlKGh0bWxSZWdleCwgXCJcIik7XG4gICAgICBjb25zdCBpY29uID0gcmVzdWx0Lmljb247XG4gICAgICBsZXQgcGF0dGVybl9tYXRjaGVzOiBNYXRjaGVzID0ge307XG4gICAgICBtYXRjaGluZy5mb3JFYWNoKChtYXRjaCkgPT4ge1xuICAgICAgICBsZXQgbWF0Y2hBcnJheSA9IHNuaXBwZXQubWF0Y2gobWF0Y2gucGF0dGVybik7XG4gICAgICAgIGlmIChtYXRjaEFycmF5KSB7XG4gICAgICAgICAgT2JqZWN0LmFzc2lnbihwYXR0ZXJuX21hdGNoZXMsIHsgW21hdGNoLm5hbWVdOiBtYXRjaEFycmF5IH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IGRlZmF1bHRDb3VudHJ5ID0gJ1VTJztcbiAgICAgIGNvbnN0IHJlbW92ZU5vbk51bWVyaWMgPSAoc3RyPzogc3RyaW5nKSA9PiBzdHIgPyBzdHIucmVwbGFjZSgvXFxEL2csICcnKSA6ICcnO1xuICAgICAgaWYgKHBhdHRlcm5fbWF0Y2hlcy5oYXNPd25Qcm9wZXJ0eSgncGhvbmVSZWdleCcpKSB7XG4gICAgICAgIGNvbnN0IHBob25lTnVtYmVycyA9IHBhdHRlcm5fbWF0Y2hlcy5waG9uZVJlZ2V4XG4gICAgICAgICAgLmZpbHRlcihwaG9uZU51bWJlclN0cmluZyA9PiBwaG9uZU51bWJlclN0cmluZykgLy8gZmlsdGVyIG91dCB1bmRlZmluZWQgdmFsdWVzXG4gICAgICAgICAgLm1hcCgocGhvbmVOdW1iZXJTdHJpbmcpID0+IHtcbiAgICAgICAgICAgIHBob25lTnVtYmVyU3RyaW5nID0gcmVtb3ZlTm9uTnVtZXJpYyhwaG9uZU51bWJlclN0cmluZyk7XG4gICAgICAgICAgICAvLyBSZW1vdmUgdGhlIG51bWJlciAxIGlmIGl0J3MgdGhlIGZpcnN0IGRpZ2l0XG4gICAgICAgICAgICBpZiAocGhvbmVOdW1iZXJTdHJpbmcuY2hhckF0KDApID09PSAnMScpIHtcbiAgICAgICAgICAgICAgcGhvbmVOdW1iZXJTdHJpbmcgPSBwaG9uZU51bWJlclN0cmluZy5zbGljZSgxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHBob25lTnVtYmVyID0gcGFyc2VQaG9uZU51bWJlckZyb21TdHJpbmcocGhvbmVOdW1iZXJTdHJpbmcsIGRlZmF1bHRDb3VudHJ5KTtcbiAgICAgICAgICAgIGlmIChwaG9uZU51bWJlciAmJiBwaG9uZU51bWJlci5pc1ZhbGlkKCkpIHtcbiAgICAgICAgICAgICAgLy8gUmV0dXJuIHRoZSBmb3JtYXR0ZWQgcGhvbmUgbnVtYmVyXG4gICAgICAgICAgICAgIHJldHVybiBwaG9uZU51bWJlci5mb3JtYXRJbnRlcm5hdGlvbmFsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuZmlsdGVyKEJvb2xlYW4pOyAvLyBSZW1vdmUgbnVsbCB2YWx1ZXMgZnJvbSB0aGUgcGhvbmVOdW1iZXJzIGFycmF5XG4gICAgICAgIE9iamVjdC5hc3NpZ24ocGF0dGVybl9tYXRjaGVzLCB7IHZhbGlkYXRlZFBob25lTnVtYmVyczogcGhvbmVOdW1iZXJzIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAocGF0dGVybl9tYXRjaGVzLmhhc093blByb3BlcnR5KCdlbWFpbFJlZ2V4JykpIHtcbiAgICAgICAgY29uc3QgZW1haWxzVmFsaWRhdGVkID0gcGF0dGVybl9tYXRjaGVzLmVtYWlsUmVnZXhcbiAgICAgICAgICAuZmlsdGVyKGVtYWlsID0+IHZhbGlkYXRvci52YWxpZGF0ZShlbWFpbCkpO1xuICAgICAgICBPYmplY3QuYXNzaWduKHBhdHRlcm5fbWF0Y2hlcywgeyBlbWFpbHNWYWxpZGF0ZWQgfSk7XG4gICAgICB9XG4gICAgICBmb3IgKGNvbnN0IGtleSBpbiBwYXR0ZXJuX21hdGNoZXMpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ2RvbWFpblJlZ2V4Jykge1xuICAgICAgICAgIHBhdHRlcm5fbWF0Y2hlc1trZXldID0gcGF0dGVybl9tYXRjaGVzW2tleV0ubWFwKCh1cmwpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRvbWFpblJlZ2V4ID0gL15odHRwcz86XFwvXFwvKD86d3d3XFwuKT8oW2EtekEtWjAtOS1dKylcXC4oW2EtekEtWl17Miw2M30pKD86XFwvfCQpL2k7XG4gICAgICAgICAgICBjb25zdCBtYXRjaCA9IHVybC5tYXRjaChkb21haW5SZWdleCk7XG4gICAgICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoWzFdICsgJy4nICsgbWF0Y2hbMl07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4gdXJsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHBhdHRlcm5fbWF0Y2hlc1trZXldID0gWy4uLm5ldyBTZXQocGF0dGVybl9tYXRjaGVzW2tleV0pXS5zb3J0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGF0dGVybl9tYXRjaGVzW2tleV0gPSBbLi4ubmV3IFNldChwYXR0ZXJuX21hdGNoZXNba2V5XSldLnNvcnQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKGNvbnN0IGtleSBpbiBwYXR0ZXJuX21hdGNoZXMpIHtcbiAgICAgICAgcGF0dGVybl9tYXRjaGVzW2tleV0gPSBbLi4ubmV3IFNldChwYXR0ZXJuX21hdGNoZXNba2V5XSldLnNvcnQoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlkOiBjcnlwdG8uY3JlYXRlSGFzaCgnc2hhMjU2JylcbiAgICAgICAgLnVwZGF0ZShgJHtpbnB1dHMucXVlcnl9fCR7dXJsfWApXG4gICAgICAgIC5kaWdlc3QoJ2hleCcpLFxuICAgICAgICBxdWVyeTogaW5wdXRzLnF1ZXJ5LFxuICAgICAgICB0aXRsZSxcbiAgICAgICAgdXJsLFxuICAgICAgICBzbmlwcGV0LFxuICAgICAgICBpY29uLFxuICAgICAgICBwYXR0ZXJuX21hdGNoZXMsXG4gICAgICAgIHJldHJpZXZlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgIHJhd0Rlc2NyaXB0aW9uLFxuICAgICAgICBwb3NpdGlvbjogaW5kZXggKyAxXG4gICAgICB9O1xuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICBzdHJ1Y3R1cmVkX2NvbnRlbnQsXG4gICAgICBkZWJ1ZzogW3tcbiAgICAgICAgcmVzdWx0Q291bnQ6IGNyb3BwZWRSZXN1bHRzLmxlbmd0aFxuICAgICAgfV1cbiAgICB9O1xuICB9XG59Il19
