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
                },
                'exposure': {
                    'percentage': 'long',
                    'value': 'long'
                }
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
        let address_url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/addresses?size=200`;
        const address_config = {
            method: 'get',
            url: address_url,
            headers: {
                'Accept': 'application/json',
                'token': this.config.token
            }
        };
        const address_response = await axios_1.default(address_config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new web_service_interface_1.WebServiceError(err.response.data) : err));
        if (address_response.data.nextPage != null) {
            let page = address_response.data.nextPage;
            let lastResult = { nextPage: '' };
            do {
                try {
                    let sub_url = address_url + `&page=${page}`;
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
            } while (lastResult.nextPage !== null && address_response.data.items.length < 5000);
        }
        const denormAddress = [];
        for (let y = 0; y < address_response.data.items.length; y++) {
            denormAddress.push(`${address_response.data.asset}:${address_response.data.items[y].address}`);
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
        const exposure_paths = ['SENDING', 'RECEIVING', 'SENDING/services', 'RECEIVING/services'];
        let exposure = [];
        let denormAddressExposure = [];
        for (let z = 0; z < exposure_paths.length; z++) {
            let exposure_url = `https://iapi.chainalysis.com/exposures/clusters/${inputs.address}/${inputs.asset}/directions/${exposure_paths[z]}?outputAsset=${inputs.outputAsset}`;
            let exposure_config = {
                method: 'get',
                url: exposure_url,
                headers: {
                    'Accept': 'application/json',
                    'token': this.config.token
                }
            };
            let exposure_response = await axios_1.default(exposure_config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new web_service_interface_1.WebServiceError(err.response.data) : err));
            try {
                for (let b = 0; exposure_response.data.indirectExposure.services.length; b++) {
                    Object.assign(exposure_response.data.indirectExposure.services[b], {
                        type: 'indirect service',
                        direction: exposure_paths[z],
                    });
                    exposure.push(exposure_response.data.indirectExposure.services[b]);
                    if (exposure_response.data.indirectExposure.services[b].rootAddress) {
                        denormAddressExposure.push(address_response.data.asset + ':' + exposure_response.data.indirectExposure.services[b].rootAddress);
                    }
                }
            }
            catch { }
            try {
                for (let b = 0; exposure_response.data.directExposure.services.length; b++) {
                    Object.assign(exposure_response.data.directExposure.services[b], {
                        type: 'direct service',
                        direction: exposure_paths[z],
                    });
                    exposure.push(exposure_response.data.directExposure.services[b]);
                    if (exposure_response.data.directExposure.services[b].rootAddress) {
                        denormAddressExposure.push(address_response.data.asset + ':' + exposure_response.data.directExposure.services[b].rootAddress);
                    }
                }
            }
            catch { }
            try {
                for (let b = 0; exposure_response.data.indirectExposure.categories.length; b++) {
                    Object.assign(exposure_response.data.indirectExposure.categories[b], {
                        type: 'indirect category',
                        direction: exposure_paths[z],
                    });
                    exposure.push(exposure_response.data.indirectExposure.categories[b]);
                }
            }
            catch { }
            try {
                for (let b = 0; exposure_response.data.directExposure.categories.length; b++) {
                    Object.assign(exposure_response.data.directExposure.categories[b], {
                        type: 'direct category',
                        direction: exposure_paths[z],
                    });
                    exposure.push(exposure_response.data.directExposure.categories[b]);
                }
            }
            catch { }
        }
        return {
            cluster: [{
                    id: address_response.data.asset + ':' + address_response.data.rootAddress,
                    name: name_response.data.items[0].name,
                    category: name_response.data.items[0].category,
                    rootAddress: address_response.data.rootAddress,
                    asset: address_response.data.asset,
                    cluster_balance: balance_response.data,
                    exposure: exposure,
                    sirenDenormAddress: denormAddress,
                    sirenDenormAddressExposure: ([...new Set(denormAddressExposure)]),
                    items_truncated: items_truncated,
                    raw_items: address_response.data.items,
                }]
        };
    }
}
exports.default = ClusterCombinedInfo;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9DbHVzdGVyQ29tYmluZWRJbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUZBQStJO0FBQy9JLGlDQUFpRTtBQUNqRSxNQUFxQixtQkFBb0IsU0FBUSx5Q0FBaUI7SUFBbEU7O1FBQ2EsU0FBSSxHQUFHLHVCQUF1QixDQUFDO1FBQy9CLGdCQUFXLEdBQWdCO1lBQ2hDLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtZQUN6QyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7WUFDdkMsV0FBVyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFO1NBQ2pELENBQUM7UUFDTyx3QkFBbUIsR0FBd0I7WUFDaEQsT0FBTyxFQUFFO2dCQUNMLGlCQUFpQixFQUFFO29CQUNmLGNBQWMsRUFBRSxNQUFNO29CQUN0QixlQUFlLEVBQUUsTUFBTTtvQkFDdkIsY0FBYyxFQUFFLE1BQU07b0JBQ3RCLGlCQUFpQixFQUFFLE1BQU07b0JBQ3pCLFNBQVMsRUFBRSxNQUFNO29CQUNqQixpQkFBaUIsRUFBRSxNQUFNO29CQUN6QixxQkFBcUIsRUFBRSxNQUFNO29CQUM3QixpQkFBaUIsRUFBRSxNQUFNO2lCQUM1QjtnQkFDRCxVQUFVLEVBQUc7b0JBQ1QsWUFBWSxFQUFFLE1BQU07b0JBQ3BCLE9BQU8sRUFBRSxNQUFNO2lCQUNsQjthQUNKO1NBQ0osQ0FBQztJQXNJTixDQUFDO0lBcklHLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFJWjtRQUNHLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFO1lBQUUsTUFBTSxDQUFDLFdBQVcsR0FBRyxRQUFRLENBQUE7U0FBRTtRQUMxRCxJQUFJLFFBQVEsR0FBRyx5Q0FBeUMsTUFBTSxDQUFDLE9BQU8sZ0JBQWdCLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQTtR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QUFJLEVBQUUsaUJBQWlCO3dCQUN2QixTQUFTLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQztxQkFDL0IsQ0FBQyxDQUFBO29CQUNGLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtpQkFDckU7YUFDSjtZQUFDLE1BQU0sR0FBRTtTQUNiO1FBQ0QsT0FBTztZQUNILE9BQU8sRUFBRSxDQUFDO29CQUNOLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsV0FBVztvQkFDekUsSUFBSSxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQ3RDLFFBQVEsRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRO29CQUM5QyxXQUFXLEVBQUUsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFdBQVc7b0JBQzlDLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBSztvQkFDbEMsZUFBZSxFQUFFLGdCQUFnQixDQUFDLElBQUk7b0JBQ3RDLFFBQVEsRUFBRSxRQUFRO29CQUNsQixrQkFBa0IsRUFBRSxhQUFhO29CQUNqQywwQkFBMEIsRUFBRSxDQUFDLENBQUMsR0FBSSxJQUFJLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7b0JBQ2xFLGVBQWUsRUFBRSxlQUFlO29CQUNoQyxTQUFTLEVBQUUsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEtBQUs7aUJBQ3pDLENBQUM7U0FDTCxDQUFBO0lBQ0wsQ0FBQztDQUNKO0FBOUpELHNDQThKQyIsImZpbGUiOiJzcmMvQ2x1c3RlckNvbWJpbmVkSW5mby5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERhdGFJbmRleFJlc3VsdHMsIElucHV0U2NoZW1hLCBPdXRwdXRDb25maWd1cmF0aW9uLCBTZXJ2aWNlRGVmaW5pdGlvbiwgV2ViU2VydmljZUVycm9yIH0gZnJvbSAnQHNpcmVuc29sdXRpb25zL3dlYi1zZXJ2aWNlLWludGVyZmFjZSc7XHJcbmltcG9ydCBheGlvcywgeyBBeGlvc1JlcXVlc3RDb25maWcsIEF4aW9zUmVzcG9uc2UgfSBmcm9tICdheGlvcyc7XHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENsdXN0ZXJDb21iaW5lZEluZm8gZXh0ZW5kcyBTZXJ2aWNlRGVmaW5pdGlvbiB7XHJcbiAgICByZWFkb25seSBuYW1lID0gJ2NsdXN0ZXJfY29tYmluZWRfaW5mbyc7XHJcbiAgICByZWFkb25seSBpbnB1dFNjaGVtYTogSW5wdXRTY2hlbWEgPSB7XHJcbiAgICAgICAgYWRkcmVzczogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICAgICAgYXNzZXQ6IHsgdHlwZTogJ3RleHQnLCByZXF1aXJlZDogdHJ1ZSB9LFxyXG4gICAgICAgIG91dHB1dEFzc2V0OiB7IHR5cGU6ICd0ZXh0JywgcmVxdWlyZWQ6IGZhbHNlIH0sXHJcbiAgICB9O1xyXG4gICAgcmVhZG9ubHkgb3V0cHV0Q29uZmlndXJhdGlvbjogT3V0cHV0Q29uZmlndXJhdGlvbiA9IHtcclxuICAgICAgICBjbHVzdGVyOiB7XHJcbiAgICAgICAgICAgICdjbHVzdGVyX2JhbGFuY2UnOiB7XHJcbiAgICAgICAgICAgICAgICAnYWRkcmVzc0NvdW50JzogJ2xvbmcnLFxyXG4gICAgICAgICAgICAgICAgJ3RyYW5zZmVyQ291bnQnOiAnbG9uZycsXHJcbiAgICAgICAgICAgICAgICAnZGVwb3NpdENvdW50JzogJ2xvbmcnLFxyXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWxDb3VudCc6ICdsb25nJyxcclxuICAgICAgICAgICAgICAgICdiYWxhbmNlJzogJ2xvbmcnLFxyXG4gICAgICAgICAgICAgICAgJ3RvdGFsU2VudEFtb3VudCc6ICdsb25nJyxcclxuICAgICAgICAgICAgICAgICd0b3RhbFJlY2VpdmVkQW1vdW50JzogJ2xvbmcnLFxyXG4gICAgICAgICAgICAgICAgJ3RvdGFsRmVlc0Ftb3VudCc6ICdsb25nJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAnZXhwb3N1cmUnIDoge1xyXG4gICAgICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiAnbG9uZycsXHJcbiAgICAgICAgICAgICAgICAndmFsdWUnOiAnbG9uZydcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBhc3luYyBpbnZva2UoaW5wdXRzOiB7XHJcbiAgICAgICAgYWRkcmVzczogc3RyaW5nLFxyXG4gICAgICAgIGFzc2V0OiBzdHJpbmcsXHJcbiAgICAgICAgb3V0cHV0QXNzZXQ6IHN0cmluZ1xyXG4gICAgfSk6IFByb21pc2U8RGF0YUluZGV4UmVzdWx0cz4ge1xyXG4gICAgICAgIGlmICghaW5wdXRzLm91dHB1dEFzc2V0KSB7IGlucHV0cy5vdXRwdXRBc3NldCA9ICdOQVRJVkUnIH1cclxuICAgICAgICBsZXQgbmFtZV91cmwgPSBgaHR0cHM6Ly9pYXBpLmNoYWluYWx5c2lzLmNvbS9jbHVzdGVycy8ke2lucHV0cy5hZGRyZXNzfT9maWx0ZXJBc3NldD0ke2lucHV0cy5hc3NldH1gXHJcbiAgICAgICAgY29uc3QgbmFtZV9jb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHtcclxuICAgICAgICAgICAgbWV0aG9kOiAnZ2V0JyxcclxuICAgICAgICAgICAgdXJsOiBuYW1lX3VybCxcclxuICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICAgICAgICAgICd0b2tlbic6IHRoaXMuY29uZmlnLnRva2VuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IG5hbWVfcmVzcG9uc2U6IEF4aW9zUmVzcG9uc2UgPSBhd2FpdCBheGlvcyhuYW1lX2NvbmZpZykuY2F0Y2goZXJyID0+IFByb21pc2UucmVqZWN0KGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzIDwgNTAwID8gbmV3IFdlYlNlcnZpY2VFcnJvcihlcnIucmVzcG9uc2UuZGF0YSkgOiBlcnIpKTtcclxuICAgICAgICBsZXQgYWRkcmVzc191cmwgPSBgaHR0cHM6Ly9pYXBpLmNoYWluYWx5c2lzLmNvbS9jbHVzdGVycy8ke2lucHV0cy5hZGRyZXNzfS8ke2lucHV0cy5hc3NldH0vYWRkcmVzc2VzP3NpemU9MjAwYFxyXG4gICAgICAgIGNvbnN0IGFkZHJlc3NfY29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogJ2dldCcsXHJcbiAgICAgICAgICAgIHVybDogYWRkcmVzc191cmwsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgICAgICAgICAndG9rZW4nOiB0aGlzLmNvbmZpZy50b2tlblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBhZGRyZXNzX3Jlc3BvbnNlOiBBeGlvc1Jlc3BvbnNlID0gYXdhaXQgYXhpb3MoYWRkcmVzc19jb25maWcpLmNhdGNoKGVyciA9PiBQcm9taXNlLnJlamVjdChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA8IDUwMCA/IG5ldyBXZWJTZXJ2aWNlRXJyb3IoZXJyLnJlc3BvbnNlLmRhdGEpIDogZXJyKSk7XHJcbiAgICAgICAgaWYgKGFkZHJlc3NfcmVzcG9uc2UuZGF0YS5uZXh0UGFnZSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIGxldCBwYWdlID0gYWRkcmVzc19yZXNwb25zZS5kYXRhLm5leHRQYWdlXHJcbiAgICAgICAgICAgIGxldCBsYXN0UmVzdWx0ID0geyBuZXh0UGFnZTogJycgfTtcclxuICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc3ViX3VybCA9IGFkZHJlc3NfdXJsICsgYCZwYWdlPSR7cGFnZX1gXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3ViX2NvbmZpZzogQXhpb3NSZXF1ZXN0Q29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdnZXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IHN1Yl91cmwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAndG9rZW4nOiB0aGlzLmNvbmZpZy50b2tlblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJfcmVzcG9uc2U6IEF4aW9zUmVzcG9uc2UgPSBhd2FpdCBheGlvcyhzdWJfY29uZmlnKS5jYXRjaChlcnIgPT4gUHJvbWlzZS5yZWplY3QoZXJyLnJlc3BvbnNlICYmIGVyci5yZXNwb25zZS5zdGF0dXMgPCA1MDAgPyBuZXcgV2ViU2VydmljZUVycm9yKGVyci5yZXNwb25zZS5kYXRhKSA6IGVycikpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RSZXN1bHQgPSBzdWJfcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgICAgICAgICBhZGRyZXNzX3Jlc3BvbnNlLmRhdGEuaXRlbXMucHVzaC5hcHBseShhZGRyZXNzX3Jlc3BvbnNlLmRhdGEuaXRlbXMsIHN1Yl9yZXNwb25zZS5kYXRhLml0ZW1zKVxyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCB7IG5ldyBXZWJTZXJ2aWNlRXJyb3IoJ3BhZ2luYXRpb24gZXJyb3InKSB9XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKGxhc3RSZXN1bHQubmV4dFBhZ2UgIT09IG51bGwgJiYgYWRkcmVzc19yZXNwb25zZS5kYXRhLml0ZW1zLmxlbmd0aCA8IDUwMDApXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGRlbm9ybUFkZHJlc3M6IHN0cmluZ1tdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCBhZGRyZXNzX3Jlc3BvbnNlLmRhdGEuaXRlbXMubGVuZ3RoOyB5KyspIHtcclxuICAgICAgICAgICAgZGVub3JtQWRkcmVzcy5wdXNoKGAke2FkZHJlc3NfcmVzcG9uc2UuZGF0YS5hc3NldH06JHthZGRyZXNzX3Jlc3BvbnNlLmRhdGEuaXRlbXNbeV0uYWRkcmVzc31gKVxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgYmFsYW5jZV91cmwgPSBgaHR0cHM6Ly9pYXBpLmNoYWluYWx5c2lzLmNvbS9jbHVzdGVycy8ke2lucHV0cy5hZGRyZXNzfS8ke2lucHV0cy5hc3NldH0vc3VtbWFyeT9vdXRwdXRBc3NldD0ke2lucHV0cy5vdXRwdXRBc3NldH1gXHJcbiAgICAgICAgY29uc3QgYmFsYW5jZV9jb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHtcclxuICAgICAgICAgICAgbWV0aG9kOiAnZ2V0JyxcclxuICAgICAgICAgICAgdXJsOiBiYWxhbmNlX3VybCxcclxuICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICAgICAgICAgICd0b2tlbic6IHRoaXMuY29uZmlnLnRva2VuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IGJhbGFuY2VfcmVzcG9uc2U6IEF4aW9zUmVzcG9uc2UgPSBhd2FpdCBheGlvcyhiYWxhbmNlX2NvbmZpZykuY2F0Y2goZXJyID0+IFByb21pc2UucmVqZWN0KGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzIDwgNTAwID8gbmV3IFdlYlNlcnZpY2VFcnJvcihlcnIucmVzcG9uc2UuZGF0YSkgOiBlcnIpKTtcclxuICAgICAgICBsZXQgaXRlbXNfdHJ1bmNhdGVkID0gZmFsc2VcclxuICAgICAgICBpZiAoYWRkcmVzc19yZXNwb25zZS5kYXRhLml0ZW1zLmxlbmd0aCA8IGJhbGFuY2VfcmVzcG9uc2UuZGF0YS5hZGRyZXNzQ291bnQpIHtcclxuICAgICAgICAgICAgaXRlbXNfdHJ1bmNhdGVkID0gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBleHBvc3VyZV9wYXRocyA9IFsnU0VORElORycsICdSRUNFSVZJTkcnLCAnU0VORElORy9zZXJ2aWNlcycsICdSRUNFSVZJTkcvc2VydmljZXMnXVxyXG4gICAgICAgIGxldCBleHBvc3VyZTogb2JqZWN0W10gPSBbXTtcclxuICAgICAgICBsZXQgZGVub3JtQWRkcmVzc0V4cG9zdXJlIDogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCB6ID0gMDsgeiA8IGV4cG9zdXJlX3BhdGhzLmxlbmd0aDsgeisrKSB7XHJcbiAgICAgICAgICAgIGxldCBleHBvc3VyZV91cmwgPSBgaHR0cHM6Ly9pYXBpLmNoYWluYWx5c2lzLmNvbS9leHBvc3VyZXMvY2x1c3RlcnMvJHtpbnB1dHMuYWRkcmVzc30vJHtpbnB1dHMuYXNzZXR9L2RpcmVjdGlvbnMvJHtleHBvc3VyZV9wYXRoc1t6XX0/b3V0cHV0QXNzZXQ9JHtpbnB1dHMub3V0cHV0QXNzZXR9YFxyXG4gICAgICAgICAgICBsZXQgZXhwb3N1cmVfY29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdnZXQnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBleHBvc3VyZV91cmwsXHJcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICAgICAgICAgICAgICAndG9rZW4nOiB0aGlzLmNvbmZpZy50b2tlblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBsZXQgZXhwb3N1cmVfcmVzcG9uc2U6IEF4aW9zUmVzcG9uc2UgPSBhd2FpdCBheGlvcyhleHBvc3VyZV9jb25maWcpLmNhdGNoKGVyciA9PiBQcm9taXNlLnJlamVjdChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA8IDUwMCA/IG5ldyBXZWJTZXJ2aWNlRXJyb3IoZXJyLnJlc3BvbnNlLmRhdGEpIDogZXJyKSk7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBiID0gMDsgZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5pbmRpcmVjdEV4cG9zdXJlLnNlcnZpY2VzLmxlbmd0aDsgYisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihleHBvc3VyZV9yZXNwb25zZS5kYXRhLmluZGlyZWN0RXhwb3N1cmUuc2VydmljZXNbYl0sIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2luZGlyZWN0IHNlcnZpY2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb246IGV4cG9zdXJlX3BhdGhzW3pdLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgZXhwb3N1cmUucHVzaChleHBvc3VyZV9yZXNwb25zZS5kYXRhLmluZGlyZWN0RXhwb3N1cmUuc2VydmljZXNbYl0pXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEuaW5kaXJlY3RFeHBvc3VyZS5zZXJ2aWNlc1tiXS5yb290QWRkcmVzcykge2Rlbm9ybUFkZHJlc3NFeHBvc3VyZS5wdXNoKGFkZHJlc3NfcmVzcG9uc2UuZGF0YS5hc3NldCArICc6JyArIGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEuaW5kaXJlY3RFeHBvc3VyZS5zZXJ2aWNlc1tiXS5yb290QWRkcmVzcyl9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge31cclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGIgPSAwOyBleHBvc3VyZV9yZXNwb25zZS5kYXRhLmRpcmVjdEV4cG9zdXJlLnNlcnZpY2VzLmxlbmd0aDsgYisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihleHBvc3VyZV9yZXNwb25zZS5kYXRhLmRpcmVjdEV4cG9zdXJlLnNlcnZpY2VzW2JdLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdkaXJlY3Qgc2VydmljZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogZXhwb3N1cmVfcGF0aHNbel0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICBleHBvc3VyZS5wdXNoKGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEuZGlyZWN0RXhwb3N1cmUuc2VydmljZXNbYl0pXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEuZGlyZWN0RXhwb3N1cmUuc2VydmljZXNbYl0ucm9vdEFkZHJlc3MpIHtkZW5vcm1BZGRyZXNzRXhwb3N1cmUucHVzaChhZGRyZXNzX3Jlc3BvbnNlLmRhdGEuYXNzZXQgKyAnOicgKyBleHBvc3VyZV9yZXNwb25zZS5kYXRhLmRpcmVjdEV4cG9zdXJlLnNlcnZpY2VzW2JdLnJvb3RBZGRyZXNzKX1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaCB7fVxyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgYiA9IDA7IGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEuaW5kaXJlY3RFeHBvc3VyZS5jYXRlZ29yaWVzLmxlbmd0aDsgYisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihleHBvc3VyZV9yZXNwb25zZS5kYXRhLmluZGlyZWN0RXhwb3N1cmUuY2F0ZWdvcmllc1tiXSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaW5kaXJlY3QgY2F0ZWdvcnknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb246IGV4cG9zdXJlX3BhdGhzW3pdLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgZXhwb3N1cmUucHVzaChleHBvc3VyZV9yZXNwb25zZS5kYXRhLmluZGlyZWN0RXhwb3N1cmUuY2F0ZWdvcmllc1tiXSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaCB7fVxyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgYiA9IDA7IGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEuZGlyZWN0RXhwb3N1cmUuY2F0ZWdvcmllcy5sZW5ndGg7IGIrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5kaXJlY3RFeHBvc3VyZS5jYXRlZ29yaWVzW2JdLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdkaXJlY3QgY2F0ZWdvcnknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb246IGV4cG9zdXJlX3BhdGhzW3pdLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgZXhwb3N1cmUucHVzaChleHBvc3VyZV9yZXNwb25zZS5kYXRhLmRpcmVjdEV4cG9zdXJlLmNhdGVnb3JpZXNbYl0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge31cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgY2x1c3RlcjogW3tcclxuICAgICAgICAgICAgICAgIGlkOiBhZGRyZXNzX3Jlc3BvbnNlLmRhdGEuYXNzZXQgKyAnOicgKyBhZGRyZXNzX3Jlc3BvbnNlLmRhdGEucm9vdEFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiBuYW1lX3Jlc3BvbnNlLmRhdGEuaXRlbXNbMF0ubmFtZSxcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBuYW1lX3Jlc3BvbnNlLmRhdGEuaXRlbXNbMF0uY2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICByb290QWRkcmVzczogYWRkcmVzc19yZXNwb25zZS5kYXRhLnJvb3RBZGRyZXNzLFxyXG4gICAgICAgICAgICAgICAgYXNzZXQ6IGFkZHJlc3NfcmVzcG9uc2UuZGF0YS5hc3NldCxcclxuICAgICAgICAgICAgICAgIGNsdXN0ZXJfYmFsYW5jZTogYmFsYW5jZV9yZXNwb25zZS5kYXRhLFxyXG4gICAgICAgICAgICAgICAgZXhwb3N1cmU6IGV4cG9zdXJlLFxyXG4gICAgICAgICAgICAgICAgc2lyZW5EZW5vcm1BZGRyZXNzOiBkZW5vcm1BZGRyZXNzLFxyXG4gICAgICAgICAgICAgICAgc2lyZW5EZW5vcm1BZGRyZXNzRXhwb3N1cmU6IChbLi4uIG5ldyBTZXQoZGVub3JtQWRkcmVzc0V4cG9zdXJlKV0pLFxyXG4gICAgICAgICAgICAgICAgaXRlbXNfdHJ1bmNhdGVkOiBpdGVtc190cnVuY2F0ZWQsXHJcbiAgICAgICAgICAgICAgICByYXdfaXRlbXM6IGFkZHJlc3NfcmVzcG9uc2UuZGF0YS5pdGVtcyxcclxuICAgICAgICAgICAgfV1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl19
