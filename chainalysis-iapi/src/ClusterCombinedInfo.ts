import { DataIndexResults, InputSchema, OutputConfiguration, ServiceDefinition, WebServiceError } from '@sirensolutions/web-service-interface';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
export default class ClusterCombinedInfo extends ServiceDefinition {
    readonly name = 'cluster_combined_info';
    readonly inputSchema: InputSchema = {
        address: { type: 'text', required: true },
        asset: { type: 'text', required: true },
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
            },
            'exposure': {
                'percentage': 'long',
                'value': 'long'
            }
        },
        pagination: {
            'nextPage': 'keyword'
        }
    };
    async invoke(inputs: {
        address: string,
        asset: string,
        outputAsset: string,
        page: string
    }): Promise<DataIndexResults> {
        if (!inputs.outputAsset) { inputs.outputAsset = 'NATIVE' }
        let name_url = `https://iapi.chainalysis.com/clusters/${inputs.address}?filterAsset=${inputs.asset}`
        const name_config: AxiosRequestConfig = {
            method: 'get',
            url: name_url,
            headers: {
                'Accept': 'application/json',
                'token': this.config.token
            }
        };
        const name_response: AxiosResponse = await axios(name_config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new WebServiceError(err.response.data) : err));
        let address_url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/addresses?size=100`
        if (inputs.page) {
            address_url + address_url + `&page=${inputs.page}`
        }
        if (!inputs.page) { inputs.outputAsset = 'NATIVE' }
        const address_config: AxiosRequestConfig = {
            method: 'get',
            url: address_url,
            headers: {
                'Accept': 'application/json',
                'token': this.config.token
            }
        };
        const address_response: AxiosResponse = await axios(address_config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new WebServiceError(err.response.data) : err));
        let nextPage = '';
        if (address_response.data.nextPage != null) {
            let page = address_response.data.nextPage
            let lastResult = { nextPage: '' };
            do {
                try {
                    let sub_url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/addresses?size=100` + `&page=${page}`
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
                    address_response.data.items.push.apply(address_response.data.items, sub_response.data.items)
                } catch { new WebServiceError('pagination error') }
            } while (lastResult.nextPage !== null && address_response.data.items.length < 1000)
            if (lastResult.nextPage !== null || lastResult.nextPage !== '') {
                nextPage = lastResult.nextPage
            }
        }
        const denormAddress: string[] = [];
        for (let y = 0; y < address_response.data.items.length; y++) {
            denormAddress.push(`${address_response.data.asset}:${address_response.data.items[y].address}`)
        }
        let balance_url = `https://iapi.chainalysis.com/clusters/${inputs.address}/${inputs.asset}/summary?outputAsset=${inputs.outputAsset}`
        const balance_config: AxiosRequestConfig = {
            method: 'get',
            url: balance_url,
            headers: {
                'Accept': 'application/json',
                'token': this.config.token
            }
        };
        const balance_response: AxiosResponse = await axios(balance_config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new WebServiceError(err.response.data) : err));
        let items_truncated = false
        if (address_response.data.items.length < balance_response.data.addressCount) {
            items_truncated = true
        }
        const exposure_paths = ['SENDING', 'RECEIVING', 'SENDING/services', 'RECEIVING/services']
        let exposure: object[] = [];
        let denormAddressExposure: string[] = [];
        for (let z = 0; z < exposure_paths.length; z++) {
            let exposure_url = `https://iapi.chainalysis.com/exposures/clusters/${inputs.address}/${inputs.asset}/directions/${exposure_paths[z]}?outputAsset=${inputs.outputAsset}`
            let exposure_config: AxiosRequestConfig = {
                method: 'get',
                url: exposure_url,
                headers: {
                    'Accept': 'application/json',
                    'token': this.config.token
                }
            };
            let exposure_response: AxiosResponse = await axios(exposure_config).catch(err => Promise.reject(err.response && err.response.status < 500 ? new WebServiceError(err.response.data) : err));
            try {
                for (let b = 0; exposure_response.data.indirectExposure.services.length; b++) {
                    Object.assign(exposure_response.data.indirectExposure.services[b], {
                        type: 'indirect service',
                        direction: exposure_paths[z],
                    })
                    exposure.push(exposure_response.data.indirectExposure.services[b])
                    if (exposure_response.data.indirectExposure.services[b].rootAddress) { denormAddressExposure.push(address_response.data.asset + ':' + exposure_response.data.indirectExposure.services[b].rootAddress) }
                }
            } catch { }
            try {
                for (let b = 0; exposure_response.data.directExposure.services.length; b++) {
                    Object.assign(exposure_response.data.directExposure.services[b], {
                        type: 'direct service',
                        direction: exposure_paths[z],
                    })
                    exposure.push(exposure_response.data.directExposure.services[b])
                    if (exposure_response.data.directExposure.services[b].rootAddress) { denormAddressExposure.push(address_response.data.asset + ':' + exposure_response.data.directExposure.services[b].rootAddress) }
                }
            } catch { }
            try {
                for (let b = 0; exposure_response.data.indirectExposure.categories.length; b++) {
                    Object.assign(exposure_response.data.indirectExposure.categories[b], {
                        type: 'indirect category',
                        direction: exposure_paths[z],
                    })
                    exposure.push(exposure_response.data.indirectExposure.categories[b])
                }
            } catch { }
            try {
                for (let b = 0; exposure_response.data.directExposure.categories.length; b++) {
                    Object.assign(exposure_response.data.directExposure.categories[b], {
                        type: 'direct category',
                        direction: exposure_paths[z],
                    })
                    exposure.push(exposure_response.data.directExposure.categories[b])
                }
            } catch { }
        }
        return {
            cluster: [{
                id: address_response.data.asset + ':' + address_response.data.rootAddress,
                name: name_response.data.items[0].name,
                category: name_response.data.items[0].category,
                rootAddress: address_response.data.rootAddress,
                asset: address_response.data.asset,
                cluster_balance: balance_response.data,
                exposure: exposure,
                sirenDenormAddress: denormAddress,
                sirenDenormAddressExposure: ([... new Set(denormAddressExposure)]),
                items_truncated: items_truncated,
                raw_items: address_response.data.items,
            }],
            pagination: [{
                nextPage: nextPage
            }]
        }
    }
}
