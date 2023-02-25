import { DataIndexResults, InputSchema, OutputConfiguration, ServiceDefinition, WebServiceError } from '@sirensolutions/web-service-interface';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
export default class ClusterAddresses extends ServiceDefinition {
  readonly name = 'cluster_address';
  readonly inputSchema: InputSchema = {
    address: { type: 'text', required: true },
    asset: { type: 'text', required: true },
    page: { type: 'text', required: false },
  };
  readonly outputConfiguration: OutputConfiguration = {
    cluster: {},
    pagination: {
      'nextPage': 'keyword'
  }
  };
  async invoke(inputs: {
    address: string,
    asset: string,
    page: string,
  }): Promise<DataIndexResults> {
    let url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/addresses?size=100`
    if (inputs.page) {
      url + url + `&page=${inputs.page}`
  }
    const config: AxiosRequestConfig = {
      method: 'get',
      url: url,
      headers: {
        'Accept': 'application/json',
        'token': this.config.token
      }
    };
    const response: AxiosResponse = await axios(config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new WebServiceError(err.response.data) : err));
    let truncated = false;
    let nextPage = '';
    if (response.data.nextPage != null) {
      let page = response.data.nextPage
      let lastResult = { nextPage: '' };
      do {
        try {
          let sub_url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/addresses?size=100&page=${page}`
          const sub_config: AxiosRequestConfig = {
            method: 'get',
            url: sub_url,
            headers: {
              'Accept': 'application/json',
              'token': this.config.token
            }
          };
          const sub_response: AxiosResponse = await axios(sub_config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new WebServiceError(err.response.data) : err));
          lastResult = sub_response.data;
          response.data.items.push.apply(response.data.items, sub_response.data.items)
        } catch { new WebServiceError('pagination error') }
      } while (lastResult.nextPage !== null && response.data.items < 1000)
      if (lastResult.nextPage !== null || lastResult.nextPage !== '') {
        truncated = true
        nextPage = lastResult.nextPage
      }
    }
    const denormAddress: string[] = [];
    for (let y = 0; y < response.data.items.length; y++) {
      denormAddress.push(`${response.data.asset}:${response.data.items[y].address}`)
    }
    return {
      cluster: [{
        id: response.data.asset + ':' + response.data.rootAddress,
        rootAddress: response.data.rootAddress,
        asset: response.data.asset,
        items: response.data.items,
        sirenDenormAddress: denormAddress,
        truncated: truncated
      }],
      pagination: [{
        nextPage: nextPage
      }]
    }
  }
}
