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
                direction: inputs.direction,
                id: inputs.asset + ':' + transaction_response.data.items[y].transactionHash,
                sirenDenormInputAddress: [],
                sirenDenormOutputAddress: []
            });
            try {
                for (let a = 0; a < hash_response.data.traces.length; a++) {
                    for (let b = 0; b < hash_response.data.traces[a].inputs.length; b++) {
                        transaction_response.data.items[y].sirenDenormInputAddress.push(inputs.asset + ':' + hash_response.data.traces[a].inputs[b].address);
                    }
                    for (let c = 0; c < hash_response.data.traces[a].outputs.length; c++) {
                        transaction_response.data.items[y].sirenDenormOutputAddress.push(inputs.asset + ':' + hash_response.data.traces[a].outputs[c].address);
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
exports.default = AddressTransactions;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9BZGRyZXNzVHJhbnNhY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUZBQStJO0FBQy9JLGlDQUFpRTtBQUNqRSxNQUFxQixtQkFBb0IsU0FBUSx5Q0FBaUI7SUFBbEU7O1FBQ2EsU0FBSSxHQUFHLHNCQUFzQixDQUFDO1FBQzlCLGdCQUFXLEdBQWdCO1lBQ2hDLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtZQUN6QyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7WUFDdkMsU0FBUyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFO1lBQzNDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRTtTQUMxQyxDQUFDO1FBQ08sd0JBQW1CLEdBQXdCO1lBQ2hELFdBQVcsRUFBRTtnQkFDVCxPQUFPLEVBQUU7b0JBQ0wsZ0JBQWdCLEVBQUUsTUFBTTtvQkFDeEIsYUFBYSxFQUFFLE1BQU07b0JBQ3JCLGNBQWMsRUFBRSxNQUFNO29CQUN0QixLQUFLLEVBQUUsTUFBTTtvQkFDYixNQUFNLEVBQUU7d0JBQ0osTUFBTSxFQUFFOzRCQUNKLFFBQVEsRUFBRSxNQUFNO3lCQUNuQjt3QkFDRCxPQUFPLEVBQUU7NEJBQ0wsUUFBUSxFQUFFLE1BQU07eUJBQ25CO3FCQUNKO2lCQUNKO2FBQ0o7WUFDRCxVQUFVLEVBQUU7Z0JBQ1IsVUFBVSxFQUFFLFNBQVM7YUFDeEI7U0FDSixDQUFDO0lBbUZOLENBQUM7SUFsRkcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUtaO1FBQ0csSUFBSSxlQUFlLEdBQUcsMENBQTBDLE1BQU0sQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLEtBQUssb0NBQW9DLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQTtRQUNwSixJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDYixlQUFlLEdBQUcsZUFBZSxHQUFHLFNBQVMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFBO1NBQzdEO1FBQ0QsTUFBTSxrQkFBa0IsR0FBdUI7WUFDM0MsTUFBTSxFQUFFLEtBQUs7WUFDYixHQUFHLEVBQUUsZUFBZTtZQUNwQixPQUFPLEVBQUU7Z0JBQ0wsUUFBUSxFQUFFLGtCQUFrQjtnQkFDNUIsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSzthQUM3QjtTQUNKLENBQUM7UUFDRixNQUFNLG9CQUFvQixHQUFrQixNQUFNLGVBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksdUNBQWUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ25NLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQTtRQUNyQixJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFDbEIsSUFBSSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksRUFBRTtZQUM1QyxJQUFJLElBQUksR0FBRyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFBO1lBQzdDLElBQUksVUFBVSxHQUFHLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxDQUFDO1lBQ2xDLEdBQUc7Z0JBQ0MsSUFBSTtvQkFDQSxJQUFJLE9BQU8sR0FBRywwQ0FBMEMsTUFBTSxDQUFDLE9BQU8sSUFBSSxNQUFNLENBQUMsS0FBSyxvQ0FBb0MsTUFBTSxDQUFDLFNBQVMsRUFBRSxHQUFHLFNBQVMsSUFBSSxFQUFFLENBQUE7b0JBQzlKLE1BQU0sVUFBVSxHQUF1Qjt3QkFDbkMsTUFBTSxFQUFFLEtBQUs7d0JBQ2IsR0FBRyxFQUFFLE9BQU87d0JBQ1osT0FBTyxFQUFFOzRCQUNMLFFBQVEsRUFBRSxrQkFBa0I7NEJBQzVCLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUs7eUJBQzdCO3FCQUNKLENBQUM7b0JBQ0YsTUFBTSxZQUFZLEdBQWtCLE1BQU0sZUFBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksdUNBQWUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNuTCxVQUFVLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQztvQkFDL0Isb0JBQW9CLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtpQkFDdkc7Z0JBQUMsTUFBTTtvQkFBRSxJQUFJLHVDQUFlLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtpQkFBRTthQUN0RCxRQUFRLFVBQVUsQ0FBQyxRQUFRLEtBQUssSUFBSSxJQUFJLG9CQUFvQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLEdBQUcsRUFBQztZQUN2RixJQUFJLFVBQVUsQ0FBQyxRQUFRLEtBQUssSUFBSSxJQUFJLFVBQVUsQ0FBQyxRQUFRLEtBQUssRUFBRSxFQUFFO2dCQUM1RCxTQUFTLEdBQUcsSUFBSSxDQUFBO2dCQUNoQixRQUFRLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQTthQUNqQztTQUNKO1FBQ0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLG9CQUFvQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzdELElBQUksUUFBUSxHQUFHLDZDQUE2QyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsSUFBSSxNQUFNLENBQUMsS0FBSyxVQUFVLENBQUE7WUFDeEksTUFBTSxXQUFXLEdBQXVCO2dCQUNwQyxNQUFNLEVBQUUsS0FBSztnQkFDYixHQUFHLEVBQUUsUUFBUTtnQkFDYixPQUFPLEVBQUU7b0JBQ0wsUUFBUSxFQUFFLGtCQUFrQjtvQkFDNUIsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSztpQkFDN0I7YUFDSixDQUFDO1lBQ0YsTUFBTSxhQUFhLEdBQWtCLE1BQU0sZUFBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksdUNBQWUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3JMLE1BQU0sQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDOUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxJQUFJO2dCQUMzQixTQUFTLEVBQUUsTUFBTSxDQUFDLFNBQVM7Z0JBQzNCLEVBQUUsRUFBRSxNQUFNLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWU7Z0JBQzNFLHVCQUF1QixFQUFFLEVBQUU7Z0JBQzNCLHdCQUF3QixFQUFFLEVBQUU7YUFDL0IsQ0FBQyxDQUFBO1lBQ0YsSUFBSTtnQkFDQSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUN2RCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTt3QkFDakUsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFBO3FCQUN2STtvQkFDRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTt3QkFDbEUsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFBO3FCQUN6STtpQkFDSjthQUNKO1lBQUMsTUFBTSxHQUFHO1NBQ2Q7UUFDRCxPQUFPO1lBQ0gsV0FBVyxFQUFFLG9CQUFvQixDQUFDLElBQUksQ0FBQyxLQUFLO1lBQzVDLFVBQVUsRUFBRSxDQUFDO29CQUNULFFBQVEsRUFBRSxRQUFRO29CQUNsQixTQUFTLEVBQUUsU0FBUztpQkFDdkIsQ0FBQztTQUNMLENBQUE7SUFDTCxDQUFDO0NBQ0o7QUEvR0Qsc0NBK0dDIiwiZmlsZSI6InNyYy9BZGRyZXNzVHJhbnNhY3Rpb25zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGF0YUluZGV4UmVzdWx0cywgSW5wdXRTY2hlbWEsIE91dHB1dENvbmZpZ3VyYXRpb24sIFNlcnZpY2VEZWZpbml0aW9uLCBXZWJTZXJ2aWNlRXJyb3IgfSBmcm9tICdAc2lyZW5zb2x1dGlvbnMvd2ViLXNlcnZpY2UtaW50ZXJmYWNlJztcclxuaW1wb3J0IGF4aW9zLCB7IEF4aW9zUmVxdWVzdENvbmZpZywgQXhpb3NSZXNwb25zZSB9IGZyb20gJ2F4aW9zJztcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWRkcmVzc1RyYW5zYWN0aW9ucyBleHRlbmRzIFNlcnZpY2VEZWZpbml0aW9uIHtcclxuICAgIHJlYWRvbmx5IG5hbWUgPSAnYWRkcmVzc190cmFuc2FjdGlvbnMnO1xyXG4gICAgcmVhZG9ubHkgaW5wdXRTY2hlbWE6IElucHV0U2NoZW1hID0ge1xyXG4gICAgICAgIGFkZHJlc3M6IHsgdHlwZTogJ3RleHQnLCByZXF1aXJlZDogdHJ1ZSB9LFxyXG4gICAgICAgIGFzc2V0OiB7IHR5cGU6ICd0ZXh0JywgcmVxdWlyZWQ6IHRydWUgfSxcclxuICAgICAgICBkaXJlY3Rpb246IHsgdHlwZTogJ3RleHQnLCByZXF1aXJlZDogdHJ1ZSB9LFxyXG4gICAgICAgIHBhZ2U6IHsgdHlwZTogJ3RleHQnLCByZXF1aXJlZDogZmFsc2UgfSxcclxuICAgIH07XHJcbiAgICByZWFkb25seSBvdXRwdXRDb25maWd1cmF0aW9uOiBPdXRwdXRDb25maWd1cmF0aW9uID0ge1xyXG4gICAgICAgIHRyYW5zYWN0aW9uOiB7XHJcbiAgICAgICAgICAgIGRldGFpbHM6IHtcclxuICAgICAgICAgICAgICAgICdibG9ja1RpbWVzdGFtcCc6ICdkYXRlJyxcclxuICAgICAgICAgICAgICAgICdibG9ja0hlaWdodCc6ICdsb25nJyxcclxuICAgICAgICAgICAgICAgICdleGNoYW5nZVJhdGUnOiAnbG9uZycsXHJcbiAgICAgICAgICAgICAgICAnZmVlJzogJ2xvbmcnLFxyXG4gICAgICAgICAgICAgICAgdHJhY2VzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdhbW91bnQnOiAnbG9uZydcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2Ftb3VudCc6ICdsb25nJ1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcGFnaW5hdGlvbjoge1xyXG4gICAgICAgICAgICAnbmV4dFBhZ2UnOiAna2V5d29yZCdcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgYXN5bmMgaW52b2tlKGlucHV0czoge1xyXG4gICAgICAgIGFkZHJlc3M6IHN0cmluZyxcclxuICAgICAgICBhc3NldDogc3RyaW5nLFxyXG4gICAgICAgIGRpcmVjdGlvbjogc3RyaW5nLFxyXG4gICAgICAgIHBhZ2U6IHN0cmluZ1xyXG4gICAgfSk6IFByb21pc2U8RGF0YUluZGV4UmVzdWx0cz4ge1xyXG4gICAgICAgIGxldCB0cmFuc2FjdGlvbl91cmwgPSBgaHR0cHM6Ly9pYXBpLmNoYWluYWx5c2lzLmNvbS9hZGRyZXNzZXMvJHtpbnB1dHMuYWRkcmVzc30vJHtpbnB1dHMuYXNzZXR9L3RyYW5zYWN0aW9ucz9zaXplPTEwMCZkaXJlY3Rpb249JHtpbnB1dHMuZGlyZWN0aW9ufWBcclxuICAgICAgICBpZiAoaW5wdXRzLnBhZ2UpIHtcclxuICAgICAgICAgICAgdHJhbnNhY3Rpb25fdXJsICsgdHJhbnNhY3Rpb25fdXJsICsgYCZwYWdlPSR7aW5wdXRzLnBhZ2V9YFxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB0cmFuc2FjdGlvbl9jb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHtcclxuICAgICAgICAgICAgbWV0aG9kOiAnZ2V0JyxcclxuICAgICAgICAgICAgdXJsOiB0cmFuc2FjdGlvbl91cmwsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgICAgICAgICAndG9rZW4nOiB0aGlzLmNvbmZpZy50b2tlblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCB0cmFuc2FjdGlvbl9yZXNwb25zZTogQXhpb3NSZXNwb25zZSA9IGF3YWl0IGF4aW9zKHRyYW5zYWN0aW9uX2NvbmZpZykuY2F0Y2goZXJyID0+IFByb21pc2UucmVqZWN0KGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzIDwgNTAwID8gbmV3IFdlYlNlcnZpY2VFcnJvcihlcnIucmVzcG9uc2UuZGF0YSkgOiBlcnIpKTtcclxuICAgICAgICBsZXQgdHJ1bmNhdGVkID0gZmFsc2VcclxuICAgICAgICBsZXQgbmV4dFBhZ2UgPSAnJztcclxuICAgICAgICBpZiAodHJhbnNhY3Rpb25fcmVzcG9uc2UuZGF0YS5uZXh0UGFnZSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIGxldCBwYWdlID0gdHJhbnNhY3Rpb25fcmVzcG9uc2UuZGF0YS5uZXh0UGFnZVxyXG4gICAgICAgICAgICBsZXQgbGFzdFJlc3VsdCA9IHsgbmV4dFBhZ2U6ICcnIH07XHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN1Yl91cmwgPSBgaHR0cHM6Ly9pYXBpLmNoYWluYWx5c2lzLmNvbS9hZGRyZXNzZXMvJHtpbnB1dHMuYWRkcmVzc30vJHtpbnB1dHMuYXNzZXR9L3RyYW5zYWN0aW9ucz9zaXplPTEwMCZkaXJlY3Rpb249JHtpbnB1dHMuZGlyZWN0aW9ufWAgKyBgJnBhZ2U9JHtwYWdlfWBcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJfY29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ2dldCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogc3ViX3VybCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd0b2tlbic6IHRoaXMuY29uZmlnLnRva2VuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1Yl9yZXNwb25zZTogQXhpb3NSZXNwb25zZSA9IGF3YWl0IGF4aW9zKHN1Yl9jb25maWcpLmNhdGNoKGVyciA9PiBQcm9taXNlLnJlamVjdChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA8IDUwMCA/IG5ldyBXZWJTZXJ2aWNlRXJyb3IoZXJyLnJlc3BvbnNlLmRhdGEpIDogZXJyKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFJlc3VsdCA9IHN1Yl9yZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uX3Jlc3BvbnNlLmRhdGEuaXRlbXMucHVzaC5hcHBseSh0cmFuc2FjdGlvbl9yZXNwb25zZS5kYXRhLml0ZW1zLCBzdWJfcmVzcG9uc2UuZGF0YS5pdGVtcylcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggeyBuZXcgV2ViU2VydmljZUVycm9yKCdwYWdpbmF0aW9uIGVycm9yJykgfVxyXG4gICAgICAgICAgICB9IHdoaWxlIChsYXN0UmVzdWx0Lm5leHRQYWdlICE9PSBudWxsICYmIHRyYW5zYWN0aW9uX3Jlc3BvbnNlLmRhdGEuaXRlbXMubGVuZ3RoIDw9IDQwMClcclxuICAgICAgICAgICAgaWYgKGxhc3RSZXN1bHQubmV4dFBhZ2UgIT09IG51bGwgfHwgbGFzdFJlc3VsdC5uZXh0UGFnZSAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgIHRydW5jYXRlZCA9IHRydWVcclxuICAgICAgICAgICAgICAgIG5leHRQYWdlID0gbGFzdFJlc3VsdC5uZXh0UGFnZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgdHJhbnNhY3Rpb25fcmVzcG9uc2UuZGF0YS5pdGVtcy5sZW5ndGg7IHkrKykge1xyXG4gICAgICAgICAgICBsZXQgaGFzaF91cmwgPSBgaHR0cHM6Ly9pYXBpLmNoYWluYWx5c2lzLmNvbS90cmFuc2FjdGlvbnMvJHt0cmFuc2FjdGlvbl9yZXNwb25zZS5kYXRhLml0ZW1zW3ldLnRyYW5zYWN0aW9uSGFzaH0vJHtpbnB1dHMuYXNzZXR9L2RldGFpbHNgXHJcbiAgICAgICAgICAgIGNvbnN0IGhhc2hfY29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdnZXQnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBoYXNoX3VybCxcclxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgICAgICAgICAgICAgICd0b2tlbic6IHRoaXMuY29uZmlnLnRva2VuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNvbnN0IGhhc2hfcmVzcG9uc2U6IEF4aW9zUmVzcG9uc2UgPSBhd2FpdCBheGlvcyhoYXNoX2NvbmZpZykuY2F0Y2goZXJyID0+IFByb21pc2UucmVqZWN0KGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzIDwgNTAwID8gbmV3IFdlYlNlcnZpY2VFcnJvcihlcnIucmVzcG9uc2UuZGF0YSkgOiBlcnIpKTtcclxuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0cmFuc2FjdGlvbl9yZXNwb25zZS5kYXRhLml0ZW1zW3ldLCB7XHJcbiAgICAgICAgICAgICAgICBkZXRhaWxzOiBoYXNoX3Jlc3BvbnNlLmRhdGEsXHJcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb246IGlucHV0cy5kaXJlY3Rpb24sXHJcbiAgICAgICAgICAgICAgICBpZDogaW5wdXRzLmFzc2V0ICsgJzonICsgdHJhbnNhY3Rpb25fcmVzcG9uc2UuZGF0YS5pdGVtc1t5XS50cmFuc2FjdGlvbkhhc2gsXHJcbiAgICAgICAgICAgICAgICBzaXJlbkRlbm9ybUlucHV0QWRkcmVzczogW10sXHJcbiAgICAgICAgICAgICAgICBzaXJlbkRlbm9ybU91dHB1dEFkZHJlc3M6IFtdXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBhID0gMDsgYSA8IGhhc2hfcmVzcG9uc2UuZGF0YS50cmFjZXMubGVuZ3RoOyBhKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBiID0gMDsgYiA8IGhhc2hfcmVzcG9uc2UuZGF0YS50cmFjZXNbYV0uaW5wdXRzLmxlbmd0aDsgYisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uX3Jlc3BvbnNlLmRhdGEuaXRlbXNbeV0uc2lyZW5EZW5vcm1JbnB1dEFkZHJlc3MucHVzaChpbnB1dHMuYXNzZXQgKyAnOicgKyBoYXNoX3Jlc3BvbnNlLmRhdGEudHJhY2VzW2FdLmlucHV0c1tiXS5hZGRyZXNzKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBjID0gMDsgYyA8IGhhc2hfcmVzcG9uc2UuZGF0YS50cmFjZXNbYV0ub3V0cHV0cy5sZW5ndGg7IGMrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbl9yZXNwb25zZS5kYXRhLml0ZW1zW3ldLnNpcmVuRGVub3JtT3V0cHV0QWRkcmVzcy5wdXNoKGlucHV0cy5hc3NldCArICc6JyArIGhhc2hfcmVzcG9uc2UuZGF0YS50cmFjZXNbYV0ub3V0cHV0c1tjXS5hZGRyZXNzKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaCB7IH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdHJhbnNhY3Rpb246IHRyYW5zYWN0aW9uX3Jlc3BvbnNlLmRhdGEuaXRlbXMsXHJcbiAgICAgICAgICAgIHBhZ2luYXRpb246IFt7XHJcbiAgICAgICAgICAgICAgICBuZXh0UGFnZTogbmV4dFBhZ2UsXHJcbiAgICAgICAgICAgICAgICB0cnVuY2F0ZWQ6IHRydW5jYXRlZFxyXG4gICAgICAgICAgICB9XVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXX0=
