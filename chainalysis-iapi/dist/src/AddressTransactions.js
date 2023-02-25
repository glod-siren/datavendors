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
            page: { type: 'text', required: false },
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
        let transaction_url = `https://iapi.chainalysis.com/addresses/${inputs.address}/${inputs.asset}/transactions?size=100&direction=${inputs.direction}`;
        if (inputs.page) {
            transaction_url + transaction_url + `&page=${inputs.page}`;
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
                    let sub_url = `https://iapi.chainalysis.com/addresses/${inputs.address}/${inputs.asset}/transactions?size=100&direction=${inputs.direction}` + `&page=${page}`;
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
            transaction: transaction_response.data.items,
            pagination: [{
                    nextPage: nextPage
                }]
        };
    }
}
exports.default = AddressTransactions;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9BZGRyZXNzVHJhbnNhY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUZBQStJO0FBQy9JLGlDQUFpRTtBQUNqRSxNQUFxQixtQkFBb0IsU0FBUSx5Q0FBaUI7SUFBbEU7O1FBQ2EsU0FBSSxHQUFHLHNCQUFzQixDQUFDO1FBQzlCLGdCQUFXLEdBQWdCO1lBQ2hDLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtZQUN6QyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7WUFDdkMsU0FBUyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFO1lBQzNDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRTtTQUMxQyxDQUFDO1FBQ08sd0JBQW1CLEdBQXdCO1lBQ2hELFdBQVcsRUFBRTtnQkFDVCxPQUFPLEVBQUU7b0JBQ0wsZ0JBQWdCLEVBQUUsTUFBTTtvQkFDeEIsYUFBYSxFQUFFLE1BQU07b0JBQ3JCLGNBQWMsRUFBRSxNQUFNO29CQUN0QixLQUFLLEVBQUUsTUFBTTtvQkFDYixNQUFNLEVBQUU7d0JBQ0osTUFBTSxFQUFFOzRCQUNKLFFBQVEsRUFBRSxNQUFNO3lCQUNuQjt3QkFDRCxPQUFPLEVBQUU7NEJBQ0wsUUFBUSxFQUFFLE1BQU07eUJBQ25CO3FCQUNKO2lCQUNKO2FBQ0o7WUFDRCxVQUFVLEVBQUU7Z0JBQ1IsVUFBVSxFQUFFLFNBQVM7YUFDeEI7U0FDSixDQUFDO0lBbUZOLENBQUM7SUFsRkcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUtaO1FBQ0csSUFBSSxlQUFlLEdBQUcsMENBQTBDLE1BQU0sQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLEtBQUssb0NBQW9DLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQTtRQUNwSixJ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SjtBQS9HRCxzQ0ErR0MiLCJmaWxlIjoic3JjL0FkZHJlc3NUcmFuc2FjdGlvbnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEYXRhSW5kZXhSZXN1bHRzLCBJbnB1dFNjaGVtYSwgT3V0cHV0Q29uZmlndXJhdGlvbiwgU2VydmljZURlZmluaXRpb24sIFdlYlNlcnZpY2VFcnJvciB9IGZyb20gJ0BzaXJlbnNvbHV0aW9ucy93ZWItc2VydmljZS1pbnRlcmZhY2UnO1xyXG5pbXBvcnQgYXhpb3MsIHsgQXhpb3NSZXF1ZXN0Q29uZmlnLCBBeGlvc1Jlc3BvbnNlIH0gZnJvbSAnYXhpb3MnO1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBZGRyZXNzVHJhbnNhY3Rpb25zIGV4dGVuZHMgU2VydmljZURlZmluaXRpb24ge1xyXG4gICAgcmVhZG9ubHkgbmFtZSA9ICdhZGRyZXNzX3RyYW5zYWN0aW9ucyc7XHJcbiAgICByZWFkb25seSBpbnB1dFNjaGVtYTogSW5wdXRTY2hlbWEgPSB7XHJcbiAgICAgICAgYWRkcmVzczogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICAgICAgYXNzZXQ6IHsgdHlwZTogJ3RleHQnLCByZXF1aXJlZDogdHJ1ZSB9LFxyXG4gICAgICAgIGRpcmVjdGlvbjogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICAgICAgcGFnZTogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiBmYWxzZSB9LFxyXG4gICAgfTtcclxuICAgIHJlYWRvbmx5IG91dHB1dENvbmZpZ3VyYXRpb246IE91dHB1dENvbmZpZ3VyYXRpb24gPSB7XHJcbiAgICAgICAgdHJhbnNhY3Rpb246IHtcclxuICAgICAgICAgICAgZGV0YWlsczoge1xyXG4gICAgICAgICAgICAgICAgJ2Jsb2NrVGltZXN0YW1wJzogJ2RhdGUnLFxyXG4gICAgICAgICAgICAgICAgJ2Jsb2NrSGVpZ2h0JzogJ2xvbmcnLFxyXG4gICAgICAgICAgICAgICAgJ2V4Y2hhbmdlUmF0ZSc6ICdsb25nJyxcclxuICAgICAgICAgICAgICAgICdmZWUnOiAnbG9uZycsXHJcbiAgICAgICAgICAgICAgICB0cmFjZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2Ftb3VudCc6ICdsb25nJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0czoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnYW1vdW50JzogJ2xvbmcnXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBwYWdpbmF0aW9uOiB7XHJcbiAgICAgICAgICAgICduZXh0UGFnZSc6ICdrZXl3b3JkJ1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBhc3luYyBpbnZva2UoaW5wdXRzOiB7XHJcbiAgICAgICAgYWRkcmVzczogc3RyaW5nLFxyXG4gICAgICAgIGFzc2V0OiBzdHJpbmcsXHJcbiAgICAgICAgZGlyZWN0aW9uOiBzdHJpbmcsXHJcbiAgICAgICAgcGFnZTogc3RyaW5nXHJcbiAgICB9KTogUHJvbWlzZTxEYXRhSW5kZXhSZXN1bHRzPiB7XHJcbiAgICAgICAgbGV0IHRyYW5zYWN0aW9uX3VybCA9IGBodHRwczovL2lhcGkuY2hhaW5hbHlzaXMuY29tL2FkZHJlc3Nlcy8ke2lucHV0cy5hZGRyZXNzfS8ke2lucHV0cy5hc3NldH0vdHJhbnNhY3Rpb25zP3NpemU9MTAwJmRpcmVjdGlvbj0ke2lucHV0cy5kaXJlY3Rpb259YFxyXG4gICAgICAgIGlmIChpbnB1dHMucGFnZSkge1xyXG4gICAgICAgICAgICB0cmFuc2FjdGlvbl91cmwgKyB0cmFuc2FjdGlvbl91cmwgKyBgJnBhZ2U9JHtpbnB1dHMucGFnZX1gXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHRyYW5zYWN0aW9uX2NvbmZpZzogQXhpb3NSZXF1ZXN0Q29uZmlnID0ge1xyXG4gICAgICAgICAgICBtZXRob2Q6ICdnZXQnLFxyXG4gICAgICAgICAgICB1cmw6IHRyYW5zYWN0aW9uX3VybCxcclxuICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICAgICAgICAgICd0b2tlbic6IHRoaXMuY29uZmlnLnRva2VuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IHRyYW5zYWN0aW9uX3Jlc3BvbnNlOiBBeGlvc1Jlc3BvbnNlID0gYXdhaXQgYXhpb3ModHJhbnNhY3Rpb25fY29uZmlnKS5jYXRjaChlcnIgPT4gUHJvbWlzZS5yZWplY3QoZXJyLnJlc3BvbnNlICYmIGVyci5yZXNwb25zZS5zdGF0dXMgPCA1MDAgPyBuZXcgV2ViU2VydmljZUVycm9yKGVyci5yZXNwb25zZS5kYXRhKSA6IGVycikpO1xyXG4gICAgICAgIGxldCB0cnVuY2F0ZWQgPSBmYWxzZVxyXG4gICAgICAgIGxldCBuZXh0UGFnZSA9ICcnO1xyXG4gICAgICAgIGlmICh0cmFuc2FjdGlvbl9yZXNwb25zZS5kYXRhLm5leHRQYWdlICE9IG51bGwpIHtcclxuICAgICAgICAgICAgbGV0IHBhZ2UgPSB0cmFuc2FjdGlvbl9yZXNwb25zZS5kYXRhLm5leHRQYWdlXHJcbiAgICAgICAgICAgIGxldCBsYXN0UmVzdWx0ID0geyBuZXh0UGFnZTogJycgfTtcclxuICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc3ViX3VybCA9IGBodHRwczovL2lhcGkuY2hhaW5hbHlzaXMuY29tL2FkZHJlc3Nlcy8ke2lucHV0cy5hZGRyZXNzfS8ke2lucHV0cy5hc3NldH0vdHJhbnNhY3Rpb25zP3NpemU9MTAwJmRpcmVjdGlvbj0ke2lucHV0cy5kaXJlY3Rpb259YCArIGAmcGFnZT0ke3BhZ2V9YFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1Yl9jb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnZ2V0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBzdWJfdXJsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3Rva2VuJzogdGhpcy5jb25maWcudG9rZW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3ViX3Jlc3BvbnNlOiBBeGlvc1Jlc3BvbnNlID0gYXdhaXQgYXhpb3Moc3ViX2NvbmZpZykuY2F0Y2goZXJyID0+IFByb21pc2UucmVqZWN0KGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzIDwgNTAwID8gbmV3IFdlYlNlcnZpY2VFcnJvcihlcnIucmVzcG9uc2UuZGF0YSkgOiBlcnIpKTtcclxuICAgICAgICAgICAgICAgICAgICBsYXN0UmVzdWx0ID0gc3ViX3Jlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25fcmVzcG9uc2UuZGF0YS5pdGVtcy5wdXNoLmFwcGx5KHRyYW5zYWN0aW9uX3Jlc3BvbnNlLmRhdGEuaXRlbXMsIHN1Yl9yZXNwb25zZS5kYXRhLml0ZW1zKVxyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCB7IG5ldyBXZWJTZXJ2aWNlRXJyb3IoJ3BhZ2luYXRpb24gZXJyb3InKSB9XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKGxhc3RSZXN1bHQubmV4dFBhZ2UgIT09IG51bGwgJiYgdHJhbnNhY3Rpb25fcmVzcG9uc2UuZGF0YS5pdGVtcyA8IDUwMClcclxuICAgICAgICAgICAgaWYgKGxhc3RSZXN1bHQubmV4dFBhZ2UgIT09IG51bGwgfHwgbGFzdFJlc3VsdC5uZXh0UGFnZSAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgIHRydW5jYXRlZCA9IHRydWVcclxuICAgICAgICAgICAgICAgIG5leHRQYWdlID0gbGFzdFJlc3VsdC5uZXh0UGFnZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgdHJhbnNhY3Rpb25fcmVzcG9uc2UuZGF0YS5pdGVtcy5sZW5ndGg7IHkrKykge1xyXG4gICAgICAgICAgICBsZXQgaGFzaF91cmwgPSBgaHR0cHM6Ly9pYXBpLmNoYWluYWx5c2lzLmNvbS90cmFuc2FjdGlvbnMvJHt0cmFuc2FjdGlvbl9yZXNwb25zZS5kYXRhLml0ZW1zW3ldLnRyYW5zYWN0aW9uSGFzaH0vJHtpbnB1dHMuYXNzZXR9L2RldGFpbHNgXHJcbiAgICAgICAgICAgIGNvbnN0IGhhc2hfY29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdnZXQnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBoYXNoX3VybCxcclxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgICAgICAgICAgICAgICd0b2tlbic6IHRoaXMuY29uZmlnLnRva2VuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNvbnN0IGhhc2hfcmVzcG9uc2U6IEF4aW9zUmVzcG9uc2UgPSBhd2FpdCBheGlvcyhoYXNoX2NvbmZpZykuY2F0Y2goZXJyID0+IFByb21pc2UucmVqZWN0KGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzIDwgNTAwID8gbmV3IFdlYlNlcnZpY2VFcnJvcihlcnIucmVzcG9uc2UuZGF0YSkgOiBlcnIpKTtcclxuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0cmFuc2FjdGlvbl9yZXNwb25zZS5kYXRhLml0ZW1zW3ldLCB7XHJcbiAgICAgICAgICAgICAgICBkZXRhaWxzOiBoYXNoX3Jlc3BvbnNlLmRhdGEsXHJcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb246IGlucHV0cy5kaXJlY3Rpb24sXHJcbiAgICAgICAgICAgICAgICBpZDogaW5wdXRzLmFzc2V0ICsgJzonICsgdHJhbnNhY3Rpb25fcmVzcG9uc2UuZGF0YS5pdGVtc1t5XS50cmFuc2FjdGlvbkhhc2gsXHJcbiAgICAgICAgICAgICAgICBzaXJlbkRlbm9ybUlucHV0QWRkcmVzczogW10sXHJcbiAgICAgICAgICAgICAgICBzaXJlbkRlbm9ybU91dHB1dEFkZHJlc3M6IFtdLFxyXG4gICAgICAgICAgICAgICAgdHJ1bmNhdGVkOiB0cnVuY2F0ZWRcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGEgPSAwOyBhIDwgaGFzaF9yZXNwb25zZS5kYXRhLnRyYWNlcy5sZW5ndGg7IGErKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGIgPSAwOyBiIDwgaGFzaF9yZXNwb25zZS5kYXRhLnRyYWNlc1thXS5pbnB1dHMubGVuZ3RoOyBiKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25fcmVzcG9uc2UuZGF0YS5pdGVtc1t5XS5zaXJlbkRlbm9ybUlucHV0QWRkcmVzcy5wdXNoKGlucHV0cy5hc3NldCArICc6JyArIGhhc2hfcmVzcG9uc2UuZGF0YS50cmFjZXNbYV0uaW5wdXRzW2JdLnJvb3RBZGRyZXNzKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBjID0gMDsgYyA8IGhhc2hfcmVzcG9uc2UuZGF0YS50cmFjZXNbYV0ub3V0cHV0cy5sZW5ndGg7IGMrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbl9yZXNwb25zZS5kYXRhLml0ZW1zW3ldLnNpcmVuRGVub3JtT3V0cHV0QWRkcmVzcy5wdXNoKGlucHV0cy5hc3NldCArICc6JyArIGhhc2hfcmVzcG9uc2UuZGF0YS50cmFjZXNbYV0ub3V0cHV0c1tjXS5yb290QWRkcmVzcylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggeyB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHRyYW5zYWN0aW9uOiB0cmFuc2FjdGlvbl9yZXNwb25zZS5kYXRhLml0ZW1zLFxyXG4gICAgICAgICAgICBwYWdpbmF0aW9uOiBbe1xyXG4gICAgICAgICAgICAgICAgbmV4dFBhZ2U6IG5leHRQYWdlXHJcbiAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiJdfQ==
