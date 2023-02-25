"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web_service_interface_1 = require("@sirensolutions/web-service-interface");
const axios_1 = require("axios");
class ClusterAddresses extends web_service_interface_1.ServiceDefinition {
    constructor() {
        super(...arguments);
        this.name = 'cluster_address';
        this.inputSchema = {
            address: { type: 'text', required: true },
            asset: { type: 'text', required: true },
            page: { type: 'text', required: false },
        };
        this.outputConfiguration = {
            cluster: {},
            pagination: {
                'nextPage': 'keyword'
            }
        };
    }
    async invoke(inputs) {
        let url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/addresses?size=100`;
        if (inputs.page) {
            url + url + `&page=${inputs.page}`;
        }
        const config = {
            method: 'get',
            url: url,
            headers: {
                'Accept': 'application/json',
                'token': this.config.token
            }
        };
        const response = await axios_1.default(config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new web_service_interface_1.WebServiceError(err.response.data) : err));
        let truncated = false;
        let nextPage = '';
        if (response.data.nextPage != null) {
            let page = response.data.nextPage;
            let lastResult = { nextPage: '' };
            do {
                try {
                    let sub_url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/addresses?size=100&page=${page}`;
                    const sub_config = {
                        method: 'get',
                        url: sub_url,
                        headers: {
                            'Accept': 'application/json',
                            'token': this.config.token
                        }
                    };
                    const sub_response = await axios_1.default(sub_config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new web_service_interface_1.WebServiceError(err.response.data) : err));
                    lastResult = sub_response.data;
                    response.data.items.push.apply(response.data.items, sub_response.data.items);
                }
                catch {
                    new web_service_interface_1.WebServiceError('pagination error');
                }
            } while (lastResult.nextPage !== null && response.data.items < 1000);
            if (lastResult.nextPage !== null || lastResult.nextPage !== '') {
                truncated = true;
                nextPage = lastResult.nextPage;
            }
        }
        const denormAddress = [];
        for (let y = 0; y < response.data.items.length; y++) {
            denormAddress.push(`${response.data.asset}:${response.data.items[y].address}`);
        }
        return {
            cluster: [{
                    id: response.data.asset + ':' + response.data.rootAddress,
                    rootAddress: response.data.rootAddress,
                    asset: response.data.asset,
                    items: response.data.items,
                    sirenDenormAddress: denormAddress,
                    truncated: truncated
                }],
            pagination: [{
                    nextPage: nextPage
                }]
        };
    }
}
exports.default = ClusterAddresses;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9DbHVzdGVyQWRkcmVzc2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUZBQStJO0FBQy9JLGlDQUFpRTtBQUNqRSxNQUFxQixnQkFBaUIsU0FBUSx5Q0FBaUI7SUFBL0Q7O1FBQ1csU0FBSSxHQUFHLGlCQUFpQixDQUFDO1FBQ3pCLGdCQUFXLEdBQWdCO1lBQ2xDLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtZQUN6QyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7WUFDdkMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFO1NBQ3hDLENBQUM7UUFDTyx3QkFBbUIsR0FBd0I7WUFDbEQsT0FBTyxFQUFFLEVBQUU7WUFDWCxVQUFVLEVBQUU7Z0JBQ1YsVUFBVSxFQUFFLFNBQVM7YUFDeEI7U0FDQSxDQUFDO0lBK0RKLENBQUM7SUE5REMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUlaO1FBQ0MsSUFBSSxHQUFHLEdBQUcseUNBQXlDLE1BQU0sQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLEtBQUsscUJBQXFCLENBQUE7UUFDdEcsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFO1lBQ2YsR0FBRyxHQUFHLEdBQUcsR0FBRyxTQUFTLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQTtTQUNyQztRQUNDLE1BQU0sTUFBTSxHQUF1QjtZQUNqQyxNQUFNLEVBQUUsS0FBSztZQUNiLEdBQUcsRUFBRSxHQUFHO1lBQ1IsT0FBTyxFQUFFO2dCQUNQLFFBQVEsRUFBRSxrQkFBa0I7Z0JBQzVCLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUs7YUFDM0I7U0FDRixDQUFDO1FBQ0YsTUFBTSxRQUFRLEdBQWtCLE1BQU0sZUFBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxH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QyxLQUFLLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLO29CQUMxQixLQUFLLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLO29CQUMxQixrQkFBa0IsRUFBRSxhQUFhO29CQUNqQyxTQUFTLEVBQUUsU0FBUztpQkFDckIsQ0FBQztZQUNGLFVBQVUsRUFBRSxDQUFDO29CQUNYLFFBQVEsRUFBRSxRQUFRO2lCQUNuQixDQUFDO1NBQ0gsQ0FBQTtJQUNILENBQUM7Q0FDRjtBQTNFRCxtQ0EyRUMiLCJmaWxlIjoic3JjL0NsdXN0ZXJBZGRyZXNzZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEYXRhSW5kZXhSZXN1bHRzLCBJbnB1dFNjaGVtYSwgT3V0cHV0Q29uZmlndXJhdGlvbiwgU2VydmljZURlZmluaXRpb24sIFdlYlNlcnZpY2VFcnJvciB9IGZyb20gJ0BzaXJlbnNvbHV0aW9ucy93ZWItc2VydmljZS1pbnRlcmZhY2UnO1xuaW1wb3J0IGF4aW9zLCB7IEF4aW9zUmVxdWVzdENvbmZpZywgQXhpb3NSZXNwb25zZSB9IGZyb20gJ2F4aW9zJztcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENsdXN0ZXJBZGRyZXNzZXMgZXh0ZW5kcyBTZXJ2aWNlRGVmaW5pdGlvbiB7XG4gIHJlYWRvbmx5IG5hbWUgPSAnY2x1c3Rlcl9hZGRyZXNzJztcbiAgcmVhZG9ubHkgaW5wdXRTY2hlbWE6IElucHV0U2NoZW1hID0ge1xuICAgIGFkZHJlc3M6IHsgdHlwZTogJ3RleHQnLCByZXF1aXJlZDogdHJ1ZSB9LFxuICAgIGFzc2V0OiB7IHR5cGU6ICd0ZXh0JywgcmVxdWlyZWQ6IHRydWUgfSxcbiAgICBwYWdlOiB7IHR5cGU6ICd0ZXh0JywgcmVxdWlyZWQ6IGZhbHNlIH0sXG4gIH07XG4gIHJlYWRvbmx5IG91dHB1dENvbmZpZ3VyYXRpb246IE91dHB1dENvbmZpZ3VyYXRpb24gPSB7XG4gICAgY2x1c3Rlcjoge30sXG4gICAgcGFnaW5hdGlvbjoge1xuICAgICAgJ25leHRQYWdlJzogJ2tleXdvcmQnXG4gIH1cbiAgfTtcbiAgYXN5bmMgaW52b2tlKGlucHV0czoge1xuICAgIGFkZHJlc3M6IHN0cmluZyxcbiAgICBhc3NldDogc3RyaW5nLFxuICAgIHBhZ2U6IHN0cmluZyxcbiAgfSk6IFByb21pc2U8RGF0YUluZGV4UmVzdWx0cz4ge1xuICAgIGxldCB1cmwgPSBgaHR0cHM6Ly9pYXBpLmNoYWluYWx5c2lzLmNvbS9jbHVzdGVycy8ke2lucHV0cy5hZGRyZXNzfS8ke2lucHV0cy5hc3NldH0vYWRkcmVzc2VzP3NpemU9MTAwYFxuICAgIGlmIChpbnB1dHMucGFnZSkge1xuICAgICAgdXJsICsgdXJsICsgYCZwYWdlPSR7aW5wdXRzLnBhZ2V9YFxuICB9XG4gICAgY29uc3QgY29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB7XG4gICAgICBtZXRob2Q6ICdnZXQnLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICd0b2tlbic6IHRoaXMuY29uZmlnLnRva2VuXG4gICAgICB9XG4gICAgfTtcbiAgICBjb25zdCByZXNwb25zZTogQXhpb3NSZXNwb25zZSA9IGF3YWl0IGF4aW9zKGNvbmZpZykuY2F0Y2goZXJyID0+IFByb21pc2UucmVqZWN0KGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzIDwgNTAwID8gbmV3IFdlYlNlcnZpY2VFcnJvcihlcnIucmVzcG9uc2UuZGF0YSkgOiBlcnIpKTtcbiAgICBsZXQgdHJ1bmNhdGVkID0gZmFsc2U7XG4gICAgbGV0IG5leHRQYWdlID0gJyc7XG4gICAgaWYgKHJlc3BvbnNlLmRhdGEubmV4dFBhZ2UgIT0gbnVsbCkge1xuICAgICAgbGV0IHBhZ2UgPSByZXNwb25zZS5kYXRhLm5leHRQYWdlXG4gICAgICBsZXQgbGFzdFJlc3VsdCA9IHsgbmV4dFBhZ2U6ICcnIH07XG4gICAgICBkbyB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbGV0IHN1Yl91cmwgPSBgaHR0cHM6Ly9pYXBpLmNoYWluYWx5c2lzLmNvbS9jbHVzdGVycy8ke2lucHV0cy5hZGRyZXNzfS8ke2lucHV0cy5hc3NldH0vYWRkcmVzc2VzP3NpemU9MTAwJnBhZ2U9JHtwYWdlfWBcbiAgICAgICAgICBjb25zdCBzdWJfY29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB7XG4gICAgICAgICAgICBtZXRob2Q6ICdnZXQnLFxuICAgICAgICAgICAgdXJsOiBzdWJfdXJsLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAndG9rZW4nOiB0aGlzLmNvbmZpZy50b2tlblxuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgICAgY29uc3Qgc3ViX3Jlc3BvbnNlOiBBeGlvc1Jlc3BvbnNlID0gYXdhaXQgYXhpb3Moc3ViX2NvbmZpZykuY2F0Y2goZXJyID0+IFByb21pc2UucmVqZWN0KGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzIDwgNTAwID8gbmV3IFdlYlNlcnZpY2VFcnJvcihlcnIucmVzcG9uc2UuZGF0YSkgOiBlcnIpKTtcbiAgICAgICAgICBsYXN0UmVzdWx0ID0gc3ViX3Jlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgcmVzcG9uc2UuZGF0YS5pdGVtcy5wdXNoLmFwcGx5KHJlc3BvbnNlLmRhdGEuaXRlbXMsIHN1Yl9yZXNwb25zZS5kYXRhLml0ZW1zKVxuICAgICAgICB9IGNhdGNoIHsgbmV3IFdlYlNlcnZpY2VFcnJvcigncGFnaW5hdGlvbiBlcnJvcicpIH1cbiAgICAgIH0gd2hpbGUgKGxhc3RSZXN1bHQubmV4dFBhZ2UgIT09IG51bGwgJiYgcmVzcG9uc2UuZGF0YS5pdGVtcyA8IDEwMDApXG4gICAgICBpZiAobGFzdFJlc3VsdC5uZXh0UGFnZSAhPT0gbnVsbCB8fCBsYXN0UmVzdWx0Lm5leHRQYWdlICE9PSAnJykge1xuICAgICAgICB0cnVuY2F0ZWQgPSB0cnVlXG4gICAgICAgIG5leHRQYWdlID0gbGFzdFJlc3VsdC5uZXh0UGFnZVxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBkZW5vcm1BZGRyZXNzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGZvciAobGV0IHkgPSAwOyB5IDwgcmVzcG9uc2UuZGF0YS5pdGVtcy5sZW5ndGg7IHkrKykge1xuICAgICAgZGVub3JtQWRkcmVzcy5wdXNoKGAke3Jlc3BvbnNlLmRhdGEuYXNzZXR9OiR7cmVzcG9uc2UuZGF0YS5pdGVtc1t5XS5hZGRyZXNzfWApXG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBjbHVzdGVyOiBbe1xuICAgICAgICBpZDogcmVzcG9uc2UuZGF0YS5hc3NldCArICc6JyArIHJlc3BvbnNlLmRhdGEucm9vdEFkZHJlc3MsXG4gICAgICAgIHJvb3RBZGRyZXNzOiByZXNwb25zZS5kYXRhLnJvb3RBZGRyZXNzLFxuICAgICAgICBhc3NldDogcmVzcG9uc2UuZGF0YS5hc3NldCxcbiAgICAgICAgaXRlbXM6IHJlc3BvbnNlLmRhdGEuaXRlbXMsXG4gICAgICAgIHNpcmVuRGVub3JtQWRkcmVzczogZGVub3JtQWRkcmVzcyxcbiAgICAgICAgdHJ1bmNhdGVkOiB0cnVuY2F0ZWRcbiAgICAgIH1dLFxuICAgICAgcGFnaW5hdGlvbjogW3tcbiAgICAgICAgbmV4dFBhZ2U6IG5leHRQYWdlXG4gICAgICB9XVxuICAgIH1cbiAgfVxufVxuIl19
