"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web_service_interface_1 = require("@sirensolutions/web-service-interface");
const axios_1 = require("axios");
class Sources extends web_service_interface_1.ServiceDefinition {
    constructor() {
        super(...arguments);
        this.name = 'sources';
        this.inputSchema = {};
        this.outputConfiguration = {
            result: {}
        };
    }
    async invoke() {
        const config = {
            method: 'get',
            url: `https://data.trade.gov/consolidated_screening_list/v1/sources`,
            headers: {
                'subscription-key': this.config.subscription_key
            }
        };
        const response = await axios_1.default(config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new web_service_interface_1.WebServiceError(err.response.data) : err));
        return {
            result: response.data.results
        };
    }
}
exports.default = Sources;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9Tb3VyY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUZBQStJO0FBQy9JLGlDQUFpRTtBQUNqRSxNQUFxQixPQUFRLFNBQVEseUNBQWlCO0lBQXREOztRQUNXLFNBQUksR0FBRyxTQUFTLENBQUM7UUFDakIsZ0JBQVcsR0FBZ0IsRUFDbkMsQ0FBQztRQUNPLHdCQUFtQixHQUF3QjtZQUNsRCxNQUFNLEVBQUUsRUFBRTtTQUNYLENBQUM7SUFjSixDQUFDO0lBYkMsS0FBSyxDQUFDLE1BQU07UUFDVixNQUFNLE1BQU0sR0FBdUI7WUFDakMsTUFBTSxFQUFFLEtBQUs7WUFDYixHQUFHLEVBQUUsK0RBQStEO1lBQ3BFLE9BQU8sRUFBRTtnQkFDUCxrQkFBa0IsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQjthQUNqRDtTQUNGLENBQUM7UUFDRixNQUFNLFFBQVEsR0FBa0IsTUFBTSxlQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSx1Q0FBZSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDM0ssT0FBTztZQUNMLE1BQU0sRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU87U0FDOUIsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQXBCRCwwQkFvQkMiLCJmaWxlIjoic3JjL1NvdXJjZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEYXRhSW5kZXhSZXN1bHRzLCBJbnB1dFNjaGVtYSwgT3V0cHV0Q29uZmlndXJhdGlvbiwgU2VydmljZURlZmluaXRpb24sIFdlYlNlcnZpY2VFcnJvciB9IGZyb20gJ0BzaXJlbnNvbHV0aW9ucy93ZWItc2VydmljZS1pbnRlcmZhY2UnO1xyXG5pbXBvcnQgYXhpb3MsIHsgQXhpb3NSZXF1ZXN0Q29uZmlnLCBBeGlvc1Jlc3BvbnNlIH0gZnJvbSAnYXhpb3MnO1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTb3VyY2VzIGV4dGVuZHMgU2VydmljZURlZmluaXRpb24ge1xyXG4gIHJlYWRvbmx5IG5hbWUgPSAnc291cmNlcyc7XHJcbiAgcmVhZG9ubHkgaW5wdXRTY2hlbWE6IElucHV0U2NoZW1hID0ge1xyXG4gIH07XHJcbiAgcmVhZG9ubHkgb3V0cHV0Q29uZmlndXJhdGlvbjogT3V0cHV0Q29uZmlndXJhdGlvbiA9IHtcclxuICAgIHJlc3VsdDoge31cclxuICB9O1xyXG4gIGFzeW5jIGludm9rZSgpOiBQcm9taXNlPERhdGFJbmRleFJlc3VsdHM+IHtcclxuICAgIGNvbnN0IGNvbmZpZzogQXhpb3NSZXF1ZXN0Q29uZmlnID0ge1xyXG4gICAgICBtZXRob2Q6ICdnZXQnLFxyXG4gICAgICB1cmw6IGBodHRwczovL2RhdGEudHJhZGUuZ292L2NvbnNvbGlkYXRlZF9zY3JlZW5pbmdfbGlzdC92MS9zb3VyY2VzYCxcclxuICAgICAgaGVhZGVyczogeyBcclxuICAgICAgICAnc3Vic2NyaXB0aW9uLWtleSc6IHRoaXMuY29uZmlnLnN1YnNjcmlwdGlvbl9rZXlcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIGNvbnN0IHJlc3BvbnNlOiBBeGlvc1Jlc3BvbnNlID0gYXdhaXQgYXhpb3MoY29uZmlnKS5jYXRjaChlcnIgPT4gUHJvbWlzZS5yZWplY3QoZXJyLnJlc3BvbnNlICYmIGVyci5yZXNwb25zZS5zdGF0dXMgPCA1MDAgPyBuZXcgV2ViU2VydmljZUVycm9yKGVyci5yZXNwb25zZS5kYXRhKSA6IGVycikpO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcmVzdWx0OiByZXNwb25zZS5kYXRhLnJlc3VsdHNcclxuICAgIH07XHJcbiAgfVxyXG59XHJcbiJdfQ==
