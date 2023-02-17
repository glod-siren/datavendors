import { DataIndexResults, InputSchema, OutputConfiguration, ServiceDefinition, WebServiceError } from '@sirensolutions/web-service-interface';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
export default class ClusterCounterparties extends ServiceDefinition {
  readonly name = 'cluster_counterparties';
  readonly inputSchema: InputSchema = {
    address: { type: 'text', required: true },
    asset: { type: 'text', required: true },
    outputAsset: { type: 'text', required: false },
  };
  readonly outputConfiguration: OutputConfiguration = {
    counterparties: {
        'raw': 'text',
        'firstTransferTimestamp': 'date',
        'lastTransferTimestamp': 'date',
        'sentAmount': 'long',
        'receivedAmount': 'long',
        'transfers': 'long'
    }
  };
  async invoke(inputs: {
    address: string,
    asset: string,
    outputAsset: string
  }): Promise<DataIndexResults> {
    if (!inputs.outputAsset) {inputs.outputAsset = 'NATIVE'}
    let url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/counterparties?outputAsset=${inputs.outputAsset}&size=200`
    const config: AxiosRequestConfig = {
      method: 'get',
      url: url,
      headers: {
        'Accept': 'application/json',
        'token': this.config.token
      }
    };
    const response: AxiosResponse = await axios(config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new WebServiceError(err.response.data) : err));
    //let items = response.data.items
    let truncated = false
    if (response.data.nextPage != null) {
      let page = response.data.nextPage
      let lastResult = { nextPage: '' };
      do {
        try {
          let sub_url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/counterparties?outputAsset=${inputs.outputAsset}&size=200&page=${page}`
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
      } while (lastResult.nextPage !== null && response.data.items < 10000)
      if (lastResult.nextPage !== null || lastResult.nextPage !== '') {
        truncated = true
      }
    }
    for (let y = 0; y < response.data.items.length; y++) {
      Object.assign(response.data.items[y], {
        id: `${response.data.items[y].asset}:${inputs.address}:${response.data.items[y].rootAddress}`,
        inputAddress: inputs.address,
        sirenDenormPartyInput: `${response.data.items[y].asset}:${inputs.address}`,
        sirenDenormPartyOutput: `${response.data.items[y].asset}:${response.data.items[y].rootAddress}`,
        truncated: truncated
      })
    }
    return {
        counterparties: response.data.items
    }
  }
}
