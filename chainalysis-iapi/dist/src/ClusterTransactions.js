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
            }
        };
    }
    async invoke(inputs) {
        let transaction_url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/transactions?size=200`;
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
        if (transaction_response.data.nextPage != null) {
            let page = transaction_response.data.nextPage;
            let lastResult = { nextPage: '' };
            do {
                try {
                    let sub_url = transaction_url + `&page=${page}`;
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
            } while (lastResult.nextPage !== null && transaction_response.data.items < 5000);
            if (lastResult.nextPage !== null || lastResult.nextPage !== '') {
                truncated = true;
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
            transaction: transaction_response.data.items
        };
    }
}
exports.default = ClusterTransactions;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9DbHVzdGVyVHJhbnNhY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUZBQStJO0FBQy9JLGlDQUFpRTtBQUNqRSxNQUFxQixtQkFBb0IsU0FBUSx5Q0FBaUI7SUFBbEU7O1FBQ2EsU0FBSSxHQUFHLHNCQUFzQixDQUFDO1FBQzlCLGdCQUFXLEdBQWdCO1lBQ2hDLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtZQUN6QyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7WUFDdkMsWUFBWSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFO1lBQy9DLFNBQVMsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRTtZQUM1QyxPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUU7U0FDN0MsQ0FBQztRQUNPLHdCQUFtQixHQUF3QjtZQUNoRCxXQUFXLEVBQUU7Z0JBQ1QsT0FBTyxFQUFFO29CQUNMLGdCQUFnQixFQUFFLE1BQU07b0JBQ3hCLGFBQWEsRUFBRSxNQUFNO29CQUNyQixjQUFjLEVBQUUsTUFBTTtvQkFDdEIsS0FBSyxFQUFFLE1BQU07b0JBQ2IsTUFBTSxFQUFFO3dCQUNKLE1BQU0sRUFBRTs0QkFDSixRQUFRLEVBQUUsTUFBTTt5QkFDbkI7d0JBQ0QsT0FBTyxFQUFFOzRCQUNMLFFBQVEsRUFBRSxNQUFNO3lCQUNuQjtxQkFDSjtpQkFDSjthQUNKO1NBQ0osQ0FBQztJQThFTixDQUFDO0lBN0VHLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFNWjtRQUNHLElBQUksZUFBZSxHQUFHLHlDQUF5QyxNQUFNLENBQUMsT0FBTyxJQUFJLE1BQU0sQ0FBQyxLQUFLLHdCQUF3QixDQUFBO1FBQ3JILElB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clRyYW5zYWN0aW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERhdGFJbmRleFJlc3VsdHMsIElucHV0U2NoZW1hLCBPdXRwdXRDb25maWd1cmF0aW9uLCBTZXJ2aWNlRGVmaW5pdGlvbiwgV2ViU2VydmljZUVycm9yIH0gZnJvbSAnQHNpcmVuc29sdXRpb25zL3dlYi1zZXJ2aWNlLWludGVyZmFjZSc7XHJcbmltcG9ydCBheGlvcywgeyBBeGlvc1JlcXVlc3RDb25maWcsIEF4aW9zUmVzcG9uc2UgfSBmcm9tICdheGlvcyc7XHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENsdXN0ZXJUcmFuc2FjdGlvbnMgZXh0ZW5kcyBTZXJ2aWNlRGVmaW5pdGlvbiB7XHJcbiAgICByZWFkb25seSBuYW1lID0gJ2NsdXN0ZXJfdHJhbnNhY3Rpb25zJztcclxuICAgIHJlYWRvbmx5IGlucHV0U2NoZW1hOiBJbnB1dFNjaGVtYSA9IHtcclxuICAgICAgICBhZGRyZXNzOiB7IHR5cGU6ICd0ZXh0JywgcmVxdWlyZWQ6IHRydWUgfSxcclxuICAgICAgICBhc3NldDogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICAgICAgY291bnRlcnBhcnR5OiB7IHR5cGU6ICd0ZXh0JywgcmVxdWlyZWQ6IGZhbHNlIH0sXHJcbiAgICAgICAgc3RhcnRUaW1lOiB7IHR5cGU6ICdkYXRlJywgcmVxdWlyZWQ6IGZhbHNlIH0sXHJcbiAgICAgICAgZW5kVGltZTogeyB0eXBlOiAnZGF0ZScsIHJlcXVpcmVkOiBmYWxzZSB9LFxyXG4gICAgfTtcclxuICAgIHJlYWRvbmx5IG91dHB1dENvbmZpZ3VyYXRpb246IE91dHB1dENvbmZpZ3VyYXRpb24gPSB7XHJcbiAgICAgICAgdHJhbnNhY3Rpb246IHtcclxuICAgICAgICAgICAgZGV0YWlsczoge1xyXG4gICAgICAgICAgICAgICAgJ2Jsb2NrVGltZXN0YW1wJzogJ2RhdGUnLFxyXG4gICAgICAgICAgICAgICAgJ2Jsb2NrSGVpZ2h0JzogJ2xvbmcnLFxyXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlUmF0ZSc6ICdsb25nJyxcclxuICAgICAgICAgICAgICAgICdmZWUnOiAnbG9uZycsXHJcbiAgICAgICAgICAgICAgICB0cmFjZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2Ftb3VudCc6ICdsb25nJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0czoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnYW1vdW50JzogJ2xvbmcnXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIGFzeW5jIGludm9rZShpbnB1dHM6IHtcclxuICAgICAgICBhZGRyZXNzOiBzdHJpbmcsXHJcbiAgICAgICAgYXNzZXQ6IHN0cmluZyxcclxuICAgICAgICBjb3VudGVycGFydHk6IHN0cmluZyxcclxuICAgICAgICBzdGFydFRpbWU6IHN0cmluZyxcclxuICAgICAgICBlbmRUaW1lOiBzdHJpbmcsXHJcbiAgICB9KTogUHJvbWlzZTxEYXRhSW5kZXhSZXN1bHRzPiB7XHJcbiAgICAgICAgbGV0IHRyYW5zYWN0aW9uX3VybCA9IGBodHRwczovL2lhcGkuY2hhaW5hbHlzaXMuY29tL2NsdXN0ZXJzLyR7aW5wdXRzLmFkZHJlc3N9LyR7aW5wdXRzLmFzc2V0fS90cmFuc2FjdGlvbnM/c2l6ZT0yMDBgXHJcbiAgICAgICAgaWYgKGlucHV0cy5zdGFydFRpbWUpIHt0cmFuc2FjdGlvbl91cmwgPSB0cmFuc2FjdGlvbl91cmwgKyBgJnN0YXJ0VGltZT0ke2lucHV0cy5zdGFydFRpbWV9YH1cclxuICAgICAgICBpZiAoaW5wdXRzLmVuZFRpbWUpIHt0cmFuc2FjdGlvbl91cmwgPSB0cmFuc2FjdGlvbl91cmwgKyBgJmVuZFRpbWU9JHtpbnB1dHMuZW5kVGltZX1gfVxyXG4gICAgICAgIGlmIChpbnB1dHMuY291bnRlcnBhcnR5KSB7dHJhbnNhY3Rpb25fdXJsID0gdHJhbnNhY3Rpb25fdXJsICsgYCZjb3VudGVycGFydHk9JHtpbnB1dHMuY291bnRlcnBhcnR5fWB9XHJcbiAgICAgICAgY29uc3QgdHJhbnNhY3Rpb25fY29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogJ2dldCcsXHJcbiAgICAgICAgICAgIHVybDogdHJhbnNhY3Rpb25fdXJsLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgICAgICAgICAgJ3Rva2VuJzogdGhpcy5jb25maWcudG9rZW5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3QgdHJhbnNhY3Rpb25fcmVzcG9uc2U6IEF4aW9zUmVzcG9uc2UgPSBhd2FpdCBheGlvcyh0cmFuc2FjdGlvbl9jb25maWcpLmNhdGNoKGVyciA9PiBQcm9taXNlLnJlamVjdChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA8IDUwMCA/IG5ldyBXZWJTZXJ2aWNlRXJyb3IoZXJyLnJlc3BvbnNlLmRhdGEpIDogZXJyKSk7XHJcbiAgICAgICAgbGV0IHRydW5jYXRlZCA9IGZhbHNlXHJcbiAgICAgICAgaWYgKHRyYW5zYWN0aW9uX3Jlc3BvbnNlLmRhdGEubmV4dFBhZ2UgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICBsZXQgcGFnZSA9IHRyYW5zYWN0aW9uX3Jlc3BvbnNlLmRhdGEubmV4dFBhZ2VcclxuICAgICAgICAgICAgbGV0IGxhc3RSZXN1bHQgPSB7IG5leHRQYWdlOiAnJyB9O1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzdWJfdXJsID0gdHJhbnNhY3Rpb25fdXJsICsgYCZwYWdlPSR7cGFnZX1gXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3ViX2NvbmZpZzogQXhpb3NSZXF1ZXN0Q29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdnZXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IHN1Yl91cmwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAndG9rZW4nOiB0aGlzLmNvbmZpZy50b2tlblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJfcmVzcG9uc2U6IEF4aW9zUmVzcG9uc2UgPSBhd2FpdCBheGlvcyhzdWJfY29uZmlnKS5jYXRjaChlcnIgPT4gUHJvbWlzZS5yZWplY3QoZXJyLnJlc3BvbnNlICYmIGVyci5yZXNwb25zZS5zdGF0dXMgPCA1MDAgPyBuZXcgV2ViU2VydmljZUVycm9yKGVyci5yZXNwb25zZS5kYXRhKSA6IGVycikpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RSZXN1bHQgPSBzdWJfcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbl9yZXNwb25zZS5kYXRhLml0ZW1zLnB1c2guYXBwbHkodHJhbnNhY3Rpb25fcmVzcG9uc2UuZGF0YS5pdGVtcywgc3ViX3Jlc3BvbnNlLmRhdGEuaXRlbXMpXHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIHsgbmV3IFdlYlNlcnZpY2VFcnJvcigncGFnaW5hdGlvbiBlcnJvcicpIH1cclxuICAgICAgICAgICAgfSB3aGlsZSAobGFzdFJlc3VsdC5uZXh0UGFnZSAhPT0gbnVsbCAmJiB0cmFuc2FjdGlvbl9yZXNwb25zZS5kYXRhLml0ZW1zIDwgNTAwMClcclxuICAgICAgICAgICAgaWYgKGxhc3RSZXN1bHQubmV4dFBhZ2UgIT09IG51bGwgfHwgbGFzdFJlc3VsdC5uZXh0UGFnZSAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgIHRydW5jYXRlZCA9IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHRyYW5zYWN0aW9uX3Jlc3BvbnNlLmRhdGEuaXRlbXMubGVuZ3RoOyB5KyspIHtcclxuICAgICAgICAgICAgbGV0IGhhc2hfdXJsID0gYGh0dHBzOi8vaWFwaS5jaGFpbmFseXNpcy5jb20vdHJhbnNhY3Rpb25zLyR7dHJhbnNhY3Rpb25fcmVzcG9uc2UuZGF0YS5pdGVtc1t5XS50cmFuc2FjdGlvbkhhc2h9LyR7aW5wdXRzLmFzc2V0fS9kZXRhaWxzYFxyXG4gICAgICAgICAgICBjb25zdCBoYXNoX2NvbmZpZzogQXhpb3NSZXF1ZXN0Q29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnZ2V0JyxcclxuICAgICAgICAgICAgICAgIHVybDogaGFzaF91cmwsXHJcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICAgICAgICAgICAgICAndG9rZW4nOiB0aGlzLmNvbmZpZy50b2tlblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjb25zdCBoYXNoX3Jlc3BvbnNlOiBBeGlvc1Jlc3BvbnNlID0gYXdhaXQgYXhpb3MoaGFzaF9jb25maWcpLmNhdGNoKGVyciA9PiBQcm9taXNlLnJlamVjdChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA8IDUwMCA/IG5ldyBXZWJTZXJ2aWNlRXJyb3IoZXJyLnJlc3BvbnNlLmRhdGEpIDogZXJyKSk7XHJcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odHJhbnNhY3Rpb25fcmVzcG9uc2UuZGF0YS5pdGVtc1t5XSwge1xyXG4gICAgICAgICAgICAgICAgZGV0YWlsczogaGFzaF9yZXNwb25zZS5kYXRhLFxyXG4gICAgICAgICAgICAgICAgaWQ6IGlucHV0cy5hc3NldCArICc6JyArIHRyYW5zYWN0aW9uX3Jlc3BvbnNlLmRhdGEuaXRlbXNbeV0udHJhbnNhY3Rpb25IYXNoLFxyXG4gICAgICAgICAgICAgICAgc2lyZW5EZW5vcm1JbnB1dEFkZHJlc3M6IFtdLFxyXG4gICAgICAgICAgICAgICAgc2lyZW5EZW5vcm1PdXRwdXRBZGRyZXNzOiBbXSxcclxuICAgICAgICAgICAgICAgIHRydW5jYXRlZDogdHJ1bmNhdGVkXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBhID0gMDsgYSA8IGhhc2hfcmVzcG9uc2UuZGF0YS50cmFjZXMubGVuZ3RoOyBhKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBiID0gMDsgYiA8IGhhc2hfcmVzcG9uc2UuZGF0YS50cmFjZXNbYV0uaW5wdXRzLmxlbmd0aDsgYisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uX3Jlc3BvbnNlLmRhdGEuaXRlbXNbeV0uc2lyZW5EZW5vcm1JbnB1dEFkZHJlc3MucHVzaChpbnB1dHMuYXNzZXQgKyAnOicgKyBoYXNoX3Jlc3BvbnNlLmRhdGEudHJhY2VzW2FdLmlucHV0c1tiXS5yb290QWRkcmVzcylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgYyA9IDA7IGMgPCBoYXNoX3Jlc3BvbnNlLmRhdGEudHJhY2VzW2FdLm91dHB1dHMubGVuZ3RoOyBjKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25fcmVzcG9uc2UuZGF0YS5pdGVtc1t5XS5zaXJlbkRlbm9ybU91dHB1dEFkZHJlc3MucHVzaChpbnB1dHMuYXNzZXQgKyAnOicgKyBoYXNoX3Jlc3BvbnNlLmRhdGEudHJhY2VzW2FdLm91dHB1dHNbY10ucm9vdEFkZHJlc3MpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIHsgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0cmFuc2FjdGlvbjogdHJhbnNhY3Rpb25fcmVzcG9uc2UuZGF0YS5pdGVtc1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXX0=
