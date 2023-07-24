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

export default class ClusterCombinedInfo extends ServiceDefinition {
    readonly name = 'cluster_combined_info';
    readonly inputSchema: InputSchema = {
        address: { type: 'text', required: true },
        asset: { type: 'text', required: false },
        outputAsset: { type: 'text', required: false },
    };
    readonly outputConfiguration: OutputConfiguration = {
        cluster: {
            'cluster_balance': {
                'addressCount': 'long',
                'transferCount': 'long',
                'depositCount': 'long',
                'withdrawalCount': 'long',
                'balance': 'long',
                'totalSentAmount': 'long',
                'totalReceivedAmount': 'long',
                'totalFeesAmount': 'long'
            }
        },
        addresses: {}
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
        asset: string,
        outputAsset: string,
    }): Promise<DataIndexResults> {
        // If asset is not provided, infer it
        if (!inputs.asset) {
            inputs.asset = this.inferAssetType(inputs.address);
        }

        if (!inputs.outputAsset) { inputs.outputAsset = 'NATIVE' }

        let name_url = `https://iapi.chainalysis.com/clusters/${inputs.address}?filterAsset=${inputs.asset}`;
        const name_config: AxiosRequestConfig = {
            method: 'get',
            url: name_url,
            headers: {
                'Accept': 'application/json',
                'token': this.config.token
            }
        };
        const name_response: AxiosResponse = await axios(name_config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new WebServiceError(err.response.data) : err));

        let balance_url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/summary?outputAsset=${inputs.outputAsset}`;
        const balance_config: AxiosRequestConfig = {
            method: 'get',
            url: balance_url,
            headers: {
                'Accept': 'application/json',
                'token': this.config.token
            }
        };
        const balance_response: AxiosResponse = await axios(balance_config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new WebServiceError(err.response.data) : err));

        let rootAddress = balance_response.data.rootAddress; // Get rootAddress from balance_response

        return {
            cluster: [{
                id: inputs.asset + ':' + rootAddress,
                name: name_response.data.items[0].name,
                category: name_response.data.items[0].category,
                rootAddress: rootAddress,
                asset: inputs.asset,
                cluster_balance: balance_response.data,
            }],
            addresses: [{
                id: inputs.asset + ':' + inputs.address,
                address: inputs.address,
                asset: inputs.asset,
                rootAddress: rootAddress,
            }]
        }
    }
}
