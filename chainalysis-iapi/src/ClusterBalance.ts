import { DataIndexResults, InputSchema, OutputConfiguration, ServiceDefinition, WebServiceError } from '@sirensolutions/web-service-interface';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
export default class ClusterBalance extends ServiceDefinition {
  readonly name = 'cluster_balance';
  readonly inputSchema: InputSchema = {
    address: { type: 'text', required: true },
    asset: { type: 'text', required: true },
    outputAsset: { type: 'text', required: false },
  };
  readonly outputConfiguration: OutputConfiguration = {
    balance : {
        'addressCount' : 'long',
        'transferCount': 'long',
        'depositCount': 'long',
        'withdrawalCount': 'long',
        'balance': 'long',
        'totalSentAmount': 'long',
        'totalReceivedAmount': 'long',
        'totalFeesAmount': 'long'
    }
  };
  async invoke(inputs: {
    address: string,
    asset: string,
    outputAsset: string,
  }): Promise<DataIndexResults> {
    if (!inputs.outputAsset) {inputs.outputAsset = 'NATIVE'}
    let url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/summary?outputAsset=${inputs.outputAsset}`
    const config: AxiosRequestConfig = {
      method: 'get',
      url: url,
      headers: {
        'Accept': 'application/json',
        'token': this.config.token
      }
    };
    const response: AxiosResponse = await axios(config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new WebServiceError(err.response.data) : err));
    const denormAddress : string[] = [];
    denormAddress.push(`${response.data.asset}:${response.data.address}`)
    denormAddress.push(`${response.data.asset}:${response.data.rootAddress}`)
    Object.assign(response.data, {
        sirenDenormAddress: denormAddress, 
        id: `${response.data.asset}:${response.data.address}`
    })
    return {
        balance: [response.data]
    }
  }
}
