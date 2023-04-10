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
const crypto = require("crypto");
class DuckDuckGoScraperDriver extends web_service_interface_1.ServiceDefinition {
    constructor() {
        super(...arguments);
        this.name = 'duckduckgo-scraper';
        this.inputSchema = {
            query: { type: 'text', required: true },
            numPages: { type: 'long', required: false },
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
        const searchOptions = { offset: 0, vqd: '' };
        const results = await DDG.search(inputs.query, { offset: 0, vqd: '' }).catch(err => Promise.reject(err.response && err.response.status < 500 ? new web_service_interface_1.WebServiceError(err.response.data) : err));
        const numPages = inputs.numPages ?? 1;
        for (let i = 2; i <= numPages; i++) {
            const currentSearchOptions = {
                ...searchOptions,
                offset: results.results.length
            };
            try {
                const currentResults = await DDG.search(inputs.query, currentSearchOptions)
                    .catch(err => Promise.reject(err.response && err.response.status < 500 ? new web_service_interface_1.WebServiceError(err.response.data) : err));
                results.results.push(...currentResults.results);
            }
            catch {
                break;
            }
        }
        let htmlRegex = /<[^>]*>/g;
        const structured_content = await Promise.all(results.results.map(async (result) => {
            const title = result.title;
            const url = result.url;
            const snippet = result.title + " " + result.url + " " + result.description.replace(htmlRegex, "");
            ;
            const rawDescription = result.rawDescription.replace(htmlRegex, "");
            ;
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
exports.default = DuckDuckGoScraperDriver;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9EdWNrRHVja0dvU2NyYXBlckRyaXZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGlGQUErSTtBQUMvSSx3Q0FBeUM7QUFDekMseURBQStEO0FBQy9ELHFEQUE0QztBQUM1QyxzRUFBd0M7QUFDeEMsaUNBQWtDO0FBTWxDLE1BQXFCLHVCQUF3QixTQUFRLHlDQUFpQjtJQUF0RTs7UUFDVyxTQUFJLEdBQUcsb0JBQW9CLENBQUM7UUFFNUIsZ0JBQVcsR0FBZ0I7WUFDbEMsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFO1lBQ3ZDLFFBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRTtTQUM1QyxDQUFDO1FBRU8sd0JBQW1CLEdBQXdCO1lBQ2xELGtCQUFrQixFQUFFO2dCQUVsQixZQUFZLEVBQUUsU0FBUztnQkFDdkIsV0FBVyxFQUFFLFNBQVM7Z0JBQ3RCLFdBQVcsRUFBRSxNQUFNO2FBQ3BCO1lBQ0QsS0FBSyxFQUFFLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRTtTQUMvQixDQUFDO0lBd0dKLENBQUM7SUF0R0MsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUdaO1FBQ0MsTUFBTSxhQUFhLEdBQXNCLEVBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFDLENBQUM7UUFDOUQsTUFBTSxPQUFPLEdBQUcsTUFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsRUFBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUks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YUFDZixDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNKLE9BQU87WUFDTCxrQkFBa0I7WUFDbEIsS0FBSyxFQUFFLENBQUM7b0JBQ04sV0FBVyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTTtpQkFDcEMsQ0FBQztTQUNILENBQUM7SUFDSixDQUFDO0NBQ0Y7QUF4SEQsMENBd0hDIiwiZmlsZSI6InNyYy9EdWNrRHVja0dvU2NyYXBlckRyaXZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERhdGFJbmRleFJlc3VsdHMsIElucHV0U2NoZW1hLCBPdXRwdXRDb25maWd1cmF0aW9uLCBTZXJ2aWNlRGVmaW5pdGlvbiwgV2ViU2VydmljZUVycm9yIH0gZnJvbSAnQHNpcmVuc29sdXRpb25zL3dlYi1zZXJ2aWNlLWludGVyZmFjZSc7XG5pbXBvcnQgRERHID0gcmVxdWlyZSgnZHVjay1kdWNrLXNjcmFwZScpO1xuaW1wb3J0IHsgcGFyc2VQaG9uZU51bWJlckZyb21TdHJpbmcgfSBmcm9tICdsaWJwaG9uZW51bWJlci1qcyc7XG5pbXBvcnQgeyBtYXRjaGluZyB9IGZyb20gJy4vbWF0Y2hpbmdPYmplY3QnO1xuaW1wb3J0IHZhbGlkYXRvciBmcm9tICdlbWFpbC12YWxpZGF0b3InO1xuaW1wb3J0IGNyeXB0byA9IHJlcXVpcmUoJ2NyeXB0bycpO1xuXG5pbnRlcmZhY2UgTWF0Y2hlcyB7XG4gIFtrZXk6IHN0cmluZ106IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEdWNrRHVja0dvU2NyYXBlckRyaXZlciBleHRlbmRzIFNlcnZpY2VEZWZpbml0aW9uIHtcbiAgcmVhZG9ubHkgbmFtZSA9ICdkdWNrZHVja2dvLXNjcmFwZXInO1xuXG4gIHJlYWRvbmx5IGlucHV0U2NoZW1hOiBJbnB1dFNjaGVtYSA9IHtcbiAgICBxdWVyeTogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiB0cnVlIH0sXG4gICAgbnVtUGFnZXM6IHsgdHlwZTogJ2xvbmcnLCByZXF1aXJlZDogZmFsc2UgfSxcbiAgfTtcblxuICByZWFkb25seSBvdXRwdXRDb25maWd1cmF0aW9uOiBPdXRwdXRDb25maWd1cmF0aW9uID0ge1xuICAgIHN0cnVjdHVyZWRfY29udGVudDoge1xuXG4gICAgICBwaG9uZU51bWJlcnM6ICdrZXl3b3JkJyxcbiAgICAgIGlwQWRkcmVzc2VzOiAna2V5d29yZCcsXG4gICAgICByZXRyaWV2ZWRBdDogJ2RhdGUnXG4gICAgfSxcbiAgICBkZWJ1ZzogeyByZXN1bHRDb3VudDogJ2xvbmcnIH1cbiAgfTtcblxuICBhc3luYyBpbnZva2UoaW5wdXRzOiB7XG4gICAgcXVlcnk6IHN0cmluZyxcbiAgICBudW1QYWdlcz86IG51bWJlclxuICB9KTogUHJvbWlzZTxEYXRhSW5kZXhSZXN1bHRzPiB7XG4gICAgY29uc3Qgc2VhcmNoT3B0aW9uczogRERHLlNlYXJjaE9wdGlvbnMgPSB7b2Zmc2V0OiAwLCB2cWQ6ICcnfTtcbiAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgRERHLnNlYXJjaChpbnB1dHMucXVlcnksIHtvZmZzZXQ6IDAsIHZxZDogJyd9KS5jYXRjaChlcnIgPT4gUHJvbWlzZS5yZWplY3QoZXJyLnJlc3BvbnNlICYmIGVyci5yZXNwb25zZS5zdGF0dXMgPCA1MDAgPyBuZXcgV2ViU2VydmljZUVycm9yKGVyci5yZXNwb25zZS5kYXRhKSA6IGVycikpO1xuICAgIGNvbnN0IG51bVBhZ2VzID0gaW5wdXRzLm51bVBhZ2VzID8/IDE7XG4gICAgZm9yIChsZXQgaSA9IDI7IGkgPD0gbnVtUGFnZXM7IGkrKykge1xuICAgICAgY29uc3QgY3VycmVudFNlYXJjaE9wdGlvbnM6IERERy5TZWFyY2hPcHRpb25zID0ge1xuICAgICAgICAuLi5zZWFyY2hPcHRpb25zLFxuICAgICAgICBvZmZzZXQ6IHJlc3VsdHMucmVzdWx0cy5sZW5ndGhcbiAgICAgIH07XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBjdXJyZW50UmVzdWx0cyA9IGF3YWl0IERERy5zZWFyY2goaW5wdXRzLnF1ZXJ5LCBjdXJyZW50U2VhcmNoT3B0aW9ucylcbiAgICAgICAgICAuY2F0Y2goZXJyID0+IFByb21pc2UucmVqZWN0KGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzIDwgNTAwID8gbmV3IFdlYlNlcnZpY2VFcnJvcihlcnIucmVzcG9uc2UuZGF0YSkgOiBlcnIpKTtcbiAgICAgICAgcmVzdWx0cy5yZXN1bHRzLnB1c2goLi4uY3VycmVudFJlc3VsdHMucmVzdWx0cyk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGh0bWxSZWdleCA9IC88W14+XSo+L2c7XG4gICAgY29uc3Qgc3RydWN0dXJlZF9jb250ZW50ID0gYXdhaXQgUHJvbWlzZS5hbGwocmVzdWx0cy5yZXN1bHRzLm1hcChhc3luYyByZXN1bHQgPT4ge1xuICAgICAgY29uc3QgdGl0bGUgPSByZXN1bHQudGl0bGU7XG4gICAgICBjb25zdCB1cmwgPSByZXN1bHQudXJsO1xuICAgICAgY29uc3Qgc25pcHBldCA9IHJlc3VsdC50aXRsZSArIFwiIFwiICsgcmVzdWx0LnVybCArIFwiIFwiICsgcmVzdWx0LmRlc2NyaXB0aW9uLnJlcGxhY2UoaHRtbFJlZ2V4LCBcIlwiKTs7XG4gICAgICBjb25zdCByYXdEZXNjcmlwdGlvbiA9IHJlc3VsdC5yYXdEZXNjcmlwdGlvbi5yZXBsYWNlKGh0bWxSZWdleCwgXCJcIik7O1xuICAgICAgY29uc3QgaWNvbiA9IHJlc3VsdC5pY29uO1xuICAgICAgbGV0IHBhdHRlcm5fbWF0Y2hlczogTWF0Y2hlcyA9IHt9O1xuICAgICAgbWF0Y2hpbmcuZm9yRWFjaCgobWF0Y2gpID0+IHtcbiAgICAgICAgbGV0IG1hdGNoQXJyYXkgPSBzbmlwcGV0Lm1hdGNoKG1hdGNoLnBhdHRlcm4pO1xuICAgICAgICBpZiAobWF0Y2hBcnJheSkge1xuICAgICAgICAgIE9iamVjdC5hc3NpZ24ocGF0dGVybl9tYXRjaGVzLCB7IFttYXRjaC5uYW1lXTogbWF0Y2hBcnJheSB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBjb25zdCBkZWZhdWx0Q291bnRyeSA9ICdVUyc7XG4gICAgICBjb25zdCByZW1vdmVOb25OdW1lcmljID0gKHN0cj86IHN0cmluZykgPT4gc3RyID8gc3RyLnJlcGxhY2UoL1xcRC9nLCAnJykgOiAnJztcbiAgICAgIGlmIChwYXR0ZXJuX21hdGNoZXMuaGFzT3duUHJvcGVydHkoJ3Bob25lUmVnZXgnKSkge1xuICAgICAgICBjb25zdCBwaG9uZU51bWJlcnMgPSBwYXR0ZXJuX21hdGNoZXMucGhvbmVSZWdleFxuICAgICAgICAgIC5maWx0ZXIocGhvbmVOdW1iZXJTdHJpbmcgPT4gcGhvbmVOdW1iZXJTdHJpbmcpIC8vIGZpbHRlciBvdXQgdW5kZWZpbmVkIHZhbHVlc1xuICAgICAgICAgIC5tYXAoKHBob25lTnVtYmVyU3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBwaG9uZU51bWJlclN0cmluZyA9IHJlbW92ZU5vbk51bWVyaWMocGhvbmVOdW1iZXJTdHJpbmcpO1xuICAgICAgICAgICAgLy8gUmVtb3ZlIHRoZSBudW1iZXIgMSBpZiBpdCdzIHRoZSBmaXJzdCBkaWdpdFxuICAgICAgICAgICAgaWYgKHBob25lTnVtYmVyU3RyaW5nLmNoYXJBdCgwKSA9PT0gJzEnKSB7XG4gICAgICAgICAgICAgIHBob25lTnVtYmVyU3RyaW5nID0gcGhvbmVOdW1iZXJTdHJpbmcuc2xpY2UoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwaG9uZU51bWJlciA9IHBhcnNlUGhvbmVOdW1iZXJGcm9tU3RyaW5nKHBob25lTnVtYmVyU3RyaW5nLCBkZWZhdWx0Q291bnRyeSk7XG4gICAgICAgICAgICBpZiAocGhvbmVOdW1iZXIgJiYgcGhvbmVOdW1iZXIuaXNWYWxpZCgpKSB7XG4gICAgICAgICAgICAgIC8vIFJldHVybiB0aGUgZm9ybWF0dGVkIHBob25lIG51bWJlclxuICAgICAgICAgICAgICByZXR1cm4gcGhvbmVOdW1iZXIuZm9ybWF0SW50ZXJuYXRpb25hbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLmZpbHRlcihCb29sZWFuKTsgLy8gUmVtb3ZlIG51bGwgdmFsdWVzIGZyb20gdGhlIHBob25lTnVtYmVycyBhcnJheVxuICAgICAgICBPYmplY3QuYXNzaWduKHBhdHRlcm5fbWF0Y2hlcywgeyB2YWxpZGF0ZWRQaG9uZU51bWJlcnM6IHBob25lTnVtYmVycyB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHBhdHRlcm5fbWF0Y2hlcy5oYXNPd25Qcm9wZXJ0eSgnZW1haWxSZWdleCcpKSB7XG4gICAgICAgIGNvbnN0IGVtYWlsc1ZhbGlkYXRlZCA9IHBhdHRlcm5fbWF0Y2hlcy5lbWFpbFJlZ2V4XG4gICAgICAgICAgLmZpbHRlcihlbWFpbCA9PiB2YWxpZGF0b3IudmFsaWRhdGUoZW1haWwpKTtcbiAgICAgICAgT2JqZWN0LmFzc2lnbihwYXR0ZXJuX21hdGNoZXMsIHsgZW1haWxzVmFsaWRhdGVkIH0pO1xuICAgICAgfVxuICAgICAgZm9yIChjb25zdCBrZXkgaW4gcGF0dGVybl9tYXRjaGVzKSB7XG4gICAgICAgIGlmIChrZXkgPT09ICdkb21haW5SZWdleCcpIHtcbiAgICAgICAgICBwYXR0ZXJuX21hdGNoZXNba2V5XSA9IHBhdHRlcm5fbWF0Y2hlc1trZXldLm1hcCgodXJsKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBkb21haW5SZWdleCA9IC9eaHR0cHM/OlxcL1xcLyg/Ond3d1xcLik/KFthLXpBLVowLTktXSspXFwuKFthLXpBLVpdezIsNjN9KSg/OlxcL3wkKS9pO1xuICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSB1cmwubWF0Y2goZG9tYWluUmVnZXgpO1xuICAgICAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICAgIHJldHVybiBtYXRjaFsxXSArICcuJyArIG1hdGNoWzJdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHVybDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICBwYXR0ZXJuX21hdGNoZXNba2V5XSA9IFsuLi5uZXcgU2V0KHBhdHRlcm5fbWF0Y2hlc1trZXldKV0uc29ydCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBhdHRlcm5fbWF0Y2hlc1trZXldID0gWy4uLm5ldyBTZXQocGF0dGVybl9tYXRjaGVzW2tleV0pXS5zb3J0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yIChjb25zdCBrZXkgaW4gcGF0dGVybl9tYXRjaGVzKSB7XG4gICAgICAgIHBhdHRlcm5fbWF0Y2hlc1trZXldID0gWy4uLm5ldyBTZXQocGF0dGVybl9tYXRjaGVzW2tleV0pXS5zb3J0KCk7XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpZDogY3J5cHRvLmNyZWF0ZUhhc2goJ3NoYTI1NicpXG4gICAgICAgIC51cGRhdGUoYCR7aW5wdXRzLnF1ZXJ5fXwke3VybH1gKVxuICAgICAgICAuZGlnZXN0KCdoZXgnKSxcbiAgICAgICAgcXVlcnk6IGlucHV0cy5xdWVyeSxcbiAgICAgICAgdGl0bGUsXG4gICAgICAgIHVybCxcbiAgICAgICAgc25pcHBldCxcbiAgICAgICAgaWNvbixcbiAgICAgICAgcGF0dGVybl9tYXRjaGVzLFxuICAgICAgICByZXRyaWV2ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICByYXdEZXNjcmlwdGlvblxuICAgICAgfTtcbiAgICB9KSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0cnVjdHVyZWRfY29udGVudCxcbiAgICAgIGRlYnVnOiBbe1xuICAgICAgICByZXN1bHRDb3VudDogcmVzdWx0cy5yZXN1bHRzLmxlbmd0aFxuICAgICAgfV1cbiAgICB9O1xuICB9XG59Il19
