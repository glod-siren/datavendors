"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web_service_interface_1 = require("@sirensolutions/web-service-interface");
const axios_1 = require("axios");
class ClusterExposure extends web_service_interface_1.ServiceDefinition {
    constructor() {
        super(...arguments);
        this.name = 'cluster_exposure';
        this.inputSchema = {
            address: { type: 'text', required: true },
            asset: { type: 'text', required: true },
            outputAsset: { type: 'text', required: false },
        };
        this.outputConfiguration = {
            exposure: {
                'percentage': 'long',
                'value': 'long'
            }
        };
    }
    async invoke(inputs) {
        if (!inputs.outputAsset) {
            inputs.outputAsset = 'NATIVE';
        }
        const exposure_paths = ['SENDING', 'RECEIVING', 'SENDING/services', 'RECEIVING/services'];
        let exposure = [];
        for (let z = 0; z < exposure_paths.length; z++) {
            let exposure_url = `https://iapi.chainalysis.com/exposures/clusters/${inputs.address}/${inputs.asset}/directions/${exposure_paths[z]}?outputAsset=${inputs.outputAsset}`;
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
                for (let b = 0; exposure_response.data.indirectExposure.services.length; b++) {
                    Object.assign(exposure_response.data.indirectExposure.services[b], {
                        type: 'Service',
                        exposure: 'indirectExposure',
                        direction: exposure_paths[z],
                        outputAsset: exposure_response.data.outputAsset,
                        asset: exposure_response.data.asset,
                        inputAddress: exposure_response.data.rootAddress,
                        id: exposure_response.data.asset + ':' + exposure_response.data.rootAddress + ':indirectExposure:' + exposure_paths[z] + ':' + exposure_response.data.indirectExposure.services[b].rootAddress,
                        sirenDenormRootAddress: exposure_response.data.asset + ':' + exposure_response.data.rootAddress,
                        sirenDenormExposureAddress: exposure_response.data.asset + ':' + exposure_response.data.indirectExposure.services[b].rootAddress,
                    });
                    exposure.push(exposure_response.data.indirectExposure.services[b]);
                }
            }
            catch { }
            try {
                for (let b = 0; exposure_response.data.directExposure.services.length; b++) {
                    Object.assign(exposure_response.data.directExposure.services[b], {
                        type: 'Service',
                        exposure: 'directExposure',
                        direction: exposure_paths[z],
                        outputAsset: exposure_response.data.outputAsset,
                        asset: exposure_response.data.asset,
                        inputAddress: exposure_response.data.rootAddress,
                        id: exposure_response.data.asset + ':' + exposure_response.data.rootAddress + ':directExposure:' + exposure_paths[z] + ':' + exposure_response.data.directExposure.services[b].rootAddress,
                        sirenDenormRootAddress: exposure_response.data.asset + ':' + exposure_response.data.rootAddress,
                        sirenDenormExposureAddress: exposure_response.data.asset + ':' + exposure_response.data.directExposure.services[b].rootAddress,
                    });
                    exposure.push(exposure_response.data.directExposure.services[b]);
                }
            }
            catch { }
            try {
                for (let b = 0; exposure_response.data.indirectExposure.categories.length; b++) {
                    Object.assign(exposure_response.data.indirectExposure.categories[b], {
                        type: 'Category',
                        exposure: 'indirectExposure',
                        direction: exposure_paths[z],
                        outputAsset: exposure_response.data.outputAsset,
                        asset: exposure_response.data.asset,
                        inputAddress: exposure_response.data.rootAddress,
                        id: exposure_response.data.asset + ':' + exposure_response.data.rootAddress + ':indirectExposure:' + exposure_paths[z] + ':' + exposure_response.data.indirectExposure.categories[b].category,
                        sirenDenormRootAddress: exposure_response.data.asset + ':' + exposure_response.data.rootAddress
                    });
                    exposure.push(exposure_response.data.indirectExposure.categories[b]);
                }
            }
            catch { }
            try {
                for (let b = 0; exposure_response.data.directExposure.categories.length; b++) {
                    Object.assign(exposure_response.data.directExposure.categories[b], {
                        type: 'Category',
                        exposure: 'directExposure',
                        direction: exposure_paths[z],
                        outputAsset: exposure_response.data.outputAsset,
                        asset: exposure_response.data.asset,
                        inputAddress: exposure_response.data.rootAddress,
                        id: exposure_response.data.asset + ':' + exposure_response.data.rootAddress + ':directExposure:' + exposure_paths[z] + ':' + exposure_response.data.directExposure.categories[b].category,
                        sirenDenormRootAddress: exposure_response.data.asset + ':' + exposure_response.data.rootAddress,
                    });
                    exposure.push(exposure_response.data.directExposure.categories[b]);
                }
            }
            catch { }
        }
        return {
            exposure: exposure
        };
    }
}
exports.default = ClusterExposure;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9DbHVzdGVyRXhwb3N1cmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxpRkFBK0k7QUFDL0ksaUNBQWlFO0FBQ2pFLE1BQXFCLGVBQWdCLFNBQVEseUNBQWlCO0lBQTlEOztRQUNhLFNBQUksR0FBRyxrQkFBa0IsQ0FBQztRQUMxQixnQkFBVyxHQUFnQjtZQUNoQyxPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7WUFDekMsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFO1lBQ3ZDLFdBQVcsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRTtTQUNqRCxDQUFDO1FBQ08sd0JBQW1CLEdBQXdCO1lBQ2hELFFBQVEsRUFBRTtnQkFDTixZQUFZLEVBQUUsTUFBTTtnQkFDcEIsT0FBTyxFQUFFLE1BQU07YUFDbEI7U0FDSixDQUFBO0lBdUZMLENBQUM7SUF0RkcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUlaO1FBQ0csSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUU7WUFBRSxNQUFNLENBQUMsV0FBVyxHQUFHLFFBQVEsQ0FBQTtTQUFFO1FBQzFELE1BQU0sY0FBYyxHQUFHLENBQUMsU0FBUyxFQUFFLFdBQVcsRUFBRSxrQkFBa0IsRUFBRSxvQkFBb0IsQ0FBQyxDQUFBO1FBQ3pGLElBQUksUUFBUSxHQUFhLEVBQUUsQ0FBQztRQUM1QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM1QyxJQUFJLFlBQVksR0FBRyxtREFBbUQsTUFBTSxDQUFDLE9BQU8sSUFBSSxNQUFNLENBQUMsS0FBSyxlQUFlLGNBQWMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQTtZQUN4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RSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxHQUFHLGtCQUFrQixHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUTt3QkFDekwsc0JBQXNCLEVBQUUsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFdBQVc7cUJBQ2xHLENBQUMsQ0FBQTtvQkFDRixRQUFRLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7aUJBQ3JFO2FBQ0o7WUFBQyxNQUFNLEdBQUc7U0FDZDtRQUNELE9BQU87WUFDSCxRQUFRLEVBQUUsUUFBUTtTQUNyQixDQUFBO0lBQ0wsQ0FBQztDQUNKO0FBbkdELGtDQW1HQyIsImZpbGUiOiJzcmMvQ2x1c3RlckV4cG9zdXJlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGF0YUluZGV4UmVzdWx0cywgSW5wdXRTY2hlbWEsIE91dHB1dENvbmZpZ3VyYXRpb24sIFNlcnZpY2VEZWZpbml0aW9uLCBXZWJTZXJ2aWNlRXJyb3IgfSBmcm9tICdAc2lyZW5zb2x1dGlvbnMvd2ViLXNlcnZpY2UtaW50ZXJmYWNlJztcclxuaW1wb3J0IGF4aW9zLCB7IEF4aW9zUmVxdWVzdENvbmZpZywgQXhpb3NSZXNwb25zZSB9IGZyb20gJ2F4aW9zJztcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2x1c3RlckV4cG9zdXJlIGV4dGVuZHMgU2VydmljZURlZmluaXRpb24ge1xyXG4gICAgcmVhZG9ubHkgbmFtZSA9ICdjbHVzdGVyX2V4cG9zdXJlJztcclxuICAgIHJlYWRvbmx5IGlucHV0U2NoZW1hOiBJbnB1dFNjaGVtYSA9IHtcclxuICAgICAgICBhZGRyZXNzOiB7IHR5cGU6ICd0ZXh0JywgcmVxdWlyZWQ6IHRydWUgfSxcclxuICAgICAgICBhc3NldDogeyB0eXBlOiAndGV4dCcsIHJlcXVpcmVkOiB0cnVlIH0sXHJcbiAgICAgICAgb3V0cHV0QXNzZXQ6IHsgdHlwZTogJ3RleHQnLCByZXF1aXJlZDogZmFsc2UgfSxcclxuICAgIH07XHJcbiAgICByZWFkb25seSBvdXRwdXRDb25maWd1cmF0aW9uOiBPdXRwdXRDb25maWd1cmF0aW9uID0ge1xyXG4gICAgICAgIGV4cG9zdXJlOiB7XHJcbiAgICAgICAgICAgICdwZXJjZW50YWdlJzogJ2xvbmcnLFxyXG4gICAgICAgICAgICAndmFsdWUnOiAnbG9uZydcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBhc3luYyBpbnZva2UoaW5wdXRzOiB7XHJcbiAgICAgICAgYWRkcmVzczogc3RyaW5nLFxyXG4gICAgICAgIGFzc2V0OiBzdHJpbmcsXHJcbiAgICAgICAgb3V0cHV0QXNzZXQ6IHN0cmluZyxcclxuICAgIH0pOiBQcm9taXNlPERhdGFJbmRleFJlc3VsdHM+IHtcclxuICAgICAgICBpZiAoIWlucHV0cy5vdXRwdXRBc3NldCkgeyBpbnB1dHMub3V0cHV0QXNzZXQgPSAnTkFUSVZFJyB9XHJcbiAgICAgICAgY29uc3QgZXhwb3N1cmVfcGF0aHMgPSBbJ1NFTkRJTkcnLCAnUkVDRUlWSU5HJywgJ1NFTkRJTkcvc2VydmljZXMnLCAnUkVDRUlWSU5HL3NlcnZpY2VzJ11cclxuICAgICAgICBsZXQgZXhwb3N1cmU6IG9iamVjdFtdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgeiA9IDA7IHogPCBleHBvc3VyZV9wYXRocy5sZW5ndGg7IHorKykge1xyXG4gICAgICAgICAgICBsZXQgZXhwb3N1cmVfdXJsID0gYGh0dHBzOi8vaWFwaS5jaGFpbmFseXNpcy5jb20vZXhwb3N1cmVzL2NsdXN0ZXJzLyR7aW5wdXRzLmFkZHJlc3N9LyR7aW5wdXRzLmFzc2V0fS9kaXJlY3Rpb25zLyR7ZXhwb3N1cmVfcGF0aHNbel19P291dHB1dEFzc2V0PSR7aW5wdXRzLm91dHB1dEFzc2V0fWBcclxuICAgICAgICAgICAgbGV0IGV4cG9zdXJlX2NvbmZpZzogQXhpb3NSZXF1ZXN0Q29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnZ2V0JyxcclxuICAgICAgICAgICAgICAgIHVybDogZXhwb3N1cmVfdXJsLFxyXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgICAgICAgICAgICAgJ3Rva2VuJzogdGhpcy5jb25maWcudG9rZW5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgbGV0IGV4cG9zdXJlX3Jlc3BvbnNlOiBBeGlvc1Jlc3BvbnNlID0gYXdhaXQgYXhpb3MoZXhwb3N1cmVfY29uZmlnKS5jYXRjaChlcnIgPT4gUHJvbWlzZS5yZWplY3QoZXJyLnJlc3BvbnNlICYmIGVyci5yZXNwb25zZS5zdGF0dXMgPCA1MDAgPyBuZXcgV2ViU2VydmljZUVycm9yKGVyci5yZXNwb25zZS5kYXRhKSA6IGVycikpO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgYiA9IDA7IGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEuaW5kaXJlY3RFeHBvc3VyZS5zZXJ2aWNlcy5sZW5ndGg7IGIrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5pbmRpcmVjdEV4cG9zdXJlLnNlcnZpY2VzW2JdLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdTZXJ2aWNlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwb3N1cmU6ICdpbmRpcmVjdEV4cG9zdXJlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uOiBleHBvc3VyZV9wYXRoc1t6XSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0QXNzZXQ6IGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEub3V0cHV0QXNzZXQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0OiBleHBvc3VyZV9yZXNwb25zZS5kYXRhLmFzc2V0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dEFkZHJlc3M6IGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEucm9vdEFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBleHBvc3VyZV9yZXNwb25zZS5kYXRhLmFzc2V0ICsgJzonICsgZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5yb290QWRkcmVzcyArICc6aW5kaXJlY3RFeHBvc3VyZTonICsgZXhwb3N1cmVfcGF0aHNbel0gKyAnOicgKyBleHBvc3VyZV9yZXNwb25zZS5kYXRhLmluZGlyZWN0RXhwb3N1cmUuc2VydmljZXNbYl0ucm9vdEFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpcmVuRGVub3JtUm9vdEFkZHJlc3M6IGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEuYXNzZXQgKyAnOicgKyBleHBvc3VyZV9yZXNwb25zZS5kYXRhLnJvb3RBZGRyZXNzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXJlbkRlbm9ybUV4cG9zdXJlQWRkcmVzczogZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5hc3NldCArICc6JyArIGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEuaW5kaXJlY3RFeHBvc3VyZS5zZXJ2aWNlc1tiXS5yb290QWRkcmVzcyxcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIGV4cG9zdXJlLnB1c2goZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5pbmRpcmVjdEV4cG9zdXJlLnNlcnZpY2VzW2JdKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIHsgfVxyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgYiA9IDA7IGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEuZGlyZWN0RXhwb3N1cmUuc2VydmljZXMubGVuZ3RoOyBiKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEuZGlyZWN0RXhwb3N1cmUuc2VydmljZXNbYl0sIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ1NlcnZpY2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBleHBvc3VyZTogJ2RpcmVjdEV4cG9zdXJlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uOiBleHBvc3VyZV9wYXRoc1t6XSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0QXNzZXQ6IGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEub3V0cHV0QXNzZXQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0OiBleHBvc3VyZV9yZXNwb25zZS5kYXRhLmFzc2V0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dEFkZHJlc3M6IGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEucm9vdEFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBleHBvc3VyZV9yZXNwb25zZS5kYXRhLmFzc2V0ICsgJzonICsgZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5yb290QWRkcmVzcyArICc6ZGlyZWN0RXhwb3N1cmU6JyArIGV4cG9zdXJlX3BhdGhzW3pdICsgJzonICsgZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5kaXJlY3RFeHBvc3VyZS5zZXJ2aWNlc1tiXS5yb290QWRkcmVzcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2lyZW5EZW5vcm1Sb290QWRkcmVzczogZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5hc3NldCArICc6JyArIGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEucm9vdEFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpcmVuRGVub3JtRXhwb3N1cmVBZGRyZXNzOiBleHBvc3VyZV9yZXNwb25zZS5kYXRhLmFzc2V0ICsgJzonICsgZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5kaXJlY3RFeHBvc3VyZS5zZXJ2aWNlc1tiXS5yb290QWRkcmVzcyxcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIGV4cG9zdXJlLnB1c2goZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5kaXJlY3RFeHBvc3VyZS5zZXJ2aWNlc1tiXSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaCB7IH1cclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGIgPSAwOyBleHBvc3VyZV9yZXNwb25zZS5kYXRhLmluZGlyZWN0RXhwb3N1cmUuY2F0ZWdvcmllcy5sZW5ndGg7IGIrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5pbmRpcmVjdEV4cG9zdXJlLmNhdGVnb3JpZXNbYl0sIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ0NhdGVnb3J5JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwb3N1cmU6ICdpbmRpcmVjdEV4cG9zdXJlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uOiBleHBvc3VyZV9wYXRoc1t6XSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0QXNzZXQ6IGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEub3V0cHV0QXNzZXQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0OiBleHBvc3VyZV9yZXNwb25zZS5kYXRhLmFzc2V0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dEFkZHJlc3M6IGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEucm9vdEFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBleHBvc3VyZV9yZXNwb25zZS5kYXRhLmFzc2V0ICsgJzonICsgZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5yb290QWRkcmVzcyArICc6aW5kaXJlY3RFeHBvc3VyZTonICsgZXhwb3N1cmVfcGF0aHNbel0gKyAnOicgKyBleHBvc3VyZV9yZXNwb25zZS5kYXRhLmluZGlyZWN0RXhwb3N1cmUuY2F0ZWdvcmllc1tiXS5jYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2lyZW5EZW5vcm1Sb290QWRkcmVzczogZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5hc3NldCArICc6JyArIGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEucm9vdEFkZHJlc3NcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIGV4cG9zdXJlLnB1c2goZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5pbmRpcmVjdEV4cG9zdXJlLmNhdGVnb3JpZXNbYl0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggeyB9XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBiID0gMDsgZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5kaXJlY3RFeHBvc3VyZS5jYXRlZ29yaWVzLmxlbmd0aDsgYisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihleHBvc3VyZV9yZXNwb25zZS5kYXRhLmRpcmVjdEV4cG9zdXJlLmNhdGVnb3JpZXNbYl0sIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ0NhdGVnb3J5JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwb3N1cmU6ICdkaXJlY3RFeHBvc3VyZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogZXhwb3N1cmVfcGF0aHNbel0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dEFzc2V0OiBleHBvc3VyZV9yZXNwb25zZS5kYXRhLm91dHB1dEFzc2V0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NldDogZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5hc3NldCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRBZGRyZXNzOiBleHBvc3VyZV9yZXNwb25zZS5kYXRhLnJvb3RBZGRyZXNzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5hc3NldCArICc6JyArIGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEucm9vdEFkZHJlc3MgKyAnOmRpcmVjdEV4cG9zdXJlOicgKyBleHBvc3VyZV9wYXRoc1t6XSArICc6JyArIGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEuZGlyZWN0RXhwb3N1cmUuY2F0ZWdvcmllc1tiXS5jYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2lyZW5EZW5vcm1Sb290QWRkcmVzczogZXhwb3N1cmVfcmVzcG9uc2UuZGF0YS5hc3NldCArICc6JyArIGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEucm9vdEFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICBleHBvc3VyZS5wdXNoKGV4cG9zdXJlX3Jlc3BvbnNlLmRhdGEuZGlyZWN0RXhwb3N1cmUuY2F0ZWdvcmllc1tiXSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaCB7IH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZXhwb3N1cmU6IGV4cG9zdXJlXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiJdfQ==
