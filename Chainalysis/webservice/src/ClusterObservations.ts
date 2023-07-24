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
export default class ClusterObservations extends ServiceDefinition {
    readonly name = 'cluster_observations';
    readonly inputSchema: InputSchema = {
        address: { type: 'text', required: true },
        asset: { type: 'text', required: false },
        startTime: { type: 'date', required: false },
        endTime: { type: 'date', required: false }
    };
    readonly outputConfiguration: OutputConfiguration = {
        observation: {
            'lat' : 'long',
            'long': 'long',
            'timestamp': 'date',
            'geo_location': 'geo_point',
            'ipAddress': 'keyword',
            'port': 'keyword'
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
        startTime: string,
        endTime: string
    }): Promise<DataIndexResults> {
        const matchedAssets = inputs.asset ? [inputs.asset] : this.inferAssetType(inputs.address);
        let overallResults: object[] = [];

        for (const asset of matchedAssets) {
            let obs_url = `https://iapi.chainalysis.com/observations/clusters/${inputs.address}/${asset}?`
            if (inputs.startTime) {obs_url = obs_url + `&startTime=${inputs.startTime}`}
            if (inputs.endTime) {obs_url = obs_url + `&endTime=${inputs.endTime}`}
            const obs_config: AxiosRequestConfig = {
                method: 'get',
                url: obs_url,
                headers: {
                    'Accept': 'application/json',
                    'token': this.config.token
                }
            };
            const obs_response: AxiosResponse = await axios(obs_config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new WebServiceError(err.response.data) : err));
            for (let y = 0; y < obs_response.data.observations.length; y++) {
                let denormAddress: string[] = [];
                denormAddress.push(`${asset}:${obs_response.data.observations[y].walletRootAddress}`)
                denormAddress.push(`${asset}:${obs_response.data.address}`)
                denormAddress.push(`${asset}:${obs_response.data.rootAddress}`)
                Object.assign(obs_response.data.observations[y], {
                    sirenDenormAddress: ([... new Set(denormAddress)]),
                    id: obs_response.data.observations[y].walletRootAddress + ':' + obs_response.data.observations[y].timestamp,
                    address: obs_response.data.observations[y].walletRootAddress,
                    rootAddress: obs_response.data.rootAddress,
                    geo_location: obs_response.data.observations[y].lat + ',' + obs_response.data.observations[y].long
                })
                overallResults.push(obs_response.data.observations[y]);
            }
        }

        return {
            observation: overallResults
        }
    }
}
