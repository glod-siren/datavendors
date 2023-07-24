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

export default class AddressTransactions extends ServiceDefinition {
    readonly name = 'address_transactions';
    readonly inputSchema: InputSchema = {
        address: { type: 'text', required: true },
        asset: { type: 'text', required: false },
        direction: { type: 'text', required: false },
        page: { type: 'text', required: false },
        page_limit: { type: 'float', required: false },
        cluster: { type: 'text', required: false },
        cluster_counterparty: { type: 'text', required: false },
        cluster_startTime: { type: 'text', required: false },
        cluster_endTime: { type: 'text', required: false },
    };
    readonly outputConfiguration: OutputConfiguration = {
        transaction: {
            details: {
                'blockTimestamp': 'date',
                'blockHeight': 'long',
                'exchangeRate': 'long',
                'fee': 'long',
                traces: {
                    inputs: {
                        'amount': 'long'
                    },
                    outputs: {
                        'amount': 'long'
                    }
                }
            }
        },
        pagination: {}
    };

    private inferAssetType(address: string): string[] {
        return Object.keys(cryptoRegexPatterns).filter(asset => {
            return new RegExp(cryptoRegexPatterns[asset]).test(address);
        });
    }

    async invoke(inputs: {
        address: string,
        asset?: string,
        direction: string,
        page?: string,
        page_limit?: number,
        cluster?: string,
        cluster_counterparty?: string,
        cluster_startTime?: string,
        cluster_endTime?: string
    }): Promise<DataIndexResults> {
        const matchedAssets = inputs.asset ? [inputs.asset] : this.inferAssetType(inputs.address);
        let overallResults = [];
        let overallNextPage = '';
        let overallTruncated = false;

        for (const asset of matchedAssets) {
            let base_url = inputs.cluster 
                ? `https://iapi.chainalysis.com/clusters/${inputs.address}/${asset}/transactions?size=100`
                : `https://iapi.chainalysis.com/addresses/${inputs.address}/${asset}/transactions?size=100&direction=${inputs.direction}`;
            if (inputs.cluster_startTime) {base_url = base_url + `&startTime=${inputs.cluster_startTime}` }
            if (inputs.cluster_endTime) { base_url = base_url + `&endTime=${inputs.cluster_endTime}` }
            if (inputs.cluster_counterparty) { base_url = base_url + `&counterparty=${inputs.cluster_counterparty}` }

            let transaction_url = `${base_url}`
            if (inputs.page) {
                transaction_url = transaction_url + `&page=${inputs.page}`;
            }
            let pagesFetched = 0;
            const pageLimit = inputs.page_limit ? (inputs.page_limit === 0 ? Number.MAX_SAFE_INTEGER : inputs.page_limit) : Number.MAX_SAFE_INTEGER;

            const transaction_config: AxiosRequestConfig = {
                method: 'get',
                url: transaction_url,
                headers: {
                    'Accept': 'application/json',
                    'token': this.config.token
                }
            };
            const transaction_response: AxiosResponse = await axios(transaction_config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new WebServiceError(err.response.data) : err));

            if (transaction_response.data.nextPage != null) {
                let page = transaction_response.data.nextPage;
                let lastResult = { nextPage: '' };
                do {
                    let sub_url = `${base_url}` + `&page=${page}`;
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
                    transaction_response.data.items.push.apply(transaction_response.data.items, sub_response.data.items);
                    page = lastResult.nextPage;
                    pagesFetched += 1;
                } while (lastResult.nextPage !== null && pagesFetched < pageLimit);
                if (lastResult.nextPage !== null) {
                    overallTruncated = true;
                    overallNextPage = lastResult.nextPage;
                }
            }
            
            for (let y = 0; y < transaction_response.data.items.length; y++) {
                let hash_url = `https://iapi.chainalysis.com/transactions/${transaction_response.data.items[y].transactionHash}/${asset}/details`;
                const hash_config: AxiosRequestConfig = {
                    method: 'get',
                    url: hash_url,
                    headers: {
                        'Accept': 'application/json',
                        'token': this.config.token
                    }
                };
                const hash_response: AxiosResponse = await axios(hash_config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new WebServiceError(err.response.data) : err));
                Object.assign(transaction_response.data.items[y], {
                    details: hash_response.data,
                    direction: inputs.direction,
                    id: asset + ':' + transaction_response.data.items[y].transactionHash,
                    sirenDenormInputAddress: [],
                    sirenDenormOutputAddress: []
                });

                try {
                    for (let a = 0; a < hash_response.data.traces.length; a++) {
                        for (let b = 0; b < hash_response.data.traces[a].inputs.length; b++) {
                            transaction_response.data.items[y].sirenDenormInputAddress.push(asset + ':' + hash_response.data.traces[a].inputs[b].address);
                        }
                        for (let c = 0; c < hash_response.data.traces[a].outputs.length; c++) {
                            transaction_response.data.items[y].sirenDenormOutputAddress.push(asset + ':' + hash_response.data.traces[a].outputs[c].address);
                        }
                    }
                } catch (error) { /* error handling can be done here if required */ }
            }
            overallResults.push.apply(overallResults, transaction_response.data.items);
        }

        return {
            transaction: overallResults,
            pagination: [{
                totalresults: overallResults.length,
                nextPage: overallNextPage
            }]
        };
    }
}
