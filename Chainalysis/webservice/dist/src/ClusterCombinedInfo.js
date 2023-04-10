"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web_service_interface_1 = require("@sirensolutions/web-service-interface");
const axios_1 = require("axios");
class ClusterCombinedInfo extends web_service_interface_1.ServiceDefinition {
    constructor() {
        super(...arguments);
        this.name = 'cluster_combined_info';
        this.inputSchema = {
            address: { type: 'text', required: true },
            asset: { type: 'text', required: true },
            outputAsset: { type: 'text', required: false },
        };
        this.outputConfiguration = {
            cluster: {
                'cluster_balance': {
                    'addressCount': 'long',
                    'transferCount': 'long',
                    'depositCount': 'long',
                    'withdrawalCount': 'long',
                    'balance': 'long',
                    'totalSentAmount': 'long',
                    'totalReceivedAmount': 'long',
                    'totalFeesAmount': 'long'
                }
            },
            addresses: {},
            pagination: {
                'nextPage': 'keyword'
            }
        };
    }
    async invoke(inputs) {
        if (!inputs.outputAsset) {
            inputs.outputAsset = 'NATIVE';
        }
        let name_url = `https://iapi.chainalysis.com/clusters/${inputs.address}?filterAsset=${inputs.asset}`;
        const name_config = {
            method: 'get',
            url: name_url,
            headers: {
                'Accept': 'application/json',
                'token': this.config.token
            }
        };
        const name_response = await axios_1.default(name_config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new web_service_interface_1.WebServiceError(err.response.data) : err));
        let address_url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/addresses?size=100`;
        if (inputs.page) {
            address_url + address_url + `&page=${inputs.page}`;
        }
        if (!inputs.page) {
            inputs.outputAsset = 'NATIVE';
        }
        const address_config = {
            method: 'get',
            url: address_url,
            headers: {
                'Accept': 'application/json',
                'token': this.config.token
            }
        };
        const address_response = await axios_1.default(address_config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new web_service_interface_1.WebServiceError(err.response.data) : err));
        let nextPage = '';
        if (address_response.data.nextPage != null) {
            let page = address_response.data.nextPage;
            let lastResult = { nextPage: '' };
            do {
                try {
                    let sub_url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/addresses?size=100` + `&page=${page}`;
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
                    address_response.data.items.push.apply(address_response.data.items, sub_response.data.items);
                }
                catch {
                    new web_service_interface_1.WebServiceError('pagination error');
                }
            } while (lastResult.nextPage !== null && address_response.data.items.length <= 400);
            if (lastResult.nextPage !== null || lastResult.nextPage !== '') {
                nextPage = lastResult.nextPage;
            }
        }
        const denormAddress = [];
        for (let y = 0; y < address_response.data.items.length; y++) {
            denormAddress.push(`${address_response.data.asset}:${address_response.data.items[y].address}`);
            Object.assign(address_response.data.items[y], {
                rootAddress: address_response.data.rootAddress,
                asset: address_response.data.asset,
                id: `${address_response.data.asset}:${address_response.data.items[y].address}`
            });
        }
        let balance_url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/summary?outputAsset=${inputs.outputAsset}`;
        const balance_config = {
            method: 'get',
            url: balance_url,
            headers: {
                'Accept': 'application/json',
                'token': this.config.token
            }
        };
        const balance_response = await axios_1.default(balance_config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new web_service_interface_1.WebServiceError(err.response.data) : err));
        let items_truncated = false;
        if (address_response.data.items.length < balance_response.data.addressCount) {
            items_truncated = true;
        }
        return {
            cluster: [{
                    id: address_response.data.asset + ':' + address_response.data.rootAddress,
                    name: name_response.data.items[0].name,
                    category: name_response.data.items[0].category,
                    rootAddress: address_response.data.rootAddress,
                    asset: address_response.data.asset,
                    cluster_balance: balance_response.data,
                    addresses_truncated: items_truncated,
                }],
            pagination: [{
                    nextPage: nextPage,
                    truncated: items_truncated,
                }],
            addresses: address_response.data.items
        };
    }
}
exports.default = ClusterCombinedInfo;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9DbHVzdGVyQ29tYmluZWRJbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUZBQStJO0FBQy9JLGlDQUFpRTtBQUNqRSxNQUFxQixtQkFBb0IsU0FBUSx5Q0FBaUI7SUFBbEU7O1FBQ2EsU0FBSSxHQUFHLHVCQUF1QixDQUFDO1FBQy9CLGdCQUFXLEdBQWdCO1lBQ2hDLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtZQUN6QyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7WUFDdkMsV0FBVyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFO1NBQ2pELENBQUM7UUFDTyx3QkFBbUIsR0FBd0I7WUFDaEQsT0FBTyxFQUFFO2dCQUNMLGlCQUFpQixFQUFFO29CQUNmLGNBQWMsRUFBRSxNQUFNO29CQUN0QixlQUFlLEVBQUUsTUFBTTtvQkFDdkIsY0FBYyxFQUFFLE1BQU07b0JBQ3RCLGlCQUFpQixFQUFFLE1BQU07b0JBQ3pCLFNBQVMsRUFBRSxNQUFNO29CQUNqQixpQkFBaUIsRUFBRSxNQUFNO29CQUN6QixxQkFBcUIsRUFBRSxNQUFNO29CQUM3QixpQkFBaUIsRUFBRSxNQUFNO2lCQUM1QjthQUNKO1lBQ0QsU0FBUyxFQUFFLEVBQUU7WUFDYixVQUFVLEVBQUU7Z0JBQ1IsVUFBVSxFQUFFLFNBQVM7YUFDeEI7U0FDSixDQUFDO0lBZ0dOLENBQUM7SUEvRkcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUtaO1FBQ0csSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUU7WUFBRSxNQUFNLENBQUMsV0FBVyxHQUFHLFFBQVEsQ0FBQTtTQUFFO1FBQzFELElBQUksUUFBUSxHQUFHLHlDQUF5QyxNQUFNLENBQUMsT0FBTyxnQkFBZ0IsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFBO1FBQ3BH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QyxDQUFDLENBQUMsSUFBSTtvQkFDdEMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVE7b0JBQzlDLFdBQVcsRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsV0FBVztvQkFDOUMsS0FBSyxFQUFFLGdCQUFnQixDQUFDLElBQUksQ0FBQyxLQUFLO29CQUNsQyxlQUFlLEVBQUUsZ0JBQWdCLENBQUMsSUFBSTtvQkFDdEMsbUJBQW1CLEVBQUUsZUFBZTtpQkFDdkMsQ0FBQztZQUNGLFVBQVUsRUFBRSxDQUFDO29CQUNULFFBQVEsRUFBRSxRQUFRO29CQUNsQixTQUFTLEVBQUUsZUFBZTtpQkFDN0IsQ0FBQztZQUNGLFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBSztTQUN6QyxDQUFBO0lBQ0wsQ0FBQztDQUNKO0FBeEhELHNDQXdIQyIsImZpbGUiOiJzcmMvQ2x1c3RlckNvbWJpbmVkSW5mby5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERhdGFJbmRleFJlc3VsdHMsIElucHV0U2NoZW1hLCBPdXRwdXRDb25maWd1cmF0aW9uLCBTZXJ2aWNlRGVmaW5pdGlvbiwgV2ViU2VydmljZUVycm9yIH0gZnJvbSAnQHNpcmVuc29sdXRpb25zL3dlYi1zZXJ2aWNlLWludGVyZmFjZSc7XHJcbmltcG9ydCBheGlvcywgeyBBeGlvc1JlcXVlc3RDb25maWcsIEF4aW9zUmVzcG9uc2UgfSBmcm9tICdheGlvcyc7XHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENsdXN0ZXJDb21iaW5lZEluZm8gZXh0ZW5kcyBTZXJ2aWNlRGVmaW5pdGlvbiB7XHJcbiAgICByZWFkb25seSBuYW1lID0gJ2NsdXN0ZXJfY29tYmluZWRfaW5mbyc7XHJcbiAgICByZWFkb25seSBpbnB1dFNjaGVtYTogSW5wdXRTY2hlbWEgPSB7XHJcbiAgICAgICAgYWRkcmVzczogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICAgICAgYXNzZXQ6IHsgdHlwZTogJ3RleHQnLCByZXF1aXJlZDogdHJ1ZSB9LFxyXG4gICAgICAgIG91dHB1dEFzc2V0OiB7IHR5cGU6ICd0ZXh0JywgcmVxdWlyZWQ6IGZhbHNlIH0sXHJcbiAgICB9O1xyXG4gICAgcmVhZG9ubHkgb3V0cHV0Q29uZmlndXJhdGlvbjogT3V0cHV0Q29uZmlndXJhdGlvbiA9IHtcclxuICAgICAgICBjbHVzdGVyOiB7XHJcbiAgICAgICAgICAgICdjbHVzdGVyX2JhbGFuY2UnOiB7XHJcbiAgICAgICAgICAgICAgICAnYWRkcmVzc0NvdW50JzogJ2xvbmcnLFxyXG4gICAgICAgICAgICAgICAgJ3RyYW5zZmVyQ291bnQnOiAnbG9uZycsXHJcbiAgICAgICAgICAgICAgICAnZGVwb3NpdENvdW50JzogJ2xvbmcnLFxyXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWxDb3VudCc6ICdsb25nJyxcclxuICAgICAgICAgICAgICAgICdiYWxhbmNlJzogJ2xvbmcnLFxyXG4gICAgICAgICAgICAgICAgJ3RvdGFsU2VudEFtb3VudCc6ICdsb25nJyxcclxuICAgICAgICAgICAgICAgICd0b3RhbFJlY2VpdmVkQW1vdW50JzogJ2xvbmcnLFxyXG4gICAgICAgICAgICAgICAgJ3RvdGFsRmVlc0Ftb3VudCc6ICdsb25nJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBhZGRyZXNzZXM6IHt9LFxyXG4gICAgICAgIHBhZ2luYXRpb246IHtcclxuICAgICAgICAgICAgJ25leHRQYWdlJzogJ2tleXdvcmQnXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIGFzeW5jIGludm9rZShpbnB1dHM6IHtcclxuICAgICAgICBhZGRyZXNzOiBzdHJpbmcsXHJcbiAgICAgICAgYXNzZXQ6IHN0cmluZyxcclxuICAgICAgICBvdXRwdXRBc3NldDogc3RyaW5nLFxyXG4gICAgICAgIHBhZ2U6IHN0cmluZ1xyXG4gICAgfSk6IFByb21pc2U8RGF0YUluZGV4UmVzdWx0cz4ge1xyXG4gICAgICAgIGlmICghaW5wdXRzLm91dHB1dEFzc2V0KSB7IGlucHV0cy5vdXRwdXRBc3NldCA9ICdOQVRJVkUnIH1cclxuICAgICAgICBsZXQgbmFtZV91cmwgPSBgaHR0cHM6Ly9pYXBpLmNoYWluYWx5c2lzLmNvbS9jbHVzdGVycy8ke2lucHV0cy5hZGRyZXNzfT9maWx0ZXJBc3NldD0ke2lucHV0cy5hc3NldH1gXHJcbiAgICAgICAgY29uc3QgbmFtZV9jb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHtcclxuICAgICAgICAgICAgbWV0aG9kOiAnZ2V0JyxcclxuICAgICAgICAgICAgdXJsOiBuYW1lX3VybCxcclxuICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICAgICAgICAgICd0b2tlbic6IHRoaXMuY29uZmlnLnRva2VuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IG5hbWVfcmVzcG9uc2U6IEF4aW9zUmVzcG9uc2UgPSBhd2FpdCBheGlvcyhuYW1lX2NvbmZpZykuY2F0Y2goZXJyID0+IFByb21pc2UucmVqZWN0KGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzIDwgNTAwID8gbmV3IFdlYlNlcnZpY2VFcnJvcihlcnIucmVzcG9uc2UuZGF0YSkgOiBlcnIpKTtcclxuICAgICAgICBsZXQgYWRkcmVzc191cmwgPSBgaHR0cHM6Ly9pYXBpLmNoYWluYWx5c2lzLmNvbS9jbHVzdGVycy8ke2lucHV0cy5hZGRyZXNzfS8ke2lucHV0cy5hc3NldH0vYWRkcmVzc2VzP3NpemU9MTAwYFxyXG4gICAgICAgIGlmIChpbnB1dHMucGFnZSkge1xyXG4gICAgICAgICAgICBhZGRyZXNzX3VybCArIGFkZHJlc3NfdXJsICsgYCZwYWdlPSR7aW5wdXRzLnBhZ2V9YFxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWlucHV0cy5wYWdlKSB7IGlucHV0cy5vdXRwdXRBc3NldCA9ICdOQVRJVkUnIH1cclxuICAgICAgICBjb25zdCBhZGRyZXNzX2NvbmZpZzogQXhpb3NSZXF1ZXN0Q29uZmlnID0ge1xyXG4gICAgICAgICAgICBtZXRob2Q6ICdnZXQnLFxyXG4gICAgICAgICAgICB1cmw6IGFkZHJlc3NfdXJsLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgICAgICAgICAgJ3Rva2VuJzogdGhpcy5jb25maWcudG9rZW5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3QgYWRkcmVzc19yZXNwb25zZTogQXhpb3NSZXNwb25zZSA9IGF3YWl0IGF4aW9zKGFkZHJlc3NfY29uZmlnKS5jYXRjaChlcnIgPT4gUHJvbWlzZS5yZWplY3QoZXJyLnJlc3BvbnNlICYmIGVyci5yZXNwb25zZS5zdGF0dXMgPCA1MDAgPyBuZXcgV2ViU2VydmljZUVycm9yKGVyci5yZXNwb25zZS5kYXRhKSA6IGVycikpO1xyXG4gICAgICAgIGxldCBuZXh0UGFnZSA9ICcnO1xyXG4gICAgICAgIGlmIChhZGRyZXNzX3Jlc3BvbnNlLmRhdGEubmV4dFBhZ2UgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICBsZXQgcGFnZSA9IGFkZHJlc3NfcmVzcG9uc2UuZGF0YS5uZXh0UGFnZVxyXG4gICAgICAgICAgICBsZXQgbGFzdFJlc3VsdCA9IHsgbmV4dFBhZ2U6ICcnIH07XHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN1Yl91cmwgPSBgaHR0cHM6Ly9pYXBpLmNoYWluYWx5c2lzLmNvbS9jbHVzdGVycy8ke2lucHV0cy5hZGRyZXNzfS8ke2lucHV0cy5hc3NldH0vYWRkcmVzc2VzP3NpemU9MTAwYCArIGAmcGFnZT0ke3BhZ2V9YFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1Yl9jb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnZ2V0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBzdWJfdXJsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3Rva2VuJzogdGhpcy5jb25maWcudG9rZW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3ViX3Jlc3BvbnNlOiBBeGlvc1Jlc3BvbnNlID0gYXdhaXQgYXhpb3Moc3ViX2NvbmZpZykuY2F0Y2goZXJyID0+IFByb21pc2UucmVqZWN0KGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzIDwgNTAwID8gbmV3IFdlYlNlcnZpY2VFcnJvcihlcnIucmVzcG9uc2UuZGF0YSkgOiBlcnIpKTtcclxuICAgICAgICAgICAgICAgICAgICBsYXN0UmVzdWx0ID0gc3ViX3Jlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgYWRkcmVzc19yZXNwb25zZS5kYXRhLml0ZW1zLnB1c2guYXBwbHkoYWRkcmVzc19yZXNwb25zZS5kYXRhLml0ZW1zLCBzdWJfcmVzcG9uc2UuZGF0YS5pdGVtcylcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggeyBuZXcgV2ViU2VydmljZUVycm9yKCdwYWdpbmF0aW9uIGVycm9yJykgfVxyXG4gICAgICAgICAgICB9IHdoaWxlIChsYXN0UmVzdWx0Lm5leHRQYWdlICE9PSBudWxsICYmIGFkZHJlc3NfcmVzcG9uc2UuZGF0YS5pdGVtcy5sZW5ndGggPD0gNDAwKVxyXG4gICAgICAgICAgICBpZiAobGFzdFJlc3VsdC5uZXh0UGFnZSAhPT0gbnVsbCB8fCBsYXN0UmVzdWx0Lm5leHRQYWdlICE9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgbmV4dFBhZ2UgPSBsYXN0UmVzdWx0Lm5leHRQYWdlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZGVub3JtQWRkcmVzczogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IGFkZHJlc3NfcmVzcG9uc2UuZGF0YS5pdGVtcy5sZW5ndGg7IHkrKykge1xyXG4gICAgICAgICAgICBkZW5vcm1BZGRyZXNzLnB1c2goYCR7YWRkcmVzc19yZXNwb25zZS5kYXRhLmFzc2V0fToke2FkZHJlc3NfcmVzcG9uc2UuZGF0YS5pdGVtc1t5XS5hZGRyZXNzfWApXHJcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oYWRkcmVzc19yZXNwb25zZS5kYXRhLml0ZW1zW3ldLCB7XHJcbiAgICAgICAgICAgICAgICByb290QWRkcmVzczogYWRkcmVzc19yZXNwb25zZS5kYXRhLnJvb3RBZGRyZXNzLFxyXG4gICAgICAgICAgICAgICAgYXNzZXQ6IGFkZHJlc3NfcmVzcG9uc2UuZGF0YS5hc3NldCxcclxuICAgICAgICAgICAgICAgIGlkOiBgJHthZGRyZXNzX3Jlc3BvbnNlLmRhdGEuYXNzZXR9OiR7YWRkcmVzc19yZXNwb25zZS5kYXRhLml0ZW1zW3ldLmFkZHJlc3N9YFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGJhbGFuY2VfdXJsID0gYGh0dHBzOi8vaWFwaS5jaGFpbmFseXNpcy5jb20vY2x1c3RlcnMvJHtpbnB1dHMuYWRkcmVzc30vJHtpbnB1dHMuYXNzZXR9L3N1bW1hcnk/b3V0cHV0QXNzZXQ9JHtpbnB1dHMub3V0cHV0QXNzZXR9YFxyXG4gICAgICAgIGNvbnN0IGJhbGFuY2VfY29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogJ2dldCcsXHJcbiAgICAgICAgICAgIHVybDogYmFsYW5jZV91cmwsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgICAgICAgICAndG9rZW4nOiB0aGlzLmNvbmZpZy50b2tlblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBiYWxhbmNlX3Jlc3BvbnNlOiBBeGlvc1Jlc3BvbnNlID0gYXdhaXQgYXhpb3MoYmFsYW5jZV9jb25maWcpLmNhdGNoKGVyciA9PiBQcm9taXNlLnJlamVjdChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA8IDUwMCA/IG5ldyBXZWJTZXJ2aWNlRXJyb3IoZXJyLnJlc3BvbnNlLmRhdGEpIDogZXJyKSk7XHJcbiAgICAgICAgbGV0IGl0ZW1zX3RydW5jYXRlZCA9IGZhbHNlXHJcbiAgICAgICAgaWYgKGFkZHJlc3NfcmVzcG9uc2UuZGF0YS5pdGVtcy5sZW5ndGggPCBiYWxhbmNlX3Jlc3BvbnNlLmRhdGEuYWRkcmVzc0NvdW50KSB7XHJcbiAgICAgICAgICAgIGl0ZW1zX3RydW5jYXRlZCA9IHRydWVcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgY2x1c3RlcjogW3tcclxuICAgICAgICAgICAgICAgIGlkOiBhZGRyZXNzX3Jlc3BvbnNlLmRhdGEuYXNzZXQgKyAnOicgKyBhZGRyZXNzX3Jlc3BvbnNlLmRhdGEucm9vdEFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiBuYW1lX3Jlc3BvbnNlLmRhdGEuaXRlbXNbMF0ubmFtZSxcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBuYW1lX3Jlc3BvbnNlLmRhdGEuaXRlbXNbMF0uY2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICByb290QWRkcmVzczogYWRkcmVzc19yZXNwb25zZS5kYXRhLnJvb3RBZGRyZXNzLFxyXG4gICAgICAgICAgICAgICAgYXNzZXQ6IGFkZHJlc3NfcmVzcG9uc2UuZGF0YS5hc3NldCxcclxuICAgICAgICAgICAgICAgIGNsdXN0ZXJfYmFsYW5jZTogYmFsYW5jZV9yZXNwb25zZS5kYXRhLFxyXG4gICAgICAgICAgICAgICAgYWRkcmVzc2VzX3RydW5jYXRlZDogaXRlbXNfdHJ1bmNhdGVkLFxyXG4gICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgcGFnaW5hdGlvbjogW3tcclxuICAgICAgICAgICAgICAgIG5leHRQYWdlOiBuZXh0UGFnZSxcclxuICAgICAgICAgICAgICAgIHRydW5jYXRlZDogaXRlbXNfdHJ1bmNhdGVkLFxyXG4gICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgYWRkcmVzc2VzOiBhZGRyZXNzX3Jlc3BvbnNlLmRhdGEuaXRlbXNcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl19
