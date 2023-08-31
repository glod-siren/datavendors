import { DataIndexResults, InputSchema, OutputConfiguration, ServiceDefinition, WebServiceError } from '@sirensolutions/web-service-interface';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const cryptoRegexPatterns = {
  'BTC': '^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$', // Bitcoin (BTC) including bech32 addresses
  'ETH': '^(?:0x)?[a-fA-F0-9]{40,42}$', // Ethereum
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

export default class ClusterAddresses extends ServiceDefinition {
  readonly name = 'cluster_address';
  readonly inputSchema: InputSchema = {
    address: { type: 'text', required: true },
    asset: { type: 'text', required: false },
    page: { type: 'text', required: false },
    page_limit: { type: 'float', required: false },
  };
  readonly outputConfiguration: OutputConfiguration = {
    addresses: {},
    pagination: {
      'nextPage': 'keyword'
    }
  };

  private inferAssetType(address: string): string[] {
    return Object.keys(cryptoRegexPatterns).filter(asset => {
      return new RegExp(cryptoRegexPatterns[asset]).test(address);
    });
  }

  async invoke(inputs: {
    address: string,
    asset?: string,
    page: string,
    page_limit: number
  }): Promise<DataIndexResults> {
    const matchedAssets = inputs.asset ? [inputs.asset] : this.inferAssetType(inputs.address);
    let overallResults = [];
    let overallNextPage = '';
    let overallTruncated = false;

    for (const asset of matchedAssets) {
      let url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${asset}/addresses?size=400`;
      if (inputs.page) {
        url = url + `&page=${inputs.page}`;
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
      const pageLimit = inputs.page_limit ? (inputs.page_limit === 0 ? Number.MAX_SAFE_INTEGER : inputs.page_limit) : Number.MAX_SAFE_INTEGER;

      if (response.data.nextPage != null) {
        let page = response.data.nextPage;
        let lastResult = { nextPage: '' };
        let sub_response: AxiosResponse;
        let pageCounter = 0;

        while (lastResult.nextPage !== null && pageCounter < pageLimit) {
          let sub_url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${asset}/addresses?size=400&page=${page}`;
          const sub_config: AxiosRequestConfig = {
            method: 'get',
            url: sub_url,
            headers: {
              'Accept': 'application/json',
              'token': this.config.token
            }
          };

          sub_response = await axios(sub_config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new WebServiceError(err.response.data) : err));
          lastResult = sub_response.data;
          response.data.items.push.apply(response.data.items, sub_response.data.items)
          page = lastResult.nextPage; // Update the page after all items have been processed for the current page.
          pageCounter += 1;
        }
        overallNextPage = lastResult.nextPage
      }
      for (let y = 0; y < response.data.items.length; y++) {
        Object.assign(response.data.items[y], {
          rootAddress: response.data.rootAddress,
          asset: response.data.asset,
          id: `${response.data.asset}:${response.data.items[y].address}`
        });
      }
      overallResults.push.apply(overallResults, response.data.items);
    }
    return {
      addresses: overallResults,
      pagination: [{
        totalresults: overallResults.length,
        nextPage: overallNextPage
      }]
    };
  }
}
