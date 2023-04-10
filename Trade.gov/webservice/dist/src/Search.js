"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web_service_interface_1 = require("@sirensolutions/web-service-interface");
const axios_1 = require("axios");
class Search extends web_service_interface_1.ServiceDefinition {
    constructor() {
        super(...arguments);
        this.name = 'search';
        this.inputSchema = {
            fuzzy_name: { type: 'text', required: false },
            sources: { type: 'text', required: false },
            types: { type: 'text', required: false },
            countries: { type: 'text', required: false },
            address: { type: 'text', required: false },
            city: { type: 'text', required: false },
            state: { type: 'text', required: false },
            postal_code: { type: 'text', required: false },
            full_address: { type: 'text', required: false },
            offset: { type: 'text', required: false },
            name: { type: 'text', required: false },
        };
        this.outputConfiguration = {
            item: {},
            result: {}
        };
    }
    async invoke(inputs) {
        let url = 'https://data.trade.gov/consolidated_screening_list/v1/search?size=50';
        if (inputs.fuzzy_name) {
            url = url + `&fuzzy_name=${inputs.fuzzy_name}`;
        }
        if (inputs.types) {
            url = url + `&types=${inputs.types}`;
        }
        if (inputs.countries) {
            url = url + `&countries=${inputs.countries}`;
        }
        if (inputs.sources) {
            url = url + `&sources=${inputs.sources}`;
        }
        if (inputs.address) {
            url = url + `&address=${inputs.address}`;
        }
        if (inputs.city) {
            url = url + `&city=${inputs.city}`;
        }
        if (inputs.state) {
            url = url + `&state=${inputs.state}`;
        }
        if (inputs.postal_code) {
            url = url + `&postal_code=${inputs.postal_code}`;
        }
        if (inputs.full_address) {
            url = url + `&full_address=${inputs.full_address}`;
        }
        if (inputs.offset) {
            url = url + `&offset=${inputs.offset}`;
        }
        if (inputs.name) {
            url = url + `&name=${inputs.name}`;
        }
        const config = {
            method: 'get',
            url: url,
            headers: {
                'subscription-key': this.config.subscription_key
            }
        };
        const response = await axios_1.default(config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new web_service_interface_1.WebServiceError(err.response.data) : err));
        return {
            item: response.data.results,
            result: [{
                    total: response.data.total,
                    sources: response.data.sources
                }]
        };
    }
}
exports.default = Search;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LFlBQVksRUFBRSxDQUFBO1NBQUM7UUFDN0UsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxXQUFXLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQTtTQUFDO1FBQzNELElBQUksTUFBTSxDQUFDLElBQUksRUFBRTtZQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsU0FBUyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUE7U0FBQztRQUNyRCxNQUFNLE1BQU0sR0FBdUI7WUFDakMsTUFBTSxFQUFFLEtBQUs7WUFDYixHQUFHLEVBQUUsR0FBRztZQUNSLE9BQU8sRUFBRTtnQkFDUCxrQkFBa0IsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQjthQUNqRDtTQUNGLENBQUM7UUFDRixNQUFNLFFBQVEsR0FBa0IsTUFBTSxlQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSx1Q0FBZSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDM0ssT0FBTztZQUNMLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU87WUFDM0IsTUFBTSxFQUFFLENBQUM7b0JBQ1AsS0FBSyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSztvQkFDMUIsT0FBTyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTztpQkFDL0IsQ0FBQztTQUNILENBQUM7SUFDSixDQUFDO0NBQ0Y7QUE1REQseUJBNERDIiwiZmlsZSI6InNyYy9TZWFyY2guanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEYXRhSW5kZXhSZXN1bHRzLCBJbnB1dFNjaGVtYSwgT3V0cHV0Q29uZmlndXJhdGlvbiwgU2VydmljZURlZmluaXRpb24sIFdlYlNlcnZpY2VFcnJvciB9IGZyb20gJ0BzaXJlbnNvbHV0aW9ucy93ZWItc2VydmljZS1pbnRlcmZhY2UnO1xuaW1wb3J0IGF4aW9zLCB7IEF4aW9zUmVxdWVzdENvbmZpZywgQXhpb3NSZXNwb25zZSB9IGZyb20gJ2F4aW9zJztcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlYXJjaCBleHRlbmRzIFNlcnZpY2VEZWZpbml0aW9uIHtcbiAgcmVhZG9ubHkgbmFtZSA9ICdzZWFyY2gnO1xuICByZWFkb25seSBpbnB1dFNjaGVtYTogSW5wdXRTY2hlbWEgPSB7XG4gICAgZnV6enlfbmFtZSA6IHsgdHlwZTogJ3RleHQnLCByZXF1aXJlZDogZmFsc2UgfSxcbiAgICBzb3VyY2VzOiB7IHR5cGU6ICd0ZXh0JywgcmVxdWlyZWQ6IGZhbHNlIH0sXG4gICAgdHlwZXM6IHsgdHlwZTogJ3RleHQnLCByZXF1aXJlZDogZmFsc2UgfSxcbiAgICBjb3VudHJpZXM6IHsgdHlwZTogJ3RleHQnLCByZXF1aXJlZDogZmFsc2UgfSxcbiAgICBhZGRyZXNzOiB7IHR5cGU6ICd0ZXh0JywgcmVxdWlyZWQ6IGZhbHNlIH0sXG4gICAgY2l0eTogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiBmYWxzZSB9LFxuICAgIHN0YXRlOiB7IHR5cGU6ICd0ZXh0JywgcmVxdWlyZWQ6IGZhbHNlIH0sIFxuICAgIHBvc3RhbF9jb2RlOiB7IHR5cGU6ICd0ZXh0JywgcmVxdWlyZWQ6IGZhbHNlIH0sXG4gICAgZnVsbF9hZGRyZXNzOiB7IHR5cGU6ICd0ZXh0JywgcmVxdWlyZWQ6IGZhbHNlIH0sXG4gICAgb2Zmc2V0OiB7IHR5cGU6ICd0ZXh0JywgcmVxdWlyZWQ6IGZhbHNlIH0sXG4gICAgbmFtZTogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiBmYWxzZSB9LFxuICB9O1xuICByZWFkb25seSBvdXRwdXRDb25maWd1cmF0aW9uOiBPdXRwdXRDb25maWd1cmF0aW9uID0ge1xuICAgIGl0ZW06IHt9LFxuICAgIHJlc3VsdDoge31cbiAgfTtcbiAgYXN5bmMgaW52b2tlKGlucHV0czoge1xuICAgIGZ1enp5X25hbWUgOiBzdHJpbmcsXG4gICAgc291cmNlczogc3RyaW5nLFxuICAgIHR5cGVzOiBzdHJpbmcsXG4gICAgY291bnRyaWVzOiBzdHJpbmcsXG4gICAgYWRkcmVzczogc3RyaW5nLFxuICAgIGNpdHk6IHN0cmluZyxcbiAgICBzdGF0ZTogc3RyaW5nLFxuICAgIHBvc3RhbF9jb2RlOiBzdHJpbmcsXG4gICAgZnVsbF9hZGRyZXNzOiBzdHJpbmcsXG4gICAgb2Zmc2V0OiBzdHJpbmcsXG4gICAgbmFtZTogc3RyaW5nXG4gIH0pOiBQcm9taXNlPERhdGFJbmRleFJlc3VsdHM+IHtcbiAgICBsZXQgdXJsID0gJ2h0dHBzOi8vZGF0YS50cmFkZS5nb3YvY29uc29saWRhdGVkX3NjcmVlbmluZ19saXN0L3YxL3NlYXJjaD9zaXplPTUwJ1xuICAgIGlmIChpbnB1dHMuZnV6enlfbmFtZSkge3VybCA9IHVybCArIGAmZnV6enlfbmFtZT0ke2lucHV0cy5mdXp6eV9uYW1lfWB9XG4gICAgaWYgKGlucHV0cy50eXBlcykge3VybCA9IHVybCArIGAmdHlwZXM9JHtpbnB1dHMudHlwZXN9YH1cbiAgICBpZiAoaW5wdXRzLmNvdW50cmllcykge3VybCA9IHVybCArIGAmY291bnRyaWVzPSR7aW5wdXRzLmNvdW50cmllc31gfVxuICAgIGlmIChpbnB1dHMuc291cmNlcykge3VybCA9IHVybCArIGAmc291cmNlcz0ke2lucHV0cy5zb3VyY2VzfWB9XG4gICAgaWYgKGlucHV0cy5hZGRyZXNzKSB7dXJsID0gdXJsICsgYCZhZGRyZXNzPSR7aW5wdXRzLmFkZHJlc3N9YH1cbiAgICBpZiAoaW5wdXRzLmNpdHkpIHt1cmwgPSB1cmwgKyBgJmNpdHk9JHtpbnB1dHMuY2l0eX1gfVxuICAgIGlmIChpbnB1dHMuc3RhdGUpIHt1cmwgPSB1cmwgKyBgJnN0YXRlPSR7aW5wdXRzLnN0YXRlfWB9XG4gICAgaWYgKGlucHV0cy5wb3N0YWxfY29kZSkge3VybCA9IHVybCArIGAmcG9zdGFsX2NvZGU9JHtpbnB1dHMucG9zdGFsX2NvZGV9YH1cbiAgICBpZiAoaW5wdXRzLmZ1bGxfYWRkcmVzcykge3VybCA9IHVybCArIGAmZnVsbF9hZGRyZXNzPSR7aW5wdXRzLmZ1bGxfYWRkcmVzc31gfVxuICAgIGlmIChpbnB1dHMub2Zmc2V0KSB7dXJsID0gdXJsICsgYCZvZmZzZXQ9JHtpbnB1dHMub2Zmc2V0fWB9XG4gICAgaWYgKGlucHV0cy5uYW1lKSB7dXJsID0gdXJsICsgYCZuYW1lPSR7aW5wdXRzLm5hbWV9YH1cbiAgICBjb25zdCBjb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHtcbiAgICAgIG1ldGhvZDogJ2dldCcsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGhlYWRlcnM6IHsgXG4gICAgICAgICdzdWJzY3JpcHRpb24ta2V5JzogdGhpcy5jb25maWcuc3Vic2NyaXB0aW9uX2tleVxuICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgcmVzcG9uc2U6IEF4aW9zUmVzcG9uc2UgPSBhd2FpdCBheGlvcyhjb25maWcpLmNhdGNoKGVyciA9PiBQcm9taXNlLnJlamVjdChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA8IDUwMCA/IG5ldyBXZWJTZXJ2aWNlRXJyb3IoZXJyLnJlc3BvbnNlLmRhdGEpIDogZXJyKSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGl0ZW06IHJlc3BvbnNlLmRhdGEucmVzdWx0cyxcbiAgICAgIHJlc3VsdDogW3tcbiAgICAgICAgdG90YWw6IHJlc3BvbnNlLmRhdGEudG90YWwsXG4gICAgICAgIHNvdXJjZXM6IHJlc3BvbnNlLmRhdGEuc291cmNlc1xuICAgICAgfV1cbiAgICB9O1xuICB9XG59XG4iXX0=
