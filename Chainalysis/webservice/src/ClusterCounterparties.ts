import { DataIndexResults, InputSchema, OutputConfiguration, ServiceDefinition, WebServiceError } from '@sirensolutions/web-service-interface';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const cryptoRegexPatterns = {
  'BTC': '^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$', // Bitcoin (BTC) including bech32 addresses
  'ETH': '^(?:0x)?[a-fA-F0-9]{40,42}$', // Ethereum
  'USDT': '^1[1-9][a-zA-Z0-9]{24,33}$', // Tether
  'XRP': '^r[0-9a-zA-Z]{24,34}$', // Ripple
  'BNB': '^bnb[0-9a-zA-Z]{38}$', // Binance Coin
  'ADA': '^Ae2tdPwUPEYy{44}$', // Cardano
  'SOL': '^So[1-9][0-9a-zA-Z]{48}$', // Solana
  'DOGE': '^D[0-9a-fA-F]{32}$', // Dogecoin
  'TRX': '^T[0-9a-fA-F]{33}$', // Tron
  'LTC': '^L[a-km-zA-HJ-NP-Z1-9]{26,33}$', // Litecoin
  'DOT': '^1[a-zA-Z0-9]{31}$', // Polkadot
  'LINK': '^0x[a-fA-F0-9]{40}$', // Chainlink
  'XLM': '^G[A-Z0-9]{55}$', // Stellar Lumens
  'XMR': '^4[0-9A-Za-z]{94}$', // Monero
  'ATOM': '^cosmos1[a-z0-9]{38}$', // Cosmos
  // Add more patterns here for other cryptocurrencies
};

export default class ClusterCounterparties extends ServiceDefinition {
  readonly name = 'cluster_counterparties';
  readonly inputSchema: InputSchema = {
    address: { type: 'text', required: true },
    asset: { type: 'text', required: false },
    outputAsset: { type: 'text', required: false },
    page: { type: 'text', required: false },
    page_limit: { type: 'float', required: false },
  };
  readonly outputConfiguration: OutputConfiguration = {
    counterparties: {
      'raw': 'text',
      'firstTransferTimestamp': 'date',
      'lastTransferTimestamp': 'date',
      'sentAmount': 'long',
      'receivedAmount': 'long',
      'transfers': 'long'
    },
    pagination: {
      'nextPage': 'keyword',
      'totalresults': 'long'
    }
  };

  inferAssetType(address: string): string {
    for (const [asset, pattern] of Object.entries(cryptoRegexPatterns)) {
      const regex = new RegExp(pattern);
      if (regex.test(address)) {
        return asset;
      }
    }
    throw new WebServiceError('Could not infer asset type from address');
  }

  async invoke(inputs: {
    address: string,
    asset?: string,
    outputAsset?: string,
    page?: string,
    page_limit?: number
  }): Promise<DataIndexResults> {
    if (!inputs.asset) { inputs.asset = this.inferAssetType(inputs.address); }
    if (!inputs.outputAsset) { inputs.outputAsset = 'NATIVE' }
    let url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/counterparties?outputAsset=${inputs.outputAsset}`
    if (inputs.page) {
      url += `?page=${inputs.page}`
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
    let pageLimit = inputs.page_limit || Number.MAX_SAFE_INTEGER;
    if (response.data.nextPage != null) {
      let page = response.data.nextPage;
      let lastResult = { nextPage: '' };
      let pagesFetched = 0;
      do {
        try {
          let sub_url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/counterparties?outputAsset=${inputs.outputAsset}&page=${page}`;
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
          response.data.items.push.apply(response.data.items, sub_response.data.items);
          page = lastResult.nextPage;
          pagesFetched += 1;
        } catch { throw new WebServiceError('pagination error') }
      } while (lastResult.nextPage !== null && pagesFetched < pageLimit);
      if (lastResult.nextPage !== null) {
        truncated = true;
        nextPage = lastResult.nextPage;
      }
    }
    return {
      counterparties: response.data.items,
      pagination: [{
        totalresults: response.data.items.length,
        nextPage: nextPage
      }]
    }
  }
}