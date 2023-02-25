"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web_service_interface_1 = require("@sirensolutions/web-service-interface");
const axios_1 = require("axios");
class ClusterTransactions extends web_service_interface_1.ServiceDefinition {
    constructor() {
        super(...arguments);
        this.name = 'cluster_transactions';
        this.inputSchema = {
            address: { type: 'text', required: true },
            asset: { type: 'text', required: true },
            counterparty: { type: 'text', required: false },
            startTime: { type: 'date', required: false },
            endTime: { type: 'date', required: false },
            page: { type: 'date', required: false },
        };
        this.outputConfiguration = {
            transaction: {
                details: {
                    'blockTimestamp': 'date',
                    'blockHeight': 'long',
                    'exchangeRate': 'long',
                    'fee': 'long',
                    traces: {
                        inputs: {
                            'amount': 'long'
                        },
                        outputs: {
                            'amount': 'long'
                        }
                    }
                }
            },
            pagination: {
                'nextPage': 'keyword'
            }
        };
    }
    async invoke(inputs) {
        let transaction_url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/transactions?size=100`;
        if (inputs.page) {
            transaction_url + transaction_url + `&page=${inputs.page}`;
        }
        if (inputs.startTime) {
            transaction_url = transaction_url + `&startTime=${inputs.startTime}`;
        }
        if (inputs.endTime) {
            transaction_url = transaction_url + `&endTime=${inputs.endTime}`;
        }
        if (inputs.counterparty) {
            transaction_url = transaction_url + `&counterparty=${inputs.counterparty}`;
        }
        const transaction_config = {
            method: 'get',
            url: transaction_url,
            headers: {
                'Accept': 'application/json',
                'token': this.config.token
            }
        };
        const transaction_response = await axios_1.default(transaction_config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new web_service_interface_1.WebServiceError(err.response.data) : err));
        let truncated = false;
        let nextPage = '';
        if (transaction_response.data.nextPage != null) {
            let page = transaction_response.data.nextPage;
            let lastResult = { nextPage: '' };
            do {
                try {
                    let sub_url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/transactions?size=100` + `&page=${page}`;
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
                    transaction_response.data.items.push.apply(transaction_response.data.items, sub_response.data.items);
                }
                catch {
                    new web_service_interface_1.WebServiceError('pagination error');
                }
            } while (lastResult.nextPage !== null && transaction_response.data.items < 500);
            if (lastResult.nextPage !== null || lastResult.nextPage !== '') {
                truncated = true;
                nextPage = lastResult.nextPage;
            }
        }
        for (let y = 0; y < transaction_response.data.items.length; y++) {
            let hash_url = `https://iapi.chainalysis.com/transactions/${transaction_response.data.items[y].transactionHash}/${inputs.asset}/details`;
            const hash_config = {
                method: 'get',
                url: hash_url,
                headers: {
                    'Accept': 'application/json',
                    'token': this.config.token
                }
            };
            const hash_response = await axios_1.default(hash_config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new web_service_interface_1.WebServiceError(err.response.data) : err));
            Object.assign(transaction_response.data.items[y], {
                details: hash_response.data,
                id: inputs.asset + ':' + transaction_response.data.items[y].transactionHash,
                sirenDenormInputAddress: [],
                sirenDenormOutputAddress: [],
                truncated: truncated
            });
            try {
                for (let a = 0; a < hash_response.data.traces.length; a++) {
                    for (let b = 0; b < hash_response.data.traces[a].inputs.length; b++) {
                        transaction_response.data.items[y].sirenDenormInputAddress.push(inputs.asset + ':' + hash_response.data.traces[a].inputs[b].rootAddress);
                    }
                    for (let c = 0; c < hash_response.data.traces[a].outputs.length; c++) {
                        transaction_response.data.items[y].sirenDenormOutputAddress.push(inputs.asset + ':' + hash_response.data.traces[a].outputs[c].rootAddress);
                    }
                }
            }
            catch { }
        }
        return {
            transaction: transaction_response.data.items,
            pagination: [{
                    nextPage: nextPage
                }]
        };
    }
}
exports.default = ClusterTransactions;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9DbHVzdGVyVHJhbnNhY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUZBQStJO0FBQy9JLGlDQUFpRTtBQUNqRSxNQUFxQixtQkFBb0IsU0FBUSx5Q0FBaUI7SUFBbEU7O1FBQ2EsU0FBSSxHQUFHLHNCQUFzQixDQUFDO1FBQzlCLGdCQUFXLEdBQWdCO1lBQ2hDLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtZQUN6QyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7WUFDdkMsWUFBWSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFO1lBQy9DLFNBQVMsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRTtZQUM1QyxPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUU7WUFDMUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFO1NBQzFDLENBQUM7UUFDTyx3QkFBbUIsR0FBd0I7WUFDaEQsV0FBVyxFQUFFO2dCQUNULE9BQU8sRUFBRTtvQkFDTCxnQkFBZ0IsRUFBRSxNQUFNO29CQUN4QixhQUFhLEVBQUUsTUFBTTtvQkFDckIsY0FBYyxFQUFFLE1BQU07b0JBQ3RCLEtBQUssRUFBRSxNQUFNO29CQUNiLE1BQU0sRUFBRTt3QkFDSixNQUFNLEVBQUU7NEJBQ0osUUFBUSxFQUFFLE1BQU07eUJBQ25CO3dCQUNELE9BQU8sRUFBRTs0QkFDTCxRQUFRLEVBQUUsTUFBTTt5QkFDbkI7cUJBQ0o7aUJBQ0o7YUFDSjtZQUNELFVBQVUsRUFBRTtnQkFDUixVQUFVLEVBQUUsU0FBUzthQUN4QjtTQUNKLENBQUM7SUF1Rk4sQ0FBQztJQXRGRyxLQUFL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LENBQUMsQ0FBQyxDQUFDLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQTtxQkFDN0k7aUJBQ0o7YUFDSjtZQUFDLE1BQU0sR0FBRztTQUNkO1FBQ0QsT0FBTztZQUNILFdBQVcsRUFBRSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsS0FBSztZQUM1QyxVQUFVLEVBQUUsQ0FBQztvQkFDVCxRQUFRLEVBQUUsUUFBUTtpQkFDckIsQ0FBQztTQUNMLENBQUE7SUFDTCxDQUFDO0NBQ0o7QUFySEQsc0NBcUhDIiwiZmlsZSI6InNyYy9DbHVzdGVyVHJhbnNhY3Rpb25zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGF0YUluZGV4UmVzdWx0cywgSW5wdXRTY2hlbWEsIE91dHB1dENvbmZpZ3VyYXRpb24sIFNlcnZpY2VEZWZpbml0aW9uLCBXZWJTZXJ2aWNlRXJyb3IgfSBmcm9tICdAc2lyZW5zb2x1dGlvbnMvd2ViLXNlcnZpY2UtaW50ZXJmYWNlJztcclxuaW1wb3J0IGF4aW9zLCB7IEF4aW9zUmVxdWVzdENvbmZpZywgQXhpb3NSZXNwb25zZSB9IGZyb20gJ2F4aW9zJztcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2x1c3RlclRyYW5zYWN0aW9ucyBleHRlbmRzIFNlcnZpY2VEZWZpbml0aW9uIHtcclxuICAgIHJlYWRvbmx5IG5hbWUgPSAnY2x1c3Rlcl90cmFuc2FjdGlvbnMnO1xyXG4gICAgcmVhZG9ubHkgaW5wdXRTY2hlbWE6IElucHV0U2NoZW1hID0ge1xyXG4gICAgICAgIGFkZHJlc3M6IHsgdHlwZTogJ3RleHQnLCByZXF1aXJlZDogdHJ1ZSB9LFxyXG4gICAgICAgIGFzc2V0OiB7IHR5cGU6ICd0ZXh0JywgcmVxdWlyZWQ6IHRydWUgfSxcclxuICAgICAgICBjb3VudGVycGFydHk6IHsgdHlwZTogJ3RleHQnLCByZXF1aXJlZDogZmFsc2UgfSxcclxuICAgICAgICBzdGFydFRpbWU6IHsgdHlwZTogJ2RhdGUnLCByZXF1aXJlZDogZmFsc2UgfSxcclxuICAgICAgICBlbmRUaW1lOiB7IHR5cGU6ICdkYXRlJywgcmVxdWlyZWQ6IGZhbHNlIH0sXHJcbiAgICAgICAgcGFnZTogeyB0eXBlOiAnZGF0ZScsIHJlcXVpcmVkOiBmYWxzZSB9LFxyXG4gICAgfTtcclxuICAgIHJlYWRvbmx5IG91dHB1dENvbmZpZ3VyYXRpb246IE91dHB1dENvbmZpZ3VyYXRpb24gPSB7XHJcbiAgICAgICAgdHJhbnNhY3Rpb246IHtcclxuICAgICAgICAgICAgZGV0YWlsczoge1xyXG4gICAgICAgICAgICAgICAgJ2Jsb2NrVGltZXN0YW1wJzogJ2RhdGUnLFxyXG4gICAgICAgICAgICAgICAgJ2Jsb2NrSGVpZ2h0JzogJ2xvbmcnLFxyXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlUmF0ZSc6ICdsb25nJyxcclxuICAgICAgICAgICAgICAgICdmZWUnOiAnbG9uZycsXHJcbiAgICAgICAgICAgICAgICB0cmFjZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2Ftb3VudCc6ICdsb25nJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0czoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnYW1vdW50JzogJ2xvbmcnXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBwYWdpbmF0aW9uOiB7XHJcbiAgICAgICAgICAgICduZXh0UGFnZSc6ICdrZXl3b3JkJ1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBhc3luYyBpbnZva2UoaW5wdXRzOiB7XHJcbiAgICAgICAgYWRkcmVzczogc3RyaW5nLFxyXG4gICAgICAgIGFzc2V0OiBzdHJpbmcsXHJcbiAgICAgICAgY291bnRlcnBhcnR5OiBzdHJpbmcsXHJcbiAgICAgICAgc3RhcnRUaW1lOiBzdHJpbmcsXHJcbiAgICAgICAgZW5kVGltZTogc3RyaW5nLFxyXG4gICAgICAgIHBhZ2U6IHN0cmluZyxcclxuICAgIH0pOiBQcm9taXNlPERhdGFJbmRleFJlc3VsdHM+IHtcclxuICAgICAgICBsZXQgdHJhbnNhY3Rpb25fdXJsID0gYGh0dHBzOi8vaWFwaS5jaGFpbmFseXNpcy5jb20vY2x1c3RlcnMvJHtpbnB1dHMuYWRkcmVzc30vJHtpbnB1dHMuYXNzZXR9L3RyYW5zYWN0aW9ucz9zaXplPTEwMGBcclxuICAgICAgICBpZiAoaW5wdXRzLnBhZ2UpIHtcclxuICAgICAgICAgICAgdHJhbnNhY3Rpb25fdXJsICsgdHJhbnNhY3Rpb25fdXJsICsgYCZwYWdlPSR7aW5wdXRzLnBhZ2V9YFxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaW5wdXRzLnN0YXJ0VGltZSkgeyB0cmFuc2FjdGlvbl91cmwgPSB0cmFuc2FjdGlvbl91cmwgKyBgJnN0YXJ0VGltZT0ke2lucHV0cy5zdGFydFRpbWV9YCB9XHJcbiAgICAgICAgaWYgKGlucHV0cy5lbmRUaW1lKSB7IHRyYW5zYWN0aW9uX3VybCA9IHRyYW5zYWN0aW9uX3VybCArIGAmZW5kVGltZT0ke2lucHV0cy5lbmRUaW1lfWAgfVxyXG4gICAgICAgIGlmIChpbnB1dHMuY291bnRlcnBhcnR5KSB7IHRyYW5zYWN0aW9uX3VybCA9IHRyYW5zYWN0aW9uX3VybCArIGAmY291bnRlcnBhcnR5PSR7aW5wdXRzLmNvdW50ZXJwYXJ0eX1gIH1cclxuICAgICAgICBjb25zdCB0cmFuc2FjdGlvbl9jb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHtcclxuICAgICAgICAgICAgbWV0aG9kOiAnZ2V0JyxcclxuICAgICAgICAgICAgdXJsOiB0cmFuc2FjdGlvbl91cmwsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgICAgICAgICAndG9rZW4nOiB0aGlzLmNvbmZpZy50b2tlblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCB0cmFuc2FjdGlvbl9yZXNwb25zZTogQXhpb3NSZXNwb25zZSA9IGF3YWl0IGF4aW9zKHRyYW5zYWN0aW9uX2NvbmZpZykuY2F0Y2goZXJyID0+IFByb21pc2UucmVqZWN0KGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzIDwgNTAwID8gbmV3IFdlYlNlcnZpY2VFcnJvcihlcnIucmVzcG9uc2UuZGF0YSkgOiBlcnIpKTtcclxuICAgICAgICBsZXQgdHJ1bmNhdGVkID0gZmFsc2U7XHJcbiAgICAgICAgbGV0IG5leHRQYWdlID0gJyc7XHJcbiAgICAgICAgaWYgKHRyYW5zYWN0aW9uX3Jlc3BvbnNlLmRhdGEubmV4dFBhZ2UgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICBsZXQgcGFnZSA9IHRyYW5zYWN0aW9uX3Jlc3BvbnNlLmRhdGEubmV4dFBhZ2VcclxuICAgICAgICAgICAgbGV0IGxhc3RSZXN1bHQgPSB7IG5leHRQYWdlOiAnJyB9O1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzdWJfdXJsID0gYGh0dHBzOi8vaWFwaS5jaGFpbmFseXNpcy5jb20vY2x1c3RlcnMvJHtpbnB1dHMuYWRkcmVzc30vJHtpbnB1dHMuYXNzZXR9L3RyYW5zYWN0aW9ucz9zaXplPTEwMGAgKyBgJnBhZ2U9JHtwYWdlfWBcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJfY29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ2dldCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogc3ViX3VybCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd0b2tlbic6IHRoaXMuY29uZmlnLnRva2VuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1Yl9yZXNwb25zZTogQXhpb3NSZXNwb25zZSA9IGF3YWl0IGF4aW9zKHN1Yl9jb25maWcpLmNhdGNoKGVyciA9PiBQcm9taXNlLnJlamVjdChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA8IDUwMCA/IG5ldyBXZWJTZXJ2aWNlRXJyb3IoZXJyLnJlc3BvbnNlLmRhdGEpIDogZXJyKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFJlc3VsdCA9IHN1Yl9yZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uX3Jlc3BvbnNlLmRhdGEuaXRlbXMucHVzaC5hcHBseSh0cmFuc2FjdGlvbl9yZXNwb25zZS5kYXRhLml0ZW1zLCBzdWJfcmVzcG9uc2UuZGF0YS5pdGVtcylcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggeyBuZXcgV2ViU2VydmljZUVycm9yKCdwYWdpbmF0aW9uIGVycm9yJykgfVxyXG4gICAgICAgICAgICB9IHdoaWxlIChsYXN0UmVzdWx0Lm5leHRQYWdlICE9PSBudWxsICYmIHRyYW5zYWN0aW9uX3Jlc3BvbnNlLmRhdGEuaXRlbXMgPCA1MDApXHJcbiAgICAgICAgICAgIGlmIChsYXN0UmVzdWx0Lm5leHRQYWdlICE9PSBudWxsIHx8IGxhc3RSZXN1bHQubmV4dFBhZ2UgIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICB0cnVuY2F0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgbmV4dFBhZ2UgPSBsYXN0UmVzdWx0Lm5leHRQYWdlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgdHJhbnNhY3Rpb25fcmVzcG9uc2UuZGF0YS5pdGVtcy5sZW5ndGg7IHkrKykge1xyXG4gICAgICAgICAgICBsZXQgaGFzaF91cmwgPSBgaHR0cHM6Ly9pYXBpLmNoYWluYWx5c2lzLmNvbS90cmFuc2FjdGlvbnMvJHt0cmFuc2FjdGlvbl9yZXNwb25zZS5kYXRhLml0ZW1zW3ldLnRyYW5zYWN0aW9uSGFzaH0vJHtpbnB1dHMuYXNzZXR9L2RldGFpbHNgXHJcbiAgICAgICAgICAgIGNvbnN0IGhhc2hfY29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdnZXQnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBoYXNoX3VybCxcclxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgICAgICAgICAgICAgICd0b2tlbic6IHRoaXMuY29uZmlnLnRva2VuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNvbnN0IGhhc2hfcmVzcG9uc2U6IEF4aW9zUmVzcG9uc2UgPSBhd2FpdCBheGlvcyhoYXNoX2NvbmZpZykuY2F0Y2goZXJyID0+IFByb21pc2UucmVqZWN0KGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzIDwgNTAwID8gbmV3IFdlYlNlcnZpY2VFcnJvcihlcnIucmVzcG9uc2UuZGF0YSkgOiBlcnIpKTtcclxuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0cmFuc2FjdGlvbl9yZXNwb25zZS5kYXRhLml0ZW1zW3ldLCB7XHJcbiAgICAgICAgICAgICAgICBkZXRhaWxzOiBoYXNoX3Jlc3BvbnNlLmRhdGEsXHJcbiAgICAgICAgICAgICAgICBpZDogaW5wdXRzLmFzc2V0ICsgJzonICsgdHJhbnNhY3Rpb25fcmVzcG9uc2UuZGF0YS5pdGVtc1t5XS50cmFuc2FjdGlvbkhhc2gsXHJcbiAgICAgICAgICAgICAgICBzaXJlbkRlbm9ybUlucHV0QWRkcmVzczogW10sXHJcbiAgICAgICAgICAgICAgICBzaXJlbkRlbm9ybU91dHB1dEFkZHJlc3M6IFtdLFxyXG4gICAgICAgICAgICAgICAgdHJ1bmNhdGVkOiB0cnVuY2F0ZWRcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGEgPSAwOyBhIDwgaGFzaF9yZXNwb25zZS5kYXRhLnRyYWNlcy5sZW5ndGg7IGErKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGIgPSAwOyBiIDwgaGFzaF9yZXNwb25zZS5kYXRhLnRyYWNlc1thXS5pbnB1dHMubGVuZ3RoOyBiKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25fcmVzcG9uc2UuZGF0YS5pdGVtc1t5XS5zaXJlbkRlbm9ybUlucHV0QWRkcmVzcy5wdXNoKGlucHV0cy5hc3NldCArICc6JyArIGhhc2hfcmVzcG9uc2UuZGF0YS50cmFjZXNbYV0uaW5wdXRzW2JdLnJvb3RBZGRyZXNzKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBjID0gMDsgYyA8IGhhc2hfcmVzcG9uc2UuZGF0YS50cmFjZXNbYV0ub3V0cHV0cy5sZW5ndGg7IGMrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbl9yZXNwb25zZS5kYXRhLml0ZW1zW3ldLnNpcmVuRGVub3JtT3V0cHV0QWRkcmVzcy5wdXNoKGlucHV0cy5hc3NldCArICc6JyArIGhhc2hfcmVzcG9uc2UuZGF0YS50cmFjZXNbYV0ub3V0cHV0c1tjXS5yb290QWRkcmVzcylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggeyB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHRyYW5zYWN0aW9uOiB0cmFuc2FjdGlvbl9yZXNwb25zZS5kYXRhLml0ZW1zLFxyXG4gICAgICAgICAgICBwYWdpbmF0aW9uOiBbe1xyXG4gICAgICAgICAgICAgICAgbmV4dFBhZ2U6IG5leHRQYWdlXHJcbiAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiJdfQ==
