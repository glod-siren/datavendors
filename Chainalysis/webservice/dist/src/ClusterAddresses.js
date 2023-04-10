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
            addresses: {},
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
                response;
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
            } while (lastResult.nextPage !== null && response.data.items.length <= 400);
            if (lastResult.nextPage !== null || lastResult.nextPage !== '') {
                truncated = true;
                nextPage = lastResult.nextPage;
            }
        }
        for (let y = 0; y < response.data.items.length; y++) {
            Object.assign(response.data.items[y], {
                rootAddress: response.data.rootAddress,
                asset: response.data.asset,
                id: `${response.data.asset}:${response.data.items[y].address}`
            });
        }
        return {
            pagination: [{
                    nextPage: nextPage,
                    truncated: truncated
                }],
            addresses: response.data.items
        };
    }
}
exports.default = ClusterAddresses;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9DbHVzdGVyQWRkcmVzc2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUZBQStJO0FBQy9JLGlDQUFpRTtBQUNqRSxNQUFxQixnQkFBaUIsU0FBUSx5Q0FBaUI7SUFBL0Q7O1FBQ1csU0FBSSxHQUFHLGlCQUFpQixDQUFDO1FBQ3pCLGdCQUFXLEdBQWdCO1lBQ2xDLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtZQUN6QyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7WUFDdkMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFO1NBQ3hDLENBQUM7UUFDTyx3QkFBbUIsR0FBd0I7WUFDbEQsU0FBUyxFQUFFLEVBQUU7WUFDYixVQUFVLEVBQUU7Z0JBQ1YsVUFBVSxFQUFFLFNBQVM7YUFDdEI7U0FDRixDQUFDO0lBNkRKLENBQUM7SUE1REMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUlaO1FBQ0MsSUFBSSxHQUFHLEdBQUcseUNBQXlDLE1BQU0sQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLEtBQUsscUJBQXFCLENBQUE7UUFDdEcsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFO1lBQ2YsR0FBRyxHQUFHLEdBQUcsR0FBRyxTQUFTLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQTtTQUNuQztRQUNELE1BQU0sTUFBTSxHQUF1QjtZQUNqQyxNQUFNLEVBQUUsS0FBSztZQUNiLEdBQUcsRUFBRSxHQUFHO1lBQ1IsT0FBTyxFQUFFO2dCQUNQLFFBQVEsRUFBRSxrQkFBa0I7Z0JBQzVCLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUs7YUFDM0I7U0FDRixDQUFDO1FBQ0YsTUFBTSxRQUFRLEdBQWtCLE1BQU0sZUFBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxH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Q0wsVUFBVSxFQUFFLENBQUM7b0JBQ1gsUUFBUSxFQUFFLFFBQVE7b0JBQ2xCLFNBQVMsRUFBRSxTQUFTO2lCQUNyQixDQUFDO1lBQ0YsU0FBUyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSztTQUMvQixDQUFBO0lBQ0gsQ0FBQztDQUNGO0FBekVELG1DQXlFQyIsImZpbGUiOiJzcmMvQ2x1c3RlckFkZHJlc3Nlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERhdGFJbmRleFJlc3VsdHMsIElucHV0U2NoZW1hLCBPdXRwdXRDb25maWd1cmF0aW9uLCBTZXJ2aWNlRGVmaW5pdGlvbiwgV2ViU2VydmljZUVycm9yIH0gZnJvbSAnQHNpcmVuc29sdXRpb25zL3dlYi1zZXJ2aWNlLWludGVyZmFjZSc7XG5pbXBvcnQgYXhpb3MsIHsgQXhpb3NSZXF1ZXN0Q29uZmlnLCBBeGlvc1Jlc3BvbnNlIH0gZnJvbSAnYXhpb3MnO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2x1c3RlckFkZHJlc3NlcyBleHRlbmRzIFNlcnZpY2VEZWZpbml0aW9uIHtcbiAgcmVhZG9ubHkgbmFtZSA9ICdjbHVzdGVyX2FkZHJlc3MnO1xuICByZWFkb25seSBpbnB1dFNjaGVtYTogSW5wdXRTY2hlbWEgPSB7XG4gICAgYWRkcmVzczogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiB0cnVlIH0sXG4gICAgYXNzZXQ6IHsgdHlwZTogJ3RleHQnLCByZXF1aXJlZDogdHJ1ZSB9LFxuICAgIHBhZ2U6IHsgdHlwZTogJ3RleHQnLCByZXF1aXJlZDogZmFsc2UgfSxcbiAgfTtcbiAgcmVhZG9ubHkgb3V0cHV0Q29uZmlndXJhdGlvbjogT3V0cHV0Q29uZmlndXJhdGlvbiA9IHtcbiAgICBhZGRyZXNzZXM6IHt9LFxuICAgIHBhZ2luYXRpb246IHtcbiAgICAgICduZXh0UGFnZSc6ICdrZXl3b3JkJ1xuICAgIH1cbiAgfTtcbiAgYXN5bmMgaW52b2tlKGlucHV0czoge1xuICAgIGFkZHJlc3M6IHN0cmluZyxcbiAgICBhc3NldDogc3RyaW5nLFxuICAgIHBhZ2U6IHN0cmluZyxcbiAgfSk6IFByb21pc2U8RGF0YUluZGV4UmVzdWx0cz4ge1xuICAgIGxldCB1cmwgPSBgaHR0cHM6Ly9pYXBpLmNoYWluYWx5c2lzLmNvbS9jbHVzdGVycy8ke2lucHV0cy5hZGRyZXNzfS8ke2lucHV0cy5hc3NldH0vYWRkcmVzc2VzP3NpemU9MTAwYFxuICAgIGlmIChpbnB1dHMucGFnZSkge1xuICAgICAgdXJsICsgdXJsICsgYCZwYWdlPSR7aW5wdXRzLnBhZ2V9YFxuICAgIH1cbiAgICBjb25zdCBjb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHtcbiAgICAgIG1ldGhvZDogJ2dldCcsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgJ3Rva2VuJzogdGhpcy5jb25maWcudG9rZW5cbiAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IHJlc3BvbnNlOiBBeGlvc1Jlc3BvbnNlID0gYXdhaXQgYXhpb3MoY29uZmlnKS5jYXRjaChlcnIgPT4gUHJvbWlzZS5yZWplY3QoZXJyLnJlc3BvbnNlICYmIGVyci5yZXNwb25zZS5zdGF0dXMgPCA1MDAgPyBuZXcgV2ViU2VydmljZUVycm9yKGVyci5yZXNwb25zZS5kYXRhKSA6IGVycikpO1xuICAgIGxldCB0cnVuY2F0ZWQgPSBmYWxzZTtcbiAgICBsZXQgbmV4dFBhZ2UgPSAnJztcbiAgICBpZiAocmVzcG9uc2UuZGF0YS5uZXh0UGFnZSAhPSBudWxsKSB7XG4gICAgICBsZXQgcGFnZSA9IHJlc3BvbnNlLmRhdGEubmV4dFBhZ2VcbiAgICAgIGxldCBsYXN0UmVzdWx0ID0geyBuZXh0UGFnZTogJycgfTtcbiAgICAgIGRvIHtcbiAgICAgICAgcmVzcG9uc2VcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBsZXQgc3ViX3VybCA9IGBodHRwczovL2lhcGkuY2hhaW5hbHlzaXMuY29tL2NsdXN0ZXJzLyR7aW5wdXRzLmFkZHJlc3N9LyR7aW5wdXRzLmFzc2V0fS9hZGRyZXNzZXM/c2l6ZT0xMDAmcGFnZT0ke3BhZ2V9YFxuICAgICAgICAgIGNvbnN0IHN1Yl9jb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHtcbiAgICAgICAgICAgIG1ldGhvZDogJ2dldCcsXG4gICAgICAgICAgICB1cmw6IHN1Yl91cmwsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICd0b2tlbic6IHRoaXMuY29uZmlnLnRva2VuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgICBjb25zdCBzdWJfcmVzcG9uc2U6IEF4aW9zUmVzcG9uc2UgPSBhd2FpdCBheGlvcyhzdWJfY29uZmlnKS5jYXRjaChlcnIgPT4gUHJvbWlzZS5yZWplY3QoZXJyLnJlc3BvbnNlICYmIGVyci5yZXNwb25zZS5zdGF0dXMgPCA1MDAgPyBuZXcgV2ViU2VydmljZUVycm9yKGVyci5yZXNwb25zZS5kYXRhKSA6IGVycikpO1xuICAgICAgICAgIGxhc3RSZXN1bHQgPSBzdWJfcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICByZXNwb25zZS5kYXRhLml0ZW1zLnB1c2guYXBwbHkocmVzcG9uc2UuZGF0YS5pdGVtcywgc3ViX3Jlc3BvbnNlLmRhdGEuaXRlbXMpXG4gICAgICAgIH0gY2F0Y2ggeyBuZXcgV2ViU2VydmljZUVycm9yKCdwYWdpbmF0aW9uIGVycm9yJykgfVxuICAgICAgfSB3aGlsZSAobGFzdFJlc3VsdC5uZXh0UGFnZSAhPT0gbnVsbCAmJiByZXNwb25zZS5kYXRhLml0ZW1zLmxlbmd0aCA8PSA0MDApXG4gICAgICBpZiAobGFzdFJlc3VsdC5uZXh0UGFnZSAhPT0gbnVsbCB8fCBsYXN0UmVzdWx0Lm5leHRQYWdlICE9PSAnJykge1xuICAgICAgICB0cnVuY2F0ZWQgPSB0cnVlXG4gICAgICAgIG5leHRQYWdlID0gbGFzdFJlc3VsdC5uZXh0UGFnZVxuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHJlc3BvbnNlLmRhdGEuaXRlbXMubGVuZ3RoOyB5KyspIHtcbiAgICAgIE9iamVjdC5hc3NpZ24ocmVzcG9uc2UuZGF0YS5pdGVtc1t5XSwge1xuICAgICAgICByb290QWRkcmVzczogcmVzcG9uc2UuZGF0YS5yb290QWRkcmVzcyxcbiAgICAgICAgYXNzZXQ6IHJlc3BvbnNlLmRhdGEuYXNzZXQsXG4gICAgICAgIGlkOiBgJHtyZXNwb25zZS5kYXRhLmFzc2V0fToke3Jlc3BvbnNlLmRhdGEuaXRlbXNbeV0uYWRkcmVzc31gXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHBhZ2luYXRpb246IFt7XG4gICAgICAgIG5leHRQYWdlOiBuZXh0UGFnZSxcbiAgICAgICAgdHJ1bmNhdGVkOiB0cnVuY2F0ZWRcbiAgICAgIH1dLFxuICAgICAgYWRkcmVzc2VzOiByZXNwb25zZS5kYXRhLml0ZW1zXG4gICAgfVxuICB9XG59XG4iXX0=
