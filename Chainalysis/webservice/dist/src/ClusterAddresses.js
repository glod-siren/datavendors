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
class ClusterAddresses extends web_service_interface_1.ServiceDefinition {
    constructor() {
        super(...arguments);
        this.name = 'cluster_address';
        this.inputSchema = {
            address: { type: 'text', required: true },
            asset: { type: 'text', required: false },
            page: { type: 'text', required: false },
            page_limit: { type: 'float', required: false },
        };
        this.outputConfiguration = {
            addresses: {},
            pagination: {
                'nextPage': 'keyword'
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
        let overallNextPage = '';
        let overallTruncated = false;
        for (const asset of matchedAssets) {
            let url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${asset}/addresses`;
            if (inputs.page) {
                url = url + `?page=${inputs.page}`;
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
            const pageLimit = inputs.page_limit ? (inputs.page_limit === 0 ? Number.MAX_SAFE_INTEGER : inputs.page_limit) : Number.MAX_SAFE_INTEGER;
            if (response.data.nextPage != null) {
                let page = response.data.nextPage;
                let lastResult = { nextPage: '' };
                let sub_response;
                let pageCounter = 0;
                while (lastResult.nextPage !== null && pageCounter < pageLimit) {
                    let sub_url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${asset}/addresses?page=${page}`;
                    const sub_config = {
                        method: 'get',
                        url: sub_url,
                        headers: {
                            'Accept': 'application/json',
                            'token': this.config.token
                        }
                    };
                    sub_response = await axios_1.default(sub_config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new web_service_interface_1.WebServiceError(err.response.data) : err));
                    lastResult = sub_response.data;
                    response.data.items.push.apply(response.data.items, sub_response.data.items);
                    page = lastResult.nextPage; // Update the page after all items have been processed for the current page.
                    pageCounter += 1;
                }
                for (let y = 0; y < response.data.items.length; y++) {
                    Object.assign(response.data.items[y], {
                        rootAddress: response.data.rootAddress,
                        asset: response.data.asset,
                        id: `${response.data.asset}:${response.data.items[y].address}`
                    });
                }
                overallResults.push.apply(overallResults, response.data.items);
                if (lastResult.nextPage !== null) {
                    overallTruncated = true;
                    overallNextPage = lastResult.nextPage;
                }
            }
        }
        return {
            addresses: Object.values(overallResults.reduce((acc, obj) => ({ ...acc, [obj.id]: obj }), {})),
            pagination: [{
                    totalresults: overallResults.length,
                    nextPage: overallNextPage
                }]
        };
    }
}
exports.default = ClusterAddresses;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LENBQUMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQy9ELElBQUksVUFBVSxDQUFDLFFBQVEsS0FBSyxJQUFJLEVBQUU7b0JBQ2hDLGdCQUFnQixHQUFHLElBQUksQ0FBQTtvQkFDdkIsZUFBZSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUE7aUJBQ3RDO2FBQ0Y7U0FFRjtRQUlELE9BQU87WUFDTCxTQUFTLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBZ0MsRUFBRSxHQUFhLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3JJLFVBQVUsRUFBRSxDQUFDO29CQUNYLFlBQVksRUFBRSxjQUFjLENBQUMsTUFBTTtvQkFDbkMsUUFBUSxFQUFFLGVBQWU7aUJBQzFCLENBQUM7U0FDSCxDQUFDO0lBQ0osQ0FBQztDQUNGO0FBakdELG1DQWlHQyIsImZpbGUiOiJzcmMvQ2x1c3RlckFkZHJlc3Nlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERhdGFJbmRleFJlc3VsdHMsIElucHV0U2NoZW1hLCBPdXRwdXRDb25maWd1cmF0aW9uLCBTZXJ2aWNlRGVmaW5pdGlvbiwgV2ViU2VydmljZUVycm9yIH0gZnJvbSAnQHNpcmVuc29sdXRpb25zL3dlYi1zZXJ2aWNlLWludGVyZmFjZSc7XG5pbXBvcnQgYXhpb3MsIHsgQXhpb3NSZXF1ZXN0Q29uZmlnLCBBeGlvc1Jlc3BvbnNlIH0gZnJvbSAnYXhpb3MnO1xuXG5jb25zdCBjcnlwdG9SZWdleFBhdHRlcm5zID0ge1xuICAnQlRDJzogJ14oYmMxfFsxM10pW2EtekEtSEotTlAtWjAtOV17MjUsMzl9JCcsIC8vIEJpdGNvaW4gKEJUQykgaW5jbHVkaW5nIGJlY2gzMiBhZGRyZXNzZXNcbiAgJ0VUSCc6ICdeKD86MHgpP1thLWZBLUYwLTldezQwLDQyfSQnLCAvLyBFdGhlcmV1bVxuICAnVVNEVCc6ICdeMVsxLTldW2EtekEtWjAtOV17MjQsMzN9JCcsIC8vIFRldGhlclxuICAnWFJQJzogJ15yWzAtOWEtekEtWl17MjQsMzR9JCcsIC8vIFJpcHBsZVxuICAnQk5CJzogJ15ibmJbMC05YS16QS1aXXszOH0kJywgLy8gQmluYW5jZSBDb2luXG4gICdBREEnOiAnXkFlMnRkUHdVUEVZeXs0NH0kJywgLy8gQ2FyZGFub1xuICAnU09MJzogJ15Tb1sxLTldWzAtOWEtekEtWl17NDh9JCcsIC8vIFNvbGFuYVxuICAnRE9HRSc6ICdeRFswLTlhLWZBLUZdezMyfSQnLCAvLyBEb2dlY29pblxuICAnVFJYJzogJ15UWzAtOWEtZkEtRl17MzN9JCcsIC8vIFRyb25cbiAgJ0xUQyc6ICdeTFthLWttLXpBLUhKLU5QLVoxLTldezI2LDMzfSQnLCAvLyBMaXRlY29pblxuICAnRE9UJzogJ14xW2EtekEtWjAtOV17MzF9JCcsIC8vIFBvbGthZG90XG4gICdMSU5LJzogJ14weFthLWZBLUYwLTldezQwfSQnLCAvLyBDaGFpbmxpbmtcbiAgJ1hMTSc6ICdeR1tBLVowLTldezU1fSQnLCAvLyBTdGVsbGFyIEx1bWVuc1xuICAnWE1SJzogJ140WzAtOUEtWmEtel17OTR9JCcsIC8vIE1vbmVyb1xuICAnQVRPTSc6ICdeY29zbW9zMVthLXowLTldezM4fSQnLCAvLyBDb3Ntb3NcbiAgLy8gQWRkIG1vcmUgcGF0dGVybnMgaGVyZSBmb3Igb3RoZXIgY3J5cHRvY3VycmVuY2llc1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2x1c3RlckFkZHJlc3NlcyBleHRlbmRzIFNlcnZpY2VEZWZpbml0aW9uIHtcbiAgcmVhZG9ubHkgbmFtZSA9ICdjbHVzdGVyX2FkZHJlc3MnO1xuICByZWFkb25seSBpbnB1dFNjaGVtYTogSW5wdXRTY2hlbWEgPSB7XG4gICAgYWRkcmVzczogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiB0cnVlIH0sXG4gICAgYXNzZXQ6IHsgdHlwZTogJ3RleHQnLCByZXF1aXJlZDogZmFsc2UgfSxcbiAgICBwYWdlOiB7IHR5cGU6ICd0ZXh0JywgcmVxdWlyZWQ6IGZhbHNlIH0sXG4gICAgcGFnZV9saW1pdDogeyB0eXBlOiAnZmxvYXQnLCByZXF1aXJlZDogZmFsc2UgfSxcbiAgfTtcbiAgcmVhZG9ubHkgb3V0cHV0Q29uZmlndXJhdGlvbjogT3V0cHV0Q29uZmlndXJhdGlvbiA9IHtcbiAgICBhZGRyZXNzZXM6IHt9LFxuICAgIHBhZ2luYXRpb246IHtcbiAgICAgICduZXh0UGFnZSc6ICdrZXl3b3JkJ1xuICAgIH1cbiAgfTtcblxuICBwcml2YXRlIGluZmVyQXNzZXRUeXBlKGFkZHJlc3M6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoY3J5cHRvUmVnZXhQYXR0ZXJucykuZmlsdGVyKGFzc2V0ID0+IHtcbiAgICAgIHJldHVybiBuZXcgUmVnRXhwKGNyeXB0b1JlZ2V4UGF0dGVybnNbYXNzZXRdKS50ZXN0KGFkZHJlc3MpO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgaW52b2tlKGlucHV0czoge1xuICAgIGFkZHJlc3M6IHN0cmluZyxcbiAgICBhc3NldD86IHN0cmluZyxcbiAgICBwYWdlOiBzdHJpbmcsXG4gICAgcGFnZV9saW1pdDogbnVtYmVyXG4gIH0pOiBQcm9taXNlPERhdGFJbmRleFJlc3VsdHM+IHtcbiAgICBjb25zdCBtYXRjaGVkQXNzZXRzID0gaW5wdXRzLmFzc2V0ID8gW2lucHV0cy5hc3NldF0gOiB0aGlzLmluZmVyQXNzZXRUeXBlKGlucHV0cy5hZGRyZXNzKTtcbiAgICBsZXQgb3ZlcmFsbFJlc3VsdHMgPSBbXTtcbiAgICBsZXQgb3ZlcmFsbE5leHRQYWdlID0gJyc7XG4gICAgbGV0IG92ZXJhbGxUcnVuY2F0ZWQgPSBmYWxzZTtcblxuICAgIGZvciAoY29uc3QgYXNzZXQgb2YgbWF0Y2hlZEFzc2V0cykge1xuICAgICAgbGV0IHVybCA9IGBodHRwczovL2lhcGkuY2hhaW5hbHlzaXMuY29tL2NsdXN0ZXJzLyR7aW5wdXRzLmFkZHJlc3N9LyR7YXNzZXR9L2FkZHJlc3Nlc2A7XG4gICAgICBpZiAoaW5wdXRzLnBhZ2UpIHtcbiAgICAgICAgdXJsID0gdXJsICsgYD9wYWdlPSR7aW5wdXRzLnBhZ2V9YDtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGNvbmZpZzogQXhpb3NSZXF1ZXN0Q29uZmlnID0ge1xuICAgICAgICBtZXRob2Q6ICdnZXQnLFxuICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgJ3Rva2VuJzogdGhpcy5jb25maWcudG9rZW5cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGNvbnN0IHJlc3BvbnNlOiBBeGlvc1Jlc3BvbnNlID0gYXdhaXQgYXhpb3MoY29uZmlnKS5jYXRjaChlcnIgPT4gUHJvbWlzZS5yZWplY3QoZXJyLnJlc3BvbnNlICYmIGVyci5yZXNwb25zZS5zdGF0dXMgPCA1MDAgPyBuZXcgV2ViU2VydmljZUVycm9yKGVyci5yZXNwb25zZS5kYXRhKSA6IGVycikpO1xuICAgICAgY29uc3QgcGFnZUxpbWl0ID0gaW5wdXRzLnBhZ2VfbGltaXQgPyAoaW5wdXRzLnBhZ2VfbGltaXQgPT09IDAgPyBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUiA6IGlucHV0cy5wYWdlX2xpbWl0KSA6IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xuXG4gICAgICBpZiAocmVzcG9uc2UuZGF0YS5uZXh0UGFnZSAhPSBudWxsKSB7XG4gICAgICAgIGxldCBwYWdlID0gcmVzcG9uc2UuZGF0YS5uZXh0UGFnZTtcbiAgICAgICAgbGV0IGxhc3RSZXN1bHQgPSB7IG5leHRQYWdlOiAnJyB9O1xuICAgICAgICBsZXQgc3ViX3Jlc3BvbnNlOiBBeGlvc1Jlc3BvbnNlO1xuICAgICAgICBsZXQgcGFnZUNvdW50ZXIgPSAwO1xuXG4gICAgICAgIHdoaWxlIChsYXN0UmVzdWx0Lm5leHRQYWdlICE9PSBudWxsICYmIHBhZ2VDb3VudGVyIDwgcGFnZUxpbWl0KSB7XG4gICAgICAgICAgbGV0IHN1Yl91cmwgPSBgaHR0cHM6Ly9pYXBpLmNoYWluYWx5c2lzLmNvbS9jbHVzdGVycy8ke2lucHV0cy5hZGRyZXNzfS8ke2Fzc2V0fS9hZGRyZXNzZXM/cGFnZT0ke3BhZ2V9YDtcbiAgICAgICAgICBjb25zdCBzdWJfY29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB7XG4gICAgICAgICAgICBtZXRob2Q6ICdnZXQnLFxuICAgICAgICAgICAgdXJsOiBzdWJfdXJsLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAndG9rZW4nOiB0aGlzLmNvbmZpZy50b2tlblxuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBzdWJfcmVzcG9uc2UgPSBhd2FpdCBheGlvcyhzdWJfY29uZmlnKS5jYXRjaChlcnIgPT4gUHJvbWlzZS5yZWplY3QoZXJyLnJlc3BvbnNlICYmIGVyci5yZXNwb25zZS5zdGF0dXMgPCA1MDAgPyBuZXcgV2ViU2VydmljZUVycm9yKGVyci5yZXNwb25zZS5kYXRhKSA6IGVycikpO1xuICAgICAgICAgIGxhc3RSZXN1bHQgPSBzdWJfcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICByZXNwb25zZS5kYXRhLml0ZW1zLnB1c2guYXBwbHkocmVzcG9uc2UuZGF0YS5pdGVtcywgc3ViX3Jlc3BvbnNlLmRhdGEuaXRlbXMpXG4gICAgICAgICAgcGFnZSA9IGxhc3RSZXN1bHQubmV4dFBhZ2U7IC8vIFVwZGF0ZSB0aGUgcGFnZSBhZnRlciBhbGwgaXRlbXMgaGF2ZSBiZWVuIHByb2Nlc3NlZCBmb3IgdGhlIGN1cnJlbnQgcGFnZS5cbiAgICAgICAgICBwYWdlQ291bnRlciArPSAxO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgcmVzcG9uc2UuZGF0YS5pdGVtcy5sZW5ndGg7IHkrKykge1xuICAgICAgICAgIE9iamVjdC5hc3NpZ24ocmVzcG9uc2UuZGF0YS5pdGVtc1t5XSwge1xuICAgICAgICAgICAgcm9vdEFkZHJlc3M6IHJlc3BvbnNlLmRhdGEucm9vdEFkZHJlc3MsXG4gICAgICAgICAgICBhc3NldDogcmVzcG9uc2UuZGF0YS5hc3NldCxcbiAgICAgICAgICAgIGlkOiBgJHtyZXNwb25zZS5kYXRhLmFzc2V0fToke3Jlc3BvbnNlLmRhdGEuaXRlbXNbeV0uYWRkcmVzc31gXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgb3ZlcmFsbFJlc3VsdHMucHVzaC5hcHBseShvdmVyYWxsUmVzdWx0cywgcmVzcG9uc2UuZGF0YS5pdGVtcyk7XG4gICAgICAgIGlmIChsYXN0UmVzdWx0Lm5leHRQYWdlICE9PSBudWxsKSB7XG4gICAgICAgICAgb3ZlcmFsbFRydW5jYXRlZCA9IHRydWVcbiAgICAgICAgICBvdmVyYWxsTmV4dFBhZ2UgPSBsYXN0UmVzdWx0Lm5leHRQYWdlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgIH1cbiAgICBpbnRlcmZhY2UgTXlPYmplY3Qge1xuICAgICAgaWQ6IG51bWJlcjsgXG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBhZGRyZXNzZXM6IE9iamVjdC52YWx1ZXMob3ZlcmFsbFJlc3VsdHMucmVkdWNlKChhY2M6IHsgW2tleTogbnVtYmVyXTogTXlPYmplY3QgfSwgb2JqOiBNeU9iamVjdCkgPT4gKHsgLi4uYWNjLCBbb2JqLmlkXTogb2JqIH0pLCB7fSkpLFxuICAgICAgcGFnaW5hdGlvbjogW3tcbiAgICAgICAgdG90YWxyZXN1bHRzOiBvdmVyYWxsUmVzdWx0cy5sZW5ndGgsXG4gICAgICAgIG5leHRQYWdlOiBvdmVyYWxsTmV4dFBhZ2VcbiAgICAgIH1dXG4gICAgfTtcbiAgfVxufVxuIl19
