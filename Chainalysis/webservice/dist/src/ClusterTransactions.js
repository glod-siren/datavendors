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
            } while (lastResult.nextPage !== null && transaction_response.data.items.length <= 400);
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
                    nextPage: nextPage,
                    truncated: truncated
                }]
        };
    }
}
exports.default = ClusterTransactions;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9DbHVzdGVyVHJhbnNhY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUZBQStJO0FBQy9JLGlDQUFpRTtBQUNqRSxNQUFxQixtQkFBb0IsU0FBUSx5Q0FBaUI7SUFBbEU7O1FBQ2EsU0FBSSxHQUFHLHNCQUFzQixDQUFDO1FBQzlCLGdCQUFXLEdBQWdCO1lBQ2hDLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtZQUN6QyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7WUFDdkMsWUFBWSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFO1lBQy9DLFNBQVMsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRTtZQUM1QyxPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUU7WUFDMUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFO1NBQzFDLENBQUM7UUFDTyx3QkFBbUIsR0FBd0I7WUFDaEQsV0FBVyxFQUFFO2dCQUNULE9BQU8sRUFBRTtvQkFDTCxnQkFBZ0IsRUFBRSxNQUFNO29CQUN4QixhQUFhLEVBQUUsTUFBTTtvQkFDckIsY0FBYyxFQUFFLE1BQU07b0JBQ3RCLEtBQUssRUFBRSxNQUFNO29CQUNiLE1BQU0sRUFBRTt3QkFDSixNQUFNLEVBQUU7NEJBQ0osUUFBUSxFQUFFLE1BQU07eUJBQ25CO3dCQUNELE9BQU8sRUFBRTs0QkFDTCxRQUFRLEVBQUUsTUFBTTt5QkFDbkI7cUJBQ0o7aUJBQ0o7YUFDSjtZQUNELFVBQVUsRUFBRTtnQkFDUixVQUFVLEVBQUUsU0FBUzthQUN4QjtTQUNKLENBQUM7SUF1Rk4sQ0FBQztJQXRGRyxLQUFL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QUFDLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQTtxQkFDN0k7aUJBQ0o7YUFDSjtZQUFDLE1BQU0sR0FBRztTQUNkO1FBQ0QsT0FBTztZQUNILFdBQVcsRUFBRSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsS0FBSztZQUM1QyxVQUFVLEVBQUUsQ0FBQztvQkFDVCxRQUFRLEVBQUUsUUFBUTtvQkFDbEIsU0FBUyxFQUFFLFNBQVM7aUJBQ3ZCLENBQUM7U0FDTCxDQUFBO0lBQ0wsQ0FBQztDQUNKO0FBckhELHNDQXFIQyIsImZpbGUiOiJzcmMvQ2x1c3RlclRyYW5zYWN0aW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERhdGFJbmRleFJlc3VsdHMsIElucHV0U2NoZW1hLCBPdXRwdXRDb25maWd1cmF0aW9uLCBTZXJ2aWNlRGVmaW5pdGlvbiwgV2ViU2VydmljZUVycm9yIH0gZnJvbSAnQHNpcmVuc29sdXRpb25zL3dlYi1zZXJ2aWNlLWludGVyZmFjZSc7XHJcbmltcG9ydCBheGlvcywgeyBBeGlvc1JlcXVlc3RDb25maWcsIEF4aW9zUmVzcG9uc2UgfSBmcm9tICdheGlvcyc7XHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENsdXN0ZXJUcmFuc2FjdGlvbnMgZXh0ZW5kcyBTZXJ2aWNlRGVmaW5pdGlvbiB7XHJcbiAgICByZWFkb25seSBuYW1lID0gJ2NsdXN0ZXJfdHJhbnNhY3Rpb25zJztcclxuICAgIHJlYWRvbmx5IGlucHV0U2NoZW1hOiBJbnB1dFNjaGVtYSA9IHtcclxuICAgICAgICBhZGRyZXNzOiB7IHR5cGU6ICd0ZXh0JywgcmVxdWlyZWQ6IHRydWUgfSxcclxuICAgICAgICBhc3NldDogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICAgICAgY291bnRlcnBhcnR5OiB7IHR5cGU6ICd0ZXh0JywgcmVxdWlyZWQ6IGZhbHNlIH0sXHJcbiAgICAgICAgc3RhcnRUaW1lOiB7IHR5cGU6ICdkYXRlJywgcmVxdWlyZWQ6IGZhbHNlIH0sXHJcbiAgICAgICAgZW5kVGltZTogeyB0eXBlOiAnZGF0ZScsIHJlcXVpcmVkOiBmYWxzZSB9LFxyXG4gICAgICAgIHBhZ2U6IHsgdHlwZTogJ2RhdGUnLCByZXF1aXJlZDogZmFsc2UgfSxcclxuICAgIH07XHJcbiAgICByZWFkb25seSBvdXRwdXRDb25maWd1cmF0aW9uOiBPdXRwdXRDb25maWd1cmF0aW9uID0ge1xyXG4gICAgICAgIHRyYW5zYWN0aW9uOiB7XHJcbiAgICAgICAgICAgIGRldGFpbHM6IHtcclxuICAgICAgICAgICAgICAgICdibG9ja1RpbWVzdGFtcCc6ICdkYXRlJyxcclxuICAgICAgICAgICAgICAgICdibG9ja0hlaWdodCc6ICdsb25nJyxcclxuICAgICAgICAgICAgICAgICdleGNoYW5nZVJhdGUnOiAnbG9uZycsXHJcbiAgICAgICAgICAgICAgICAnZmVlJzogJ2xvbmcnLFxyXG4gICAgICAgICAgICAgICAgdHJhY2VzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdhbW91bnQnOiAnbG9uZydcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2Ftb3VudCc6ICdsb25nJ1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcGFnaW5hdGlvbjoge1xyXG4gICAgICAgICAgICAnbmV4dFBhZ2UnOiAna2V5d29yZCdcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgYXN5bmMgaW52b2tlKGlucHV0czoge1xyXG4gICAgICAgIGFkZHJlc3M6IHN0cmluZyxcclxuICAgICAgICBhc3NldDogc3RyaW5nLFxyXG4gICAgICAgIGNvdW50ZXJwYXJ0eTogc3RyaW5nLFxyXG4gICAgICAgIHN0YXJ0VGltZTogc3RyaW5nLFxyXG4gICAgICAgIGVuZFRpbWU6IHN0cmluZyxcclxuICAgICAgICBwYWdlOiBzdHJpbmcsXHJcbiAgICB9KTogUHJvbWlzZTxEYXRhSW5kZXhSZXN1bHRzPiB7XHJcbiAgICAgICAgbGV0IHRyYW5zYWN0aW9uX3VybCA9IGBodHRwczovL2lhcGkuY2hhaW5hbHlzaXMuY29tL2NsdXN0ZXJzLyR7aW5wdXRzLmFkZHJlc3N9LyR7aW5wdXRzLmFzc2V0fS90cmFuc2FjdGlvbnM/c2l6ZT0xMDBgXHJcbiAgICAgICAgaWYgKGlucHV0cy5wYWdlKSB7XHJcbiAgICAgICAgICAgIHRyYW5zYWN0aW9uX3VybCArIHRyYW5zYWN0aW9uX3VybCArIGAmcGFnZT0ke2lucHV0cy5wYWdlfWBcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlucHV0cy5zdGFydFRpbWUpIHsgdHJhbnNhY3Rpb25fdXJsID0gdHJhbnNhY3Rpb25fdXJsICsgYCZzdGFydFRpbWU9JHtpbnB1dHMuc3RhcnRUaW1lfWAgfVxyXG4gICAgICAgIGlmIChpbnB1dHMuZW5kVGltZSkgeyB0cmFuc2FjdGlvbl91cmwgPSB0cmFuc2FjdGlvbl91cmwgKyBgJmVuZFRpbWU9JHtpbnB1dHMuZW5kVGltZX1gIH1cclxuICAgICAgICBpZiAoaW5wdXRzLmNvdW50ZXJwYXJ0eSkgeyB0cmFuc2FjdGlvbl91cmwgPSB0cmFuc2FjdGlvbl91cmwgKyBgJmNvdW50ZXJwYXJ0eT0ke2lucHV0cy5jb3VudGVycGFydHl9YCB9XHJcbiAgICAgICAgY29uc3QgdHJhbnNhY3Rpb25fY29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogJ2dldCcsXHJcbiAgICAgICAgICAgIHVybDogdHJhbnNhY3Rpb25fdXJsLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgICAgICAgICAgJ3Rva2VuJzogdGhpcy5jb25maWcudG9rZW5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3QgdHJhbnNhY3Rpb25fcmVzcG9uc2U6IEF4aW9zUmVzcG9uc2UgPSBhd2FpdCBheGlvcyh0cmFuc2FjdGlvbl9jb25maWcpLmNhdGNoKGVyciA9PiBQcm9taXNlLnJlamVjdChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA8IDUwMCA/IG5ldyBXZWJTZXJ2aWNlRXJyb3IoZXJyLnJlc3BvbnNlLmRhdGEpIDogZXJyKSk7XHJcbiAgICAgICAgbGV0IHRydW5jYXRlZCA9IGZhbHNlO1xyXG4gICAgICAgIGxldCBuZXh0UGFnZSA9ICcnO1xyXG4gICAgICAgIGlmICh0cmFuc2FjdGlvbl9yZXNwb25zZS5kYXRhLm5leHRQYWdlICE9IG51bGwpIHtcclxuICAgICAgICAgICAgbGV0IHBhZ2UgPSB0cmFuc2FjdGlvbl9yZXNwb25zZS5kYXRhLm5leHRQYWdlXHJcbiAgICAgICAgICAgIGxldCBsYXN0UmVzdWx0ID0geyBuZXh0UGFnZTogJycgfTtcclxuICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc3ViX3VybCA9IGBodHRwczovL2lhcGkuY2hhaW5hbHlzaXMuY29tL2NsdXN0ZXJzLyR7aW5wdXRzLmFkZHJlc3N9LyR7aW5wdXRzLmFzc2V0fS90cmFuc2FjdGlvbnM/c2l6ZT0xMDBgICsgYCZwYWdlPSR7cGFnZX1gXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3ViX2NvbmZpZzogQXhpb3NSZXF1ZXN0Q29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdnZXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IHN1Yl91cmwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAndG9rZW4nOiB0aGlzLmNvbmZpZy50b2tlblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJfcmVzcG9uc2U6IEF4aW9zUmVzcG9uc2UgPSBhd2FpdCBheGlvcyhzdWJfY29uZmlnKS5jYXRjaChlcnIgPT4gUHJvbWlzZS5yZWplY3QoZXJyLnJlc3BvbnNlICYmIGVyci5yZXNwb25zZS5zdGF0dXMgPCA1MDAgPyBuZXcgV2ViU2VydmljZUVycm9yKGVyci5yZXNwb25zZS5kYXRhKSA6IGVycikpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RSZXN1bHQgPSBzdWJfcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbl9yZXNwb25zZS5kYXRhLml0ZW1zLnB1c2guYXBwbHkodHJhbnNhY3Rpb25fcmVzcG9uc2UuZGF0YS5pdGVtcywgc3ViX3Jlc3BvbnNlLmRhdGEuaXRlbXMpXHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIHsgbmV3IFdlYlNlcnZpY2VFcnJvcigncGFnaW5hdGlvbiBlcnJvcicpIH1cclxuICAgICAgICAgICAgfSB3aGlsZSAobGFzdFJlc3VsdC5uZXh0UGFnZSAhPT0gbnVsbCAmJiB0cmFuc2FjdGlvbl9yZXNwb25zZS5kYXRhLml0ZW1zLmxlbmd0aCA8PTQwMClcclxuICAgICAgICAgICAgaWYgKGxhc3RSZXN1bHQubmV4dFBhZ2UgIT09IG51bGwgfHwgbGFzdFJlc3VsdC5uZXh0UGFnZSAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgIHRydW5jYXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBuZXh0UGFnZSA9IGxhc3RSZXN1bHQubmV4dFBhZ2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0cmFuc2FjdGlvbl9yZXNwb25zZS5kYXRhLml0ZW1zLmxlbmd0aDsgeSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBoYXNoX3VybCA9IGBodHRwczovL2lhcGkuY2hhaW5hbHlzaXMuY29tL3RyYW5zYWN0aW9ucy8ke3RyYW5zYWN0aW9uX3Jlc3BvbnNlLmRhdGEuaXRlbXNbeV0udHJhbnNhY3Rpb25IYXNofS8ke2lucHV0cy5hc3NldH0vZGV0YWlsc2BcclxuICAgICAgICAgICAgY29uc3QgaGFzaF9jb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ2dldCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGhhc2hfdXJsLFxyXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgICAgICAgICAgICAgJ3Rva2VuJzogdGhpcy5jb25maWcudG9rZW5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY29uc3QgaGFzaF9yZXNwb25zZTogQXhpb3NSZXNwb25zZSA9IGF3YWl0IGF4aW9zKGhhc2hfY29uZmlnKS5jYXRjaChlcnIgPT4gUHJvbWlzZS5yZWplY3QoZXJyLnJlc3BvbnNlICYmIGVyci5yZXNwb25zZS5zdGF0dXMgPCA1MDAgPyBuZXcgV2ViU2VydmljZUVycm9yKGVyci5yZXNwb25zZS5kYXRhKSA6IGVycikpO1xyXG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKHRyYW5zYWN0aW9uX3Jlc3BvbnNlLmRhdGEuaXRlbXNbeV0sIHtcclxuICAgICAgICAgICAgICAgIGRldGFpbHM6IGhhc2hfcmVzcG9uc2UuZGF0YSxcclxuICAgICAgICAgICAgICAgIGlkOiBpbnB1dHMuYXNzZXQgKyAnOicgKyB0cmFuc2FjdGlvbl9yZXNwb25zZS5kYXRhLml0ZW1zW3ldLnRyYW5zYWN0aW9uSGFzaCxcclxuICAgICAgICAgICAgICAgIHNpcmVuRGVub3JtSW5wdXRBZGRyZXNzOiBbXSxcclxuICAgICAgICAgICAgICAgIHNpcmVuRGVub3JtT3V0cHV0QWRkcmVzczogW10sXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBhID0gMDsgYSA8IGhhc2hfcmVzcG9uc2UuZGF0YS50cmFjZXMubGVuZ3RoOyBhKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBiID0gMDsgYiA8IGhhc2hfcmVzcG9uc2UuZGF0YS50cmFjZXNbYV0uaW5wdXRzLmxlbmd0aDsgYisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uX3Jlc3BvbnNlLmRhdGEuaXRlbXNbeV0uc2lyZW5EZW5vcm1JbnB1dEFkZHJlc3MucHVzaChpbnB1dHMuYXNzZXQgKyAnOicgKyBoYXNoX3Jlc3BvbnNlLmRhdGEudHJhY2VzW2FdLmlucHV0c1tiXS5yb290QWRkcmVzcylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgYyA9IDA7IGMgPCBoYXNoX3Jlc3BvbnNlLmRhdGEudHJhY2VzW2FdLm91dHB1dHMubGVuZ3RoOyBjKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25fcmVzcG9uc2UuZGF0YS5pdGVtc1t5XS5zaXJlbkRlbm9ybU91dHB1dEFkZHJlc3MucHVzaChpbnB1dHMuYXNzZXQgKyAnOicgKyBoYXNoX3Jlc3BvbnNlLmRhdGEudHJhY2VzW2FdLm91dHB1dHNbY10ucm9vdEFkZHJlc3MpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIHsgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0cmFuc2FjdGlvbjogdHJhbnNhY3Rpb25fcmVzcG9uc2UuZGF0YS5pdGVtcyxcclxuICAgICAgICAgICAgcGFnaW5hdGlvbjogW3tcclxuICAgICAgICAgICAgICAgIG5leHRQYWdlOiBuZXh0UGFnZSxcclxuICAgICAgICAgICAgICAgIHRydW5jYXRlZDogdHJ1bmNhdGVkXHJcbiAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiJdfQ==
