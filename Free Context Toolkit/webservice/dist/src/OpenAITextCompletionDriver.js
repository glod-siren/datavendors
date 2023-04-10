"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web_service_interface_1 = require("@sirensolutions/web-service-interface");
const axios_1 = __importDefault(require("axios"));
class OpenAITextCompletionDriver extends web_service_interface_1.ServiceDefinition {
    constructor() {
        super(...arguments);
        this.name = 'openai_text_completion';
        this.inputSchema = {
            query: { type: 'text', required: true }
        };
        // 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
        this.outputConfiguration = {
            structuredContent: {},
        };
    }
    async invoke(inputs) {
        // Extract the user query from the incoming inputs
        const userQuery = inputs.query;
        // Call the OpenAI API to generate structured content from the user query
        const openaiApiKey = this.config.openaikey;
        const openaiApiUrl = 'https://api.openai.com/v1/completions';
        const openaiApiData = {
            prompt: userQuery,
            max_tokens: 5,
            n: 1,
            stop: '\n',
        };
        const openaiApiResponse = await axios_1.default.post(openaiApiUrl, openaiApiData, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${openaiApiKey}`,
            },
        }).catch(err => Promise.reject(err.response && err.response.status < 500 ? new web_service_interface_1.WebServiceError(err.response.data) : err));
        // Extract the structured content from the OpenAI API response
        const structuredContent = openaiApiResponse.data.choices[0].text;
        // Return an array of objects containing the structured content
        return { structuredContent: [structuredContent] };
    }
}
exports.default = OpenAITextCompletionDriver;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9PcGVuQUlUZXh0Q29tcGxldGlvbkRyaXZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGlGQUE4STtBQUM5SSxrREFBNkM7QUFFN0MsTUFBcUIsMEJBQTJCLFNBQVEseUNBQWlCO0lBQXpFOztRQUNXLFNBQUksR0FBRyx3QkFBd0IsQ0FBQztRQUVoQyxnQkFBVyxHQUFnQjtZQUNsQyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7U0FDMUMsQ0FBQztRQUNGLHNEQUFzRDtRQUM3Qyx3QkFBbUIsR0FBd0I7WUFDOUMsaUJBQWlCLEVBQUUsRUFBRTtTQUN4QixDQUFDO0lBNkJKLENBQUM7SUEzQkMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUVkO1FBQ0csa0RBQWtEO1FBQ2xELE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFFL0IseUVBQXlFO1FBQ3pFLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQzNDLE1BQU0sWUFBWSxHQUFHLHVDQUF1QyxDQUFDO1FBQzdELE1BQU0sYUFBYSxHQUFHO1lBQ3BCLE1BQU0sRUFBRSxTQUFTO1lBQ2pCLFVBQVUsRUFBRSxDQUFDO1lBQ2IsQ0FBQyxFQUFFLENBQUM7WUFDSixJQUFJLEVBQUUsSUFBSTtTQUNYLENBQUM7UUFDQSxNQUFNLGlCQUFpQixHQUFrQixNQUFNLGVBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLGFBQWEsRUFBRTtZQUNyRixPQUFPLEVBQUU7Z0JBQ1AsY0FBYyxFQUFFLGtCQUFrQjtnQkFDbEMsYUFBYSxFQUFFLFVBQVUsWUFBWSxFQUFFO2FBQ3hDO1NBQ0YsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksdUNBQWUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzFILDhEQUE4RDtRQUM5RCxNQUFNLGlCQUFpQixHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBRWpFLCtEQUErRDtRQUMvRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUM7SUFDcEQsQ0FBQztDQUNKO0FBdENELDZDQXNDQyIsImZpbGUiOiJzcmMvT3BlbkFJVGV4dENvbXBsZXRpb25Ecml2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEYXRhSW5kZXhSZXN1bHRzLCBJbnB1dFNjaGVtYSwgT3V0cHV0Q29uZmlndXJhdGlvbiwgU2VydmljZURlZmluaXRpb24sIFdlYlNlcnZpY2VFcnJvcn0gZnJvbSAnQHNpcmVuc29sdXRpb25zL3dlYi1zZXJ2aWNlLWludGVyZmFjZSc7XG5pbXBvcnQgYXhpb3MsIHsgQXhpb3NSZXNwb25zZSB9IGZyb20gJ2F4aW9zJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT3BlbkFJVGV4dENvbXBsZXRpb25Ecml2ZXIgZXh0ZW5kcyBTZXJ2aWNlRGVmaW5pdGlvbiB7XG4gIHJlYWRvbmx5IG5hbWUgPSAnb3BlbmFpX3RleHRfY29tcGxldGlvbic7XG5cbiAgcmVhZG9ubHkgaW5wdXRTY2hlbWE6IElucHV0U2NoZW1hID0ge1xuICAgIHF1ZXJ5OiB7IHR5cGU6ICd0ZXh0JywgcmVxdWlyZWQ6IHRydWUgfVxufTtcbi8vIHNrLXpDZEZmdU0zVTZFVU1SazNoVHRVVDNCbGJrRkpTbnJkMUpSZjR4d2U3V1BvdExEUVxucmVhZG9ubHkgb3V0cHV0Q29uZmlndXJhdGlvbjogT3V0cHV0Q29uZmlndXJhdGlvbiA9IHtcbiAgICAgIHN0cnVjdHVyZWRDb250ZW50OiB7fSxcbiAgfTtcblxuICBhc3luYyBpbnZva2UoaW5wdXRzOiB7XG4gICAgcXVlcnk6IHN0cmluZyxcbn0pOiBQcm9taXNlPERhdGFJbmRleFJlc3VsdHM+IHtcbiAgICAvLyBFeHRyYWN0IHRoZSB1c2VyIHF1ZXJ5IGZyb20gdGhlIGluY29taW5nIGlucHV0c1xuICAgIGNvbnN0IHVzZXJRdWVyeSA9IGlucHV0cy5xdWVyeTtcblxuICAgIC8vIENhbGwgdGhlIE9wZW5BSSBBUEkgdG8gZ2VuZXJhdGUgc3RydWN0dXJlZCBjb250ZW50IGZyb20gdGhlIHVzZXIgcXVlcnlcbiAgICBjb25zdCBvcGVuYWlBcGlLZXkgPSB0aGlzLmNvbmZpZy5vcGVuYWlrZXk7XG4gICAgY29uc3Qgb3BlbmFpQXBpVXJsID0gJ2h0dHBzOi8vYXBpLm9wZW5haS5jb20vdjEvY29tcGxldGlvbnMnO1xuICAgIGNvbnN0IG9wZW5haUFwaURhdGEgPSB7XG4gICAgICBwcm9tcHQ6IHVzZXJRdWVyeSxcbiAgICAgIG1heF90b2tlbnM6IDUsXG4gICAgICBuOiAxLFxuICAgICAgc3RvcDogJ1xcbicsXG4gICAgfTtcbiAgICAgIGNvbnN0IG9wZW5haUFwaVJlc3BvbnNlOiBBeGlvc1Jlc3BvbnNlID0gYXdhaXQgYXhpb3MucG9zdChvcGVuYWlBcGlVcmwsIG9wZW5haUFwaURhdGEsIHtcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke29wZW5haUFwaUtleX1gLFxuICAgICAgICB9LFxuICAgICAgfSkuY2F0Y2goZXJyID0+IFByb21pc2UucmVqZWN0KGVyci5yZXNwb25zZSAmJiBlcnIucmVzcG9uc2Uuc3RhdHVzIDwgNTAwID8gbmV3IFdlYlNlcnZpY2VFcnJvcihlcnIucmVzcG9uc2UuZGF0YSkgOiBlcnIpKTtcbiAgICAgIC8vIEV4dHJhY3QgdGhlIHN0cnVjdHVyZWQgY29udGVudCBmcm9tIHRoZSBPcGVuQUkgQVBJIHJlc3BvbnNlXG4gICAgICBjb25zdCBzdHJ1Y3R1cmVkQ29udGVudCA9IG9wZW5haUFwaVJlc3BvbnNlLmRhdGEuY2hvaWNlc1swXS50ZXh0O1xuXG4gICAgICAvLyBSZXR1cm4gYW4gYXJyYXkgb2Ygb2JqZWN0cyBjb250YWluaW5nIHRoZSBzdHJ1Y3R1cmVkIGNvbnRlbnRcbiAgICAgIHJldHVybiB7IHN0cnVjdHVyZWRDb250ZW50OiBbc3RydWN0dXJlZENvbnRlbnRdIH07XG4gICAgfSBcbn1cbiJdfQ==
