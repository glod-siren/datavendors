"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web_service_interface_1 = require("@sirensolutions/web-service-interface");
const DDG = require("duck-duck-scrape");
const crypto_1 = __importDefault(require("crypto"));
class DuckDuckGoImageScraperDriver extends web_service_interface_1.ServiceDefinition {
    constructor() {
        super(...arguments);
        this.name = 'duckduckgo-image-scraper';
        this.inputSchema = {
            query: { type: 'text', required: true },
            cropNumber: { type: 'long', required: true },
            exact_search: { type: 'text', required: false },
            site_search: { type: 'text', required: false },
        };
        this.outputConfiguration = {
            structured_content: {
                url: 'keyword',
                source: 'text',
                title: 'text',
                height: 'long',
                width: 'long',
                thumbnail: 'keyword',
                position: 'long',
                retrievedAt: 'date'
            },
            debug: { resultCount: 'long' }
        };
    }
    async invoke(inputs) {
        const { query, cropNumber, exact_search, site_search } = inputs;
        // Wrap query in double quotes if exact_search is true
        const searchQuery = exact_search === 'true' ? `+${query.split(' ').join(' AND +')} AND "${query}"` : query;
        // Append site search string if provided
        const siteQuery = site_search ? ` AND site:${site_search}` : '';
        const searchOptions = { offset: 0 };
        const results = await DDG.searchImages(searchQuery + siteQuery, { offset: 0 })
            .catch(err => Promise.reject(err.response && err.response.status < 500 ? new web_service_interface_1.WebServiceError(err.response.data) : err));
        const croppedResults = results.results.slice(0, cropNumber);
        const structured_content = croppedResults.map((result, index) => {
            return {
                id: crypto_1.default.createHash('sha256')
                    .update(`${query}|${result.url}`)
                    .digest('hex'),
                query,
                url: result.url,
                source: result.source,
                title: result.title,
                height: result.height,
                width: result.width,
                thumbnail: result.thumbnail,
                position: index + 1,
                retrievedAt: new Date().toISOString(),
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
exports.default = DuckDuckGoImageScraperDriver;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9EdWNrRHVja0dvSW1hZ2VTY3JhcGVyRHJpdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsaUZBQStJO0FBQy9JLHdDQUF5QztBQUN6QyxvREFBNEI7QUFFNUIsTUFBcUIsNEJBQTZCLFNBQVEseUNBQWlCO0lBQTNFOztRQUNXLFNBQUksR0FBRywwQkFBMEIsQ0FBQztRQUVsQyxnQkFBVyxHQUFnQjtZQUNsQyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7WUFDdkMsVUFBVSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFO1lBQzVDLFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRTtZQUMvQyxXQUFXLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUU7U0FDL0MsQ0FBQztRQUVPLHdCQUFtQixHQUF3QjtZQUNsRCxrQkFBa0IsRUFBRTtnQkFDbEIsR0FBRyxFQUFFLFNBQVM7Z0JBQ2QsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsS0FBSyxFQUFFLE1BQU07Z0JBQ2IsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsS0FBSyxFQUFFLE1BQU07Z0JBQ2IsU0FBUyxFQUFFLFNBQVM7Z0JBQ3BCLFFBQVEsRUFBRSxNQUFNO2dCQUNoQixXQUFXLEVBQUUsTUFBTTthQUNwQjtZQUNELEtBQUssRUFBRSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUU7U0FDL0IsQ0FBQztJQThDSixDQUFDO0lBNUNDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFLWjtRQUNDLE1BQU0sRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFFaEUsc0RBQXNEO1FBQ3RELE1BQU0sV0FBVyxHQUFHLFlBQVksS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUUzRyx3Q0FBd0M7UUFDeEMsTUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxhQUFhLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFaEUsTUFBTSxhQUFhLEdBQTJCLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzVELE1BQU0sT0FBTyxHQUFHLE1BQU0sR0FBRyxDQUFDLFlBQVksQ0FBQyxXQUFXLEdBQUcsU0FBUyxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQzNFLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksdUNBQWUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRTFILE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUU1RCxNQUFNLGtCQUFrQixHQUFHLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDOUQsT0FBTztnQkFDTCxFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDO3FCQUM1QixNQUFNLENBQUMsR0FBRyxLQUFLLElBQUksTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO3FCQUNoQyxNQUFNLENBQUMsS0FBSyxDQUFDO2dCQUNoQixLQUFLO2dCQUNMLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRztnQkFDZixNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU07Z0JBQ3JCLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSztnQkFDbkIsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNO2dCQUNyQixLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUs7Z0JBQ25CLFNBQVMsRUFBRSxNQUFNLENBQUMsU0FBUztnQkFDM0IsUUFBUSxFQUFFLEtBQUssR0FBRyxDQUFDO2dCQUNuQixXQUFXLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUU7YUFDdEMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTztZQUNMLGtCQUFrQjtZQUNsQixLQUFLLEVBQUUsQ0FBQztvQkFDTixXQUFXLEVBQUUsY0FBYyxDQUFDLE1BQU07aUJBQ25DLENBQUM7U0FDSCxDQUFDO0lBQ0osQ0FBQztDQUNGO0FBcEVELCtDQW9FQyIsImZpbGUiOiJzcmMvRHVja0R1Y2tHb0ltYWdlU2NyYXBlckRyaXZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERhdGFJbmRleFJlc3VsdHMsIElucHV0U2NoZW1hLCBPdXRwdXRDb25maWd1cmF0aW9uLCBTZXJ2aWNlRGVmaW5pdGlvbiwgV2ViU2VydmljZUVycm9yIH0gZnJvbSAnQHNpcmVuc29sdXRpb25zL3dlYi1zZXJ2aWNlLWludGVyZmFjZSc7XG5pbXBvcnQgRERHID0gcmVxdWlyZSgnZHVjay1kdWNrLXNjcmFwZScpO1xuaW1wb3J0IGNyeXB0byBmcm9tICdjcnlwdG8nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEdWNrRHVja0dvSW1hZ2VTY3JhcGVyRHJpdmVyIGV4dGVuZHMgU2VydmljZURlZmluaXRpb24ge1xuICByZWFkb25seSBuYW1lID0gJ2R1Y2tkdWNrZ28taW1hZ2Utc2NyYXBlcic7XG5cbiAgcmVhZG9ubHkgaW5wdXRTY2hlbWE6IElucHV0U2NoZW1hID0ge1xuICAgIHF1ZXJ5OiB7IHR5cGU6ICd0ZXh0JywgcmVxdWlyZWQ6IHRydWUgfSxcbiAgICBjcm9wTnVtYmVyOiB7IHR5cGU6ICdsb25nJywgcmVxdWlyZWQ6IHRydWUgfSxcbiAgICBleGFjdF9zZWFyY2g6IHsgdHlwZTogJ3RleHQnLCByZXF1aXJlZDogZmFsc2UgfSxcbiAgICBzaXRlX3NlYXJjaDogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiBmYWxzZSB9LFxuICB9O1xuXG4gIHJlYWRvbmx5IG91dHB1dENvbmZpZ3VyYXRpb246IE91dHB1dENvbmZpZ3VyYXRpb24gPSB7XG4gICAgc3RydWN0dXJlZF9jb250ZW50OiB7XG4gICAgICB1cmw6ICdrZXl3b3JkJyxcbiAgICAgIHNvdXJjZTogJ3RleHQnLFxuICAgICAgdGl0bGU6ICd0ZXh0JyxcbiAgICAgIGhlaWdodDogJ2xvbmcnLFxuICAgICAgd2lkdGg6ICdsb25nJyxcbiAgICAgIHRodW1ibmFpbDogJ2tleXdvcmQnLFxuICAgICAgcG9zaXRpb246ICdsb25nJyxcbiAgICAgIHJldHJpZXZlZEF0OiAnZGF0ZSdcbiAgICB9LFxuICAgIGRlYnVnOiB7IHJlc3VsdENvdW50OiAnbG9uZycgfVxuICB9O1xuXG4gIGFzeW5jIGludm9rZShpbnB1dHM6IHtcbiAgICBxdWVyeTogc3RyaW5nLFxuICAgIGNyb3BOdW1iZXI6IG51bWJlcixcbiAgICBleGFjdF9zZWFyY2g6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICBzaXRlX3NlYXJjaDogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICB9KTogUHJvbWlzZTxEYXRhSW5kZXhSZXN1bHRzPiB7XG4gICAgY29uc3QgeyBxdWVyeSwgY3JvcE51bWJlciwgZXhhY3Rfc2VhcmNoLCBzaXRlX3NlYXJjaCB9ID0gaW5wdXRzO1xuICBcbiAgICAvLyBXcmFwIHF1ZXJ5IGluIGRvdWJsZSBxdW90ZXMgaWYgZXhhY3Rfc2VhcmNoIGlzIHRydWVcbiAgICBjb25zdCBzZWFyY2hRdWVyeSA9IGV4YWN0X3NlYXJjaCA9PT0gJ3RydWUnID8gYCske3F1ZXJ5LnNwbGl0KCcgJykuam9pbignIEFORCArJyl9IEFORCBcIiR7cXVlcnl9XCJgIDogcXVlcnk7XG4gIFxuICAgIC8vIEFwcGVuZCBzaXRlIHNlYXJjaCBzdHJpbmcgaWYgcHJvdmlkZWRcbiAgICBjb25zdCBzaXRlUXVlcnkgPSBzaXRlX3NlYXJjaCA/IGAgQU5EIHNpdGU6JHtzaXRlX3NlYXJjaH1gIDogJyc7XG4gIFxuICAgIGNvbnN0IHNlYXJjaE9wdGlvbnM6IERERy5JbWFnZVNlYXJjaE9wdGlvbnMgPSB7IG9mZnNldDogMCB9O1xuICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBEREcuc2VhcmNoSW1hZ2VzKHNlYXJjaFF1ZXJ5ICsgc2l0ZVF1ZXJ5LCB7IG9mZnNldDogMCB9KVxuICAgICAgLmNhdGNoKGVyciA9PiBQcm9taXNlLnJlamVjdChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA8IDUwMCA/IG5ldyBXZWJTZXJ2aWNlRXJyb3IoZXJyLnJlc3BvbnNlLmRhdGEpIDogZXJyKSk7XG4gIFxuICAgIGNvbnN0IGNyb3BwZWRSZXN1bHRzID0gcmVzdWx0cy5yZXN1bHRzLnNsaWNlKDAsIGNyb3BOdW1iZXIpO1xuICBcbiAgICBjb25zdCBzdHJ1Y3R1cmVkX2NvbnRlbnQgPSBjcm9wcGVkUmVzdWx0cy5tYXAoKHJlc3VsdCwgaW5kZXgpID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlkOiBjcnlwdG8uY3JlYXRlSGFzaCgnc2hhMjU2JylcbiAgICAgICAgICAudXBkYXRlKGAke3F1ZXJ5fXwke3Jlc3VsdC51cmx9YClcbiAgICAgICAgICAuZGlnZXN0KCdoZXgnKSxcbiAgICAgICAgcXVlcnksXG4gICAgICAgIHVybDogcmVzdWx0LnVybCxcbiAgICAgICAgc291cmNlOiByZXN1bHQuc291cmNlLFxuICAgICAgICB0aXRsZTogcmVzdWx0LnRpdGxlLFxuICAgICAgICBoZWlnaHQ6IHJlc3VsdC5oZWlnaHQsXG4gICAgICAgIHdpZHRoOiByZXN1bHQud2lkdGgsXG4gICAgICAgIHRodW1ibmFpbDogcmVzdWx0LnRodW1ibmFpbCxcbiAgICAgICAgcG9zaXRpb246IGluZGV4ICsgMSxcbiAgICAgICAgcmV0cmlldmVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgIH07XG4gICAgfSk7XG4gIFxuICAgIHJldHVybiB7XG4gICAgICBzdHJ1Y3R1cmVkX2NvbnRlbnQsXG4gICAgICBkZWJ1ZzogW3tcbiAgICAgICAgcmVzdWx0Q291bnQ6IGNyb3BwZWRSZXN1bHRzLmxlbmd0aFxuICAgICAgfV1cbiAgICB9O1xuICB9XG59XG4iXX0=
