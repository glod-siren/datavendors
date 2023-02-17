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
        };
        this.outputConfiguration = {
            cluster: {}
        };
    }
    async invoke(inputs) {
        let url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/addresses?size=200`;
        const config = {
            method: 'get',
            url: url,
            headers: {
                'Accept': 'application/json',
                'token': this.config.token
            }
        };
        const response = await axios_1.default(config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new web_service_interface_1.WebServiceError(err.response.data) : err));
        //let items = response.data.items
        if (response.data.nextPage != null) {
            let page = response.data.nextPage;
            let lastResult = { nextPage: '' };
            do {
                try {
                    let sub_url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/addresses?size=200&page=${page}`;
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
            } while (lastResult.nextPage !== null);
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
                    sirenDenormAddress: denormAddress
                }]
        };
    }
}
exports.default = ClusterAddresses;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9DbHVzdGVyQWRkcmVzc2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUZBQStJO0FBQy9JLGlDQUFpRTtBQUNqRSxNQUFxQixnQkFBaUIsU0FBUSx5Q0FBaUI7SUFBL0Q7O1FBQ1csU0FBSSxHQUFHLGlCQUFpQixDQUFDO1FBQ3pCLGdCQUFXLEdBQWdCO1lBQ2xDLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtZQUN6QyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7U0FDeEMsQ0FBQztRQUNPLHdCQUFtQixHQUF3QjtZQUNsRCxPQUFPLEVBQUUsRUFBRTtTQUNaLENBQUM7SUFrREosQ0FBQztJQWpEQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BR1o7UUFDQyxJQUFJLEdBQUcsR0FBRyx5Q0FBeUMsTUFBTSxDQUFDLE9BQU8sSUFBSSxNQUFNLENBQUMsS0FBSyxxQkFBcUIsQ0FBQTtRQUN0RyxNQUFNLE1BQU0sR0FBdUI7WUFDakMsTUFBTSxFQUFFLEtBQUs7WUFDYixHQUFHLEVBQUUsR0FBRztZQUNSLE9BQU8sRUFBRTtnQkFDUCxRQUFRLEVBQUUsa0JBQWtCO2dCQUM1QixPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLO2FBQzNCO1NBQ0YsQ0FBQztRQUNGLE1BQU0sUUFBUSxHQUFrQixNQUFNLGVBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLHVDQUFlLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMzSyxpQ0FBaUM7UUFDakMsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLEVBQUU7WUFDbEMsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUE7WUFDakMsSUFBSSxVQUFVLEdBQUcsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLENBQUM7WUFDbEMsR0FBRztnQkFDRCxJQUFJO29CQUNGLElBQUksT0FBTyxHQUFHLHlDQUF5QyxNQUFNLENBQUMsT0FBTyxJQUFJLE1BQU0sQ0FBQyxLQUFLLDRCQUE0QixJQUFJLEVBQUUsQ0FBQTtvQkFDdkgsTUFBTSxVQUFVLEdBQXVCO3dCQUNyQyxNQUFNLEVBQUUsS0FBSzt3QkFDYixHQUFHLEVBQUUsT0FBTzt3QkFDWixPQUFPLEVBQUU7NEJBQ1AsUUFBUSxFQUFFLGtCQUFrQjs0QkFDNUIsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSzt5QkFDM0I7cUJBQ0YsQ0FBQztvQkFDRixNQUFNLFlBQVksR0FBa0IsTUFBTSxlQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSx1Q0FBZSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ25MLFVBQVUsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDO29CQUMvQixRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7aUJBQzdFO2dCQUFDLE1BQU07b0JBQUUsSUFBSSx1Q0FBZSxDQUFDLGtCQUFrQixDQUFDLENBQUE7aUJBQUU7YUFDcEQsUUFBUSxVQUFVLENBQUMsUUFBUSxLQUFLLElBQUksRUFBQztTQUN2QztRQUNELE1BQU0sYUFBYSxHQUFjLEVBQUUsQ0FBQztRQUNwQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ25ELGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO1NBQy9FO1FBQ0QsT0FBTztZQUNMLE9BQU8sRUFBRSxDQUFDO29CQUNSLEVBQUUsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXO29CQUN6RCxXQUFXLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXO29CQUN0QyxLQUFLLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLO29CQUMxQixLQUFLLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLO29CQUMxQixrQkFBa0IsRUFBRSxhQUFhO2lCQUNsQyxDQUFDO1NBQ0gsQ0FBQTtJQUNILENBQUM7Q0FDRjtBQTFERCxtQ0EwREMiLCJmaWxlIjoic3JjL0NsdXN0ZXJBZGRyZXNzZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEYXRhSW5kZXhSZXN1bHRzLCBJbnB1dFNjaGVtYSwgT3V0cHV0Q29uZmlndXJhdGlvbiwgU2VydmljZURlZmluaXRpb24sIFdlYlNlcnZpY2VFcnJvciB9IGZyb20gJ0BzaXJlbnNvbHV0aW9ucy93ZWItc2VydmljZS1pbnRlcmZhY2UnO1xuaW1wb3J0IGF4aW9zLCB7IEF4aW9zUmVxdWVzdENvbmZpZywgQXhpb3NSZXNwb25zZSB9IGZyb20gJ2F4aW9zJztcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENsdXN0ZXJBZGRyZXNzZXMgZXh0ZW5kcyBTZXJ2aWNlRGVmaW5pdGlvbiB7XG4gIHJlYWRvbmx5IG5hbWUgPSAnY2x1c3Rlcl9hZGRyZXNzJztcbiAgcmVhZG9ubHkgaW5wdXRTY2hlbWE6IElucHV0U2NoZW1hID0ge1xuICAgIGFkZHJlc3M6IHsgdHlwZTogJ3RleHQnLCByZXF1aXJlZDogdHJ1ZSB9LFxuICAgIGFzc2V0OiB7IHR5cGU6ICd0ZXh0JywgcmVxdWlyZWQ6IHRydWUgfSxcbiAgfTtcbiAgcmVhZG9ubHkgb3V0cHV0Q29uZmlndXJhdGlvbjogT3V0cHV0Q29uZmlndXJhdGlvbiA9IHtcbiAgICBjbHVzdGVyOiB7fVxuICB9O1xuICBhc3luYyBpbnZva2UoaW5wdXRzOiB7XG4gICAgYWRkcmVzczogc3RyaW5nLFxuICAgIGFzc2V0OiBzdHJpbmcsXG4gIH0pOiBQcm9taXNlPERhdGFJbmRleFJlc3VsdHM+IHtcbiAgICBsZXQgdXJsID0gYGh0dHBzOi8vaWFwaS5jaGFpbmFseXNpcy5jb20vY2x1c3RlcnMvJHtpbnB1dHMuYWRkcmVzc30vJHtpbnB1dHMuYXNzZXR9L2FkZHJlc3Nlcz9zaXplPTIwMGBcbiAgICBjb25zdCBjb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHtcbiAgICAgIG1ldGhvZDogJ2dldCcsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgJ3Rva2VuJzogdGhpcy5jb25maWcudG9rZW5cbiAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IHJlc3BvbnNlOiBBeGlvc1Jlc3BvbnNlID0gYXdhaXQgYXhpb3MoY29uZmlnKS5jYXRjaChlcnIgPT4gUHJvbWlzZS5yZWplY3QoZXJyLnJlc3BvbnNlICYmIGVyci5yZXNwb25zZS5zdGF0dXMgPCA1MDAgPyBuZXcgV2ViU2VydmljZUVycm9yKGVyci5yZXNwb25zZS5kYXRhKSA6IGVycikpO1xuICAgIC8vbGV0IGl0ZW1zID0gcmVzcG9uc2UuZGF0YS5pdGVtc1xuICAgIGlmIChyZXNwb25zZS5kYXRhLm5leHRQYWdlICE9IG51bGwpIHtcbiAgICAgIGxldCBwYWdlID0gcmVzcG9uc2UuZGF0YS5uZXh0UGFnZVxuICAgICAgbGV0IGxhc3RSZXN1bHQgPSB7IG5leHRQYWdlOiAnJyB9O1xuICAgICAgZG8ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGxldCBzdWJfdXJsID0gYGh0dHBzOi8vaWFwaS5jaGFpbmFseXNpcy5jb20vY2x1c3RlcnMvJHtpbnB1dHMuYWRkcmVzc30vJHtpbnB1dHMuYXNzZXR9L2FkZHJlc3Nlcz9zaXplPTIwMCZwYWdlPSR7cGFnZX1gXG4gICAgICAgICAgY29uc3Qgc3ViX2NvbmZpZzogQXhpb3NSZXF1ZXN0Q29uZmlnID0ge1xuICAgICAgICAgICAgbWV0aG9kOiAnZ2V0JyxcbiAgICAgICAgICAgIHVybDogc3ViX3VybCxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgJ3Rva2VuJzogdGhpcy5jb25maWcudG9rZW5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICAgIGNvbnN0IHN1Yl9yZXNwb25zZTogQXhpb3NSZXNwb25zZSA9IGF3YWl0IGF4aW9zKHN1Yl9jb25maWcpLmNhdGNoKGVyciA9PiBQcm9taXNlLnJlamVjdChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA8IDUwMCA/IG5ldyBXZWJTZXJ2aWNlRXJyb3IoZXJyLnJlc3BvbnNlLmRhdGEpIDogZXJyKSk7XG4gICAgICAgICAgbGFzdFJlc3VsdCA9IHN1Yl9yZXNwb25zZS5kYXRhO1xuICAgICAgICAgIHJlc3BvbnNlLmRhdGEuaXRlbXMucHVzaC5hcHBseShyZXNwb25zZS5kYXRhLml0ZW1zLCBzdWJfcmVzcG9uc2UuZGF0YS5pdGVtcylcbiAgICAgICAgfSBjYXRjaCB7IG5ldyBXZWJTZXJ2aWNlRXJyb3IoJ3BhZ2luYXRpb24gZXJyb3InKSB9XG4gICAgICB9IHdoaWxlIChsYXN0UmVzdWx0Lm5leHRQYWdlICE9PSBudWxsKVxuICAgIH1cbiAgICBjb25zdCBkZW5vcm1BZGRyZXNzIDogc3RyaW5nW10gPSBbXTtcbiAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHJlc3BvbnNlLmRhdGEuaXRlbXMubGVuZ3RoOyB5KyspIHtcbiAgICAgIGRlbm9ybUFkZHJlc3MucHVzaChgJHtyZXNwb25zZS5kYXRhLmFzc2V0fToke3Jlc3BvbnNlLmRhdGEuaXRlbXNbeV0uYWRkcmVzc31gKVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgY2x1c3RlcjogW3tcbiAgICAgICAgaWQ6IHJlc3BvbnNlLmRhdGEuYXNzZXQgKyAnOicgKyByZXNwb25zZS5kYXRhLnJvb3RBZGRyZXNzLFxuICAgICAgICByb290QWRkcmVzczogcmVzcG9uc2UuZGF0YS5yb290QWRkcmVzcyxcbiAgICAgICAgYXNzZXQ6IHJlc3BvbnNlLmRhdGEuYXNzZXQsXG4gICAgICAgIGl0ZW1zOiByZXNwb25zZS5kYXRhLml0ZW1zLFxuICAgICAgICBzaXJlbkRlbm9ybUFkZHJlc3M6IGRlbm9ybUFkZHJlc3NcbiAgICAgIH1dXG4gICAgfVxuICB9XG59XG4iXX0=
