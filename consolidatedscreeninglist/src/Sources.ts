import { DataIndexResults, InputSchema, OutputConfiguration, ServiceDefinition, WebServiceError } from '@sirensolutions/web-service-interface';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
export default class Sources extends ServiceDefinition {
  readonly name = 'sources';
  readonly inputSchema: InputSchema = {
  };
  readonly outputConfiguration: OutputConfiguration = {
    result: {}
  };
  async invoke(): Promise<DataIndexResults> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `https://data.trade.gov/consolidated_screening_list/v1/sources`,
      headers: { 
        'subscription-key': this.config.subscription_key
      }
    };
    const response: AxiosResponse = await axios(config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new WebServiceError(err.response.data) : err));
    return {
      result: response.data.results
    };
  }
}
