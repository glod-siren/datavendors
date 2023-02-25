"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web_service_interface_1 = require("@sirensolutions/web-service-interface");
const axios_1 = require("axios");
class IpObservations extends web_service_interface_1.ServiceDefinition {
    constructor() {
        super(...arguments);
        this.name = 'ip_observations';
        this.inputSchema = {
            ip: { type: 'text', required: true },
            startTime: { type: 'date', required: false },
            endTime: { type: 'date', required: false },
            page: { type: 'date', required: false },
        };
        this.outputConfiguration = {
            observation: {
                'lat': 'long',
                'long': 'long',
                'timestamp': 'date',
                'geo_location': 'geo_point',
                'ipAddress': 'keyword',
                'port': 'keyword'
            },
            pagination: {
                'nextPage': 'keyword'
            }
        };
    }
    async invoke(inputs) {
        let obs_url = `https://iapi.chainalysis.com/observations/ips/${inputs.ip}?size=100`;
        if (inputs.page) {
            obs_url + obs_url + `&page=${inputs.page}`;
        }
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
        let truncated = false;
        let nextPage = '';
        if (obs_response.data.nextPage != null) {
            let page = obs_response.data.nextPage;
            let lastResult = { nextPage: '' };
            do {
                try {
                    let sub_url = `https://iapi.chainalysis.com/observations/ips/${inputs.ip}?size=100` + `&page=${page}`;
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
                    obs_response.data.items.push.apply(obs_response.data.items, sub_response.data.items);
                }
                catch {
                    new web_service_interface_1.WebServiceError('pagination error');
                }
            } while (lastResult.nextPage !== null && obs_response.data.items < 5000);
            if (lastResult.nextPage !== null || lastResult.nextPage !== '') {
                truncated = true;
                nextPage = lastResult.nextPage;
            }
        }
        for (let y = 0; y < obs_response.data.items.length; y++) {
            let plain_asset = obs_response.data.items[y].software.match(/bitcoin|ethereum/);
            let asset = '';
            if (plain_asset == 'bitcoin') {
                asset = 'BTC';
            }
            if (plain_asset == 'ethereum') {
                asset = 'ETH';
            }
            let denormAddress = [];
            denormAddress.push(`${asset}:${obs_response.data.items[y].walletRootAddress}`);
            denormAddress.push(`${asset}:${obs_response.data.items[y].rootAddress}`);
            Object.assign(obs_response.data.items[y], {
                sirenDenormAddress: ([...new Set(denormAddress)]),
                id: obs_response.data.items[y].ipAddress + ':' + obs_response.data.items[y].timestamp,
                address: obs_response.data.items[y].walletRootAddress,
                rootAddress: obs_response.data.rootAddress,
                geo_location: obs_response.data.items[y].lat + ',' + obs_response.data.items[y].long
            });
        }
        return {
            observation: obs_response.data.items,
            pagination: [{
                    nextPage: nextPage
                }]
        };
    }
}
exports.default = IpObservations;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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VztnQkFDMUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTthQUN2RixDQUFDLENBQUE7U0FDTDtRQUNELE9BQU87WUFDSCxXQUFXLEVBQUUsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLO1lBQ3BDLFVBQVUsRUFBRSxDQUFDO29CQUNULFFBQVEsRUFBRSxRQUFRO2lCQUNyQixDQUFDO1NBQ0wsQ0FBQTtJQUNMLENBQUM7Q0FDSjtBQS9GRCxpQ0ErRkMiLCJmaWxlIjoic3JjL0lwT2JzZXJ2YXRpb25zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGF0YUluZGV4UmVzdWx0cywgSW5wdXRTY2hlbWEsIE91dHB1dENvbmZpZ3VyYXRpb24sIFNlcnZpY2VEZWZpbml0aW9uLCBXZWJTZXJ2aWNlRXJyb3IgfSBmcm9tICdAc2lyZW5zb2x1dGlvbnMvd2ViLXNlcnZpY2UtaW50ZXJmYWNlJztcclxuaW1wb3J0IGF4aW9zLCB7IEF4aW9zUmVxdWVzdENvbmZpZywgQXhpb3NSZXNwb25zZSB9IGZyb20gJ2F4aW9zJztcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSXBPYnNlcnZhdGlvbnMgZXh0ZW5kcyBTZXJ2aWNlRGVmaW5pdGlvbiB7XHJcbiAgICByZWFkb25seSBuYW1lID0gJ2lwX29ic2VydmF0aW9ucyc7XHJcbiAgICByZWFkb25seSBpbnB1dFNjaGVtYTogSW5wdXRTY2hlbWEgPSB7XHJcbiAgICAgICAgaXA6IHsgdHlwZTogJ3RleHQnLCByZXF1aXJlZDogdHJ1ZSB9LFxyXG4gICAgICAgIHN0YXJ0VGltZTogeyB0eXBlOiAnZGF0ZScsIHJlcXVpcmVkOiBmYWxzZSB9LFxyXG4gICAgICAgIGVuZFRpbWU6IHsgdHlwZTogJ2RhdGUnLCByZXF1aXJlZDogZmFsc2UgfSxcclxuICAgICAgICBwYWdlOiB7IHR5cGU6ICdkYXRlJywgcmVxdWlyZWQ6IGZhbHNlIH0sXHJcbiAgICB9O1xyXG4gICAgcmVhZG9ubHkgb3V0cHV0Q29uZmlndXJhdGlvbjogT3V0cHV0Q29uZmlndXJhdGlvbiA9IHtcclxuICAgICAgICBvYnNlcnZhdGlvbjoge1xyXG4gICAgICAgICAgICAnbGF0JyA6ICdsb25nJyxcclxuICAgICAgICAgICAgJ2xvbmcnOiAnbG9uZycsXHJcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiAnZGF0ZScsXHJcbiAgICAgICAgICAgICdnZW9fbG9jYXRpb24nOiAnZ2VvX3BvaW50JyxcclxuICAgICAgICAgICAgJ2lwQWRkcmVzcyc6ICdrZXl3b3JkJyxcclxuICAgICAgICAgICAgJ3BvcnQnOiAna2V5d29yZCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBhZ2luYXRpb246IHtcclxuICAgICAgICAgICAgJ25leHRQYWdlJzogJ2tleXdvcmQnXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIGFzeW5jIGludm9rZShpbnB1dHM6IHtcclxuICAgICAgICBpcDogc3RyaW5nLFxyXG4gICAgICAgIHN0YXJ0VGltZTogc3RyaW5nLFxyXG4gICAgICAgIGVuZFRpbWU6IHN0cmluZyxcclxuICAgICAgICBwYWdlOiBzdHJpbmcsXHJcbiAgICB9KTogUHJvbWlzZTxEYXRhSW5kZXhSZXN1bHRzPiB7XHJcbiAgICAgICAgbGV0IG9ic191cmwgPSBgaHR0cHM6Ly9pYXBpLmNoYWluYWx5c2lzLmNvbS9vYnNlcnZhdGlvbnMvaXBzLyR7aW5wdXRzLmlwfT9zaXplPTEwMGBcclxuICAgICAgICBpZiAoaW5wdXRzLnBhZ2UpIHtcclxuICAgICAgICAgICAgb2JzX3VybCArIG9ic191cmwgKyBgJnBhZ2U9JHtpbnB1dHMucGFnZX1gXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlucHV0cy5zdGFydFRpbWUpIHtvYnNfdXJsID0gb2JzX3VybCArIGAmc3RhcnRUaW1lPSR7aW5wdXRzLnN0YXJ0VGltZX1gfVxyXG4gICAgICAgIGlmIChpbnB1dHMuZW5kVGltZSkge29ic191cmwgPSBvYnNfdXJsICsgYCZlbmRUaW1lPSR7aW5wdXRzLmVuZFRpbWV9YH1cclxuICAgICAgICBjb25zdCBvYnNfY29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogJ2dldCcsXHJcbiAgICAgICAgICAgIHVybDogb2JzX3VybCxcclxuICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICAgICAgICAgICd0b2tlbic6IHRoaXMuY29uZmlnLnRva2VuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IG9ic19yZXNwb25zZTogQXhpb3NSZXNwb25zZSA9IGF3YWl0IGF4aW9zKG9ic19jb25maWcpLmNhdGNoKGVyciA9PiBQcm9taXNlLnJlamVjdChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA8IDUwMCA/IG5ldyBXZWJTZXJ2aWNlRXJyb3IoZXJyLnJlc3BvbnNlLmRhdGEpIDogZXJyKSk7XHJcbiAgICAgICAgbGV0IHRydW5jYXRlZCA9IGZhbHNlXHJcbiAgICAgICAgbGV0IG5leHRQYWdlID0gJyc7XHJcbiAgICAgICAgaWYgKG9ic19yZXNwb25zZS5kYXRhLm5leHRQYWdlICE9IG51bGwpIHtcclxuICAgICAgICAgICAgbGV0IHBhZ2UgPSBvYnNfcmVzcG9uc2UuZGF0YS5uZXh0UGFnZVxyXG4gICAgICAgICAgICBsZXQgbGFzdFJlc3VsdCA9IHsgbmV4dFBhZ2U6ICcnIH07XHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN1Yl91cmwgPSBgaHR0cHM6Ly9pYXBpLmNoYWluYWx5c2lzLmNvbS9vYnNlcnZhdGlvbnMvaXBzLyR7aW5wdXRzLmlwfT9zaXplPTEwMGAgKyBgJnBhZ2U9JHtwYWdlfWBcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJfY29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ2dldCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogc3ViX3VybCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd0b2tlbic6IHRoaXMuY29uZmlnLnRva2VuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1Yl9yZXNwb25zZTogQXhpb3NSZXNwb25zZSA9IGF3YWl0IGF4aW9zKHN1Yl9jb25maWcpLmNhdGNoKGVyciA9PiBQcm9taXNlLnJlamVjdChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA8IDUwMCA/IG5ldyBXZWJTZXJ2aWNlRXJyb3IoZXJyLnJlc3BvbnNlLmRhdGEpIDogZXJyKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFJlc3VsdCA9IHN1Yl9yZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgIG9ic19yZXNwb25zZS5kYXRhLml0ZW1zLnB1c2guYXBwbHkob2JzX3Jlc3BvbnNlLmRhdGEuaXRlbXMsIHN1Yl9yZXNwb25zZS5kYXRhLml0ZW1zKVxyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCB7IG5ldyBXZWJTZXJ2aWNlRXJyb3IoJ3BhZ2luYXRpb24gZXJyb3InKSB9XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKGxhc3RSZXN1bHQubmV4dFBhZ2UgIT09IG51bGwgJiYgb2JzX3Jlc3BvbnNlLmRhdGEuaXRlbXMgPCA1MDAwKVxyXG4gICAgICAgICAgICBpZiAobGFzdFJlc3VsdC5uZXh0UGFnZSAhPT0gbnVsbCB8fCBsYXN0UmVzdWx0Lm5leHRQYWdlICE9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgdHJ1bmNhdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIG5leHRQYWdlID0gbGFzdFJlc3VsdC5uZXh0UGFnZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IG9ic19yZXNwb25zZS5kYXRhLml0ZW1zLmxlbmd0aDsgeSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBwbGFpbl9hc3NldCA9IG9ic19yZXNwb25zZS5kYXRhLml0ZW1zW3ldLnNvZnR3YXJlLm1hdGNoKC9iaXRjb2lufGV0aGVyZXVtLylcclxuICAgICAgICAgICAgbGV0IGFzc2V0OiBTdHJpbmcgPSAnJ1xyXG4gICAgICAgICAgICBpZiAocGxhaW5fYXNzZXQgPT0gJ2JpdGNvaW4nKSB7XHJcbiAgICAgICAgICAgICAgICBhc3NldCA9ICdCVEMnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHBsYWluX2Fzc2V0ID09ICdldGhlcmV1bScpIHtcclxuICAgICAgICAgICAgICAgIGFzc2V0ID0gJ0VUSCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgZGVub3JtQWRkcmVzczogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICAgICAgZGVub3JtQWRkcmVzcy5wdXNoKGAke2Fzc2V0fToke29ic19yZXNwb25zZS5kYXRhLml0ZW1zW3ldLndhbGxldFJvb3RBZGRyZXNzfWApXHJcbiAgICAgICAgICAgIGRlbm9ybUFkZHJlc3MucHVzaChgJHthc3NldH06JHtvYnNfcmVzcG9uc2UuZGF0YS5pdGVtc1t5XS5yb290QWRkcmVzc31gKVxyXG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKG9ic19yZXNwb25zZS5kYXRhLml0ZW1zW3ldLCB7XHJcbiAgICAgICAgICAgICAgICBzaXJlbkRlbm9ybUFkZHJlc3M6IChbLi4uIG5ldyBTZXQoZGVub3JtQWRkcmVzcyldKSxcclxuICAgICAgICAgICAgICAgIGlkOiBvYnNfcmVzcG9uc2UuZGF0YS5pdGVtc1t5XS5pcEFkZHJlc3MgKyAnOicgKyBvYnNfcmVzcG9uc2UuZGF0YS5pdGVtc1t5XS50aW1lc3RhbXAsXHJcbiAgICAgICAgICAgICAgICBhZGRyZXNzOiBvYnNfcmVzcG9uc2UuZGF0YS5pdGVtc1t5XS53YWxsZXRSb290QWRkcmVzcyxcclxuICAgICAgICAgICAgICAgIHJvb3RBZGRyZXNzOiBvYnNfcmVzcG9uc2UuZGF0YS5yb290QWRkcmVzcyxcclxuICAgICAgICAgICAgICAgIGdlb19sb2NhdGlvbjogb2JzX3Jlc3BvbnNlLmRhdGEuaXRlbXNbeV0ubGF0ICsgJywnICsgb2JzX3Jlc3BvbnNlLmRhdGEuaXRlbXNbeV0ubG9uZ1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBvYnNlcnZhdGlvbjogb2JzX3Jlc3BvbnNlLmRhdGEuaXRlbXMsXHJcbiAgICAgICAgICAgIHBhZ2luYXRpb246IFt7XHJcbiAgICAgICAgICAgICAgICBuZXh0UGFnZTogbmV4dFBhZ2VcclxuICAgICAgICAgICAgfV1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl19
