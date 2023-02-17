import { DataIndexResults, InputSchema, OutputConfiguration, ServiceDefinition, WebServiceError } from '@sirensolutions/web-service-interface';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
export default class ClusterTransactions extends ServiceDefinition {
    readonly name = 'cluster_transactions';
    readonly inputSchema: InputSchema = {
        address: { type: 'text', required: true },
        asset: { type: 'text', required: true },
        counterparty: { type: 'text', required: false },
        startTime: { type: 'date', required: false },
        endTime: { type: 'date', required: false },
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
        }
    };
    async invoke(inputs: {
        address: string,
        asset: string,
        counterparty: string,
        startTime: string,
        endTime: string,
    }): Promise<DataIndexResults> {
        let transaction_url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/transactions?size=200`
        if (inputs.startTime) {transaction_url = transaction_url + `&startTime=${inputs.startTime}`}
        if (inputs.endTime) {transaction_url = transaction_url + `&endTime=${inputs.endTime}`}
        if (inputs.counterparty) {transaction_url = transaction_url + `&counterparty=${inputs.counterparty}`}
        const transaction_config: AxiosRequestConfig = {
            method: 'get',
            url: transaction_url,
            headers: {
                'Accept': 'application/json',
                'token': this.config.token
            }
        };
        const transaction_response: AxiosResponse = await axios(transaction_config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new WebServiceError(err.response.data) : err));
        let truncated = false
        if (transaction_response.data.nextPage != null) {
            let page = transaction_response.data.nextPage
            let lastResult = { nextPage: '' };
            do {
                try {
                    let sub_url = transaction_url + `&page=${page}`
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
                    transaction_response.data.items.push.apply(transaction_response.data.items, sub_response.data.items)
                } catch { new WebServiceError('pagination error') }
            } while (lastResult.nextPage !== null && transaction_response.data.items < 5000)
            if (lastResult.nextPage !== null || lastResult.nextPage !== '') {
                truncated = true
            }
        }
        for (let y = 0; y < transaction_response.data.items.length; y++) {
            let hash_url = `https://iapi.chainalysis.com/transactions/${transaction_response.data.items[y].transactionHash}/${inputs.asset}/details`
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
                id: inputs.asset + ':' + transaction_response.data.items[y].transactionHash,
                sirenDenormInputAddress: [],
                sirenDenormOutputAddress: [],
                truncated: truncated
            })
            try {
                for (let a = 0; a < hash_response.data.traces.length; a++) {
                    for (let b = 0; b < hash_response.data.traces[a].inputs.length; b++) {
                        transaction_response.data.items[y].sirenDenormInputAddress.push(inputs.asset + ':' + hash_response.data.traces[a].inputs[b].rootAddress)
                    }
                    for (let c = 0; c < hash_response.data.traces[a].outputs.length; c++) {
                        transaction_response.data.items[y].sirenDenormOutputAddress.push(inputs.asset + ':' + hash_response.data.traces[a].outputs[c].rootAddress)
                    }
                }
            } catch { }
        }
        return {
            transaction: transaction_response.data.items
        }
    }
}
