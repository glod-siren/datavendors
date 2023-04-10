"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web_service_interface_1 = require("@sirensolutions/web-service-interface");
const axios_1 = require("axios");
class ClusterBalance extends web_service_interface_1.ServiceDefinition {
    constructor() {
        super(...arguments);
        this.name = 'cluster_balance';
        this.inputSchema = {
            address: { type: 'text', required: true },
            asset: { type: 'text', required: true },
            outputAsset: { type: 'text', required: false },
        };
        this.outputConfiguration = {
            balance: {
                'addressCount': 'long',
                'transferCount': 'long',
                'depositCount': 'long',
                'withdrawalCount': 'long',
                'balance': 'long',
                'totalSentAmount': 'long',
                'totalReceivedAmount': 'long',
                'totalFeesAmount': 'long'
            }
        };
    }
    async invoke(inputs) {
        if (!inputs.outputAsset) {
            inputs.outputAsset = 'NATIVE';
        }
        let url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/summary?outputAsset=${inputs.outputAsset}`;
        const config = {
            method: 'get',
            url: url,
            headers: {
                'Accept': 'application/json',
                'token': this.config.token
            }
        };
        const response = await axios_1.default(config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new web_service_interface_1.WebServiceError(err.response.data) : err));
        const denormAddress = [];
        denormAddress.push(`${response.data.asset}:${response.data.address}`);
        denormAddress.push(`${response.data.asset}:${response.data.rootAddress}`);
        Object.assign(response.data, {
            sirenDenormAddress: denormAddress,
            id: `${response.data.asset}:${response.data.address}`
        });
        return {
            balance: [response.data]
        };
    }
}
exports.default = ClusterBalance;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9DbHVzdGVyQmFsYW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlGQUErSTtBQUMvSSxpQ0FBaUU7QUFDakUsTUFBcUIsY0FBZSxTQUFRLHlDQUFpQjtJQUE3RDs7UUFDVyxTQUFJLEdBQUcsaUJBQWlCLENBQUM7UUFDekIsZ0JBQVcsR0FBZ0I7WUFDbEMsT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFO1lBQ3pDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtZQUN2QyxXQUFXLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUU7U0FDL0MsQ0FBQztRQUNPLHdCQUFtQixHQUF3QjtZQUNsRCxPQUFPLEVBQUc7Z0JBQ04sY0FBYyxFQUFHLE1BQU07Z0JBQ3ZCLGVBQWUsRUFBRSxNQUFNO2dCQUN2QixjQUFjLEVBQUUsTUFBTTtnQkFDdEIsaUJBQWlCLEVBQUUsTUFBTTtnQkFDekIsU0FBUyxFQUFFLE1BQU07Z0JBQ2pCLGlCQUFpQixFQUFFLE1BQU07Z0JBQ3pCLHFCQUFxQixFQUFFLE1BQU07Z0JBQzdCLGlCQUFpQixFQUFFLE1BQU07YUFDNUI7U0FDRixDQUFDO0lBNEJKLENBQUM7SUEzQkMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUlaO1FBQ0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUU7WUFBQyxNQUFNLENBQUMsV0FBVyxHQUFHLFFBQVEsQ0FBQTtTQUFDO1FBQ3hELElBQUksR0FBRyxHQUFHLHlDQUF5QyxNQUFNLENBQUMsT0FBTyxJQUFJLE1BQU0sQ0FBQyxLQUFLLHdCQUF3QixNQUFNLENBQUMsV0FBVyxFQUFFLENBQUE7UUFDN0gsTUFBTSxNQUFNLEdBQXVCO1lBQ2pDLE1BQU0sRUFBRSxLQUFLO1lBQ2IsR0FBRyxFQUFFLEdBQUc7WUFDUixPQUFPLEVBQUU7Z0JBQ1AsUUFBUSxFQUFFLGtCQUFrQjtnQkFDNUIsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSzthQUMzQjtTQUNGLENBQUM7UUFDRixNQUFNLFFBQVEsR0FBa0IsTUFBTSxlQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSx1Q0FBZSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDM0ssTUFBTSxhQUFhLEdBQWMsRUFBRSxDQUFDO1FBQ3BDLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7UUFDckUsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQTtRQUN6RSxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUU7WUFDekIsa0JBQWtCLEVBQUUsYUFBYTtZQUNqQyxFQUFFLEVBQUUsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtTQUN4RCxDQUFDLENBQUE7UUFDRixPQUFPO1lBQ0gsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztTQUMzQixDQUFBO0lBQ0gsQ0FBQztDQUNGO0FBOUNELGlDQThDQyIsImZpbGUiOiJzcmMvQ2x1c3RlckJhbGFuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEYXRhSW5kZXhSZXN1bHRzLCBJbnB1dFNjaGVtYSwgT3V0cHV0Q29uZmlndXJhdGlvbiwgU2VydmljZURlZmluaXRpb24sIFdlYlNlcnZpY2VFcnJvciB9IGZyb20gJ0BzaXJlbnNvbHV0aW9ucy93ZWItc2VydmljZS1pbnRlcmZhY2UnO1xyXG5pbXBvcnQgYXhpb3MsIHsgQXhpb3NSZXF1ZXN0Q29uZmlnLCBBeGlvc1Jlc3BvbnNlIH0gZnJvbSAnYXhpb3MnO1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDbHVzdGVyQmFsYW5jZSBleHRlbmRzIFNlcnZpY2VEZWZpbml0aW9uIHtcclxuICByZWFkb25seSBuYW1lID0gJ2NsdXN0ZXJfYmFsYW5jZSc7XHJcbiAgcmVhZG9ubHkgaW5wdXRTY2hlbWE6IElucHV0U2NoZW1hID0ge1xyXG4gICAgYWRkcmVzczogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICBhc3NldDogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICBvdXRwdXRBc3NldDogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiBmYWxzZSB9LFxyXG4gIH07XHJcbiAgcmVhZG9ubHkgb3V0cHV0Q29uZmlndXJhdGlvbjogT3V0cHV0Q29uZmlndXJhdGlvbiA9IHtcclxuICAgIGJhbGFuY2UgOiB7XHJcbiAgICAgICAgJ2FkZHJlc3NDb3VudCcgOiAnbG9uZycsXHJcbiAgICAgICAgJ3RyYW5zZmVyQ291bnQnOiAnbG9uZycsXHJcbiAgICAgICAgJ2RlcG9zaXRDb3VudCc6ICdsb25nJyxcclxuICAgICAgICAnd2l0aGRyYXdhbENvdW50JzogJ2xvbmcnLFxyXG4gICAgICAgICdiYWxhbmNlJzogJ2xvbmcnLFxyXG4gICAgICAgICd0b3RhbFNlbnRBbW91bnQnOiAnbG9uZycsXHJcbiAgICAgICAgJ3RvdGFsUmVjZWl2ZWRBbW91bnQnOiAnbG9uZycsXHJcbiAgICAgICAgJ3RvdGFsRmVlc0Ftb3VudCc6ICdsb25nJ1xyXG4gICAgfVxyXG4gIH07XHJcbiAgYXN5bmMgaW52b2tlKGlucHV0czoge1xyXG4gICAgYWRkcmVzczogc3RyaW5nLFxyXG4gICAgYXNzZXQ6IHN0cmluZyxcclxuICAgIG91dHB1dEFzc2V0OiBzdHJpbmcsXHJcbiAgfSk6IFByb21pc2U8RGF0YUluZGV4UmVzdWx0cz4ge1xyXG4gICAgaWYgKCFpbnB1dHMub3V0cHV0QXNzZXQpIHtpbnB1dHMub3V0cHV0QXNzZXQgPSAnTkFUSVZFJ31cclxuICAgIGxldCB1cmwgPSBgaHR0cHM6Ly9pYXBpLmNoYWluYWx5c2lzLmNvbS9jbHVzdGVycy8ke2lucHV0cy5hZGRyZXNzfS8ke2lucHV0cy5hc3NldH0vc3VtbWFyeT9vdXRwdXRBc3NldD0ke2lucHV0cy5vdXRwdXRBc3NldH1gXHJcbiAgICBjb25zdCBjb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHtcclxuICAgICAgbWV0aG9kOiAnZ2V0JyxcclxuICAgICAgdXJsOiB1cmwsXHJcbiAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgICd0b2tlbic6IHRoaXMuY29uZmlnLnRva2VuXHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICBjb25zdCByZXNwb25zZTogQXhpb3NSZXNwb25zZSA9IGF3YWl0IGF4aW9zKGNvbmZpZykuY2F0Y2goZXJyID0+IFByb21pc2UucmVqZWN0KGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzIDwgNTAwID8gbmV3IFdlYlNlcnZpY2VFcnJvcihlcnIucmVzcG9uc2UuZGF0YSkgOiBlcnIpKTtcclxuICAgIGNvbnN0IGRlbm9ybUFkZHJlc3MgOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgZGVub3JtQWRkcmVzcy5wdXNoKGAke3Jlc3BvbnNlLmRhdGEuYXNzZXR9OiR7cmVzcG9uc2UuZGF0YS5hZGRyZXNzfWApXHJcbiAgICBkZW5vcm1BZGRyZXNzLnB1c2goYCR7cmVzcG9uc2UuZGF0YS5hc3NldH06JHtyZXNwb25zZS5kYXRhLnJvb3RBZGRyZXNzfWApXHJcbiAgICBPYmplY3QuYXNzaWduKHJlc3BvbnNlLmRhdGEsIHtcclxuICAgICAgICBzaXJlbkRlbm9ybUFkZHJlc3M6IGRlbm9ybUFkZHJlc3MsIFxyXG4gICAgICAgIGlkOiBgJHtyZXNwb25zZS5kYXRhLmFzc2V0fToke3Jlc3BvbnNlLmRhdGEuYWRkcmVzc31gXHJcbiAgICB9KVxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBiYWxhbmNlOiBbcmVzcG9uc2UuZGF0YV1cclxuICAgIH1cclxuICB9XHJcbn1cclxuIl19
