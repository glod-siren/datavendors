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
            } while (lastResult.nextPage !== null && address_response.data.items.length < 1000);
            if (lastResult.nextPage !== null || lastResult.nextPage !== '') {
                nextPage = lastResult.nextPage;
            }
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
                }],
            pagination: [{
                    nextPage: nextPage
                }]
        };
    }
}
exports.default = ClusterCombinedInfo;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9DbHVzdGVyQ29tYmluZWRJbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUZBQStJO0FBQy9JLGlDQUFpRTtBQUNqRSxNQUFxQixtQkFBb0IsU0FBUSx5Q0FBaUI7SUFBbEU7O1FBQ2EsU0FBSSxHQUFHLHVCQUF1QixDQUFDO1FBQy9CLGdCQUFXLEdBQWdCO1lBQ2hDLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtZQUN6QyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7WUFDdkMsV0FBVyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFO1NBQ2pELENBQUM7UUFDTyx3QkFBbUIsR0FBd0I7WUFDaEQsT0FBTyxFQUFFO2dCQUNMLGlCQUFpQixFQUFFO29CQUNmLGNBQWMsRUFBRSxNQUFNO29CQUN0QixlQUFlLEVBQUUsTUFBTTtvQkFDdkIsY0FBYyxFQUFFLE1BQU07b0JBQ3RCLGlCQUFpQixFQUFFLE1BQU07b0JBQ3pCLFNBQVMsRUFBRSxNQUFNO29CQUNqQixpQkFBaUIsRUFBRSxNQUFNO29CQUN6QixxQkFBcUIsRUFBRSxNQUFNO29CQUM3QixpQkFBaUIsRUFBRSxNQUFNO2lCQUM1QjtnQkFDRCxVQUFVLEVBQUU7b0JBQ1IsWUFBWSxFQUFFLE1BQU07b0JBQ3BCLE9BQU8sRUFBRSxNQUFNO2lCQUNsQjthQUNKO1lBQ0QsVUFBVSxFQUFFO2dCQUNSLFVBQVUsRUFBRSxTQUFTO2FBQ3hCO1NBQ0osQ0FBQztJQWtKTixDQUFDO0lBakpHLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFLWjtRQUNHLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFO1lBQUUsTUFBTSxDQUFDLFdBQVcsR0FBRyxRQUFRLENBQUE7U0FBRTtRQUMxRCxJQUFJLFFBQVEsR0FBRyx5Q0FBeUMsTUFBTSxD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QWdCLENBQUMsSUFBSSxDQUFDLEtBQUs7b0JBQ2xDLGVBQWUsRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJO29CQUN0QyxRQUFRLEVBQUUsUUFBUTtvQkFDbEIsa0JBQWtCLEVBQUUsYUFBYTtvQkFDakMsMEJBQTBCLEVBQUUsQ0FBQyxDQUFDLEdBQUksSUFBSSxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO29CQUNsRSxlQUFlLEVBQUUsZUFBZTtvQkFDaEMsU0FBUyxFQUFFLGdCQUFnQixDQUFDLElBQUksQ0FBQyxLQUFLO2lCQUN6QyxDQUFDO1lBQ0YsVUFBVSxFQUFFLENBQUM7b0JBQ1QsUUFBUSxFQUFFLFFBQVE7aUJBQ3JCLENBQUM7U0FDTCxDQUFBO0lBQ0wsQ0FBQztDQUNKO0FBN0tELHNDQTZLQyIsImZpbGUiOiJzcmMvQ2x1c3RlckNvbWJpbmVkSW5mby5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERhdGFJbmRleFJlc3VsdHMsIElucHV0U2NoZW1hLCBPdXRwdXRDb25maWd1cmF0aW9uLCBTZXJ2aWNlRGVmaW5pdGlvbiwgV2ViU2VydmljZUVycm9yIH0gZnJvbSAnQHNpcmVuc29sdXRpb25zL3dlYi1zZXJ2aWNlLWludGVyZmFjZSc7XHJcbmltcG9ydCBheGlvcywgeyBBeGlvc1JlcXVlc3RDb25maWcsIEF4aW9zUmVzcG9uc2UgfSBmcm9tICdheGlvcyc7XHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENsdXN0ZXJDb21iaW5lZEluZm8gZXh0ZW5kcyBTZXJ2aWNlRGVmaW5pdGlvbiB7XHJcbiAgICByZWFkb25seSBuYW1lID0gJ2NsdXN0ZXJfY29tYmluZWRfaW5mbyc7XHJcbiAgICByZWFkb25seSBpbnB1dFNjaGVtYTogSW5wdXRTY2hlbWEgPSB7XHJcbiAgICAgICAgYWRkcmVzczogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICAgICAgYXNzZXQ6IHsgdHlwZTogJ3RleHQnLCByZXF1aXJlZDogdHJ1ZSB9LFxyXG4gICAgICAgIG91dHB1dEFzc2V0OiB7IHR5cGU6ICd0ZXh0JywgcmVxdWlyZWQ6IGZhbHNlIH0sXHJcbiAgICB9O1xyXG4gICAgcmVhZG9ubHkgb3V0cHV0Q29uZmlndXJhdGlvbjogT3V0cHV0Q29uZmlndXJhdGlvbiA9IHtcclxuICAgICAgICBjbHVzdGVyOiB7XHJcbiAgICAgICAgICAgICdjbHVzdGVyX2JhbGFuY2UnOiB7XHJcbiAgICAgICAgICAgICAgICAnYWRkcmVzc0NvdW50JzogJ2xvbmcnLFxyXG4gICAgICAgICAgICAgICAgJ3RyYW5zZmVyQ291bnQnOiAnbG9uZycsXHJcbiAgICAgICAgICAgICAgICAnZGVwb3NpdENvdW50JzogJ2xvbmcnLFxyXG4gICAgICAgICAgICAgICAgJ3dpdGhkcmF3YWxDb3VudCc6ICdsb25nJyxcclxuICAgICAgICAgICAgICAgICdiYWxhbmNlJzogJ2xvbmcnLFxyXG4gICAgICAgICAgICAgICAgJ3RvdGFsU2VudEFtb3VudCc6ICdsb25nJyxcclxuICAgICAgICAgICAgICAgICd0b3RhbFJlY2VpdmVkQW1vdW50JzogJ2xvbmcnLFxyXG4gICAgICAgICAgICAgICAgJ3RvdGFsRmVlc0Ftb3VudCc6ICdsb25nJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAnZXhwb3N1cmUnOiB7XHJcbiAgICAgICAgICAgICAgICAncGVyY2VudGFnZSc6ICdsb25nJyxcclxuICAgICAgICAgICAgICAgICd2YWx1ZSc6ICdsb25nJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBwYWdpbmF0aW9uOiB7XHJcbiAgICAgICAgICAgICduZXh0UGFnZSc6ICdrZXl3b3JkJ1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBhc3luYyBpbnZva2UoaW5wdXRzOiB7XHJcbiAgICAgICAgYWRkcmVzczogc3RyaW5nLFxyXG4gICAgICAgIGFzc2V0OiBzdHJpbmcsXHJcbiAgICAgICAgb3V0cHV0QXNzZXQ6IHN0cmluZyxcclxuICAgICAgICBwYWdlOiBzdHJpbmdcclxuICAgIH0pOiBQcm9taXNlPERhdGFJbmRleFJlc3VsdHM+IHtcclxuICAgICAgICBpZiAoIWlucHV0cy5vdXRwdXRBc3NldCkgeyBpbnB1dHMub3V0cHV0QXNzZXQgPSAnTkFUSVZFJyB9XHJcbiAgICAgICAgbGV0IG5hbWVfdXJsID0gYGh0dHBzOi8vaWFwaS5jaGFpbmFseXNpcy5jb20vY2x1c3RlcnMvJHtpbnB1dHMuYWRkcmVzc30/ZmlsdGVyQXNzZXQ9JHtpbnB1dHMuYXNzZXR9YFxyXG4gICAgICAgIGNvbnN0IG5hbWVfY29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogJ2dldCcsXHJcbiAgICAgICAgICAgIHVybDogbmFtZV91cmwsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgICAgICAgICAndG9rZW4nOiB0aGlzLmNvbmZpZy50b2tlblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBuYW1lX3Jlc3BvbnNlOiBBeGlvc1Jlc3BvbnNlID0gYXdhaXQgYXhpb3MobmFtZV9jb25maWcpLmNhdGNoKGVyciA9PiBQcm9taXNlLnJlamVjdChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA8IDUwMCA/IG5ldyBXZWJTZXJ2aWNlRXJyb3IoZXJyLnJlc3BvbnNlLmRhdGEpIDogZXJyKSk7XHJcbiAgICAgICAgbGV0IGFkZHJlc3NfdXJsID0gYGh0dHBzOi8vaWFwaS5jaGFpbmFseXNpcy5jb20vY2x1c3RlcnMvJHtpbnB1dHMuYWRkcmVzc30vJHtpbnB1dHMuYXNzZXR9L2FkZHJlc3Nlcz9zaXplPTEwMGBcclxuICAgICAgICBpZiAoaW5wdXRzLnBhZ2UpIHtcclxuICAgICAgICAgICAgYWRkcmVzc191cmwgKyBhZGRyZXNzX3VybCArIGAmcGFnZT0ke2lucHV0cy5wYWdlfWBcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFpbnB1dHMucGFnZSkgeyBpbnB1dHMub3V0cHV0QXNzZXQgPSAnTkFUSVZFJyB9XHJcbiAgICAgICAgY29uc3QgYWRkcmVzc19jb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHtcclxuICAgICAgICAgICAgbWV0aG9kOiAnZ2V0JyxcclxuICAgICAgICAgICAgdXJsOiBhZGRyZXNzX3VybCxcclxuICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICAgICAgICAgICd0b2tlbic6IHRoaXMuY29uZmlnLnRva2VuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IGFkZHJlc3NfcmVzcG9uc2U6IEF4aW9zUmVzcG9uc2UgPSBhd2FpdCBheGlvcyhhZGRyZXNzX2NvbmZpZykuY2F0Y2goZXJyID0+IFByb21pc2UucmVqZWN0KGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzIDwgNTAwID8gbmV3IFdlYlNlcnZpY2VFcnJvcihlcnIucmVzcG9uc2UuZGF0YSkgOiBlcnIpKTtcclxuICAgICAgICBsZXQgbmV4dFBhZ2UgPSAnJztcclxuICAgICAgICBpZiAoYWRkcmVzc19yZXNwb25zZS5kYXRhLm5leHRQYWdlICE9IG51bGwpIHtcclxuICAgICAgICAgICAgbGV0IHBhZ2UgPSBhZGRyZXNzX3Jlc3BvbnNlLmRhdGEubmV4dFBhZ2VcclxuICAgICAgICAgICAgbGV0IGxhc3RSZXN1bHQgPSB7IG5leHRQYWdlOiAnJyB9O1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzdWJfdXJsID0gYGh0dHBzOi8vaWFwaS5jaGFpbmFseXNpcy5jb20vY2x1c3RlcnMvJHtpbnB1dHMuYWRkcmVzc30vJHtpbnB1dHMuYXNzZXR9L2FkZHJlc3Nlcz9zaXplPTEwMGAgKyBgJnBhZ2U9JHtwYWdlfWBcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJfY29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ2dldCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogc3ViX3VybCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd0b2tlbic6IHRoaXMuY29uZmlnLnRva2VuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1Yl9yZXNwb25zZTogQXhpb3NSZXNwb25zZSA9IGF3YWl0IGF4aW9zKHN1Yl9jb25maWcpLmNhdGNoKGVyciA9PiBQcm9taXNlLnJlamVjdChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA8IDUwMCA/IG5ldyBXZWJTZXJ2aWNlRXJyb3IoZXJyLnJlc3BvbnNlLmRhdGEpIDogZXJyKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFJlc3VsdCA9IHN1Yl9yZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgIGFkZHJlc3NfcmVzcG9uc2UuZGF0YS5pdGVtcy5wdXNoLmFwcGx5KGFkZHJlc3NfcmVzcG9uc2UuZGF0YS5pdGVtcywgc3ViX3Jlc3BvbnNlLmRhdGEuaXRlbXMpXHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIHsgbmV3IFdlYlNlcnZpY2VFcnJvcigncGFnaW5hdGlvbiBlcnJvcicpIH1cclxuICAgICAgICAgICAgfSB3aGlsZSAobGFzdFJlc3VsdC5uZXh0UGFnZSAhPT0gbnVsbCAmJiBhZGRyZXNzX3Jlc3BvbnNlLmRhdGEuaXRlbXMubGVuZ3RoIDwgMTAwMClcclxuICAgICAgICAgICAgaWYgKGxhc3RSZXN1bHQubmV4dFBhZ2UgIT09IG51bGwgfHwgbGFzdFJlc3VsdC5uZXh0UGFnZSAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgIG5leHRQYWdlID0gbGFzdFJlc3VsdC5uZXh0UGFnZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGRlbm9ybUFkZHJlc3M6IHN0cmluZ1tdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCBhZGRyZXNzX3Jlc3BvbnNlLmRhdGEuaXRlbXMubGVuZ3RoOyB5KyspIHtcclxuICAgICAgICAgICAgZGVub3JtQWRkcmVzcy5wdXNoKGAke2FkZHJlc3NfcmVzcG9uc2UuZGF0YS5hc3NldH06JHthZGRyZXNzX3Jlc3BvbnNlLmRhdGEuaXRlbXNbeV0uYWRkcmVzc31gKVxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgYmFsYW5jZV91cmwgPSBgaHR0cHM6Ly9pYXBpLmNoYWluYWx5c2lzLmNvbS9jbHVzdGVycy8ke2lucHV0cy5hZGRyZXNzfS8ke2lucHV0cy5hc3NldH0vc3VtbWFyeT9vdXRwdXRBc3NldD0ke2lucHV0cy5vdXRwdXRBc3NldH1gXHJcbiAgICAgICAgY29uc3QgYmFsYW5jZV9jb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHtcclxuICAgICAgICAgICAgbWV0aG9kOiAnZ2V0JyxcclxuICAgICAgICAgICAgdXJsOiBiYWxhbmNlX3VybCxcclxuICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICAgICAgICAgICd0b2tlbic6IHRoaXMuY29uZmlnLnRva2VuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IGJhbGFuY2VfcmVzcG9uc2U6IEF4aW9zUmVzcG9uc2UgPSBhd2FpdCBheGlvcyhiYWxhbmNlX2NvbmZpZykuY2F0Y2goZXJyID0+IFByb21pc2UucmVqZWN0KGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzIDwgNTAwID8gbmV3IFdlYlNlcnZpY2VFcnJvcihlcnIucmVzcG9uc2UuZGF0YSkgOiBlcnIpKTtcclxuICAgICAgICBsZXQgaXRlbXNfdHJ1bmNhdGVkID0gZmFsc2VcclxuICAgICAgICBpZiAoYWRkcmVzc19yZXNwb25zZS5kYXRhLml0ZW1zLmxlbmd0aCA8IGJhbGFuY2VfcmVzcG9uc2UuZGF0YS5hZGRyZXNzQ291bnQpIHtcclxuICAgICAgICAgICAgaXRlbXNfdHJ1bmNhdGVkID0gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBleHBvc3VyZV9wYXRocyA9IFsnU0VORElORycsICdSRUNFSVZJTkcnLCAnU0VORElORy9zZXJ2aWNlcycsICdSRUNFSVZJTkcvc2VydmljZXMnXVxyXG4gICAgICAgIGxldCBleHBvc3VyZTogb2JqZWN0W10gPSBbXTtcclxuICAgICAgICBsZXQgZGVub3JtQWRkcmVzc0V4cG9zdXJlOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IHogPSAwOyB6IDwgZXhwb3N1cmVfcGF0aHMubGVuZ3RoOyB6KyspIHtcclxuICAgICAgICAgICAgbGV0IGV4cG9zdXJlX3VybCA9IGBodHRwczovL2lhcGkuY2hhaW5hbHlzaXMuY29tL2V4cG9zdXJlcy9jbHVzdGVycy8ke2lucHV0cy5hZGRyZXNzfS8ke2lucHV0cy5hc3NldH0vZGlyZWN0aW9ucy8ke2V4cG9zdXJlX3BhdGhzW3pdfT9vdXRwdXRBc3NldD0ke2lucHV0cy5vdXRwdXRBc3NldH1gXHJcbiAgICAgICAgICAgIGxldCBleHBvc3VyZV9jb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ2dldCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGV4cG9zdXJlX3VybCxcclxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgICAgICAgICAgICAgICd0b2tlbic6IHRoaXMuY29uZmlnLnRva2VuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGxldCBleHBvc3VyZV9yZXNwb25zZTogQXhpb3NSZXNwb25zZSA9IGF3YWl0IGF4aW9zKGV4cG9zdXJlX2NvbmZpZykuY2F0Y2goZXJyID0+IFByb21pc2UucmVqZWN0KGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzIDwgNTAwID8gbmV3IFdlYlNlcnZpY2VFcnJvcihlcnIucmVzcG9uc2UuZGF0YSkgOiBlcnIpKTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGIgPSAwOyBleHBvc3VyZV9yZXNwb25zZS5kYXRhLmluZGlyZWN0RXhwb3N1cmUuc2VydmljZXMubGVuZ3RoOyBiKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEuaW5kaXJlY3RFeHBvc3VyZS5zZXJ2aWNlc1tiXSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaW5kaXJlY3Qgc2VydmljZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogZXhwb3N1cmVfcGF0aHNbel0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICBleHBvc3VyZS5wdXNoKGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEuaW5kaXJlY3RFeHBvc3VyZS5zZXJ2aWNlc1tiXSlcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5pbmRpcmVjdEV4cG9zdXJlLnNlcnZpY2VzW2JdLnJvb3RBZGRyZXNzKSB7IGRlbm9ybUFkZHJlc3NFeHBvc3VyZS5wdXNoKGFkZHJlc3NfcmVzcG9uc2UuZGF0YS5hc3NldCArICc6JyArIGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEuaW5kaXJlY3RFeHBvc3VyZS5zZXJ2aWNlc1tiXS5yb290QWRkcmVzcykgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIHsgfVxyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgYiA9IDA7IGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEuZGlyZWN0RXhwb3N1cmUuc2VydmljZXMubGVuZ3RoOyBiKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEuZGlyZWN0RXhwb3N1cmUuc2VydmljZXNbYl0sIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2RpcmVjdCBzZXJ2aWNlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uOiBleHBvc3VyZV9wYXRoc1t6XSxcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIGV4cG9zdXJlLnB1c2goZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5kaXJlY3RFeHBvc3VyZS5zZXJ2aWNlc1tiXSlcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5kaXJlY3RFeHBvc3VyZS5zZXJ2aWNlc1tiXS5yb290QWRkcmVzcykgeyBkZW5vcm1BZGRyZXNzRXhwb3N1cmUucHVzaChhZGRyZXNzX3Jlc3BvbnNlLmRhdGEuYXNzZXQgKyAnOicgKyBleHBvc3VyZV9yZXNwb25zZS5kYXRhLmRpcmVjdEV4cG9zdXJlLnNlcnZpY2VzW2JdLnJvb3RBZGRyZXNzKSB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggeyB9XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBiID0gMDsgZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5pbmRpcmVjdEV4cG9zdXJlLmNhdGVnb3JpZXMubGVuZ3RoOyBiKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEuaW5kaXJlY3RFeHBvc3VyZS5jYXRlZ29yaWVzW2JdLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbmRpcmVjdCBjYXRlZ29yeScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogZXhwb3N1cmVfcGF0aHNbel0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICBleHBvc3VyZS5wdXNoKGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEuaW5kaXJlY3RFeHBvc3VyZS5jYXRlZ29yaWVzW2JdKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIHsgfVxyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgYiA9IDA7IGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEuZGlyZWN0RXhwb3N1cmUuY2F0ZWdvcmllcy5sZW5ndGg7IGIrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5kaXJlY3RFeHBvc3VyZS5jYXRlZ29yaWVzW2JdLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdkaXJlY3QgY2F0ZWdvcnknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb246IGV4cG9zdXJlX3BhdGhzW3pdLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgZXhwb3N1cmUucHVzaChleHBvc3VyZV9yZXNwb25zZS5kYXRhLmRpcmVjdEV4cG9zdXJlLmNhdGVnb3JpZXNbYl0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggeyB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGNsdXN0ZXI6IFt7XHJcbiAgICAgICAgICAgICAgICBpZDogYWRkcmVzc19yZXNwb25zZS5kYXRhLmFzc2V0ICsgJzonICsgYWRkcmVzc19yZXNwb25zZS5kYXRhLnJvb3RBZGRyZXNzLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogbmFtZV9yZXNwb25zZS5kYXRhLml0ZW1zWzBdLm5hbWUsXHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogbmFtZV9yZXNwb25zZS5kYXRhLml0ZW1zWzBdLmNhdGVnb3J5LFxyXG4gICAgICAgICAgICAgICAgcm9vdEFkZHJlc3M6IGFkZHJlc3NfcmVzcG9uc2UuZGF0YS5yb290QWRkcmVzcyxcclxuICAgICAgICAgICAgICAgIGFzc2V0OiBhZGRyZXNzX3Jlc3BvbnNlLmRhdGEuYXNzZXQsXHJcbiAgICAgICAgICAgICAgICBjbHVzdGVyX2JhbGFuY2U6IGJhbGFuY2VfcmVzcG9uc2UuZGF0YSxcclxuICAgICAgICAgICAgICAgIGV4cG9zdXJlOiBleHBvc3VyZSxcclxuICAgICAgICAgICAgICAgIHNpcmVuRGVub3JtQWRkcmVzczogZGVub3JtQWRkcmVzcyxcclxuICAgICAgICAgICAgICAgIHNpcmVuRGVub3JtQWRkcmVzc0V4cG9zdXJlOiAoWy4uLiBuZXcgU2V0KGRlbm9ybUFkZHJlc3NFeHBvc3VyZSldKSxcclxuICAgICAgICAgICAgICAgIGl0ZW1zX3RydW5jYXRlZDogaXRlbXNfdHJ1bmNhdGVkLFxyXG4gICAgICAgICAgICAgICAgcmF3X2l0ZW1zOiBhZGRyZXNzX3Jlc3BvbnNlLmRhdGEuaXRlbXMsXHJcbiAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICBwYWdpbmF0aW9uOiBbe1xyXG4gICAgICAgICAgICAgICAgbmV4dFBhZ2U6IG5leHRQYWdlXHJcbiAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiJdfQ==
