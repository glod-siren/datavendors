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

export default class ClusterBalance extends ServiceDefinition {
  readonly name = 'cluster_balance';
  readonly inputSchema: InputSchema = {
    address: { type: 'text', required: true },
    asset: { type: 'text', required: false },
    outputAsset: { type: 'text', required: false },
  };
  readonly outputConfiguration: OutputConfiguration = {
    balance: {
      'addressCount': 'long',
      'transferCount': 'long',
      'depositCount': 'long',
      'withdrawalCount': 'long',
      'balance': 'long',
      'totalSentAmount': 'long',
      'totalReceivedAmount': 'long',
      'totalFeesAmount': 'long'
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
    outputAsset?: string,
  }): Promise<DataIndexResults> {
    let matchedAssets = inputs.asset ? [inputs.asset] : this.inferAssetType(inputs.address);
    let overallResults: any[] = []; // define overallResults as array of 'any' type

    for (const asset of matchedAssets) {
      let url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${asset}/summary?outputAsset=${inputs.outputAsset}`;
      const config: AxiosRequestConfig = {
        method: 'get',
        url: url,
        headers: {
          'Accept': 'application/json',
          'token': this.config.token
        }
      };
      const response: AxiosResponse = await axios(config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new WebServiceError(err.response.data) : err));
      const denormAddress: string[] = [];
      denormAddress.push(`${response.data.asset}:${response.data.address}`);
      denormAddress.push(`${response.data.asset}:${response.data.rootAddress}`);
      Object.assign(response.data, {
        sirenDenormAddress: denormAddress,
        id: `${response.data.asset}:${response.data.address}`
      });
      overallResults.push(response.data);
    }
    return {
      balance: overallResults
    }
  }
}
