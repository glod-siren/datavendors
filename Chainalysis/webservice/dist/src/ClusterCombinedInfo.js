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
class ClusterCombinedInfo extends web_service_interface_1.ServiceDefinition {
    constructor() {
        super(...arguments);
        this.name = 'cluster_combined_info';
        this.inputSchema = {
            address: { type: 'text', required: true },
            asset: { type: 'text', required: false },
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
            addresses: {}
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
        // If asset is not provided, infer it
        if (!inputs.asset) {
            inputs.asset = this.inferAssetType(inputs.address);
        }
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
        let rootAddress = balance_response.data.rootAddress; // Get rootAddress from balance_response
        return {
            cluster: [{
                    id: inputs.asset + ':' + rootAddress,
                    name: name_response.data.items[0].name,
                    category: name_response.data.items[0].category,
                    rootAddress: rootAddress,
                    asset: inputs.asset,
                    cluster_balance: balance_response.data,
                }],
            addresses: [{
                    id: inputs.asset + ':' + inputs.address,
                    address: inputs.address,
                    asset: inputs.asset,
                    rootAddress: rootAddress,
                }]
        };
    }
}
exports.default = ClusterCombinedInfo;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9DbHVzdGVyQ29tYmluZWRJbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUZBQStJO0FBQy9JLGlDQUFpRTtBQUVqRSxNQUFNLG1CQUFtQixHQUFHO0lBQ3hCLEtBQUssRUFBRSxzQ0FBc0M7SUFDN0MsS0FBSyxFQUFFLDZCQUE2QjtJQUNwQyxLQUFLLEVBQUUsdUJBQXVCO0lBQzlCLEtBQUssRUFBRSxzQkFBc0I7SUFDN0IsS0FBSyxFQUFFLG9CQUFvQjtJQUMzQixLQUFLLEVBQUUsMEJBQTBCO0lBQ2pDLE1BQU0sRUFBRSxvQkFBb0I7SUFDNUIsS0FBSyxFQUFFLG9CQUFvQjtJQUMzQixLQUFLLEVBQUUsZ0NBQWdDO0lBQ3ZDLEtBQUssRUFBRSxvQkFBb0I7SUFDM0IsTUFBTSxFQUFFLHFCQUFxQjtJQUM3QixLQUFLLEVBQUUsaUJBQWlCO0lBQ3hCLEtBQUssRUFBRSxvQkFBb0I7SUFDM0IsTUFBTSxFQUFFLHVCQUF1QjtDQUVsQyxDQUFDO0FBRUYsTUFBcUIsbUJBQW9CLFNBQVEseUNBQWlCO0lBQWxFOztRQUNhLFNBQUksR0FBRyx1QkFBdUIsQ0FBQztRQUMvQixnQkFBVyxHQUFnQjtZQUNoQyxPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7WUFDekMsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFO1lBQ3hDLFdBQVcsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRTtTQUNqRCxDQUFDO1FBQ08sd0JBQW1CLEdBQXdCO1lBQ2hELE9BQU8sRUFBRTtnQkFDTCxpQkFBaUIsRUFBRTtvQkFDZixjQUFjLEVBQUUsTUFBTTtvQkFDdEIsZUFBZSxFQUFFLE1BQU07b0JBQ3ZCLGNBQWMsRUFBRSxNQUFNO29CQUN0QixpQkFBaUIsRUFBRSxNQUFNO29CQUN6QixTQUFTLEVBQUUsTUFB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QUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQ3RDLFFBQVEsRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRO29CQUM5QyxXQUFXLEVBQUUsV0FBVztvQkFDeEIsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLO29CQUNuQixlQUFlLEVBQUUsZ0JBQWdCLENBQUMsSUFBSTtpQkFDekMsQ0FBQztZQUNGLFNBQVMsRUFBRSxDQUFDO29CQUNSLEVBQUUsRUFBRSxNQUFNLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsT0FBTztvQkFDdkMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPO29CQUN2QixLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUs7b0JBQ25CLFdBQVcsRUFBRSxXQUFXO2lCQUMzQixDQUFDO1NBQ0wsQ0FBQTtJQUNMLENBQUM7Q0FDSjtBQXRGRCxzQ0FzRkMiLCJmaWxlIjoic3JjL0NsdXN0ZXJDb21iaW5lZEluZm8uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEYXRhSW5kZXhSZXN1bHRzLCBJbnB1dFNjaGVtYSwgT3V0cHV0Q29uZmlndXJhdGlvbiwgU2VydmljZURlZmluaXRpb24sIFdlYlNlcnZpY2VFcnJvciB9IGZyb20gJ0BzaXJlbnNvbHV0aW9ucy93ZWItc2VydmljZS1pbnRlcmZhY2UnO1xyXG5pbXBvcnQgYXhpb3MsIHsgQXhpb3NSZXF1ZXN0Q29uZmlnLCBBeGlvc1Jlc3BvbnNlIH0gZnJvbSAnYXhpb3MnO1xyXG5cclxuY29uc3QgY3J5cHRvUmVnZXhQYXR0ZXJucyA9IHtcclxuICAgICdCVEMnOiAnXihiYzF8WzEzXSlbYS16QS1ISi1OUC1aMC05XXsyNSwzOX0kJywgLy8gQml0Y29pbiAoQlRDKSBpbmNsdWRpbmcgYmVjaDMyIGFkZHJlc3Nlc1xyXG4gICAgJ0VUSCc6ICdeKD86MHgpP1thLWZBLUYwLTldezQwLDQyfSQnLCAvLyBFdGhlcmV1bVxyXG4gICAgJ1hSUCc6ICdeclswLTlhLXpBLVpdezI0LDM0fSQnLCAvLyBSaXBwbGVcclxuICAgICdCTkInOiAnXmJuYlswLTlhLXpBLVpdezM4fSQnLCAvLyBCaW5hbmNlIENvaW5cclxuICAgICdBREEnOiAnXkFlMnRkUHdVUEVZeXs0NH0kJywgLy8gQ2FyZGFub1xyXG4gICAgJ1NPTCc6ICdeU29bMS05XVswLTlhLXpBLVpdezQ4fSQnLCAvLyBTb2xhbmFcclxuICAgICdET0dFJzogJ15EWzAtOWEtZkEtRl17MzJ9JCcsIC8vIERvZ2Vjb2luXHJcbiAgICAnVFJYJzogJ15UWzAtOWEtZkEtRl17MzN9JCcsIC8vIFRyb25cclxuICAgICdMVEMnOiAnXkxbYS1rbS16QS1ISi1OUC1aMS05XXsyNiwzM30kJywgLy8gTGl0ZWNvaW5cclxuICAgICdET1QnOiAnXjFbYS16QS1aMC05XXszMX0kJywgLy8gUG9sa2Fkb3RcclxuICAgICdMSU5LJzogJ14weFthLWZBLUYwLTldezQwfSQnLCAvLyBDaGFpbmxpbmtcclxuICAgICdYTE0nOiAnXkdbQS1aMC05XXs1NX0kJywgLy8gU3RlbGxhciBMdW1lbnNcclxuICAgICdYTVInOiAnXjRbMC05QS1aYS16XXs5NH0kJywgLy8gTW9uZXJvXHJcbiAgICAnQVRPTSc6ICdeY29zbW9zMVthLXowLTldezM4fSQnLCAvLyBDb3Ntb3NcclxuICAgIC8vIEFkZCBtb3JlIHBhdHRlcm5zIGhlcmUgZm9yIG90aGVyIGNyeXB0b2N1cnJlbmNpZXNcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENsdXN0ZXJDb21iaW5lZEluZm8gZXh0ZW5kcyBTZXJ2aWNlRGVmaW5pdGlvbiB7XHJcbiAgICByZWFkb25seSBuYW1lID0gJ2NsdXN0ZXJfY29tYmluZWRfaW5mbyc7XHJcbiAgICByZWFkb25seSBpbnB1dFNjaGVtYTogSW5wdXRTY2hlbWEgPSB7XHJcbiAgICAgICAgYWRkcmVzczogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICAgICAgYXNzZXQ6IHsgdHlwZTogJ3RleHQnLCByZXF1aXJlZDogZmFsc2UgfSxcclxuICAgICAgICBvdXRwdXRBc3NldDogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiBmYWxzZSB9LFxyXG4gICAgfTtcclxuICAgIHJlYWRvbmx5IG91dHB1dENvbmZpZ3VyYXRpb246IE91dHB1dENvbmZpZ3VyYXRpb24gPSB7XHJcbiAgICAgICAgY2x1c3Rlcjoge1xyXG4gICAgICAgICAgICAnY2x1c3Rlcl9iYWxhbmNlJzoge1xyXG4gICAgICAgICAgICAgICAgJ2FkZHJlc3NDb3VudCc6ICdsb25nJyxcclxuICAgICAgICAgICAgICAgICd0cmFuc2ZlckNvdW50JzogJ2xvbmcnLFxyXG4gICAgICAgICAgICAgICAgJ2RlcG9zaXRDb3VudCc6ICdsb25nJyxcclxuICAgICAgICAgICAgICAgICd3aXRoZHJhd2FsQ291bnQnOiAnbG9uZycsXHJcbiAgICAgICAgICAgICAgICAnYmFsYW5jZSc6ICdsb25nJyxcclxuICAgICAgICAgICAgICAgICd0b3RhbFNlbnRBbW91bnQnOiAnbG9uZycsXHJcbiAgICAgICAgICAgICAgICAndG90YWxSZWNlaXZlZEFtb3VudCc6ICdsb25nJyxcclxuICAgICAgICAgICAgICAgICd0b3RhbEZlZXNBbW91bnQnOiAnbG9uZydcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYWRkcmVzc2VzOiB7fVxyXG4gICAgfTtcclxuXHJcbiAgICBpbmZlckFzc2V0VHlwZShhZGRyZXNzOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIGZvciAoY29uc3QgW2Fzc2V0LCBwYXR0ZXJuXSBvZiBPYmplY3QuZW50cmllcyhjcnlwdG9SZWdleFBhdHRlcm5zKSkge1xyXG4gICAgICAgICAgICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAocGF0dGVybik7XHJcbiAgICAgICAgICAgIGlmIChyZWdleC50ZXN0KGFkZHJlc3MpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXNzZXQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhyb3cgbmV3IFdlYlNlcnZpY2VFcnJvcignQ291bGQgbm90IGluZmVyIGFzc2V0IHR5cGUgZnJvbSBhZGRyZXNzJyk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgaW52b2tlKGlucHV0czoge1xyXG4gICAgICAgIGFkZHJlc3M6IHN0cmluZyxcclxuICAgICAgICBhc3NldDogc3RyaW5nLFxyXG4gICAgICAgIG91dHB1dEFzc2V0OiBzdHJpbmcsXHJcbiAgICB9KTogUHJvbWlzZTxEYXRhSW5kZXhSZXN1bHRzPiB7XHJcbiAgICAgICAgLy8gSWYgYXNzZXQgaXMgbm90IHByb3ZpZGVkLCBpbmZlciBpdFxyXG4gICAgICAgIGlmICghaW5wdXRzLmFzc2V0KSB7XHJcbiAgICAgICAgICAgIGlucHV0cy5hc3NldCA9IHRoaXMuaW5mZXJBc3NldFR5cGUoaW5wdXRzLmFkZHJlc3MpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFpbnB1dHMub3V0cHV0QXNzZXQpIHsgaW5wdXRzLm91dHB1dEFzc2V0ID0gJ05BVElWRScgfVxyXG5cclxuICAgICAgICBsZXQgbmFtZV91cmwgPSBgaHR0cHM6Ly9pYXBpLmNoYWluYWx5c2lzLmNvbS9jbHVzdGVycy8ke2lucHV0cy5hZGRyZXNzfT9maWx0ZXJBc3NldD0ke2lucHV0cy5hc3NldH1gO1xyXG4gICAgICAgIGNvbnN0IG5hbWVfY29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogJ2dldCcsXHJcbiAgICAgICAgICAgIHVybDogbmFtZV91cmwsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgICAgICAgICAndG9rZW4nOiB0aGlzLmNvbmZpZy50b2tlblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBuYW1lX3Jlc3BvbnNlOiBBeGlvc1Jlc3BvbnNlID0gYXdhaXQgYXhpb3MobmFtZV9jb25maWcpLmNhdGNoKGVyciA9PiBQcm9taXNlLnJlamVjdChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA8IDUwMCA/IG5ldyBXZWJTZXJ2aWNlRXJyb3IoZXJyLnJlc3BvbnNlLmRhdGEpIDogZXJyKSk7XHJcblxyXG4gICAgICAgIGxldCBiYWxhbmNlX3VybCA9IGBodHRwczovL2lhcGkuY2hhaW5hbHlzaXMuY29tL2NsdXN0ZXJzLyR7aW5wdXRzLmFkZHJlc3N9LyR7aW5wdXRzLmFzc2V0fS9zdW1tYXJ5P291dHB1dEFzc2V0PSR7aW5wdXRzLm91dHB1dEFzc2V0fWA7XHJcbiAgICAgICAgY29uc3QgYmFsYW5jZV9jb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHtcclxuICAgICAgICAgICAgbWV0aG9kOiAnZ2V0JyxcclxuICAgICAgICAgICAgdXJsOiBiYWxhbmNlX3VybCxcclxuICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICAgICAgICAgICd0b2tlbic6IHRoaXMuY29uZmlnLnRva2VuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IGJhbGFuY2VfcmVzcG9uc2U6IEF4aW9zUmVzcG9uc2UgPSBhd2FpdCBheGlvcyhiYWxhbmNlX2NvbmZpZykuY2F0Y2goZXJyID0+IFByb21pc2UucmVqZWN0KGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzIDwgNTAwID8gbmV3IFdlYlNlcnZpY2VFcnJvcihlcnIucmVzcG9uc2UuZGF0YSkgOiBlcnIpKTtcclxuXHJcbiAgICAgICAgbGV0IHJvb3RBZGRyZXNzID0gYmFsYW5jZV9yZXNwb25zZS5kYXRhLnJvb3RBZGRyZXNzOyAvLyBHZXQgcm9vdEFkZHJlc3MgZnJvbSBiYWxhbmNlX3Jlc3BvbnNlXHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGNsdXN0ZXI6IFt7XHJcbiAgICAgICAgICAgICAgICBpZDogaW5wdXRzLmFzc2V0ICsgJzonICsgcm9vdEFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiBuYW1lX3Jlc3BvbnNlLmRhdGEuaXRlbXNbMF0ubmFtZSxcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBuYW1lX3Jlc3BvbnNlLmRhdGEuaXRlbXNbMF0uY2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICByb290QWRkcmVzczogcm9vdEFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgICBhc3NldDogaW5wdXRzLmFzc2V0LFxyXG4gICAgICAgICAgICAgICAgY2x1c3Rlcl9iYWxhbmNlOiBiYWxhbmNlX3Jlc3BvbnNlLmRhdGEsXHJcbiAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICBhZGRyZXNzZXM6IFt7XHJcbiAgICAgICAgICAgICAgICBpZDogaW5wdXRzLmFzc2V0ICsgJzonICsgaW5wdXRzLmFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgICBhZGRyZXNzOiBpbnB1dHMuYWRkcmVzcyxcclxuICAgICAgICAgICAgICAgIGFzc2V0OiBpbnB1dHMuYXNzZXQsXHJcbiAgICAgICAgICAgICAgICByb290QWRkcmVzczogcm9vdEFkZHJlc3MsXHJcbiAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiJdfQ==
