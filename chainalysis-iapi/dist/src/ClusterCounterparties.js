"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web_service_interface_1 = require("@sirensolutions/web-service-interface");
const axios_1 = require("axios");
class ClusterCounterparties extends web_service_interface_1.ServiceDefinition {
    constructor() {
        super(...arguments);
        this.name = 'cluster_counterparties';
        this.inputSchema = {
            address: { type: 'text', required: true },
            asset: { type: 'text', required: true },
            outputAsset: { type: 'text', required: false },
        };
        this.outputConfiguration = {
            counterparties: {
                'raw': 'text',
                'firstTransferTimestamp': 'date',
                'lastTransferTimestamp': 'date',
                'sentAmount': 'long',
                'receivedAmount': 'long',
                'transfers': 'long'
            }
        };
    }
    async invoke(inputs) {
        if (!inputs.outputAsset) {
            inputs.outputAsset = 'NATIVE';
        }
        let url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/counterparties?outputAsset=${inputs.outputAsset}&size=200`;
        const config = {
            method: 'get',
            url: url,
            headers: {
                'Accept': 'application/json',
                'token': this.config.token
            }
        };
        const response = await axios_1.default(config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new web_service_interface_1.WebServiceError(err.response.data) : err));
        //let items = response.data.items
        let truncated = false;
        if (response.data.nextPage != null) {
            let page = response.data.nextPage;
            let lastResult = { nextPage: '' };
            do {
                try {
                    let sub_url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/counterparties?outputAsset=${inputs.outputAsset}&size=200&page=${page}`;
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
                }
                catch {
                    new web_service_interface_1.WebServiceError('pagination error');
                }
            } while (lastResult.nextPage !== null && response.data.items < 10000);
            if (lastResult.nextPage !== null || lastResult.nextPage !== '') {
                truncated = true;
            }
        }
        for (let y = 0; y < response.data.items.length; y++) {
            Object.assign(response.data.items[y], {
                id: `${response.data.items[y].asset}:${inputs.address}:${response.data.items[y].rootAddress}`,
                inputAddress: inputs.address,
                sirenDenormPartyInput: `${response.data.items[y].asset}:${inputs.address}`,
                sirenDenormPartyOutput: `${response.data.items[y].asset}:${response.data.items[y].rootAddress}`,
                truncated: truncated
            });
        }
        return {
            counterparties: response.data.items
        };
    }
}
exports.default = ClusterCounterparties;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9DbHVzdGVyQ291bnRlcnBhcnRpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxpRkFBK0k7QUFDL0ksaUNBQWlFO0FBQ2pFLE1BQXFCLHFCQUFzQixTQUFRLHlDQUFpQjtJQUFwRTs7UUFDVyxTQUFJLEdBQUcsd0JBQXdCLENBQUM7UUFDaEMsZ0JBQVcsR0FBZ0I7WUFDbEMsT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFO1lBQ3pDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtZQUN2QyxXQUFXLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUU7U0FDL0MsQ0FBQztRQUNPLHdCQUFtQixHQUF3QjtZQUNsRCxjQUFjLEVBQUU7Z0JBQ1osS0FBSyxFQUFFLE1BQU07Z0JBQ2Isd0JBQXdCLEVBQUUsTUFBTTtnQkFDaEMsdUJBQXVCLEVBQUUsTUFBTTtnQkFDL0IsWUFBWSxFQUFFLE1BQU07Z0JBQ3BCLGdCQUFnQixFQUFFLE1BQU07Z0JBQ3hCLFdBQVcsRUFBRSxNQUFNO2FBQ3RCO1NBQ0YsQ0FBQztJQXVESixDQUFDO0lBdERDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFJWjtRQUNDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFO1lBQUMsTUFBTSxDQUFDLFdBQVcsR0FBRyxRQUFRLENBQUE7U0FBQztRQUN4RCxJQUFJLEdBQUcsR0FBRyx5Q0FBeUMsTUFBTSxDQUFDLE9BQU8sSUFBSSxNQUFNLENBQUMsS0FBSywrQkFBK0IsTUFBTSxDQUFDLFdBQVcsV0FBVyxDQUFBO1FBQzdJLE1BQU0sTUFBTSxHQUF1QjtZQUNqQyxNQUFNLEVBQUUsS0FBSztZQUNiLEdBQUcsRUFBRSxHQUFHO1lBQ1IsT0FBTyxFQUFFO2dCQUNQLFFBQVEsRUFBRSxrQkFBa0I7Z0JBQzVCLE9BQU8sRUFB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LE9BQU87Z0JBQzVCLHFCQUFxQixFQUFFLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUU7Z0JBQzFFLHNCQUFzQixFQUFFLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRTtnQkFDL0YsU0FBUyxFQUFFLFNBQVM7YUFDckIsQ0FBQyxDQUFBO1NBQ0g7UUFDRCxPQUFPO1lBQ0gsY0FBYyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSztTQUN0QyxDQUFBO0lBQ0gsQ0FBQztDQUNGO0FBdkVELHdDQXVFQyIsImZpbGUiOiJzcmMvQ2x1c3RlckNvdW50ZXJwYXJ0aWVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGF0YUluZGV4UmVzdWx0cywgSW5wdXRTY2hlbWEsIE91dHB1dENvbmZpZ3VyYXRpb24sIFNlcnZpY2VEZWZpbml0aW9uLCBXZWJTZXJ2aWNlRXJyb3IgfSBmcm9tICdAc2lyZW5zb2x1dGlvbnMvd2ViLXNlcnZpY2UtaW50ZXJmYWNlJztcclxuaW1wb3J0IGF4aW9zLCB7IEF4aW9zUmVxdWVzdENvbmZpZywgQXhpb3NSZXNwb25zZSB9IGZyb20gJ2F4aW9zJztcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2x1c3RlckNvdW50ZXJwYXJ0aWVzIGV4dGVuZHMgU2VydmljZURlZmluaXRpb24ge1xyXG4gIHJlYWRvbmx5IG5hbWUgPSAnY2x1c3Rlcl9jb3VudGVycGFydGllcyc7XHJcbiAgcmVhZG9ubHkgaW5wdXRTY2hlbWE6IElucHV0U2NoZW1hID0ge1xyXG4gICAgYWRkcmVzczogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICBhc3NldDogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICBvdXRwdXRBc3NldDogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiBmYWxzZSB9LFxyXG4gIH07XHJcbiAgcmVhZG9ubHkgb3V0cHV0Q29uZmlndXJhdGlvbjogT3V0cHV0Q29uZmlndXJhdGlvbiA9IHtcclxuICAgIGNvdW50ZXJwYXJ0aWVzOiB7XHJcbiAgICAgICAgJ3Jhdyc6ICd0ZXh0JyxcclxuICAgICAgICAnZmlyc3RUcmFuc2ZlclRpbWVzdGFtcCc6ICdkYXRlJyxcclxuICAgICAgICAnbGFzdFRyYW5zZmVyVGltZXN0YW1wJzogJ2RhdGUnLFxyXG4gICAgICAgICdzZW50QW1vdW50JzogJ2xvbmcnLFxyXG4gICAgICAgICdyZWNlaXZlZEFtb3VudCc6ICdsb25nJyxcclxuICAgICAgICAndHJhbnNmZXJzJzogJ2xvbmcnXHJcbiAgICB9XHJcbiAgfTtcclxuICBhc3luYyBpbnZva2UoaW5wdXRzOiB7XHJcbiAgICBhZGRyZXNzOiBzdHJpbmcsXHJcbiAgICBhc3NldDogc3RyaW5nLFxyXG4gICAgb3V0cHV0QXNzZXQ6IHN0cmluZ1xyXG4gIH0pOiBQcm9taXNlPERhdGFJbmRleFJlc3VsdHM+IHtcclxuICAgIGlmICghaW5wdXRzLm91dHB1dEFzc2V0KSB7aW5wdXRzLm91dHB1dEFzc2V0ID0gJ05BVElWRSd9XHJcbiAgICBsZXQgdXJsID0gYGh0dHBzOi8vaWFwaS5jaGFpbmFseXNpcy5jb20vY2x1c3RlcnMvJHtpbnB1dHMuYWRkcmVzc30vJHtpbnB1dHMuYXNzZXR9L2NvdW50ZXJwYXJ0aWVzP291dHB1dEFzc2V0PSR7aW5wdXRzLm91dHB1dEFzc2V0fSZzaXplPTIwMGBcclxuICAgIGNvbnN0IGNvbmZpZzogQXhpb3NSZXF1ZXN0Q29uZmlnID0ge1xyXG4gICAgICBtZXRob2Q6ICdnZXQnLFxyXG4gICAgICB1cmw6IHVybCxcclxuICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgJ3Rva2VuJzogdGhpcy5jb25maWcudG9rZW5cclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIGNvbnN0IHJlc3BvbnNlOiBBeGlvc1Jlc3BvbnNlID0gYXdhaXQgYXhpb3MoY29uZmlnKS5jYXRjaChlcnIgPT4gUHJvbWlzZS5yZWplY3QoZXJyLnJlc3BvbnNlICYmIGVyci5yZXNwb25zZS5zdGF0dXMgPCA1MDAgPyBuZXcgV2ViU2VydmljZUVycm9yKGVyci5yZXNwb25zZS5kYXRhKSA6IGVycikpO1xyXG4gICAgLy9sZXQgaXRlbXMgPSByZXNwb25zZS5kYXRhLml0ZW1zXHJcbiAgICBsZXQgdHJ1bmNhdGVkID0gZmFsc2VcclxuICAgIGlmIChyZXNwb25zZS5kYXRhLm5leHRQYWdlICE9IG51bGwpIHtcclxuICAgICAgbGV0IHBhZ2UgPSByZXNwb25zZS5kYXRhLm5leHRQYWdlXHJcbiAgICAgIGxldCBsYXN0UmVzdWx0ID0geyBuZXh0UGFnZTogJycgfTtcclxuICAgICAgZG8ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBsZXQgc3ViX3VybCA9IGBodHRwczovL2lhcGkuY2hhaW5hbHlzaXMuY29tL2NsdXN0ZXJzLyR7aW5wdXRzLmFkZHJlc3N9LyR7aW5wdXRzLmFzc2V0fS9jb3VudGVycGFydGllcz9vdXRwdXRBc3NldD0ke2lucHV0cy5vdXRwdXRBc3NldH0mc2l6ZT0yMDAmcGFnZT0ke3BhZ2V9YFxyXG4gICAgICAgICAgY29uc3Qgc3ViX2NvbmZpZzogQXhpb3NSZXF1ZXN0Q29uZmlnID0ge1xyXG4gICAgICAgICAgICBtZXRob2Q6ICdnZXQnLFxyXG4gICAgICAgICAgICB1cmw6IHN1Yl91cmwsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgICAgICAgICd0b2tlbic6IHRoaXMuY29uZmlnLnRva2VuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH07XHJcbiAgICAgICAgICBjb25zdCBzdWJfcmVzcG9uc2U6IEF4aW9zUmVzcG9uc2UgPSBhd2FpdCBheGlvcyhzdWJfY29uZmlnKS5jYXRjaChlcnIgPT4gUHJvbWlzZS5yZWplY3QoZXJyLnJlc3BvbnNlICYmIGVyci5yZXNwb25zZS5zdGF0dXMgPCA1MDAgPyBuZXcgV2ViU2VydmljZUVycm9yKGVyci5yZXNwb25zZS5kYXRhKSA6IGVycikpO1xyXG4gICAgICAgICAgbGFzdFJlc3VsdCA9IHN1Yl9yZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgcmVzcG9uc2UuZGF0YS5pdGVtcy5wdXNoLmFwcGx5KHJlc3BvbnNlLmRhdGEuaXRlbXMsIHN1Yl9yZXNwb25zZS5kYXRhLml0ZW1zKVxyXG4gICAgICAgIH0gY2F0Y2ggeyBuZXcgV2ViU2VydmljZUVycm9yKCdwYWdpbmF0aW9uIGVycm9yJykgfVxyXG4gICAgICB9IHdoaWxlIChsYXN0UmVzdWx0Lm5leHRQYWdlICE9PSBudWxsICYmIHJlc3BvbnNlLmRhdGEuaXRlbXMgPCAxMDAwMClcclxuICAgICAgaWYgKGxhc3RSZXN1bHQubmV4dFBhZ2UgIT09IG51bGwgfHwgbGFzdFJlc3VsdC5uZXh0UGFnZSAhPT0gJycpIHtcclxuICAgICAgICB0cnVuY2F0ZWQgPSB0cnVlXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGZvciAobGV0IHkgPSAwOyB5IDwgcmVzcG9uc2UuZGF0YS5pdGVtcy5sZW5ndGg7IHkrKykge1xyXG4gICAgICBPYmplY3QuYXNzaWduKHJlc3BvbnNlLmRhdGEuaXRlbXNbeV0sIHtcclxuICAgICAgICBpZDogYCR7cmVzcG9uc2UuZGF0YS5pdGVtc1t5XS5hc3NldH06JHtpbnB1dHMuYWRkcmVzc306JHtyZXNwb25zZS5kYXRhLml0ZW1zW3ldLnJvb3RBZGRyZXNzfWAsXHJcbiAgICAgICAgaW5wdXRBZGRyZXNzOiBpbnB1dHMuYWRkcmVzcyxcclxuICAgICAgICBzaXJlbkRlbm9ybVBhcnR5SW5wdXQ6IGAke3Jlc3BvbnNlLmRhdGEuaXRlbXNbeV0uYXNzZXR9OiR7aW5wdXRzLmFkZHJlc3N9YCxcclxuICAgICAgICBzaXJlbkRlbm9ybVBhcnR5T3V0cHV0OiBgJHtyZXNwb25zZS5kYXRhLml0ZW1zW3ldLmFzc2V0fToke3Jlc3BvbnNlLmRhdGEuaXRlbXNbeV0ucm9vdEFkZHJlc3N9YCxcclxuICAgICAgICB0cnVuY2F0ZWQ6IHRydW5jYXRlZFxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBjb3VudGVycGFydGllczogcmVzcG9uc2UuZGF0YS5pdGVtc1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=
