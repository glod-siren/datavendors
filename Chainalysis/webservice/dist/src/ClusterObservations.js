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
class ClusterObservations extends web_service_interface_1.ServiceDefinition {
    constructor() {
        super(...arguments);
        this.name = 'cluster_observations';
        this.inputSchema = {
            address: { type: 'text', required: true },
            asset: { type: 'text', required: false },
            startTime: { type: 'date', required: false },
            endTime: { type: 'date', required: false }
        };
        this.outputConfiguration = {
            observation: {
                'lat': 'long',
                'long': 'long',
                'timestamp': 'date',
                'geo_location': 'geo_point',
                'ipAddress': 'keyword',
                'port': 'keyword'
            }
        };
    }
    inferAssetType(address) {
        return Object.keys(cryptoRegexPatterns).filter(asset => {
            return new RegExp(cryptoRegexPatterns[asset]).test(address);
        });
    }
    async invoke(inputs) {
        const matchedAssets = inputs.asset ? [inputs.asset] : this.inferAssetType(inputs.address);
        let overallResults = [];
        for (const asset of matchedAssets) {
            let obs_url = `https://iapi.chainalysis.com/observations/clusters/${inputs.address}/${asset}?`;
            if (inputs.startTime) {
                obs_url = obs_url + `&startTime=${inputs.startTime}`;
            }
            if (inputs.endTime) {
                obs_url = obs_url + `&endTime=${inputs.endTime}`;
            }
            const obs_config = {
                method: 'get',
                url: obs_url,
                headers: {
                    'Accept': 'application/json',
                    'token': this.config.token
                }
            };
            const obs_response = await axios_1.default(obs_config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new web_service_interface_1.WebServiceError(err.response.data) : err));
            for (let y = 0; y < obs_response.data.observations.length; y++) {
                let denormAddress = [];
                denormAddress.push(`${asset}:${obs_response.data.observations[y].walletRootAddress}`);
                denormAddress.push(`${asset}:${obs_response.data.address}`);
                denormAddress.push(`${asset}:${obs_response.data.rootAddress}`);
                Object.assign(obs_response.data.observations[y], {
                    sirenDenormAddress: ([...new Set(denormAddress)]),
                    id: obs_response.data.observations[y].walletRootAddress + ':' + obs_response.data.observations[y].timestamp,
                    address: obs_response.data.observations[y].walletRootAddress,
                    rootAddress: obs_response.data.rootAddress,
                    geo_location: obs_response.data.observations[y].lat + ',' + obs_response.data.observations[y].long
                });
                overallResults.push(obs_response.data.observations[y]);
            }
        }
        return {
            observation: overallResults
        };
    }
}
exports.default = ClusterObservations;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9DbHVzdGVyT2JzZXJ2YXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUZBQStJO0FBQy9JLGlDQUFpRTtBQUVqRSxNQUFNLG1CQUFtQixHQUFHO0lBQ3hCLEtBQUssRUFBRSxzQ0FBc0M7SUFDN0MsS0FBSyxFQUFFLDZCQUE2QjtJQUNwQyxNQUFNLEVBQUUsNEJBQTRCO0lBQ3BDLEtBQUssRUFBRSx1QkFBdUI7SUFDOUIsS0FBSyxFQUFFLHNCQUFzQjtJQUM3QixLQUFLLEVBQUUsb0JBQW9CO0lBQzNCLEtBQUssRUFBRSwwQkFBMEI7SUFDakMsTUFBTSxFQUFFLG9CQUFvQjtJQUM1QixLQUFLLEVBQUUsb0JBQW9CO0lBQzNCLEtBQUssRUFBRSxnQ0FBZ0M7SUFDdkMsS0FBSyxFQUFFLG9CQUFvQjtJQUMzQixNQUFNLEVBQUUscUJBQXFCO0lBQzdCLEtBQUssRUFBRSxpQkFBaUI7SUFDeEIsS0FBSyxFQUFFLG9CQUFvQjtJQUMzQixNQUFNLEVBQUUsdUJBQXVCO0NBRWxDLENBQUM7QUFFRixNQUFxQixtQkFBb0IsU0FBUSx5Q0FBaUI7SUFBbEU7O1FBQ2EsU0FBSSxHQUFHLHNCQUFzQixDQUFDO1FBQzlCLGdCQUFXLEdBQWdCO1lBQ2hDLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtZQUN6QyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUU7WUFDeEMsU0FBUyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFO1lBQzVDLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRTtTQUM3QyxDQUFDO1FBQ08sd0JBQW1CLEdBQXdCO1lBQ2hELFdBQVcsRUFBRTtnQkFDVCxLQUFLLEVBQUcsTUFBTTtnQkFDZCxNQUFNLEVBQUUsTUFBTTtn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QUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLEdBQUcsR0FBRyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7b0JBQzNHLE9BQU8sRUFBRSxZQUFZLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxpQkFBaUI7b0JBQzVELFdBQVcsRUFBRSxZQUFZLENBQUMsSUFBSSxDQUFDLFdBQVc7b0JBQzFDLFlBQVksRUFBRSxZQUFZLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7aUJBQ3JHLENBQUMsQ0FBQTtnQkFDRixjQUFjLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDMUQ7U0FDSjtRQUVELE9BQU87WUFDSCxXQUFXLEVBQUUsY0FBYztTQUM5QixDQUFBO0lBQ0wsQ0FBQztDQUNKO0FBbkVELHNDQW1FQyIsImZpbGUiOiJzcmMvQ2x1c3Rlck9ic2VydmF0aW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERhdGFJbmRleFJlc3VsdHMsIElucHV0U2NoZW1hLCBPdXRwdXRDb25maWd1cmF0aW9uLCBTZXJ2aWNlRGVmaW5pdGlvbiwgV2ViU2VydmljZUVycm9yIH0gZnJvbSAnQHNpcmVuc29sdXRpb25zL3dlYi1zZXJ2aWNlLWludGVyZmFjZSc7XHJcbmltcG9ydCBheGlvcywgeyBBeGlvc1JlcXVlc3RDb25maWcsIEF4aW9zUmVzcG9uc2UgfSBmcm9tICdheGlvcyc7XHJcblxyXG5jb25zdCBjcnlwdG9SZWdleFBhdHRlcm5zID0ge1xyXG4gICAgJ0JUQyc6ICdeKGJjMXxbMTNdKVthLXpBLUhKLU5QLVowLTldezI1LDM5fSQnLCAvLyBCaXRjb2luIChCVEMpIGluY2x1ZGluZyBiZWNoMzIgYWRkcmVzc2VzXHJcbiAgICAnRVRIJzogJ14oPzoweCk/W2EtZkEtRjAtOV17NDAsNDJ9JCcsIC8vIEV0aGVyZXVtXHJcbiAgICAnVVNEVCc6ICdeMVsxLTldW2EtekEtWjAtOV17MjQsMzN9JCcsIC8vIFRldGhlclxyXG4gICAgJ1hSUCc6ICdeclswLTlhLXpBLVpdezI0LDM0fSQnLCAvLyBSaXBwbGVcclxuICAgICdCTkInOiAnXmJuYlswLTlhLXpBLVpdezM4fSQnLCAvLyBCaW5hbmNlIENvaW5cclxuICAgICdBREEnOiAnXkFlMnRkUHdVUEVZeXs0NH0kJywgLy8gQ2FyZGFub1xyXG4gICAgJ1NPTCc6ICdeU29bMS05XVswLTlhLXpBLVpdezQ4fSQnLCAvLyBTb2xhbmFcclxuICAgICdET0dFJzogJ15EWzAtOWEtZkEtRl17MzJ9JCcsIC8vIERvZ2Vjb2luXHJcbiAgICAnVFJYJzogJ15UWzAtOWEtZkEtRl17MzN9JCcsIC8vIFRyb25cclxuICAgICdMVEMnOiAnXkxbYS1rbS16QS1ISi1OUC1aMS05XXsyNiwzM30kJywgLy8gTGl0ZWNvaW5cclxuICAgICdET1QnOiAnXjFbYS16QS1aMC05XXszMX0kJywgLy8gUG9sa2Fkb3RcclxuICAgICdMSU5LJzogJ14weFthLWZBLUYwLTldezQwfSQnLCAvLyBDaGFpbmxpbmtcclxuICAgICdYTE0nOiAnXkdbQS1aMC05XXs1NX0kJywgLy8gU3RlbGxhciBMdW1lbnNcclxuICAgICdYTVInOiAnXjRbMC05QS1aYS16XXs5NH0kJywgLy8gTW9uZXJvXHJcbiAgICAnQVRPTSc6ICdeY29zbW9zMVthLXowLTldezM4fSQnLCAvLyBDb3Ntb3NcclxuICAgIC8vIEFkZCBtb3JlIHBhdHRlcm5zIGhlcmUgZm9yIG90aGVyIGNyeXB0b2N1cnJlbmNpZXNcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENsdXN0ZXJPYnNlcnZhdGlvbnMgZXh0ZW5kcyBTZXJ2aWNlRGVmaW5pdGlvbiB7XHJcbiAgICByZWFkb25seSBuYW1lID0gJ2NsdXN0ZXJfb2JzZXJ2YXRpb25zJztcclxuICAgIHJlYWRvbmx5IGlucHV0U2NoZW1hOiBJbnB1dFNjaGVtYSA9IHtcclxuICAgICAgICBhZGRyZXNzOiB7IHR5cGU6ICd0ZXh0JywgcmVxdWlyZWQ6IHRydWUgfSxcclxuICAgICAgICBhc3NldDogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiBmYWxzZSB9LFxyXG4gICAgICAgIHN0YXJ0VGltZTogeyB0eXBlOiAnZGF0ZScsIHJlcXVpcmVkOiBmYWxzZSB9LFxyXG4gICAgICAgIGVuZFRpbWU6IHsgdHlwZTogJ2RhdGUnLCByZXF1aXJlZDogZmFsc2UgfVxyXG4gICAgfTtcclxuICAgIHJlYWRvbmx5IG91dHB1dENvbmZpZ3VyYXRpb246IE91dHB1dENvbmZpZ3VyYXRpb24gPSB7XHJcbiAgICAgICAgb2JzZXJ2YXRpb246IHtcclxuICAgICAgICAgICAgJ2xhdCcgOiAnbG9uZycsXHJcbiAgICAgICAgICAgICdsb25nJzogJ2xvbmcnLFxyXG4gICAgICAgICAgICAndGltZXN0YW1wJzogJ2RhdGUnLFxyXG4gICAgICAgICAgICAnZ2VvX2xvY2F0aW9uJzogJ2dlb19wb2ludCcsXHJcbiAgICAgICAgICAgICdpcEFkZHJlc3MnOiAna2V5d29yZCcsXHJcbiAgICAgICAgICAgICdwb3J0JzogJ2tleXdvcmQnXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBwcml2YXRlIGluZmVyQXNzZXRUeXBlKGFkZHJlc3M6IHN0cmluZyk6IHN0cmluZ1tdIHtcclxuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMoY3J5cHRvUmVnZXhQYXR0ZXJucykuZmlsdGVyKGFzc2V0ID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoY3J5cHRvUmVnZXhQYXR0ZXJuc1thc3NldF0pLnRlc3QoYWRkcmVzcyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgaW52b2tlKGlucHV0czoge1xyXG4gICAgICAgIGFkZHJlc3M6IHN0cmluZyxcclxuICAgICAgICBhc3NldD86IHN0cmluZyxcclxuICAgICAgICBzdGFydFRpbWU6IHN0cmluZyxcclxuICAgICAgICBlbmRUaW1lOiBzdHJpbmdcclxuICAgIH0pOiBQcm9taXNlPERhdGFJbmRleFJlc3VsdHM+IHtcclxuICAgICAgICBjb25zdCBtYXRjaGVkQXNzZXRzID0gaW5wdXRzLmFzc2V0ID8gW2lucHV0cy5hc3NldF0gOiB0aGlzLmluZmVyQXNzZXRUeXBlKGlucHV0cy5hZGRyZXNzKTtcclxuICAgICAgICBsZXQgb3ZlcmFsbFJlc3VsdHM6IG9iamVjdFtdID0gW107XHJcblxyXG4gICAgICAgIGZvciAoY29uc3QgYXNzZXQgb2YgbWF0Y2hlZEFzc2V0cykge1xyXG4gICAgICAgICAgICBsZXQgb2JzX3VybCA9IGBodHRwczovL2lhcGkuY2hhaW5hbHlzaXMuY29tL29ic2VydmF0aW9ucy9jbHVzdGVycy8ke2lucHV0cy5hZGRyZXNzfS8ke2Fzc2V0fT9gXHJcbiAgICAgICAgICAgIGlmIChpbnB1dHMuc3RhcnRUaW1lKSB7b2JzX3VybCA9IG9ic191cmwgKyBgJnN0YXJ0VGltZT0ke2lucHV0cy5zdGFydFRpbWV9YH1cclxuICAgICAgICAgICAgaWYgKGlucHV0cy5lbmRUaW1lKSB7b2JzX3VybCA9IG9ic191cmwgKyBgJmVuZFRpbWU9JHtpbnB1dHMuZW5kVGltZX1gfVxyXG4gICAgICAgICAgICBjb25zdCBvYnNfY29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdnZXQnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBvYnNfdXJsLFxyXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgICAgICAgICAgICAgJ3Rva2VuJzogdGhpcy5jb25maWcudG9rZW5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY29uc3Qgb2JzX3Jlc3BvbnNlOiBBeGlvc1Jlc3BvbnNlID0gYXdhaXQgYXhpb3Mob2JzX2NvbmZpZykuY2F0Y2goZXJyID0+IFByb21pc2UucmVqZWN0KGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzIDwgNTAwID8gbmV3IFdlYlNlcnZpY2VFcnJvcihlcnIucmVzcG9uc2UuZGF0YSkgOiBlcnIpKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCBvYnNfcmVzcG9uc2UuZGF0YS5vYnNlcnZhdGlvbnMubGVuZ3RoOyB5KyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBkZW5vcm1BZGRyZXNzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgZGVub3JtQWRkcmVzcy5wdXNoKGAke2Fzc2V0fToke29ic19yZXNwb25zZS5kYXRhLm9ic2VydmF0aW9uc1t5XS53YWxsZXRSb290QWRkcmVzc31gKVxyXG4gICAgICAgICAgICAgICAgZGVub3JtQWRkcmVzcy5wdXNoKGAke2Fzc2V0fToke29ic19yZXNwb25zZS5kYXRhLmFkZHJlc3N9YClcclxuICAgICAgICAgICAgICAgIGRlbm9ybUFkZHJlc3MucHVzaChgJHthc3NldH06JHtvYnNfcmVzcG9uc2UuZGF0YS5yb290QWRkcmVzc31gKVxyXG4gICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihvYnNfcmVzcG9uc2UuZGF0YS5vYnNlcnZhdGlvbnNbeV0sIHtcclxuICAgICAgICAgICAgICAgICAgICBzaXJlbkRlbm9ybUFkZHJlc3M6IChbLi4uIG5ldyBTZXQoZGVub3JtQWRkcmVzcyldKSxcclxuICAgICAgICAgICAgICAgICAgICBpZDogb2JzX3Jlc3BvbnNlLmRhdGEub2JzZXJ2YXRpb25zW3ldLndhbGxldFJvb3RBZGRyZXNzICsgJzonICsgb2JzX3Jlc3BvbnNlLmRhdGEub2JzZXJ2YXRpb25zW3ldLnRpbWVzdGFtcCxcclxuICAgICAgICAgICAgICAgICAgICBhZGRyZXNzOiBvYnNfcmVzcG9uc2UuZGF0YS5vYnNlcnZhdGlvbnNbeV0ud2FsbGV0Um9vdEFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgICAgICAgcm9vdEFkZHJlc3M6IG9ic19yZXNwb25zZS5kYXRhLnJvb3RBZGRyZXNzLFxyXG4gICAgICAgICAgICAgICAgICAgIGdlb19sb2NhdGlvbjogb2JzX3Jlc3BvbnNlLmRhdGEub2JzZXJ2YXRpb25zW3ldLmxhdCArICcsJyArIG9ic19yZXNwb25zZS5kYXRhLm9ic2VydmF0aW9uc1t5XS5sb25nXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgb3ZlcmFsbFJlc3VsdHMucHVzaChvYnNfcmVzcG9uc2UuZGF0YS5vYnNlcnZhdGlvbnNbeV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBvYnNlcnZhdGlvbjogb3ZlcmFsbFJlc3VsdHNcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl19
