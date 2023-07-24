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

export default class IpObservations extends ServiceDefinition {
    readonly name = 'ip_observations';
    readonly inputSchema: InputSchema = {
        ip: { type: 'text', required: true },
        startTime: { type: 'date', required: false },
        endTime: { type: 'date', required: false },
        page: { type: 'date', required: false },
        page_limit: { type: 'float', required: false },
    };
    readonly outputConfiguration: OutputConfiguration = {
        observation: {
            'lat' : 'long',
            'long': 'long',
            'timestamp': 'date',
            'geo_location': 'geo_point',
            'ipAddress': 'keyword',
            'port': 'keyword',
            'asset': 'keyword'
        },
        pagination: {
            'nextPage': 'keyword',
            'totalresults': 'long'
        }
    };
    async invoke(inputs: {
        ip: string,
        startTime: string,
        endTime: string,
        page: string,
        page_limit?: number,
    }): Promise<DataIndexResults> {
        let obs_url = `https://iapi.chainalysis.com/observations/ips/${inputs.ip}?size=100`;
        if (inputs.page) {
            obs_url = obs_url + `&page=${inputs.page}`;
        }
        if (inputs.startTime) {
            obs_url = obs_url + `&startTime=${inputs.startTime}`;
        }
        if (inputs.endTime) {
            obs_url = obs_url + `&endTime=${inputs.endTime}`;
        }
        const obs_config: AxiosRequestConfig = {
            method: 'get',
            url: obs_url,
            headers: {
                'Accept': 'application/json',
                'token': this.config.token
            }
        };
        const obs_response: AxiosResponse = await axios(obs_config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new WebServiceError(err.response.data) : err));
        let truncated = false;
        let nextPage = '';
        if (obs_response.data.nextPage != null) {
            let page = obs_response.data.nextPage;
            let lastResult = { nextPage: '' };
            const page_limit = inputs.page_limit ? inputs.page_limit : Number.MAX_SAFE_INTEGER;
            let pagesFetched = 0;
            do {
                try {
                    let sub_url = `https://iapi.chainalysis.com/observations/ips/${inputs.ip}?size=100` + `&page=${page}`;
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
                    obs_response.data.items.push.apply(obs_response.data.items, sub_response.data.items);
                    page = lastResult.nextPage;
                    pagesFetched += 1;
                } catch { new WebServiceError('pagination error') }
            } while (lastResult.nextPage !== null && pagesFetched < page_limit);            
            if (lastResult.nextPage !== null) {
                truncated = true;
                nextPage = lastResult.nextPage;
            }
        }
        for (let y = 0; y < obs_response.data.items.length; y++) {
            let asset: String = ''
            for (const cryptoType in cryptoRegexPatterns) {
                const regexPattern = new RegExp(cryptoRegexPatterns[cryptoType]);
                if (regexPattern.test(obs_response.data.items[y].walletRootAddress)) {
                    asset = cryptoType;
                    break;
                }
            }
            Object.assign(obs_response.data.items[y], {
                id: obs_response.data.items[y].ipAddress + ':' + obs_response.data.items[y].timestamp,
                address: obs_response.data.items[y].walletRootAddress,
                geo_location: obs_response.data.items[y].lat + ',' + obs_response.data.items[y].long,
                asset: asset
            })
        }
        return {
            observation: obs_response.data.items,
            pagination: [{
                totalresults: obs_response.data.length,
                nextPage: nextPage
            }]
        }
    }
}
