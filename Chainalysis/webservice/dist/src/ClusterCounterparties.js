"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web_service_interface_1 = require("@sirensolutions/web-service-interface");
const axios_1 = require("axios");
const cryptoRegexPatterns = {
    'BTC': '^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$',
    'ETH': '^(?:0x)?[a-fA-F0-9]{40,42}$',
    'XRP': '^r[0-9a-zA-Z]{24,34}$',
    'BNB': '^bnb[0-9a-zA-Z]{38}$',
    'ADA': '^Ae2tdPwUPEYy{44}$',
    'SOL': '^So[1-9][0-9a-zA-Z]{48}$',
    'DOGE': '^D[0-9a-fA-F]{32}$',
    'TRX': '^T[0-9a-fA-F]{33}$',
    'LTC': '^L[a-km-zA-HJ-NP-Z1-9]{26,33}$',
    'DOT': '^1[a-zA-Z0-9]{31}$',
    'LINK': '^0x[a-fA-F0-9]{40}$',
    'XLM': '^G[A-Z0-9]{55}$',
    'XMR': '^4[0-9A-Za-z]{94}$',
    'ATOM': '^cosmos1[a-z0-9]{38}$',
};
class ClusterCounterparties extends web_service_interface_1.ServiceDefinition {
    constructor() {
        super(...arguments);
        this.name = 'cluster_counterparties';
        this.inputSchema = {
            address: { type: 'text', required: true },
            asset: { type: 'text', required: false },
            outputAsset: { type: 'text', required: false },
            page: { type: 'text', required: false },
            page_limit: { type: 'float', required: false },
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
                'nextPage': 'keyword',
                'totalresults': 'long'
            }
        };
    }
    inferAssetType(address) {
        for (const [asset, pattern] of Object.entries(cryptoRegexPatterns)) {
            const regex = new RegExp(pattern);
            if (regex.test(address)) {
                return asset;
            }
        }
        throw new web_service_interface_1.WebServiceError('Could not infer asset type from address');
    }
    async invoke(inputs) {
        if (!inputs.asset) {
            inputs.asset = this.inferAssetType(inputs.address);
        }
        if (!inputs.outputAsset) {
            inputs.outputAsset = 'NATIVE';
        }
        let url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/counterparties?outputAsset=${inputs.outputAsset}`;
        if (inputs.page) {
            url += `?page=${inputs.page}`;
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
        let truncated = false;
        let nextPage = '';
        let pageLimit = inputs.page_limit || Number.MAX_SAFE_INTEGER;
        if (response.data.nextPage != null) {
            let page = response.data.nextPage;
            let lastResult = { nextPage: '' };
            let pagesFetched = 0;
            do {
                try {
                    let sub_url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/counterparties?outputAsset=${inputs.outputAsset}&page=${page}`;
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
                    page = lastResult.nextPage;
                    pagesFetched += 1;
                }
                catch {
                    throw new web_service_interface_1.WebServiceError('pagination error');
                }
            } while (lastResult.nextPage !== null && pagesFetched < pageLimit);
            if (lastResult.nextPage !== null) {
                truncated = true;
                nextPage = lastResult.nextPage;
            }
        }
        for (let y = 0; y < response.data.items.length; y++) {
            Object.assign(response.data.items[y], {
                id: `${response.data.items[y].asset}:${inputs.address}:${response.data.items[y].rootAddress}`,
                inputAddress: inputs.address,
            });
        }
        return {
            counterparties: response.data.items,
            pagination: [{
                    totalresults: response.data.items.length,
                    nextPage: nextPage
                }]
        };
    }
}
exports.default = ClusterCounterparties;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9DbHVzdGVyQ291bnRlcnBhcnRpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxpRkFBK0k7QUFDL0ksaUNBQWlFO0FBRWpFLE1BQU0sbUJBQW1CLEdBQUc7SUFDMUIsS0FBSyxFQUFFLHNDQUFzQztJQUM3QyxLQUFLLEVBQUUsNkJBQTZCO0lBQ3BDLEtBQUssRUFBRSx1QkFBdUI7SUFDOUIsS0FBSyxFQUFFLHNCQUFzQjtJQUM3QixLQUFLLEVBQUUsb0JBQW9CO0lBQzNCLEtBQUssRUFBRSwwQkFBMEI7SUFDakMsTUFBTSxFQUFFLG9CQUFvQjtJQUM1QixLQUFLLEVBQUUsb0JBQW9CO0lBQzNCLEtBQUssRUFBRSxnQ0FBZ0M7SUFDdkMsS0FBSyxFQUFFLG9CQUFvQjtJQUMzQixNQUFNLEVBQUUscUJBQXFCO0lBQzdCLEtBQUssRUFBRSxpQkFBaUI7SUFDeEIsS0FBSyxFQUFFLG9CQUFvQjtJQUMzQixNQUFNLEVBQUUsdUJBQXVCO0NBRWhDLENBQUM7QUFFRixNQUFxQixxQkFBc0IsU0FBUSx5Q0FBaUI7SUFBcEU7O1FBQ1csU0FBSSxHQUFHLHdCQUF3QixDQUFDO1FBQ2hDLGdCQUFXLEdBQWdCO1lBQ2xDLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtZQUN6QyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUU7WUFDeEMsV0FBVyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFO1lBQzlDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRTtZQUN2QyxVQUFVLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUU7U0FDL0MsQ0FBQztRQUNPLHdCQUFtQixHQUF3QjtZQUNsRCxjQUFjLEVBQUU7Z0JB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LEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDakQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDbEMsRUFBRSxFQUFFLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLE1BQU0sQ0FBQyxPQUFPLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFO2dCQUM3RixZQUFZLEVBQUUsTUFBTSxDQUFDLE9BQU87YUFDL0IsQ0FBQyxDQUFDO1NBQ047UUFDRCxPQUFPO1lBQ0wsY0FBYyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSztZQUNuQyxVQUFVLEVBQUUsQ0FBQztvQkFDWCxZQUFZLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTTtvQkFDeEMsUUFBUSxFQUFFLFFBQVE7aUJBQ25CLENBQUM7U0FDSCxDQUFBO0lBQ0gsQ0FBQztDQUNGO0FBcEdELHdDQW9HQyIsImZpbGUiOiJzcmMvQ2x1c3RlckNvdW50ZXJwYXJ0aWVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGF0YUluZGV4UmVzdWx0cywgSW5wdXRTY2hlbWEsIE91dHB1dENvbmZpZ3VyYXRpb24sIFNlcnZpY2VEZWZpbml0aW9uLCBXZWJTZXJ2aWNlRXJyb3IgfSBmcm9tICdAc2lyZW5zb2x1dGlvbnMvd2ViLXNlcnZpY2UtaW50ZXJmYWNlJztcclxuaW1wb3J0IGF4aW9zLCB7IEF4aW9zUmVxdWVzdENvbmZpZywgQXhpb3NSZXNwb25zZSB9IGZyb20gJ2F4aW9zJztcclxuXHJcbmNvbnN0IGNyeXB0b1JlZ2V4UGF0dGVybnMgPSB7XHJcbiAgJ0JUQyc6ICdeKGJjMXxbMTNdKVthLXpBLUhKLU5QLVowLTldezI1LDM5fSQnLCAvLyBCaXRjb2luIChCVEMpIGluY2x1ZGluZyBiZWNoMzIgYWRkcmVzc2VzXHJcbiAgJ0VUSCc6ICdeKD86MHgpP1thLWZBLUYwLTldezQwLDQyfSQnLCAvLyBFdGhlcmV1bVxyXG4gICdYUlAnOiAnXnJbMC05YS16QS1aXXsyNCwzNH0kJywgLy8gUmlwcGxlXHJcbiAgJ0JOQic6ICdeYm5iWzAtOWEtekEtWl17Mzh9JCcsIC8vIEJpbmFuY2UgQ29pblxyXG4gICdBREEnOiAnXkFlMnRkUHdVUEVZeXs0NH0kJywgLy8gQ2FyZGFub1xyXG4gICdTT0wnOiAnXlNvWzEtOV1bMC05YS16QS1aXXs0OH0kJywgLy8gU29sYW5hXHJcbiAgJ0RPR0UnOiAnXkRbMC05YS1mQS1GXXszMn0kJywgLy8gRG9nZWNvaW5cclxuICAnVFJYJzogJ15UWzAtOWEtZkEtRl17MzN9JCcsIC8vIFRyb25cclxuICAnTFRDJzogJ15MW2Eta20tekEtSEotTlAtWjEtOV17MjYsMzN9JCcsIC8vIExpdGVjb2luXHJcbiAgJ0RPVCc6ICdeMVthLXpBLVowLTldezMxfSQnLCAvLyBQb2xrYWRvdFxyXG4gICdMSU5LJzogJ14weFthLWZBLUYwLTldezQwfSQnLCAvLyBDaGFpbmxpbmtcclxuICAnWExNJzogJ15HW0EtWjAtOV17NTV9JCcsIC8vIFN0ZWxsYXIgTHVtZW5zXHJcbiAgJ1hNUic6ICdeNFswLTlBLVphLXpdezk0fSQnLCAvLyBNb25lcm9cclxuICAnQVRPTSc6ICdeY29zbW9zMVthLXowLTldezM4fSQnLCAvLyBDb3Ntb3NcclxuICAvLyBBZGQgbW9yZSBwYXR0ZXJucyBoZXJlIGZvciBvdGhlciBjcnlwdG9jdXJyZW5jaWVzXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDbHVzdGVyQ291bnRlcnBhcnRpZXMgZXh0ZW5kcyBTZXJ2aWNlRGVmaW5pdGlvbiB7XHJcbiAgcmVhZG9ubHkgbmFtZSA9ICdjbHVzdGVyX2NvdW50ZXJwYXJ0aWVzJztcclxuICByZWFkb25seSBpbnB1dFNjaGVtYTogSW5wdXRTY2hlbWEgPSB7XHJcbiAgICBhZGRyZXNzOiB7IHR5cGU6ICd0ZXh0JywgcmVxdWlyZWQ6IHRydWUgfSxcclxuICAgIGFzc2V0OiB7IHR5cGU6ICd0ZXh0JywgcmVxdWlyZWQ6IGZhbHNlIH0sXHJcbiAgICBvdXRwdXRBc3NldDogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiBmYWxzZSB9LFxyXG4gICAgcGFnZTogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiBmYWxzZSB9LFxyXG4gICAgcGFnZV9saW1pdDogeyB0eXBlOiAnZmxvYXQnLCByZXF1aXJlZDogZmFsc2UgfSxcclxuICB9O1xyXG4gIHJlYWRvbmx5IG91dHB1dENvbmZpZ3VyYXRpb246IE91dHB1dENvbmZpZ3VyYXRpb24gPSB7XHJcbiAgICBjb3VudGVycGFydGllczoge1xyXG4gICAgICAncmF3JzogJ3RleHQnLFxyXG4gICAgICAnZmlyc3RUcmFuc2ZlclRpbWVzdGFtcCc6ICdkYXRlJyxcclxuICAgICAgJ2xhc3RUcmFuc2ZlclRpbWVzdGFtcCc6ICdkYXRlJyxcclxuICAgICAgJ3NlbnRBbW91bnQnOiAnbG9uZycsXHJcbiAgICAgICdyZWNlaXZlZEFtb3VudCc6ICdsb25nJyxcclxuICAgICAgJ3RyYW5zZmVycyc6ICdsb25nJ1xyXG4gICAgfSxcclxuICAgIHBhZ2luYXRpb246IHtcclxuICAgICAgJ25leHRQYWdlJzogJ2tleXdvcmQnLFxyXG4gICAgICAndG90YWxyZXN1bHRzJzogJ2xvbmcnXHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgaW5mZXJBc3NldFR5cGUoYWRkcmVzczogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIGZvciAoY29uc3QgW2Fzc2V0LCBwYXR0ZXJuXSBvZiBPYmplY3QuZW50cmllcyhjcnlwdG9SZWdleFBhdHRlcm5zKSkge1xyXG4gICAgICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAocGF0dGVybik7XHJcbiAgICAgIGlmIChyZWdleC50ZXN0KGFkZHJlc3MpKSB7XHJcbiAgICAgICAgcmV0dXJuIGFzc2V0O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aHJvdyBuZXcgV2ViU2VydmljZUVycm9yKCdDb3VsZCBub3QgaW5mZXIgYXNzZXQgdHlwZSBmcm9tIGFkZHJlc3MnKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGludm9rZShpbnB1dHM6IHtcclxuICAgIGFkZHJlc3M6IHN0cmluZyxcclxuICAgIGFzc2V0Pzogc3RyaW5nLFxyXG4gICAgb3V0cHV0QXNzZXQ/OiBzdHJpbmcsXHJcbiAgICBwYWdlPzogc3RyaW5nLFxyXG4gICAgcGFnZV9saW1pdD86IG51bWJlclxyXG4gIH0pOiBQcm9taXNlPERhdGFJbmRleFJlc3VsdHM+IHtcclxuICAgIGlmICghaW5wdXRzLmFzc2V0KSB7IGlucHV0cy5hc3NldCA9IHRoaXMuaW5mZXJBc3NldFR5cGUoaW5wdXRzLmFkZHJlc3MpOyB9XHJcbiAgICBpZiAoIWlucHV0cy5vdXRwdXRBc3NldCkgeyBpbnB1dHMub3V0cHV0QXNzZXQgPSAnTkFUSVZFJyB9XHJcbiAgICBsZXQgdXJsID0gYGh0dHBzOi8vaWFwaS5jaGFpbmFseXNpcy5jb20vY2x1c3RlcnMvJHtpbnB1dHMuYWRkcmVzc30vJHtpbnB1dHMuYXNzZXR9L2NvdW50ZXJwYXJ0aWVzP291dHB1dEFzc2V0PSR7aW5wdXRzLm91dHB1dEFzc2V0fWBcclxuICAgIGlmIChpbnB1dHMucGFnZSkge1xyXG4gICAgICB1cmwgKz0gYD9wYWdlPSR7aW5wdXRzLnBhZ2V9YFxyXG4gICAgfVxyXG4gICAgY29uc3QgY29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB7XHJcbiAgICAgIG1ldGhvZDogJ2dldCcsXHJcbiAgICAgIHVybDogdXJsLFxyXG4gICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICAndG9rZW4nOiB0aGlzLmNvbmZpZy50b2tlblxyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgY29uc3QgcmVzcG9uc2U6IEF4aW9zUmVzcG9uc2UgPSBhd2FpdCBheGlvcyhjb25maWcpLmNhdGNoKGVyciA9PiBQcm9taXNlLnJlamVjdChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA8IDUwMCA/IG5ldyBXZWJTZXJ2aWNlRXJyb3IoZXJyLnJlc3BvbnNlLmRhdGEpIDogZXJyKSk7XHJcbiAgICBsZXQgdHJ1bmNhdGVkID0gZmFsc2U7XHJcbiAgICBsZXQgbmV4dFBhZ2UgPSAnJztcclxuICAgIGxldCBwYWdlTGltaXQgPSBpbnB1dHMucGFnZV9saW1pdCB8fCBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcclxuICAgIGlmIChyZXNwb25zZS5kYXRhLm5leHRQYWdlICE9IG51bGwpIHtcclxuICAgICAgbGV0IHBhZ2UgPSByZXNwb25zZS5kYXRhLm5leHRQYWdlO1xyXG4gICAgICBsZXQgbGFzdFJlc3VsdCA9IHsgbmV4dFBhZ2U6ICcnIH07XHJcbiAgICAgIGxldCBwYWdlc0ZldGNoZWQgPSAwO1xyXG4gICAgICBkbyB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGxldCBzdWJfdXJsID0gYGh0dHBzOi8vaWFwaS5jaGFpbmFseXNpcy5jb20vY2x1c3RlcnMvJHtpbnB1dHMuYWRkcmVzc30vJHtpbnB1dHMuYXNzZXR9L2NvdW50ZXJwYXJ0aWVzP291dHB1dEFzc2V0PSR7aW5wdXRzLm91dHB1dEFzc2V0fSZwYWdlPSR7cGFnZX1gO1xyXG4gICAgICAgICAgY29uc3Qgc3ViX2NvbmZpZzogQXhpb3NSZXF1ZXN0Q29uZmlnID0ge1xyXG4gICAgICAgICAgICBtZXRob2Q6ICdnZXQnLFxyXG4gICAgICAgICAgICB1cmw6IHN1Yl91cmwsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgICAgICAgICd0b2tlbic6IHRoaXMuY29uZmlnLnRva2VuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH07XHJcbiAgICAgICAgICBjb25zdCBzdWJfcmVzcG9uc2U6IEF4aW9zUmVzcG9uc2UgPSBhd2FpdCBheGlvcyhzdWJfY29uZmlnKS5jYXRjaChlcnIgPT4gUHJvbWlzZS5yZWplY3QoZXJyLnJlc3BvbnNlICYmIGVyci5yZXNwb25zZS5zdGF0dXMgPCA1MDAgPyBuZXcgV2ViU2VydmljZUVycm9yKGVyci5yZXNwb25zZS5kYXRhKSA6IGVycikpO1xyXG4gICAgICAgICAgbGFzdFJlc3VsdCA9IHN1Yl9yZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgcmVzcG9uc2UuZGF0YS5pdGVtcy5wdXNoLmFwcGx5KHJlc3BvbnNlLmRhdGEuaXRlbXMsIHN1Yl9yZXNwb25zZS5kYXRhLml0ZW1zKTtcclxuICAgICAgICAgIHBhZ2UgPSBsYXN0UmVzdWx0Lm5leHRQYWdlO1xyXG4gICAgICAgICAgcGFnZXNGZXRjaGVkICs9IDE7XHJcbiAgICAgICAgfSBjYXRjaCB7IHRocm93IG5ldyBXZWJTZXJ2aWNlRXJyb3IoJ3BhZ2luYXRpb24gZXJyb3InKSB9XHJcbiAgICAgIH0gd2hpbGUgKGxhc3RSZXN1bHQubmV4dFBhZ2UgIT09IG51bGwgJiYgcGFnZXNGZXRjaGVkIDwgcGFnZUxpbWl0KTtcclxuICAgICAgaWYgKGxhc3RSZXN1bHQubmV4dFBhZ2UgIT09IG51bGwpIHtcclxuICAgICAgICB0cnVuY2F0ZWQgPSB0cnVlO1xyXG4gICAgICAgIG5leHRQYWdlID0gbGFzdFJlc3VsdC5uZXh0UGFnZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZm9yIChsZXQgeSA9IDA7IHkgPCByZXNwb25zZS5kYXRhLml0ZW1zLmxlbmd0aDsgeSsrKSB7XHJcbiAgICAgICAgT2JqZWN0LmFzc2lnbihyZXNwb25zZS5kYXRhLml0ZW1zW3ldLCB7XHJcbiAgICAgICAgICAgIGlkOiBgJHtyZXNwb25zZS5kYXRhLml0ZW1zW3ldLmFzc2V0fToke2lucHV0cy5hZGRyZXNzfToke3Jlc3BvbnNlLmRhdGEuaXRlbXNbeV0ucm9vdEFkZHJlc3N9YCxcclxuICAgICAgICAgICAgaW5wdXRBZGRyZXNzOiBpbnB1dHMuYWRkcmVzcyxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvdW50ZXJwYXJ0aWVzOiByZXNwb25zZS5kYXRhLml0ZW1zLFxyXG4gICAgICBwYWdpbmF0aW9uOiBbe1xyXG4gICAgICAgIHRvdGFscmVzdWx0czogcmVzcG9uc2UuZGF0YS5pdGVtcy5sZW5ndGgsXHJcbiAgICAgICAgbmV4dFBhZ2U6IG5leHRQYWdlXHJcbiAgICAgIH1dXHJcbiAgICB9XHJcbiAgfVxyXG59Il19
