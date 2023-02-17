import { DataIndexResults, InputSchema, OutputConfiguration, ServiceDefinition, WebServiceError } from '@sirensolutions/web-service-interface';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
export default class Search extends ServiceDefinition {
  readonly name = 'search';
  readonly inputSchema: InputSchema = {
    fuzzy_name : { type: 'text', required: false },
    sources: { type: 'text', required: false },
    types: { type: 'text', required: false },
    countries: { type: 'text', required: false },
    address: { type: 'text', required: false },
    city: { type: 'text', required: false },
    state: { type: 'text', required: false }, 
    postal_code: { type: 'text', required: false },
    full_address: { type: 'text', required: false },
    offset: { type: 'text', required: false },
    name: { type: 'text', required: false },
  };
  readonly outputConfiguration: OutputConfiguration = {
    item: {},
    result: {}
  };
  async invoke(inputs: {
    fuzzy_name : string,
    sources: string,
    types: string,
    countries: string,
    address: string,
    city: string,
    state: string,
    postal_code: string,
    full_address: string,
    offset: string,
    name: string
  }): Promise<DataIndexResults> {
    let url = 'https://data.trade.gov/consolidated_screening_list/v1/search?size=50'
    if (inputs.fuzzy_name) {url = url + `&fuzzy_name=${inputs.fuzzy_name}`}
    if (inputs.types) {url = url + `&types=${inputs.types}`}
    if (inputs.countries) {url = url + `&countries=${inputs.countries}`}
    if (inputs.sources) {url = url + `&sources=${inputs.sources}`}
    if (inputs.address) {url = url + `&address=${inputs.address}`}
    if (inputs.city) {url = url + `&city=${inputs.city}`}
    if (inputs.state) {url = url + `&state=${inputs.state}`}
    if (inputs.postal_code) {url = url + `&postal_code=${inputs.postal_code}`}
    if (inputs.full_address) {url = url + `&full_address=${inputs.full_address}`}
    if (inputs.offset) {url = url + `&offset=${inputs.offset}`}
    if (inputs.name) {url = url + `&name=${inputs.name}`}
    const config: AxiosRequestConfig = {
      method: 'get',
      url: url,
      headers: { 
        'subscription-key': this.config.subscription_key
      }
    };
    const response: AxiosResponse = await axios(config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new WebServiceError(err.response.data) : err));
    return {
      item: response.data.results,
      result: [{
        total: response.data.total,
        sources: response.data.sources
      }]
    };
  }
}
