"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web_service_interface_1 = require("@sirensolutions/web-service-interface");
const axios_1 = require("axios");
class ClusterObservations extends web_service_interface_1.ServiceDefinition {
    constructor() {
        super(...arguments);
        this.name = 'cluster_observations';
        this.inputSchema = {
            address: { type: 'text', required: true },
            asset: { type: 'text', required: true },
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
    async invoke(inputs) {
        let obs_url = `https://iapi.chainalysis.com/observations/clusters/${inputs.address}/${inputs.asset}?`;
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
            denormAddress.push(`${inputs.asset}:${obs_response.data.observations[y].walletRootAddress}`);
            denormAddress.push(`${inputs.asset}:${obs_response.data.address}`);
            denormAddress.push(`${inputs.asset}:${obs_response.data.rootAddress}`);
            Object.assign(obs_response.data.observations[y], {
                sirenDenormAddress: ([...new Set(denormAddress)]),
                id: obs_response.data.observations[y].walletRootAddress + ':' + obs_response.data.observations[y].timestamp,
                address: obs_response.data.observations[y].walletRootAddress,
                rootAddress: obs_response.data.rootAddress,
                geo_location: obs_response.data.observations[y].lat + ',' + obs_response.data.observations[y].long
            });
        }
        return {
            observation: obs_response.data.observations
        };
    }
}
exports.default = ClusterObservations;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9DbHVzdGVyT2JzZXJ2YXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUZBQStJO0FBQy9JLGlDQUFpRTtBQUNqRSxNQUFxQixtQkFBb0IsU0FBUSx5Q0FBaUI7SUFBbEU7O1FBQ2EsU0FBSSxHQUFHLHNCQUFzQixDQUFDO1FBQzlCLGdCQUFXLEdBQWdCO1lBQ2hDLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtZQUN6QyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7WUFDdkMsU0FBUyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFO1lBQzVDLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRTtTQUM3QyxDQUFDO1FBQ08sd0JBQW1CLEdBQXdCO1lBQ2hELFdBQVcsRUFBRTtnQkFDVCxLQUFLLEVBQUcsTUFBTTtnQkFDZCxNQUFNLEVBQUUsTUFBTTtnQkFDZCxXQUFXLEVBQUUsTUFBTTtnQkFDbkIsY0FBYyxFQUFFLFdBQVc7Z0JBQzNCLFdBQVcsRUFBRSxTQUFTO2dCQUN0QixNQUFNLEVBQUUsU0FBUzthQUNwQjtTQUNKLENBQUM7SUFvQ04sQ0FBQztJQW5DRyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BS1o7UUFDRyxJQUFJLE9BQU8sR0FBRyxzREFBc0QsTUFBTSxDQUFDLE9BQU8sSUFBSSxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUE7UUFDckcsSUFBSSxNQUFNLENBQUMsU0FBUyxFQUFFO1lBQUMsT0FBTyxHQUFHLE9BQU8sR0FBRyxjQUFjLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQTtTQUFDO1FBQzVFLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRTtZQUFDLE9BQU8sR0FBRyxPQUFPLEdBQUcsWUFBWSxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUE7U0FBQztRQUN0RSxNQUFNLFVBQVUsR0FBdUI7WUFDbkMsTUFBTSxFQUFFLEtBQUs7WUFDYixHQUFHLEVBQUUsT0FBTztZQUNaLE9BQU8sRUFBRTtnQkFDTCxRQUFRLEVBQUUsa0JBQWtCO2dCQUM1QixPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLO2FBQzdCO1NBQ0osQ0FBQztRQUNGLE1BQU0sWUFBWSxHQUFrQixNQUFNLGVBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLHVDQUFlLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNuTCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzVELElBQUksYUFBYSxHQUFhLEVBQUUsQ0FBQztZQUNqQyxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUE7WUFDNUYsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO1lBQ2xFLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQTtZQUN0RSxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUM3QyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsR0FBSSxJQUFJLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO2dCQUNsRCxFQUFFLEVBQUUsWUFBWSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLEdBQUcsR0FBRyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7Z0JBQzNHLE9BQU8sRUFBRSxZQUFZLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxpQkFBaUI7Z0JBQzVELFdBQVcsRUFBRSxZQUFZLENBQUMsSUFBSSxDQUFDLFdBQVc7Z0JBQzFDLFlBQVksRUFBRSxZQUFZLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7YUFDckcsQ0FBQyxDQUFBO1NBQ0w7UUFDRCxPQUFPO1lBQ0gsV0FBVyxFQUFFLFlBQVksQ0FBQyxJQUFJLENBQUMsWUFBWTtTQUM5QyxDQUFBO0lBQ0wsQ0FBQztDQUNKO0FBckRELHNDQXFEQyIsImZpbGUiOiJzcmMvQ2x1c3Rlck9ic2VydmF0aW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERhdGFJbmRleFJlc3VsdHMsIElucHV0U2NoZW1hLCBPdXRwdXRDb25maWd1cmF0aW9uLCBTZXJ2aWNlRGVmaW5pdGlvbiwgV2ViU2VydmljZUVycm9yIH0gZnJvbSAnQHNpcmVuc29sdXRpb25zL3dlYi1zZXJ2aWNlLWludGVyZmFjZSc7XHJcbmltcG9ydCBheGlvcywgeyBBeGlvc1JlcXVlc3RDb25maWcsIEF4aW9zUmVzcG9uc2UgfSBmcm9tICdheGlvcyc7XHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENsdXN0ZXJPYnNlcnZhdGlvbnMgZXh0ZW5kcyBTZXJ2aWNlRGVmaW5pdGlvbiB7XHJcbiAgICByZWFkb25seSBuYW1lID0gJ2NsdXN0ZXJfb2JzZXJ2YXRpb25zJztcclxuICAgIHJlYWRvbmx5IGlucHV0U2NoZW1hOiBJbnB1dFNjaGVtYSA9IHtcclxuICAgICAgICBhZGRyZXNzOiB7IHR5cGU6ICd0ZXh0JywgcmVxdWlyZWQ6IHRydWUgfSxcclxuICAgICAgICBhc3NldDogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICAgICAgc3RhcnRUaW1lOiB7IHR5cGU6ICdkYXRlJywgcmVxdWlyZWQ6IGZhbHNlIH0sXHJcbiAgICAgICAgZW5kVGltZTogeyB0eXBlOiAnZGF0ZScsIHJlcXVpcmVkOiBmYWxzZSB9XHJcbiAgICB9O1xyXG4gICAgcmVhZG9ubHkgb3V0cHV0Q29uZmlndXJhdGlvbjogT3V0cHV0Q29uZmlndXJhdGlvbiA9IHtcclxuICAgICAgICBvYnNlcnZhdGlvbjoge1xyXG4gICAgICAgICAgICAnbGF0JyA6ICdsb25nJyxcclxuICAgICAgICAgICAgJ2xvbmcnOiAnbG9uZycsXHJcbiAgICAgICAgICAgICd0aW1lc3RhbXAnOiAnZGF0ZScsXHJcbiAgICAgICAgICAgICdnZW9fbG9jYXRpb24nOiAnZ2VvX3BvaW50JyxcclxuICAgICAgICAgICAgJ2lwQWRkcmVzcyc6ICdrZXl3b3JkJyxcclxuICAgICAgICAgICAgJ3BvcnQnOiAna2V5d29yZCdcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgYXN5bmMgaW52b2tlKGlucHV0czoge1xyXG4gICAgICAgIGFkZHJlc3M6IHN0cmluZyxcclxuICAgICAgICBhc3NldDogc3RyaW5nLFxyXG4gICAgICAgIHN0YXJ0VGltZTogc3RyaW5nLFxyXG4gICAgICAgIGVuZFRpbWU6IHN0cmluZ1xyXG4gICAgfSk6IFByb21pc2U8RGF0YUluZGV4UmVzdWx0cz4ge1xyXG4gICAgICAgIGxldCBvYnNfdXJsID0gYGh0dHBzOi8vaWFwaS5jaGFpbmFseXNpcy5jb20vb2JzZXJ2YXRpb25zL2NsdXN0ZXJzLyR7aW5wdXRzLmFkZHJlc3N9LyR7aW5wdXRzLmFzc2V0fT9gXHJcbiAgICAgICAgaWYgKGlucHV0cy5zdGFydFRpbWUpIHtvYnNfdXJsID0gb2JzX3VybCArIGAmc3RhcnRUaW1lPSR7aW5wdXRzLnN0YXJ0VGltZX1gfVxyXG4gICAgICAgIGlmIChpbnB1dHMuZW5kVGltZSkge29ic191cmwgPSBvYnNfdXJsICsgYCZlbmRUaW1lPSR7aW5wdXRzLmVuZFRpbWV9YH1cclxuICAgICAgICBjb25zdCBvYnNfY29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogJ2dldCcsXHJcbiAgICAgICAgICAgIHVybDogb2JzX3VybCxcclxuICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICAgICAgICAgICd0b2tlbic6IHRoaXMuY29uZmlnLnRva2VuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IG9ic19yZXNwb25zZTogQXhpb3NSZXNwb25zZSA9IGF3YWl0IGF4aW9zKG9ic19jb25maWcpLmNhdGNoKGVyciA9PiBQcm9taXNlLnJlamVjdChlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnN0YXR1cyA8IDUwMCA/IG5ldyBXZWJTZXJ2aWNlRXJyb3IoZXJyLnJlc3BvbnNlLmRhdGEpIDogZXJyKSk7XHJcbiAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCBvYnNfcmVzcG9uc2UuZGF0YS5vYnNlcnZhdGlvbnMubGVuZ3RoOyB5KyspIHtcclxuICAgICAgICAgICAgbGV0IGRlbm9ybUFkZHJlc3M6IHN0cmluZ1tdID0gW107XHJcbiAgICAgICAgICAgIGRlbm9ybUFkZHJlc3MucHVzaChgJHtpbnB1dHMuYXNzZXR9OiR7b2JzX3Jlc3BvbnNlLmRhdGEub2JzZXJ2YXRpb25zW3ldLndhbGxldFJvb3RBZGRyZXNzfWApXHJcbiAgICAgICAgICAgIGRlbm9ybUFkZHJlc3MucHVzaChgJHtpbnB1dHMuYXNzZXR9OiR7b2JzX3Jlc3BvbnNlLmRhdGEuYWRkcmVzc31gKVxyXG4gICAgICAgICAgICBkZW5vcm1BZGRyZXNzLnB1c2goYCR7aW5wdXRzLmFzc2V0fToke29ic19yZXNwb25zZS5kYXRhLnJvb3RBZGRyZXNzfWApXHJcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24ob2JzX3Jlc3BvbnNlLmRhdGEub2JzZXJ2YXRpb25zW3ldLCB7XHJcbiAgICAgICAgICAgICAgICBzaXJlbkRlbm9ybUFkZHJlc3M6IChbLi4uIG5ldyBTZXQoZGVub3JtQWRkcmVzcyldKSxcclxuICAgICAgICAgICAgICAgIGlkOiBvYnNfcmVzcG9uc2UuZGF0YS5vYnNlcnZhdGlvbnNbeV0ud2FsbGV0Um9vdEFkZHJlc3MgKyAnOicgKyBvYnNfcmVzcG9uc2UuZGF0YS5vYnNlcnZhdGlvbnNbeV0udGltZXN0YW1wLFxyXG4gICAgICAgICAgICAgICAgYWRkcmVzczogb2JzX3Jlc3BvbnNlLmRhdGEub2JzZXJ2YXRpb25zW3ldLndhbGxldFJvb3RBZGRyZXNzLFxyXG4gICAgICAgICAgICAgICAgcm9vdEFkZHJlc3M6IG9ic19yZXNwb25zZS5kYXRhLnJvb3RBZGRyZXNzLFxyXG4gICAgICAgICAgICAgICAgZ2VvX2xvY2F0aW9uOiBvYnNfcmVzcG9uc2UuZGF0YS5vYnNlcnZhdGlvbnNbeV0ubGF0ICsgJywnICsgb2JzX3Jlc3BvbnNlLmRhdGEub2JzZXJ2YXRpb25zW3ldLmxvbmdcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgb2JzZXJ2YXRpb246IG9ic19yZXNwb25zZS5kYXRhLm9ic2VydmF0aW9uc1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXX0=
