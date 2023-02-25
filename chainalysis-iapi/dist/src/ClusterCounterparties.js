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
            page: { type: 'text', required: false },
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
                'nextPage': 'keyword'
            }
        };
    }
    async invoke(inputs) {
        if (!inputs.outputAsset) {
            inputs.outputAsset = 'NATIVE';
        }
        let url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/counterparties?outputAsset=${inputs.outputAsset}&size=100`;
        if (inputs.page) {
            url + url + `&page=${inputs.page}`;
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
        //let items = response.data.items
        let truncated = false;
        let nextPage = '';
        if (response.data.nextPage != null) {
            let page = response.data.nextPage;
            let lastResult = { nextPage: '' };
            do {
                try {
                    let sub_url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/counterparties?outputAsset=${inputs.outputAsset}&size=100&page=${page}`;
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
            } while (lastResult.nextPage !== null && response.data.items < 500);
            if (lastResult.nextPage !== null || lastResult.nextPage !== '') {
                truncated = true;
                nextPage = lastResult.nextPage;
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
            counterparties: response.data.items,
            pagination: [{
                    nextPage: nextPage
                }]
        };
    }
}
exports.default = ClusterCounterparties;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9DbHVzdGVyQ291bnRlcnBhcnRpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxpRkFBK0k7QUFDL0ksaUNBQWlFO0FBQ2pFLE1BQXFCLHFCQUFzQixTQUFRLHlDQUFpQjtJQUFwRTs7UUFDVyxTQUFJLEdBQUcsd0JBQXdCLENBQUM7UUFDaEMsZ0JBQVcsR0FBZ0I7WUFDbEMsT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFO1lBQ3pDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtZQUN2QyxXQUFXLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUU7WUFDOUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFO1NBQ3hDLENBQUM7UUFDTyx3QkFBbUIsR0FBd0I7WUFDbEQsY0FBYyxFQUFFO2dCQUNkLEtBQUssRUFBRSxNQUFNO2dCQUNiLHdCQUF3QixFQUFFLE1BQU07Z0JBQ2hDLHVCQUF1QixFQUFFLE1BQU07Z0JBQy9CLFlBQVksRUFBRSxNQUFNO2dCQUNwQixnQkFBZ0IsRUFBRSxNQUFNO2dCQUN4QixXQUFXLEVBQUUsTUFBTTthQUNwQjtZQUNELFVBQVUsRUFBRTtnQkFDVixVQUFVLEVBQUUsU0FBUzthQUN4QjtTQUNBLENBQUM7SUFnRUosQ0FBQztJQS9EQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BS1o7UUFDQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRTtZQUFFLE1BQU0sQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFBO1NBQUU7UUFDMUQsSUFBSSxHQUFHLEdBQUcseUNBQXlDLE1BQU0sQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLEtBQUssK0JBQStCLE1BQU0sQ0FBQyxXQUFXLFdBQVcsQ0FBQTtRQUM3SSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDZixHQUFHLEdBQUcsR0FBRyxHQUFHLFNBQVMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFBO1NBQ25DO1FBQ0QsTUFBTSxNQUFNLEdBQXVCO1lBQ2pDLE1BQU0sRUFBRSxLQUFLO1lBQ2IsR0FBRyxFQUFFLEdBQUc7WUFDUixPQUFPLEVBQUU7Z0JBQ1AsUUFBUSxFQUFFLGtCQUFrQjtnQkFDNUIsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSzthQUMzQjtTQUNGLENBQUM7UUFDRixNQUFNLFFBQVEsR0FBa0IsTUFBTSxlQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSx1Q0FBZSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDM0ssaUNBQWlDO1FBQ2pDLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQTtRQUNyQixJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFDbEIsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLEVBQUU7WUFDbEMsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUE7WUFDakMsSUFBSSxVQUFVLEdBQUcsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLENBQUM7WUFDbEMsR0FBRztnQkFDRCxJQUFJO29CQUNGLElBQUksT0FBTyxHQUFHLHlDQUF5QyxNQUFNLENBQUMsT0FBTyxJQUFJLE1BQU0sQ0FBQyxLQUFLLCtCQUErQixNQUFNLENBQUMsV0FBVyxrQkFBa0IsSUFBSSxFQUFFLENBQUE7b0JBQzlKLE1BQU0sVUFBVSxHQUF1Qjt3QkFDckMsTUFBTSxFQUFFLEtBQUs7d0JBQ2IsR0FBRyxFQUFFLE9BQU87d0JBQ1osT0FBTyxFQUFFOzRCQUNQLFFBQVEsRUFBRSxrQkFBa0I7NEJBQzVCLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUs7eUJBQzNCO3FCQUNGLENBQUM7b0JBQ0YsTUFBTSxZQUFZLEdBQWtCLE1BQU0sZUFBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksdUNBQWUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNuTCxVQUFVLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQztvQkFDL0IsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO2lCQUM3RTtnQkFBQyxNQUFNO29CQUFFLElBQUksdUNBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO2lCQUFFO2FBQ3BELFFBQVEsVUFBVSxDQUFDLFFBQVEsS0FBSyxJQUFJLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsR0FBRyxFQUFDO1lBQ25FLElBQUksVUFBVSxDQUFDLFFBQVEsS0FBSyxJQUFJLElBQUksVUFBVSxDQUFDLFFBQVEsS0FBSyxFQUFFLEVBQUU7Z0JBQzlELFNBQVMsR0FBRyxJQUFJLENBQUM7Z0JBQ2pCLFFBQVEsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDO2FBQ2hDO1NBQ0Y7UUFDRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ25ELE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3BDLEVBQUUsRUFBRSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsT0FBTyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRTtnQkFDN0YsWUFBWSxFQUFFLE1BQU0sQ0FBQyxPQUFPO2dCQUM1QixxQkFBcUIsRUFBRSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFO2dCQUMxRSxzQkFBc0IsRUFBRSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUU7Z0JBQy9GLFNBQVMsRUFBRSxTQUFTO2FBQ3JCLENBQUMsQ0FBQTtTQUNIO1FBQ0QsT0FBTztZQUNMLGNBQWMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUs7WUFDbkMsVUFBVSxFQUFFLENBQUM7b0JBQ1gsUUFBUSxFQUFFLFFBQVE7aUJBQ25CLENBQUM7U0FDSCxDQUFBO0lBQ0gsQ0FBQztDQUNGO0FBcEZELHdDQW9GQyIsImZpbGUiOiJzcmMvQ2x1c3RlckNvdW50ZXJwYXJ0aWVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGF0YUluZGV4UmVzdWx0cywgSW5wdXRTY2hlbWEsIE91dHB1dENvbmZpZ3VyYXRpb24sIFNlcnZpY2VEZWZpbml0aW9uLCBXZWJTZXJ2aWNlRXJyb3IgfSBmcm9tICdAc2lyZW5zb2x1dGlvbnMvd2ViLXNlcnZpY2UtaW50ZXJmYWNlJztcclxuaW1wb3J0IGF4aW9zLCB7IEF4aW9zUmVxdWVzdENvbmZpZywgQXhpb3NSZXNwb25zZSB9IGZyb20gJ2F4aW9zJztcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2x1c3RlckNvdW50ZXJwYXJ0aWVzIGV4dGVuZHMgU2VydmljZURlZmluaXRpb24ge1xyXG4gIHJlYWRvbmx5IG5hbWUgPSAnY2x1c3Rlcl9jb3VudGVycGFydGllcyc7XHJcbiAgcmVhZG9ubHkgaW5wdXRTY2hlbWE6IElucHV0U2NoZW1hID0ge1xyXG4gICAgYWRkcmVzczogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICBhc3NldDogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICBvdXRwdXRBc3NldDogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiBmYWxzZSB9LFxyXG4gICAgcGFnZTogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiBmYWxzZSB9LFxyXG4gIH07XHJcbiAgcmVhZG9ubHkgb3V0cHV0Q29uZmlndXJhdGlvbjogT3V0cHV0Q29uZmlndXJhdGlvbiA9IHtcclxuICAgIGNvdW50ZXJwYXJ0aWVzOiB7XHJcbiAgICAgICdyYXcnOiAndGV4dCcsXHJcbiAgICAgICdmaXJzdFRyYW5zZmVyVGltZXN0YW1wJzogJ2RhdGUnLFxyXG4gICAgICAnbGFzdFRyYW5zZmVyVGltZXN0YW1wJzogJ2RhdGUnLFxyXG4gICAgICAnc2VudEFtb3VudCc6ICdsb25nJyxcclxuICAgICAgJ3JlY2VpdmVkQW1vdW50JzogJ2xvbmcnLFxyXG4gICAgICAndHJhbnNmZXJzJzogJ2xvbmcnXHJcbiAgICB9LFxyXG4gICAgcGFnaW5hdGlvbjoge1xyXG4gICAgICAnbmV4dFBhZ2UnOiAna2V5d29yZCdcclxuICB9XHJcbiAgfTtcclxuICBhc3luYyBpbnZva2UoaW5wdXRzOiB7XHJcbiAgICBhZGRyZXNzOiBzdHJpbmcsXHJcbiAgICBhc3NldDogc3RyaW5nLFxyXG4gICAgb3V0cHV0QXNzZXQ6IHN0cmluZyxcclxuICAgIHBhZ2U6IHN0cmluZyxcclxuICB9KTogUHJvbWlzZTxEYXRhSW5kZXhSZXN1bHRzPiB7XHJcbiAgICBpZiAoIWlucHV0cy5vdXRwdXRBc3NldCkgeyBpbnB1dHMub3V0cHV0QXNzZXQgPSAnTkFUSVZFJyB9XHJcbiAgICBsZXQgdXJsID0gYGh0dHBzOi8vaWFwaS5jaGFpbmFseXNpcy5jb20vY2x1c3RlcnMvJHtpbnB1dHMuYWRkcmVzc30vJHtpbnB1dHMuYXNzZXR9L2NvdW50ZXJwYXJ0aWVzP291dHB1dEFzc2V0PSR7aW5wdXRzLm91dHB1dEFzc2V0fSZzaXplPTEwMGBcclxuICAgIGlmIChpbnB1dHMucGFnZSkge1xyXG4gICAgICB1cmwgKyB1cmwgKyBgJnBhZ2U9JHtpbnB1dHMucGFnZX1gXHJcbiAgICB9XHJcbiAgICBjb25zdCBjb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHtcclxuICAgICAgbWV0aG9kOiAnZ2V0JyxcclxuICAgICAgdXJsOiB1cmwsXHJcbiAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgICd0b2tlbic6IHRoaXMuY29uZmlnLnRva2VuXHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICBjb25zdCByZXNwb25zZTogQXhpb3NSZXNwb25zZSA9IGF3YWl0IGF4aW9zKGNvbmZpZykuY2F0Y2goZXJyID0+IFByb21pc2UucmVqZWN0KGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzIDwgNTAwID8gbmV3IFdlYlNlcnZpY2VFcnJvcihlcnIucmVzcG9uc2UuZGF0YSkgOiBlcnIpKTtcclxuICAgIC8vbGV0IGl0ZW1zID0gcmVzcG9uc2UuZGF0YS5pdGVtc1xyXG4gICAgbGV0IHRydW5jYXRlZCA9IGZhbHNlXHJcbiAgICBsZXQgbmV4dFBhZ2UgPSAnJztcclxuICAgIGlmIChyZXNwb25zZS5kYXRhLm5leHRQYWdlICE9IG51bGwpIHtcclxuICAgICAgbGV0IHBhZ2UgPSByZXNwb25zZS5kYXRhLm5leHRQYWdlXHJcbiAgICAgIGxldCBsYXN0UmVzdWx0ID0geyBuZXh0UGFnZTogJycgfTtcclxuICAgICAgZG8ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBsZXQgc3ViX3VybCA9IGBodHRwczovL2lhcGkuY2hhaW5hbHlzaXMuY29tL2NsdXN0ZXJzLyR7aW5wdXRzLmFkZHJlc3N9LyR7aW5wdXRzLmFzc2V0fS9jb3VudGVycGFydGllcz9vdXRwdXRBc3NldD0ke2lucHV0cy5vdXRwdXRBc3NldH0mc2l6ZT0xMDAmcGFnZT0ke3BhZ2V9YFxyXG4gICAgICAgICAgY29uc3Qgc3ViX2NvbmZpZzogQXhpb3NSZXF1ZXN0Q29uZmlnID0ge1xyXG4gICAgICAgICAgICBtZXRob2Q6ICdnZXQnLFxyXG4gICAgICAgICAgICB1cmw6IHN1Yl91cmwsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgICAgICAgICd0b2tlbic6IHRoaXMuY29uZmlnLnRva2VuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH07XHJcbiAgICAgICAgICBjb25zdCBzdWJfcmVzcG9uc2U6IEF4aW9zUmVzcG9uc2UgPSBhd2FpdCBheGlvcyhzdWJfY29uZmlnKS5jYXRjaChlcnIgPT4gUHJvbWlzZS5yZWplY3QoZXJyLnJlc3BvbnNlICYmIGVyci5yZXNwb25zZS5zdGF0dXMgPCA1MDAgPyBuZXcgV2ViU2VydmljZUVycm9yKGVyci5yZXNwb25zZS5kYXRhKSA6IGVycikpO1xyXG4gICAgICAgICAgbGFzdFJlc3VsdCA9IHN1Yl9yZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgcmVzcG9uc2UuZGF0YS5pdGVtcy5wdXNoLmFwcGx5KHJlc3BvbnNlLmRhdGEuaXRlbXMsIHN1Yl9yZXNwb25zZS5kYXRhLml0ZW1zKVxyXG4gICAgICAgIH0gY2F0Y2ggeyBuZXcgV2ViU2VydmljZUVycm9yKCdwYWdpbmF0aW9uIGVycm9yJykgfVxyXG4gICAgICB9IHdoaWxlIChsYXN0UmVzdWx0Lm5leHRQYWdlICE9PSBudWxsICYmIHJlc3BvbnNlLmRhdGEuaXRlbXMgPCA1MDApXHJcbiAgICAgIGlmIChsYXN0UmVzdWx0Lm5leHRQYWdlICE9PSBudWxsIHx8IGxhc3RSZXN1bHQubmV4dFBhZ2UgIT09ICcnKSB7XHJcbiAgICAgICAgdHJ1bmNhdGVkID0gdHJ1ZTtcclxuICAgICAgICBuZXh0UGFnZSA9IGxhc3RSZXN1bHQubmV4dFBhZ2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGZvciAobGV0IHkgPSAwOyB5IDwgcmVzcG9uc2UuZGF0YS5pdGVtcy5sZW5ndGg7IHkrKykge1xyXG4gICAgICBPYmplY3QuYXNzaWduKHJlc3BvbnNlLmRhdGEuaXRlbXNbeV0sIHtcclxuICAgICAgICBpZDogYCR7cmVzcG9uc2UuZGF0YS5pdGVtc1t5XS5hc3NldH06JHtpbnB1dHMuYWRkcmVzc306JHtyZXNwb25zZS5kYXRhLml0ZW1zW3ldLnJvb3RBZGRyZXNzfWAsXHJcbiAgICAgICAgaW5wdXRBZGRyZXNzOiBpbnB1dHMuYWRkcmVzcyxcclxuICAgICAgICBzaXJlbkRlbm9ybVBhcnR5SW5wdXQ6IGAke3Jlc3BvbnNlLmRhdGEuaXRlbXNbeV0uYXNzZXR9OiR7aW5wdXRzLmFkZHJlc3N9YCxcclxuICAgICAgICBzaXJlbkRlbm9ybVBhcnR5T3V0cHV0OiBgJHtyZXNwb25zZS5kYXRhLml0ZW1zW3ldLmFzc2V0fToke3Jlc3BvbnNlLmRhdGEuaXRlbXNbeV0ucm9vdEFkZHJlc3N9YCxcclxuICAgICAgICB0cnVuY2F0ZWQ6IHRydW5jYXRlZFxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY291bnRlcnBhcnRpZXM6IHJlc3BvbnNlLmRhdGEuaXRlbXMsXHJcbiAgICAgIHBhZ2luYXRpb246IFt7XHJcbiAgICAgICAgbmV4dFBhZ2U6IG5leHRQYWdlXHJcbiAgICAgIH1dXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiJdfQ==
