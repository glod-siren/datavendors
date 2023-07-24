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
class ClusterBalance extends web_service_interface_1.ServiceDefinition {
    constructor() {
        super(...arguments);
        this.name = 'cluster_balance';
        this.inputSchema = {
            address: { type: 'text', required: true },
            asset: { type: 'text', required: false },
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
    inferAssetType(address) {
        return Object.keys(cryptoRegexPatterns).filter(asset => {
            return new RegExp(cryptoRegexPatterns[asset]).test(address);
        });
    }
    async invoke(inputs) {
        let matchedAssets = inputs.asset ? [inputs.asset] : this.inferAssetType(inputs.address);
        let overallResults = []; // define overallResults as array of 'any' type
        for (const asset of matchedAssets) {
            let url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${asset}/summary?outputAsset=${inputs.outputAsset}`;
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
            overallResults.push(response.data);
        }
        return {
            balance: overallResults
        };
    }
}
exports.default = ClusterBalance;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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RyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLHVDQUFlLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMzSyxNQUFNLGFBQWEsR0FBYSxFQUFFLENBQUM7WUFDbkMsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUN0RSxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBQzFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRTtnQkFDM0Isa0JBQWtCLEVBQUUsYUFBYTtnQkFDakMsRUFBRSxFQUFFLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7YUFDdEQsQ0FBQyxDQUFDO1lBQ0gsY0FBYyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDcEM7UUFDRCxPQUFPO1lBQ0wsT0FBTyxFQUFFLGNBQWM7U0FDeEIsQ0FBQTtJQUNILENBQUM7Q0FDRjtBQTFERCxpQ0EwREMiLCJmaWxlIjoic3JjL0NsdXN0ZXJCYWxhbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGF0YUluZGV4UmVzdWx0cywgSW5wdXRTY2hlbWEsIE91dHB1dENvbmZpZ3VyYXRpb24sIFNlcnZpY2VEZWZpbml0aW9uLCBXZWJTZXJ2aWNlRXJyb3IgfSBmcm9tICdAc2lyZW5zb2x1dGlvbnMvd2ViLXNlcnZpY2UtaW50ZXJmYWNlJztcclxuaW1wb3J0IGF4aW9zLCB7IEF4aW9zUmVxdWVzdENvbmZpZywgQXhpb3NSZXNwb25zZSB9IGZyb20gJ2F4aW9zJztcclxuXHJcbmNvbnN0IGNyeXB0b1JlZ2V4UGF0dGVybnMgPSB7XHJcbiAgJ0JUQyc6ICdeKGJjMXxbMTNdKVthLXpBLUhKLU5QLVowLTldezI1LDM5fSQnLCAvLyBCaXRjb2luIChCVEMpIGluY2x1ZGluZyBiZWNoMzIgYWRkcmVzc2VzXHJcbiAgJ0VUSCc6ICdeKD86MHgpP1thLWZBLUYwLTldezQwLDQyfSQnLCAvLyBFdGhlcmV1bVxyXG4gICdYUlAnOiAnXnJbMC05YS16QS1aXXsyNCwzNH0kJywgLy8gUmlwcGxlXHJcbiAgJ0JOQic6ICdeYm5iWzAtOWEtekEtWl17Mzh9JCcsIC8vIEJpbmFuY2UgQ29pblxyXG4gICdBREEnOiAnXkFlMnRkUHdVUEVZeXs0NH0kJywgLy8gQ2FyZGFub1xyXG4gICdTT0wnOiAnXlNvWzEtOV1bMC05YS16QS1aXXs0OH0kJywgLy8gU29sYW5hXHJcbiAgJ0RPR0UnOiAnXkRbMC05YS1mQS1GXXszMn0kJywgLy8gRG9nZWNvaW5cclxuICAnVFJYJzogJ15UWzAtOWEtZkEtRl17MzN9JCcsIC8vIFRyb25cclxuICAnTFRDJzogJ15MW2Eta20tekEtSEotTlAtWjEtOV17MjYsMzN9JCcsIC8vIExpdGVjb2luXHJcbiAgJ0RPVCc6ICdeMVthLXpBLVowLTldezMxfSQnLCAvLyBQb2xrYWRvdFxyXG4gICdMSU5LJzogJ14weFthLWZBLUYwLTldezQwfSQnLCAvLyBDaGFpbmxpbmtcclxuICAnWExNJzogJ15HW0EtWjAtOV17NTV9JCcsIC8vIFN0ZWxsYXIgTHVtZW5zXHJcbiAgJ1hNUic6ICdeNFswLTlBLVphLXpdezk0fSQnLCAvLyBNb25lcm9cclxuICAnQVRPTSc6ICdeY29zbW9zMVthLXowLTldezM4fSQnLCAvLyBDb3Ntb3NcclxuICAvLyBBZGQgbW9yZSBwYXR0ZXJucyBoZXJlIGZvciBvdGhlciBjcnlwdG9jdXJyZW5jaWVzXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDbHVzdGVyQmFsYW5jZSBleHRlbmRzIFNlcnZpY2VEZWZpbml0aW9uIHtcclxuICByZWFkb25seSBuYW1lID0gJ2NsdXN0ZXJfYmFsYW5jZSc7XHJcbiAgcmVhZG9ubHkgaW5wdXRTY2hlbWE6IElucHV0U2NoZW1hID0ge1xyXG4gICAgYWRkcmVzczogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICBhc3NldDogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiBmYWxzZSB9LFxyXG4gICAgb3V0cHV0QXNzZXQ6IHsgdHlwZTogJ3RleHQnLCByZXF1aXJlZDogZmFsc2UgfSxcclxuICB9O1xyXG4gIHJlYWRvbmx5IG91dHB1dENvbmZpZ3VyYXRpb246IE91dHB1dENvbmZpZ3VyYXRpb24gPSB7XHJcbiAgICBiYWxhbmNlOiB7XHJcbiAgICAgICdhZGRyZXNzQ291bnQnOiAnbG9uZycsXHJcbiAgICAgICd0cmFuc2ZlckNvdW50JzogJ2xvbmcnLFxyXG4gICAgICAnZGVwb3NpdENvdW50JzogJ2xvbmcnLFxyXG4gICAgICAnd2l0aGRyYXdhbENvdW50JzogJ2xvbmcnLFxyXG4gICAgICAnYmFsYW5jZSc6ICdsb25nJyxcclxuICAgICAgJ3RvdGFsU2VudEFtb3VudCc6ICdsb25nJyxcclxuICAgICAgJ3RvdGFsUmVjZWl2ZWRBbW91bnQnOiAnbG9uZycsXHJcbiAgICAgICd0b3RhbEZlZXNBbW91bnQnOiAnbG9uZydcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBwcml2YXRlIGluZmVyQXNzZXRUeXBlKGFkZHJlc3M6IHN0cmluZyk6IHN0cmluZ1tdIHtcclxuICAgIHJldHVybiBPYmplY3Qua2V5cyhjcnlwdG9SZWdleFBhdHRlcm5zKS5maWx0ZXIoYXNzZXQgPT4ge1xyXG4gICAgICByZXR1cm4gbmV3IFJlZ0V4cChjcnlwdG9SZWdleFBhdHRlcm5zW2Fzc2V0XSkudGVzdChhZGRyZXNzKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgaW52b2tlKGlucHV0czoge1xyXG4gICAgYWRkcmVzczogc3RyaW5nLFxyXG4gICAgYXNzZXQ/OiBzdHJpbmcsXHJcbiAgICBvdXRwdXRBc3NldD86IHN0cmluZyxcclxuICB9KTogUHJvbWlzZTxEYXRhSW5kZXhSZXN1bHRzPiB7XHJcbiAgICBsZXQgbWF0Y2hlZEFzc2V0cyA9IGlucHV0cy5hc3NldCA/IFtpbnB1dHMuYXNzZXRdIDogdGhpcy5pbmZlckFzc2V0VHlwZShpbnB1dHMuYWRkcmVzcyk7XHJcbiAgICBsZXQgb3ZlcmFsbFJlc3VsdHM6IGFueVtdID0gW107IC8vIGRlZmluZSBvdmVyYWxsUmVzdWx0cyBhcyBhcnJheSBvZiAnYW55JyB0eXBlXHJcblxyXG4gICAgZm9yIChjb25zdCBhc3NldCBvZiBtYXRjaGVkQXNzZXRzKSB7XHJcbiAgICAgIGxldCB1cmwgPSBgaHR0cHM6Ly9pYXBpLmNoYWluYWx5c2lzLmNvbS9jbHVzdGVycy8ke2lucHV0cy5hZGRyZXNzfS8ke2Fzc2V0fS9zdW1tYXJ5P291dHB1dEFzc2V0PSR7aW5wdXRzLm91dHB1dEFzc2V0fWA7XHJcbiAgICAgIGNvbnN0IGNvbmZpZzogQXhpb3NSZXF1ZXN0Q29uZmlnID0ge1xyXG4gICAgICAgIG1ldGhvZDogJ2dldCcsXHJcbiAgICAgICAgdXJsOiB1cmwsXHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICAgICd0b2tlbic6IHRoaXMuY29uZmlnLnRva2VuXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgICBjb25zdCByZXNwb25zZTogQXhpb3NSZXNwb25zZSA9IGF3YWl0IGF4aW9zKGNvbmZpZykuY2F0Y2goZXJyID0+IFByb21pc2UucmVqZWN0KGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzIDwgNTAwID8gbmV3IFdlYlNlcnZpY2VFcnJvcihlcnIucmVzcG9uc2UuZGF0YSkgOiBlcnIpKTtcclxuICAgICAgY29uc3QgZGVub3JtQWRkcmVzczogc3RyaW5nW10gPSBbXTtcclxuICAgICAgZGVub3JtQWRkcmVzcy5wdXNoKGAke3Jlc3BvbnNlLmRhdGEuYXNzZXR9OiR7cmVzcG9uc2UuZGF0YS5hZGRyZXNzfWApO1xyXG4gICAgICBkZW5vcm1BZGRyZXNzLnB1c2goYCR7cmVzcG9uc2UuZGF0YS5hc3NldH06JHtyZXNwb25zZS5kYXRhLnJvb3RBZGRyZXNzfWApO1xyXG4gICAgICBPYmplY3QuYXNzaWduKHJlc3BvbnNlLmRhdGEsIHtcclxuICAgICAgICBzaXJlbkRlbm9ybUFkZHJlc3M6IGRlbm9ybUFkZHJlc3MsXHJcbiAgICAgICAgaWQ6IGAke3Jlc3BvbnNlLmRhdGEuYXNzZXR9OiR7cmVzcG9uc2UuZGF0YS5hZGRyZXNzfWBcclxuICAgICAgfSk7XHJcbiAgICAgIG92ZXJhbGxSZXN1bHRzLnB1c2gocmVzcG9uc2UuZGF0YSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBiYWxhbmNlOiBvdmVyYWxsUmVzdWx0c1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=
