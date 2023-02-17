"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web_service_interface_1 = require("@sirensolutions/web-service-interface");
const axios_1 = require("axios");
class AddressTransactions extends web_service_interface_1.ServiceDefinition {
    constructor() {
        super(...arguments);
        this.name = 'address_transactions';
        this.inputSchema = {
            address: { type: 'text', required: true },
            asset: { type: 'text', required: true },
            direction: { type: 'text', required: true },
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
        let transaction_url = `https://iapi.chainalysis.com/addresses/${inputs.address}/${inputs.asset}/transactions?size=200&direction=${inputs.direction}`;
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
                direction: inputs.direction,
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
exports.default = AddressTransactions;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9BZGRyZXNzVHJhbnNhY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUZBQStJO0FBQy9JLGlDQUFpRTtBQUNqRSxNQUFxQixtQkFBb0IsU0FBUSx5Q0FBaUI7SUFBbEU7O1FBQ2EsU0FBSSxHQUFHLHNCQUFzQixDQUFDO1FBQzlCLGdCQUFXLEdBQWdCO1lBQ2hDLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtZQUN6QyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7WUFDdkMsU0FBUyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFO1NBQzlDLENBQUM7UUFDTyx3QkFBbUIsR0FBd0I7WUFDaEQsV0FBVyxFQUFFO2dCQUNULE9BQU8sRUFBRTtvQkFDTCxnQkFBZ0IsRUFBRSxNQUFNO29CQUN4QixhQUFhLEVBQUUsTUFBTTtvQkFDckIsY0FBYyxFQUFFLE1BQU07b0JBQ3RCLEtBQUssRUFBRSxNQUFNO29CQUNiLE1BQU0sRUFBRTt3QkFDSixNQUFNLEVBQUU7NEJBQ0osUUFBUSxFQUFFLE1BQU07eUJBQ25CO3dCQUNELE9BQU8sRUFBRTs0QkFDTCxRQUFRLEVBQUUsTUFBTTt5QkFDbkI7cUJBQ0o7aUJBQ0o7YUFDSjtTQUNKLENBQUM7SUEwRU4sQ0FBQztJQXpFRyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BSVo7UUFDRyxJQUFJLGVBQWUsR0FBRywwQ0FBMEMsTUFBTSxDQUFDLE9BQU8sSUFBSSxNQUFNLENBQUMsS0FBSyxvQ0FBb0MsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFBO1FBQ3BKLE1BQU0sa0JBQWtCLEdBQXVCO1lBQzNDLE1BQU0sRUFBRSxLQUFLO1lBQ2IsR0FBRyxFQUFFLGVBQWU7WUFDcEIsT0FBTyxFQUFFO2dCQUNMLFFBQVEsRUFBRSxrQkFBa0I7Z0JBQzVC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QWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQTtxQkFDM0k7b0JBQ0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7d0JBQ2xFLG9CQUFvQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQTtxQkFDN0k7aUJBQ0o7YUFDSjtZQUFDLE1BQU0sR0FBRztTQUNkO1FBQ0QsT0FBTztZQUNILFdBQVcsRUFBRSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsS0FBSztTQUMvQyxDQUFBO0lBQ0wsQ0FBQztDQUNKO0FBbEdELHNDQWtHQyIsImZpbGUiOiJzcmMvQWRkcmVzc1RyYW5zYWN0aW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERhdGFJbmRleFJlc3VsdHMsIElucHV0U2NoZW1hLCBPdXRwdXRDb25maWd1cmF0aW9uLCBTZXJ2aWNlRGVmaW5pdGlvbiwgV2ViU2VydmljZUVycm9yIH0gZnJvbSAnQHNpcmVuc29sdXRpb25zL3dlYi1zZXJ2aWNlLWludGVyZmFjZSc7XHJcbmltcG9ydCBheGlvcywgeyBBeGlvc1JlcXVlc3RDb25maWcsIEF4aW9zUmVzcG9uc2UgfSBmcm9tICdheGlvcyc7XHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFkZHJlc3NUcmFuc2FjdGlvbnMgZXh0ZW5kcyBTZXJ2aWNlRGVmaW5pdGlvbiB7XHJcbiAgICByZWFkb25seSBuYW1lID0gJ2FkZHJlc3NfdHJhbnNhY3Rpb25zJztcclxuICAgIHJlYWRvbmx5IGlucHV0U2NoZW1hOiBJbnB1dFNjaGVtYSA9IHtcclxuICAgICAgICBhZGRyZXNzOiB7IHR5cGU6ICd0ZXh0JywgcmVxdWlyZWQ6IHRydWUgfSxcclxuICAgICAgICBhc3NldDogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICAgICAgZGlyZWN0aW9uOiB7IHR5cGU6ICd0ZXh0JywgcmVxdWlyZWQ6IHRydWUgfSxcclxuICAgIH07XHJcbiAgICByZWFkb25seSBvdXRwdXRDb25maWd1cmF0aW9uOiBPdXRwdXRDb25maWd1cmF0aW9uID0ge1xyXG4gICAgICAgIHRyYW5zYWN0aW9uOiB7XHJcbiAgICAgICAgICAgIGRldGFpbHM6IHtcclxuICAgICAgICAgICAgICAgICdibG9ja1RpbWVzdGFtcCc6ICdkYXRlJyxcclxuICAgICAgICAgICAgICAgICdibG9ja0hlaWdodCc6ICdsb25nJyxcclxuICAgICAgICAgICAgICAgICdleGNoYW5nZVJhdGUnOiAnbG9uZycsXHJcbiAgICAgICAgICAgICAgICAnZmVlJzogJ2xvbmcnLFxyXG4gICAgICAgICAgICAgICAgdHJhY2VzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdhbW91bnQnOiAnbG9uZydcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2Ftb3VudCc6ICdsb25nJ1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBhc3luYyBpbnZva2UoaW5wdXRzOiB7XHJcbiAgICAgICAgYWRkcmVzczogc3RyaW5nLFxyXG4gICAgICAgIGFzc2V0OiBzdHJpbmcsXHJcbiAgICAgICAgZGlyZWN0aW9uOiBzdHJpbmdcclxuICAgIH0pOiBQcm9taXNlPERhdGFJbmRleFJlc3VsdHM+IHtcclxuICAgICAgICBsZXQgdHJhbnNhY3Rpb25fdXJsID0gYGh0dHBzOi8vaWFwaS5jaGFpbmFseXNpcy5jb20vYWRkcmVzc2VzLyR7aW5wdXRzLmFkZHJlc3N9LyR7aW5wdXRzLmFzc2V0fS90cmFuc2FjdGlvbnM/c2l6ZT0yMDAmZGlyZWN0aW9uPSR7aW5wdXRzLmRpcmVjdGlvbn1gXHJcbiAgICAgICAgY29uc3QgdHJhbnNhY3Rpb25fY29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogJ2dldCcsXHJcbiAgICAgICAgICAgIHVybDogdHJhbnNhY3Rpb25fdXJsLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgICAgICAgICAgJ3Rva2VuJzogdGhpcy5jb25maWcudG9rZW5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3QgdHJhbnNhY3Rpb25fcmVzcG9uc2U6IEF4aW9zUmVzcG9uc2UgPSBhd2FpdCBheGlvcyh0cmFuc2FjdGlvbl9jb25maWcpLmNhdGNoKGVyciA9PiBQcm9taXNlLnJlamVjdChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA8IDUwMCA/IG5ldyBXZWJTZXJ2aWNlRXJyb3IoZXJyLnJlc3BvbnNlLmRhdGEpIDogZXJyKSk7XHJcbiAgICAgICAgbGV0IHRydW5jYXRlZCA9IGZhbHNlXHJcbiAgICAgICAgaWYgKHRyYW5zYWN0aW9uX3Jlc3BvbnNlLmRhdGEubmV4dFBhZ2UgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICBsZXQgcGFnZSA9IHRyYW5zYWN0aW9uX3Jlc3BvbnNlLmRhdGEubmV4dFBhZ2VcclxuICAgICAgICAgICAgbGV0IGxhc3RSZXN1bHQgPSB7IG5leHRQYWdlOiAnJyB9O1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzdWJfdXJsID0gdHJhbnNhY3Rpb25fdXJsICsgYCZwYWdlPSR7cGFnZX1gXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3ViX2NvbmZpZzogQXhpb3NSZXF1ZXN0Q29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdnZXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IHN1Yl91cmwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAndG9rZW4nOiB0aGlzLmNvbmZpZy50b2tlblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJfcmVzcG9uc2U6IEF4aW9zUmVzcG9uc2UgPSBhd2FpdCBheGlvcyhzdWJfY29uZmlnKS5jYXRjaChlcnIgPT4gUHJvbWlzZS5yZWplY3QoZXJyLnJlc3BvbnNlICYmIGVyci5yZXNwb25zZS5zdGF0dXMgPCA1MDAgPyBuZXcgV2ViU2VydmljZUVycm9yKGVyci5yZXNwb25zZS5kYXRhKSA6IGVycikpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RSZXN1bHQgPSBzdWJfcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbl9yZXNwb25zZS5kYXRhLml0ZW1zLnB1c2guYXBwbHkodHJhbnNhY3Rpb25fcmVzcG9uc2UuZGF0YS5pdGVtcywgc3ViX3Jlc3BvbnNlLmRhdGEuaXRlbXMpXHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIHsgbmV3IFdlYlNlcnZpY2VFcnJvcigncGFnaW5hdGlvbiBlcnJvcicpIH1cclxuICAgICAgICAgICAgfSB3aGlsZSAobGFzdFJlc3VsdC5uZXh0UGFnZSAhPT0gbnVsbCAmJiB0cmFuc2FjdGlvbl9yZXNwb25zZS5kYXRhLml0ZW1zIDwgNTAwMClcclxuICAgICAgICAgICAgaWYgKGxhc3RSZXN1bHQubmV4dFBhZ2UgIT09IG51bGwgfHwgbGFzdFJlc3VsdC5uZXh0UGFnZSAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgIHRydW5jYXRlZCA9IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHRyYW5zYWN0aW9uX3Jlc3BvbnNlLmRhdGEuaXRlbXMubGVuZ3RoOyB5KyspIHtcclxuICAgICAgICAgICAgbGV0IGhhc2hfdXJsID0gYGh0dHBzOi8vaWFwaS5jaGFpbmFseXNpcy5jb20vdHJhbnNhY3Rpb25zLyR7dHJhbnNhY3Rpb25fcmVzcG9uc2UuZGF0YS5pdGVtc1t5XS50cmFuc2FjdGlvbkhhc2h9LyR7aW5wdXRzLmFzc2V0fS9kZXRhaWxzYFxyXG4gICAgICAgICAgICBjb25zdCBoYXNoX2NvbmZpZzogQXhpb3NSZXF1ZXN0Q29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnZ2V0JyxcclxuICAgICAgICAgICAgICAgIHVybDogaGFzaF91cmwsXHJcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICAgICAgICAgICAgICAndG9rZW4nOiB0aGlzLmNvbmZpZy50b2tlblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjb25zdCBoYXNoX3Jlc3BvbnNlOiBBeGlvc1Jlc3BvbnNlID0gYXdhaXQgYXhpb3MoaGFzaF9jb25maWcpLmNhdGNoKGVyciA9PiBQcm9taXNlLnJlamVjdChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA8IDUwMCA/IG5ldyBXZWJTZXJ2aWNlRXJyb3IoZXJyLnJlc3BvbnNlLmRhdGEpIDogZXJyKSk7XHJcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odHJhbnNhY3Rpb25fcmVzcG9uc2UuZGF0YS5pdGVtc1t5XSwge1xyXG4gICAgICAgICAgICAgICAgZGV0YWlsczogaGFzaF9yZXNwb25zZS5kYXRhLFxyXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uOiBpbnB1dHMuZGlyZWN0aW9uLFxyXG4gICAgICAgICAgICAgICAgaWQ6IGlucHV0cy5hc3NldCArICc6JyArIHRyYW5zYWN0aW9uX3Jlc3BvbnNlLmRhdGEuaXRlbXNbeV0udHJhbnNhY3Rpb25IYXNoLFxyXG4gICAgICAgICAgICAgICAgc2lyZW5EZW5vcm1JbnB1dEFkZHJlc3M6IFtdLFxyXG4gICAgICAgICAgICAgICAgc2lyZW5EZW5vcm1PdXRwdXRBZGRyZXNzOiBbXSxcclxuICAgICAgICAgICAgICAgIHRydW5jYXRlZDogdHJ1bmNhdGVkXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBhID0gMDsgYSA8IGhhc2hfcmVzcG9uc2UuZGF0YS50cmFjZXMubGVuZ3RoOyBhKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBiID0gMDsgYiA8IGhhc2hfcmVzcG9uc2UuZGF0YS50cmFjZXNbYV0uaW5wdXRzLmxlbmd0aDsgYisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uX3Jlc3BvbnNlLmRhdGEuaXRlbXNbeV0uc2lyZW5EZW5vcm1JbnB1dEFkZHJlc3MucHVzaChpbnB1dHMuYXNzZXQgKyAnOicgKyBoYXNoX3Jlc3BvbnNlLmRhdGEudHJhY2VzW2FdLmlucHV0c1tiXS5yb290QWRkcmVzcylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgYyA9IDA7IGMgPCBoYXNoX3Jlc3BvbnNlLmRhdGEudHJhY2VzW2FdLm91dHB1dHMubGVuZ3RoOyBjKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25fcmVzcG9uc2UuZGF0YS5pdGVtc1t5XS5zaXJlbkRlbm9ybU91dHB1dEFkZHJlc3MucHVzaChpbnB1dHMuYXNzZXQgKyAnOicgKyBoYXNoX3Jlc3BvbnNlLmRhdGEudHJhY2VzW2FdLm91dHB1dHNbY10ucm9vdEFkZHJlc3MpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIHsgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0cmFuc2FjdGlvbjogdHJhbnNhY3Rpb25fcmVzcG9uc2UuZGF0YS5pdGVtc1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXX0=
