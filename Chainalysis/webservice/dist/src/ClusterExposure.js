"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web_service_interface_1 = require("@sirensolutions/web-service-interface");
const axios_1 = require("axios");
const cryptoRegexPatterns = {
    'BTC': '^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$',
    'ETH': '^(?:0x)?[a-fA-F0-9]{40,42}$',
    'USDT': '^1[1-9][a-zA-Z0-9]{24,33}$',
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
class ClusterExposure extends web_service_interface_1.ServiceDefinition {
    constructor() {
        super(...arguments);
        this.name = 'cluster_exposure';
        this.inputSchema = {
            address: { type: 'text', required: true },
            asset: { type: 'text', required: false },
            outputAsset: { type: 'text', required: false },
        };
        this.outputConfiguration = {
            exposure: {
                'percentage': 'long',
                'value': 'long'
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
        let overallExposure = [];
        for (const asset of matchedAssets) {
            const exposure_paths = ['SENDING', 'RECEIVING', 'SENDING/services', 'RECEIVING/services'];
            let exposure = [];
            for (let z = 0; z < exposure_paths.length; z++) {
                let exposure_url = `https://iapi.chainalysis.com/exposures/clusters/${inputs.address}/${asset}/directions/${exposure_paths[z]}?outputAsset=${inputs.outputAsset}`;
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
                    for (let b = 0; exposure_response.data.indirectExposure.services && b < exposure_response.data.indirectExposure.services.length; b++) {
                        Object.assign(exposure_response.data.indirectExposure.services[b], {
                            type: 'Service',
                            exposure: 'indirectExposure',
                            direction: exposure_paths[z],
                            outputAsset: exposure_response.data.outputAsset,
                            asset: exposure_response.data.asset,
                            inputAddress: exposure_response.data.rootAddress,
                            id: `${exposure_response.data.asset}:${exposure_response.data.rootAddress}:indirectExposure:${exposure_paths[z]}:${exposure_response.data.indirectExposure.services[b].rootAddress}`,
                            sirenDenormRootAddress: `${exposure_response.data.asset}:${exposure_response.data.rootAddress}`,
                            sirenDenormExposureAddress: `${exposure_response.data.asset}:${exposure_response.data.indirectExposure.services[b].rootAddress}`,
                        });
                        exposure.push(exposure_response.data.indirectExposure.services[b]);
                    }
                }
                catch { }
                try {
                    for (let b = 0; exposure_response.data.directExposure.services && b < exposure_response.data.directExposure.services.length; b++) {
                        Object.assign(exposure_response.data.directExposure.services[b], {
                            type: 'Service',
                            exposure: 'directExposure',
                            direction: exposure_paths[z],
                            outputAsset: exposure_response.data.outputAsset,
                            asset: exposure_response.data.asset,
                            inputAddress: exposure_response.data.rootAddress,
                            id: `${exposure_response.data.asset}:${exposure_response.data.rootAddress}:directExposure:${exposure_paths[z]}:${exposure_response.data.directExposure.services[b].rootAddress}`,
                            sirenDenormRootAddress: `${exposure_response.data.asset}:${exposure_response.data.rootAddress}`,
                            sirenDenormExposureAddress: `${exposure_response.data.asset}:${exposure_response.data.directExposure.services[b].rootAddress}`,
                        });
                        exposure.push(exposure_response.data.directExposure.services[b]);
                    }
                }
                catch { }
                try {
                    for (let b = 0; exposure_response.data.indirectExposure.categories && b < exposure_response.data.indirectExposure.categories.length; b++) {
                        Object.assign(exposure_response.data.indirectExposure.categories[b], {
                            type: 'Category',
                            exposure: 'indirectExposure',
                            direction: exposure_paths[z],
                            outputAsset: exposure_response.data.outputAsset,
                            asset: exposure_response.data.asset,
                            inputAddress: exposure_response.data.rootAddress,
                            id: `${exposure_response.data.asset}:${exposure_response.data.rootAddress}:indirectExposure:${exposure_paths[z]}:${exposure_response.data.indirectExposure.categories[b].category}`,
                            sirenDenormRootAddress: `${exposure_response.data.asset}:${exposure_response.data.rootAddress}`
                        });
                        exposure.push(exposure_response.data.indirectExposure.categories[b]);
                    }
                }
                catch { }
                try {
                    for (let b = 0; exposure_response.data.directExposure.categories && b < exposure_response.data.directExposure.categories.length; b++) {
                        Object.assign(exposure_response.data.directExposure.categories[b], {
                            type: 'Category',
                            exposure: 'directExposure',
                            direction: exposure_paths[z],
                            outputAsset: exposure_response.data.outputAsset,
                            asset: exposure_response.data.asset,
                            inputAddress: exposure_response.data.rootAddress,
                            id: `${exposure_response.data.asset}:${exposure_response.data.rootAddress}:directExposure:${exposure_paths[z]}:${exposure_response.data.directExposure.categories[b].category}`,
                            sirenDenormRootAddress: `${exposure_response.data.asset}:${exposure_response.data.rootAddress}`,
                        });
                        exposure.push(exposure_response.data.directExposure.categories[b]);
                    }
                }
                catch { }
            }
            overallExposure.push(...exposure);
        }
        return {
            exposure: overallExposure
        };
    }
}
exports.default = ClusterExposure;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9DbHVzdGVyRXhwb3N1cmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxpRkFBK0k7QUFDL0ksaUNBQWlFO0FBRWpFLE1BQU0sbUJBQW1CLEdBQUc7SUFDeEIsS0FBSyxFQUFFLHNDQUFzQztJQUM3QyxLQUFLLEVBQUUsNkJBQTZCO0lBQ3BDLE1BQU0sRUFBRSw0QkFBNEI7SUFDcEMsS0FBSyxFQUFFLHVCQUF1QjtJQUM5QixLQUFLLEVBQUUsc0JBQXNCO0lBQzdCLEtBQUssRUFBRSxvQkFBb0I7SUFDM0IsS0FBSyxFQUFFLDBCQUEwQjtJQUNqQyxNQUFNLEVBQUUsb0JBQW9CO0lBQzVCLEtBQUssRUFBRSxvQkFBb0I7SUFDM0IsS0FBSyxFQUFFLGdDQUFnQztJQUN2QyxLQUFLLEVBQUUsb0JBQW9CO0lBQzNCLE1BQU0sRUFBRSxxQkFBcUI7SUFDN0IsS0FBSyxFQUFFLGlCQUFpQjtJQUN4QixLQUFLLEVBQUUsb0JBQW9CO0lBQzNCLE1BQU0sRUFBRSx1QkFBdUI7Q0FFbEMsQ0FBQztBQUVGLE1BQXFCLGVBQWdCLFNBQVEseUNBQWlCO0lBQTlEOztRQUNhLFNBQUksR0FBRyxrQkFBa0IsQ0FBQztRQUMxQixnQkFBVyxHQUFnQjtZQUNoQyxPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7WUFDekMsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFO1lBQ3hDLFdBQVcsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRTtTQUNqRCxDQUFDO1FBQ08sd0JBQW1CLEdBQXdCO1lBQ2hELFFBQVEsRUFBRTtnQkFDTixZQUFZLEVBQUUsTUFBTTtnQkFDcEIsT0FBTyxFQUFFLE1BQU07YUFDbEI7U0FDSixDQUFBO0lBbUdMLENBQUM7SUFqR1csY0FBYyxDQUFDLE9BQWU7UUFDbEMsT0FBTyxNQUFNLENB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SyxJQUFJLGlCQUFpQixDQUFDLElBQUksQ0FBQyxXQUFXLG1CQUFtQixjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUksaUJBQWlCLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFOzRCQUMvSyxzQkFBc0IsRUFBRSxHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksaUJBQWlCLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTt5QkFDbEcsQ0FBQyxDQUFBO3dCQUNGLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtxQkFDckU7aUJBQ0o7Z0JBQUMsTUFBTSxHQUFHO2FBQ2Q7WUFDRCxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUM7U0FDckM7UUFDRCxPQUFPO1lBQ0gsUUFBUSxFQUFFLGVBQWU7U0FDNUIsQ0FBQTtJQUNMLENBQUM7Q0FDSjtBQS9HRCxrQ0ErR0MiLCJmaWxlIjoic3JjL0NsdXN0ZXJFeHBvc3VyZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERhdGFJbmRleFJlc3VsdHMsIElucHV0U2NoZW1hLCBPdXRwdXRDb25maWd1cmF0aW9uLCBTZXJ2aWNlRGVmaW5pdGlvbiwgV2ViU2VydmljZUVycm9yIH0gZnJvbSAnQHNpcmVuc29sdXRpb25zL3dlYi1zZXJ2aWNlLWludGVyZmFjZSc7XHJcbmltcG9ydCBheGlvcywgeyBBeGlvc1JlcXVlc3RDb25maWcsIEF4aW9zUmVzcG9uc2UgfSBmcm9tICdheGlvcyc7XHJcblxyXG5jb25zdCBjcnlwdG9SZWdleFBhdHRlcm5zID0ge1xyXG4gICAgJ0JUQyc6ICdeKGJjMXxbMTNdKVthLXpBLUhKLU5QLVowLTldezI1LDM5fSQnLCAvLyBCaXRjb2luIChCVEMpIGluY2x1ZGluZyBiZWNoMzIgYWRkcmVzc2VzXHJcbiAgICAnRVRIJzogJ14oPzoweCk/W2EtZkEtRjAtOV17NDAsNDJ9JCcsIC8vIEV0aGVyZXVtXHJcbiAgICAnVVNEVCc6ICdeMVsxLTldW2EtekEtWjAtOV17MjQsMzN9JCcsIC8vIFRldGhlclxyXG4gICAgJ1hSUCc6ICdeclswLTlhLXpBLVpdezI0LDM0fSQnLCAvLyBSaXBwbGVcclxuICAgICdCTkInOiAnXmJuYlswLTlhLXpBLVpdezM4fSQnLCAvLyBCaW5hbmNlIENvaW5cclxuICAgICdBREEnOiAnXkFlMnRkUHdVUEVZeXs0NH0kJywgLy8gQ2FyZGFub1xyXG4gICAgJ1NPTCc6ICdeU29bMS05XVswLTlhLXpBLVpdezQ4fSQnLCAvLyBTb2xhbmFcclxuICAgICdET0dFJzogJ15EWzAtOWEtZkEtRl17MzJ9JCcsIC8vIERvZ2Vjb2luXHJcbiAgICAnVFJYJzogJ15UWzAtOWEtZkEtRl17MzN9JCcsIC8vIFRyb25cclxuICAgICdMVEMnOiAnXkxbYS1rbS16QS1ISi1OUC1aMS05XXsyNiwzM30kJywgLy8gTGl0ZWNvaW5cclxuICAgICdET1QnOiAnXjFbYS16QS1aMC05XXszMX0kJywgLy8gUG9sa2Fkb3RcclxuICAgICdMSU5LJzogJ14weFthLWZBLUYwLTldezQwfSQnLCAvLyBDaGFpbmxpbmtcclxuICAgICdYTE0nOiAnXkdbQS1aMC05XXs1NX0kJywgLy8gU3RlbGxhciBMdW1lbnNcclxuICAgICdYTVInOiAnXjRbMC05QS1aYS16XXs5NH0kJywgLy8gTW9uZXJvXHJcbiAgICAnQVRPTSc6ICdeY29zbW9zMVthLXowLTldezM4fSQnLCAvLyBDb3Ntb3NcclxuICAgIC8vIEFkZCBtb3JlIHBhdHRlcm5zIGhlcmUgZm9yIG90aGVyIGNyeXB0b2N1cnJlbmNpZXNcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENsdXN0ZXJFeHBvc3VyZSBleHRlbmRzIFNlcnZpY2VEZWZpbml0aW9uIHtcclxuICAgIHJlYWRvbmx5IG5hbWUgPSAnY2x1c3Rlcl9leHBvc3VyZSc7XHJcbiAgICByZWFkb25seSBpbnB1dFNjaGVtYTogSW5wdXRTY2hlbWEgPSB7XHJcbiAgICAgICAgYWRkcmVzczogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICAgICAgYXNzZXQ6IHsgdHlwZTogJ3RleHQnLCByZXF1aXJlZDogZmFsc2UgfSxcclxuICAgICAgICBvdXRwdXRBc3NldDogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiBmYWxzZSB9LFxyXG4gICAgfTtcclxuICAgIHJlYWRvbmx5IG91dHB1dENvbmZpZ3VyYXRpb246IE91dHB1dENvbmZpZ3VyYXRpb24gPSB7XHJcbiAgICAgICAgZXhwb3N1cmU6IHtcclxuICAgICAgICAgICAgJ3BlcmNlbnRhZ2UnOiAnbG9uZycsXHJcbiAgICAgICAgICAgICd2YWx1ZSc6ICdsb25nJ1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGluZmVyQXNzZXRUeXBlKGFkZHJlc3M6IHN0cmluZyk6IHN0cmluZ1tdIHtcclxuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMoY3J5cHRvUmVnZXhQYXR0ZXJucykuZmlsdGVyKGFzc2V0ID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoY3J5cHRvUmVnZXhQYXR0ZXJuc1thc3NldF0pLnRlc3QoYWRkcmVzcyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgaW52b2tlKGlucHV0czoge1xyXG4gICAgICAgIGFkZHJlc3M6IHN0cmluZyxcclxuICAgICAgICBhc3NldD86IHN0cmluZyxcclxuICAgICAgICBvdXRwdXRBc3NldD86IHN0cmluZyxcclxuICAgIH0pOiBQcm9taXNlPERhdGFJbmRleFJlc3VsdHM+IHtcclxuICAgICAgICBsZXQgbWF0Y2hlZEFzc2V0cyA9IGlucHV0cy5hc3NldCA/IFtpbnB1dHMuYXNzZXRdIDogdGhpcy5pbmZlckFzc2V0VHlwZShpbnB1dHMuYWRkcmVzcyk7XHJcbiAgICAgICAgbGV0IG92ZXJhbGxFeHBvc3VyZTogYW55W10gPSBbXTtcclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBhc3NldCBvZiBtYXRjaGVkQXNzZXRzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGV4cG9zdXJlX3BhdGhzID0gWydTRU5ESU5HJywgJ1JFQ0VJVklORycsICdTRU5ESU5HL3NlcnZpY2VzJywgJ1JFQ0VJVklORy9zZXJ2aWNlcyddXHJcbiAgICAgICAgICAgIGxldCBleHBvc3VyZTogb2JqZWN0W10gPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgeiA9IDA7IHogPCBleHBvc3VyZV9wYXRocy5sZW5ndGg7IHorKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGV4cG9zdXJlX3VybCA9IGBodHRwczovL2lhcGkuY2hhaW5hbHlzaXMuY29tL2V4cG9zdXJlcy9jbHVzdGVycy8ke2lucHV0cy5hZGRyZXNzfS8ke2Fzc2V0fS9kaXJlY3Rpb25zLyR7ZXhwb3N1cmVfcGF0aHNbel19P291dHB1dEFzc2V0PSR7aW5wdXRzLm91dHB1dEFzc2V0fWBcclxuICAgICAgICAgICAgICAgIGxldCBleHBvc3VyZV9jb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdnZXQnLFxyXG4gICAgICAgICAgICAgICAgICAgIHVybDogZXhwb3N1cmVfdXJsLFxyXG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ3Rva2VuJzogdGhpcy5jb25maWcudG9rZW5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgbGV0IGV4cG9zdXJlX3Jlc3BvbnNlOiBBeGlvc1Jlc3BvbnNlID0gYXdhaXQgYXhpb3MoZXhwb3N1cmVfY29uZmlnKS5jYXRjaChlcnIgPT4gUHJvbWlzZS5yZWplY3QoZXJyLnJlc3BvbnNlICYmIGVyci5yZXNwb25zZS5zdGF0dXMgPCA1MDAgPyBuZXcgV2ViU2VydmljZUVycm9yKGVyci5yZXNwb25zZS5kYXRhKSA6IGVycikpO1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBiID0gMDsgZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5pbmRpcmVjdEV4cG9zdXJlLnNlcnZpY2VzICYmIGIgPCBleHBvc3VyZV9yZXNwb25zZS5kYXRhLmluZGlyZWN0RXhwb3N1cmUuc2VydmljZXMubGVuZ3RoOyBiKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihleHBvc3VyZV9yZXNwb25zZS5kYXRhLmluZGlyZWN0RXhwb3N1cmUuc2VydmljZXNbYl0sIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdTZXJ2aWNlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9zdXJlOiAnaW5kaXJlY3RFeHBvc3VyZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb246IGV4cG9zdXJlX3BhdGhzW3pdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0QXNzZXQ6IGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEub3V0cHV0QXNzZXQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NldDogZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5hc3NldCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0QWRkcmVzczogZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5yb290QWRkcmVzcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBgJHtleHBvc3VyZV9yZXNwb25zZS5kYXRhLmFzc2V0fToke2V4cG9zdXJlX3Jlc3BvbnNlLmRhdGEucm9vdEFkZHJlc3N9OmluZGlyZWN0RXhwb3N1cmU6JHtleHBvc3VyZV9wYXRoc1t6XX06JHtleHBvc3VyZV9yZXNwb25zZS5kYXRhLmluZGlyZWN0RXhwb3N1cmUuc2VydmljZXNbYl0ucm9vdEFkZHJlc3N9YCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpcmVuRGVub3JtUm9vdEFkZHJlc3M6IGAke2V4cG9zdXJlX3Jlc3BvbnNlLmRhdGEuYXNzZXR9OiR7ZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5yb290QWRkcmVzc31gLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2lyZW5EZW5vcm1FeHBvc3VyZUFkZHJlc3M6IGAke2V4cG9zdXJlX3Jlc3BvbnNlLmRhdGEuYXNzZXR9OiR7ZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5pbmRpcmVjdEV4cG9zdXJlLnNlcnZpY2VzW2JdLnJvb3RBZGRyZXNzfWAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9zdXJlLnB1c2goZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5pbmRpcmVjdEV4cG9zdXJlLnNlcnZpY2VzW2JdKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggeyB9XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGIgPSAwOyBleHBvc3VyZV9yZXNwb25zZS5kYXRhLmRpcmVjdEV4cG9zdXJlLnNlcnZpY2VzICYmIGIgPCBleHBvc3VyZV9yZXNwb25zZS5kYXRhLmRpcmVjdEV4cG9zdXJlLnNlcnZpY2VzLmxlbmd0aDsgYisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5kaXJlY3RFeHBvc3VyZS5zZXJ2aWNlc1tiXSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ1NlcnZpY2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwb3N1cmU6ICdkaXJlY3RFeHBvc3VyZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb246IGV4cG9zdXJlX3BhdGhzW3pdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0QXNzZXQ6IGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEub3V0cHV0QXNzZXQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NldDogZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5hc3NldCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0QWRkcmVzczogZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5yb290QWRkcmVzcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBgJHtleHBvc3VyZV9yZXNwb25zZS5kYXRhLmFzc2V0fToke2V4cG9zdXJlX3Jlc3BvbnNlLmRhdGEucm9vdEFkZHJlc3N9OmRpcmVjdEV4cG9zdXJlOiR7ZXhwb3N1cmVfcGF0aHNbel19OiR7ZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5kaXJlY3RFeHBvc3VyZS5zZXJ2aWNlc1tiXS5yb290QWRkcmVzc31gLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2lyZW5EZW5vcm1Sb290QWRkcmVzczogYCR7ZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5hc3NldH06JHtleHBvc3VyZV9yZXNwb25zZS5kYXRhLnJvb3RBZGRyZXNzfWAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaXJlbkRlbm9ybUV4cG9zdXJlQWRkcmVzczogYCR7ZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5hc3NldH06JHtleHBvc3VyZV9yZXNwb25zZS5kYXRhLmRpcmVjdEV4cG9zdXJlLnNlcnZpY2VzW2JdLnJvb3RBZGRyZXNzfWAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9zdXJlLnB1c2goZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5kaXJlY3RFeHBvc3VyZS5zZXJ2aWNlc1tiXSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIHsgfVxyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBiID0gMDsgZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5pbmRpcmVjdEV4cG9zdXJlLmNhdGVnb3JpZXMgJiYgYiA8IGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEuaW5kaXJlY3RFeHBvc3VyZS5jYXRlZ29yaWVzLmxlbmd0aDsgYisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5pbmRpcmVjdEV4cG9zdXJlLmNhdGVnb3JpZXNbYl0sIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdDYXRlZ29yeScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBvc3VyZTogJ2luZGlyZWN0RXhwb3N1cmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uOiBleHBvc3VyZV9wYXRoc1t6XSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dEFzc2V0OiBleHBvc3VyZV9yZXNwb25zZS5kYXRhLm91dHB1dEFzc2V0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXQ6IGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEuYXNzZXQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dEFkZHJlc3M6IGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEucm9vdEFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogYCR7ZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5hc3NldH06JHtleHBvc3VyZV9yZXNwb25zZS5kYXRhLnJvb3RBZGRyZXNzfTppbmRpcmVjdEV4cG9zdXJlOiR7ZXhwb3N1cmVfcGF0aHNbel19OiR7ZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5pbmRpcmVjdEV4cG9zdXJlLmNhdGVnb3JpZXNbYl0uY2F0ZWdvcnl9YCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpcmVuRGVub3JtUm9vdEFkZHJlc3M6IGAke2V4cG9zdXJlX3Jlc3BvbnNlLmRhdGEuYXNzZXR9OiR7ZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5yb290QWRkcmVzc31gXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9zdXJlLnB1c2goZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5pbmRpcmVjdEV4cG9zdXJlLmNhdGVnb3JpZXNbYl0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCB7IH1cclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgYiA9IDA7IGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEuZGlyZWN0RXhwb3N1cmUuY2F0ZWdvcmllcyAmJiBiIDwgZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5kaXJlY3RFeHBvc3VyZS5jYXRlZ29yaWVzLmxlbmd0aDsgYisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5kaXJlY3RFeHBvc3VyZS5jYXRlZ29yaWVzW2JdLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnQ2F0ZWdvcnknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwb3N1cmU6ICdkaXJlY3RFeHBvc3VyZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb246IGV4cG9zdXJlX3BhdGhzW3pdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0QXNzZXQ6IGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEub3V0cHV0QXNzZXQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NldDogZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5hc3NldCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0QWRkcmVzczogZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5yb290QWRkcmVzcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBgJHtleHBvc3VyZV9yZXNwb25zZS5kYXRhLmFzc2V0fToke2V4cG9zdXJlX3Jlc3BvbnNlLmRhdGEucm9vdEFkZHJlc3N9OmRpcmVjdEV4cG9zdXJlOiR7ZXhwb3N1cmVfcGF0aHNbel19OiR7ZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5kaXJlY3RFeHBvc3VyZS5jYXRlZ29yaWVzW2JdLmNhdGVnb3J5fWAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaXJlbkRlbm9ybVJvb3RBZGRyZXNzOiBgJHtleHBvc3VyZV9yZXNwb25zZS5kYXRhLmFzc2V0fToke2V4cG9zdXJlX3Jlc3BvbnNlLmRhdGEucm9vdEFkZHJlc3N9YCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwb3N1cmUucHVzaChleHBvc3VyZV9yZXNwb25zZS5kYXRhLmRpcmVjdEV4cG9zdXJlLmNhdGVnb3JpZXNbYl0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCB7IH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvdmVyYWxsRXhwb3N1cmUucHVzaCguLi5leHBvc3VyZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGV4cG9zdXJlOiBvdmVyYWxsRXhwb3N1cmVcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl19
