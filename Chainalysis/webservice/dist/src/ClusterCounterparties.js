"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web_service_interface_1 = require("@sirensolutions/web-service-interface");
const axios_1 = require("axios");
class ClusterCounterparties extends web_service_interface_1.ServiceDefinition {
    constructor() {
        super(...arguments);
        this.name = 'cluster_counterparties';
        this.inputSchema = {
            address: { type: 'text', required: true },
            asset: { type: 'text', required: true },
            outputAsset: { type: 'text', required: false },
            page: { type: 'text', required: false },
        };
        this.outputConfiguration = {
            counterparties: {
                'raw': 'text',
                'firstTransferTimestamp': 'date',
                'lastTransferTimestamp': 'date',
                'sentAmount': 'long',
                'receivedAmount': 'long',
                'transfers': 'long'
            },
            pagination: {
                'nextPage': 'keyword'
            }
        };
    }
    async invoke(inputs) {
        if (!inputs.outputAsset) {
            inputs.outputAsset = 'NATIVE';
        }
        let url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/counterparties?outputAsset=${inputs.outputAsset}&size=100`;
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
        //let items = response.data.items
        let truncated = false;
        let nextPage = '';
        if (response.data.nextPage != null) {
            let page = response.data.nextPage;
            let lastResult = { nextPage: '' };
            do {
                try {
                    let sub_url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/counterparties?outputAsset=${inputs.outputAsset}&size=100&page=${page}`;
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
                id: `${response.data.items[y].asset}:${inputs.address}:${response.data.items[y].rootAddress}`,
                inputAddress: inputs.address,
                sirenDenormPartyInput: `${response.data.items[y].asset}:${inputs.address}`,
                sirenDenormPartyOutput: `${response.data.items[y].asset}:${response.data.items[y].rootAddress}`
            });
        }
        return {
            counterparties: response.data.items,
            pagination: [{
                    nextPage: nextPage,
                    truncated: truncated
                }]
        };
    }
}
exports.default = ClusterCounterparties;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9DbHVzdGVyQ291bnRlcnBhcnRpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxpRkFBK0k7QUFDL0ksaUNBQWlFO0FBQ2pFLE1BQXFCLHFCQUFzQixTQUFRLHlDQUFpQjtJQUFwRTs7UUFDVyxTQUFJLEdBQUcsd0JBQXdCLENBQUM7UUFDaEMsZ0JBQVcsR0FBZ0I7WUFDbEMsT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFO1lBQ3pDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtZQUN2QyxXQUFXLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUU7WUFDOUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFO1NBQ3hDLENBQUM7UUFDTyx3QkFBbUIsR0FBd0I7WUFDbEQsY0FBYyxFQUFFO2dCQUNkLEtBQUssRUFBRSxNQUFNO2dCQUNiLHdCQUF3QixFQUFFLE1BQU07Z0JBQ2hDLHVCQUF1QixFQUFFLE1BQU07Z0JBQy9CLFlBQVksRUFBRSxNQUFNO2dCQUNwQixnQkFBZ0IsRUFBRSxNQUFNO2dCQUN4QixXQUFXLEVBQUUsTUFBTTthQUNwQjtZQUNELFVBQVUsRUFBRTtnQkFDVixVQUFVLEVBQUUsU0FBUzthQUN4QjtTQUNBLENBQUM7SUFnRUosQ0FBQztJQS9EQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BS1o7UUFDQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRTtZQUFFLE1BQU0sQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFBO1NBQUU7UUFDMUQsSUFBSSxHQUFHLEdBQUcseUNBQXlDLE1BQU0sQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLEtBQUssK0JBQStCLE1BQU0sQ0FBQyxXQUFXLFdBQVcsQ0FBQTtRQUM3SSxJQUFJLE1B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QU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNuRCxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNwQyxFQUFFLEVBQUUsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDLE9BQU8sSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUU7Z0JBQzdGLFlBQVksRUFBRSxNQUFNLENBQUMsT0FBTztnQkFDNUIscUJBQXFCLEVBQUUsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRTtnQkFDMUUsc0JBQXNCLEVBQUUsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFO2FBQ2hHLENBQUMsQ0FBQTtTQUNIO1FBQ0QsT0FBTztZQUNMLGNBQWMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUs7WUFDbkMsVUFBVSxFQUFFLENBQUM7b0JBQ1gsUUFBUSxFQUFFLFFBQVE7b0JBQ2xCLFNBQVMsRUFBRSxTQUFTO2lCQUNyQixDQUFDO1NBQ0gsQ0FBQTtJQUNILENBQUM7Q0FDRjtBQXBGRCx3Q0FvRkMiLCJmaWxlIjoic3JjL0NsdXN0ZXJDb3VudGVycGFydGllcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERhdGFJbmRleFJlc3VsdHMsIElucHV0U2NoZW1hLCBPdXRwdXRDb25maWd1cmF0aW9uLCBTZXJ2aWNlRGVmaW5pdGlvbiwgV2ViU2VydmljZUVycm9yIH0gZnJvbSAnQHNpcmVuc29sdXRpb25zL3dlYi1zZXJ2aWNlLWludGVyZmFjZSc7XHJcbmltcG9ydCBheGlvcywgeyBBeGlvc1JlcXVlc3RDb25maWcsIEF4aW9zUmVzcG9uc2UgfSBmcm9tICdheGlvcyc7XHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENsdXN0ZXJDb3VudGVycGFydGllcyBleHRlbmRzIFNlcnZpY2VEZWZpbml0aW9uIHtcclxuICByZWFkb25seSBuYW1lID0gJ2NsdXN0ZXJfY291bnRlcnBhcnRpZXMnO1xyXG4gIHJlYWRvbmx5IGlucHV0U2NoZW1hOiBJbnB1dFNjaGVtYSA9IHtcclxuICAgIGFkZHJlc3M6IHsgdHlwZTogJ3RleHQnLCByZXF1aXJlZDogdHJ1ZSB9LFxyXG4gICAgYXNzZXQ6IHsgdHlwZTogJ3RleHQnLCByZXF1aXJlZDogdHJ1ZSB9LFxyXG4gICAgb3V0cHV0QXNzZXQ6IHsgdHlwZTogJ3RleHQnLCByZXF1aXJlZDogZmFsc2UgfSxcclxuICAgIHBhZ2U6IHsgdHlwZTogJ3RleHQnLCByZXF1aXJlZDogZmFsc2UgfSxcclxuICB9O1xyXG4gIHJlYWRvbmx5IG91dHB1dENvbmZpZ3VyYXRpb246IE91dHB1dENvbmZpZ3VyYXRpb24gPSB7XHJcbiAgICBjb3VudGVycGFydGllczoge1xyXG4gICAgICAncmF3JzogJ3RleHQnLFxyXG4gICAgICAnZmlyc3RUcmFuc2ZlclRpbWVzdGFtcCc6ICdkYXRlJyxcclxuICAgICAgJ2xhc3RUcmFuc2ZlclRpbWVzdGFtcCc6ICdkYXRlJyxcclxuICAgICAgJ3NlbnRBbW91bnQnOiAnbG9uZycsXHJcbiAgICAgICdyZWNlaXZlZEFtb3VudCc6ICdsb25nJyxcclxuICAgICAgJ3RyYW5zZmVycyc6ICdsb25nJ1xyXG4gICAgfSxcclxuICAgIHBhZ2luYXRpb246IHtcclxuICAgICAgJ25leHRQYWdlJzogJ2tleXdvcmQnXHJcbiAgfVxyXG4gIH07XHJcbiAgYXN5bmMgaW52b2tlKGlucHV0czoge1xyXG4gICAgYWRkcmVzczogc3RyaW5nLFxyXG4gICAgYXNzZXQ6IHN0cmluZyxcclxuICAgIG91dHB1dEFzc2V0OiBzdHJpbmcsXHJcbiAgICBwYWdlOiBzdHJpbmcsXHJcbiAgfSk6IFByb21pc2U8RGF0YUluZGV4UmVzdWx0cz4ge1xyXG4gICAgaWYgKCFpbnB1dHMub3V0cHV0QXNzZXQpIHsgaW5wdXRzLm91dHB1dEFzc2V0ID0gJ05BVElWRScgfVxyXG4gICAgbGV0IHVybCA9IGBodHRwczovL2lhcGkuY2hhaW5hbHlzaXMuY29tL2NsdXN0ZXJzLyR7aW5wdXRzLmFkZHJlc3N9LyR7aW5wdXRzLmFzc2V0fS9jb3VudGVycGFydGllcz9vdXRwdXRBc3NldD0ke2lucHV0cy5vdXRwdXRBc3NldH0mc2l6ZT0xMDBgXHJcbiAgICBpZiAoaW5wdXRzLnBhZ2UpIHtcclxuICAgICAgdXJsICsgdXJsICsgYCZwYWdlPSR7aW5wdXRzLnBhZ2V9YFxyXG4gICAgfVxyXG4gICAgY29uc3QgY29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB7XHJcbiAgICAgIG1ldGhvZDogJ2dldCcsXHJcbiAgICAgIHVybDogdXJsLFxyXG4gICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICAndG9rZW4nOiB0aGlzLmNvbmZpZy50b2tlblxyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgY29uc3QgcmVzcG9uc2U6IEF4aW9zUmVzcG9uc2UgPSBhd2FpdCBheGlvcyhjb25maWcpLmNhdGNoKGVyciA9PiBQcm9taXNlLnJlamVjdChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA8IDUwMCA/IG5ldyBXZWJTZXJ2aWNlRXJyb3IoZXJyLnJlc3BvbnNlLmRhdGEpIDogZXJyKSk7XHJcbiAgICAvL2xldCBpdGVtcyA9IHJlc3BvbnNlLmRhdGEuaXRlbXNcclxuICAgIGxldCB0cnVuY2F0ZWQgPSBmYWxzZVxyXG4gICAgbGV0IG5leHRQYWdlID0gJyc7XHJcbiAgICBpZiAocmVzcG9uc2UuZGF0YS5uZXh0UGFnZSAhPSBudWxsKSB7XHJcbiAgICAgIGxldCBwYWdlID0gcmVzcG9uc2UuZGF0YS5uZXh0UGFnZVxyXG4gICAgICBsZXQgbGFzdFJlc3VsdCA9IHsgbmV4dFBhZ2U6ICcnIH07XHJcbiAgICAgIGRvIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgbGV0IHN1Yl91cmwgPSBgaHR0cHM6Ly9pYXBpLmNoYWluYWx5c2lzLmNvbS9jbHVzdGVycy8ke2lucHV0cy5hZGRyZXNzfS8ke2lucHV0cy5hc3NldH0vY291bnRlcnBhcnRpZXM/b3V0cHV0QXNzZXQ9JHtpbnB1dHMub3V0cHV0QXNzZXR9JnNpemU9MTAwJnBhZ2U9JHtwYWdlfWBcclxuICAgICAgICAgIGNvbnN0IHN1Yl9jb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHtcclxuICAgICAgICAgICAgbWV0aG9kOiAnZ2V0JyxcclxuICAgICAgICAgICAgdXJsOiBzdWJfdXJsLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICAgICAgICAndG9rZW4nOiB0aGlzLmNvbmZpZy50b2tlblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgICAgY29uc3Qgc3ViX3Jlc3BvbnNlOiBBeGlvc1Jlc3BvbnNlID0gYXdhaXQgYXhpb3Moc3ViX2NvbmZpZykuY2F0Y2goZXJyID0+IFByb21pc2UucmVqZWN0KGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzIDwgNTAwID8gbmV3IFdlYlNlcnZpY2VFcnJvcihlcnIucmVzcG9uc2UuZGF0YSkgOiBlcnIpKTtcclxuICAgICAgICAgIGxhc3RSZXN1bHQgPSBzdWJfcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgIHJlc3BvbnNlLmRhdGEuaXRlbXMucHVzaC5hcHBseShyZXNwb25zZS5kYXRhLml0ZW1zLCBzdWJfcmVzcG9uc2UuZGF0YS5pdGVtcylcclxuICAgICAgICB9IGNhdGNoIHsgbmV3IFdlYlNlcnZpY2VFcnJvcigncGFnaW5hdGlvbiBlcnJvcicpIH1cclxuICAgICAgfSB3aGlsZSAobGFzdFJlc3VsdC5uZXh0UGFnZSAhPT0gbnVsbCAmJiByZXNwb25zZS5kYXRhLml0ZW1zLmxlbmd0aCA8PSA0MDApXHJcbiAgICAgIGlmIChsYXN0UmVzdWx0Lm5leHRQYWdlICE9PSBudWxsIHx8IGxhc3RSZXN1bHQubmV4dFBhZ2UgIT09ICcnKSB7XHJcbiAgICAgICAgdHJ1bmNhdGVkID0gdHJ1ZTtcclxuICAgICAgICBuZXh0UGFnZSA9IGxhc3RSZXN1bHQubmV4dFBhZ2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGZvciAobGV0IHkgPSAwOyB5IDwgcmVzcG9uc2UuZGF0YS5pdGVtcy5sZW5ndGg7IHkrKykge1xyXG4gICAgICBPYmplY3QuYXNzaWduKHJlc3BvbnNlLmRhdGEuaXRlbXNbeV0sIHtcclxuICAgICAgICBpZDogYCR7cmVzcG9uc2UuZGF0YS5pdGVtc1t5XS5hc3NldH06JHtpbnB1dHMuYWRkcmVzc306JHtyZXNwb25zZS5kYXRhLml0ZW1zW3ldLnJvb3RBZGRyZXNzfWAsXHJcbiAgICAgICAgaW5wdXRBZGRyZXNzOiBpbnB1dHMuYWRkcmVzcyxcclxuICAgICAgICBzaXJlbkRlbm9ybVBhcnR5SW5wdXQ6IGAke3Jlc3BvbnNlLmRhdGEuaXRlbXNbeV0uYXNzZXR9OiR7aW5wdXRzLmFkZHJlc3N9YCxcclxuICAgICAgICBzaXJlbkRlbm9ybVBhcnR5T3V0cHV0OiBgJHtyZXNwb25zZS5kYXRhLml0ZW1zW3ldLmFzc2V0fToke3Jlc3BvbnNlLmRhdGEuaXRlbXNbeV0ucm9vdEFkZHJlc3N9YFxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY291bnRlcnBhcnRpZXM6IHJlc3BvbnNlLmRhdGEuaXRlbXMsXHJcbiAgICAgIHBhZ2luYXRpb246IFt7XHJcbiAgICAgICAgbmV4dFBhZ2U6IG5leHRQYWdlLFxyXG4gICAgICAgIHRydW5jYXRlZDogdHJ1bmNhdGVkXHJcbiAgICAgIH1dXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiJdfQ==
