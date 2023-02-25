import { DataIndexResults, InputSchema, OutputConfiguration, ServiceDefinition, WebServiceError } from '@sirensolutions/web-service-interface';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
export default class IpObservations extends ServiceDefinition {
    readonly name = 'ip_observations';
    readonly inputSchema: InputSchema = {
        ip: { type: 'text', required: true },
        startTime: { type: 'date', required: false },
        endTime: { type: 'date', required: false },
        page: { type: 'date', required: false },
    };
    readonly outputConfiguration: OutputConfiguration = {
        observation: {
            'lat' : 'long',
            'long': 'long',
            'timestamp': 'date',
            'geo_location': 'geo_point',
            'ipAddress': 'keyword',
            'port': 'keyword'
        },
        pagination: {
            'nextPage': 'keyword'
        }
    };
    async invoke(inputs: {
        ip: string,
        startTime: string,
        endTime: string,
        page: string,
    }): Promise<DataIndexResults> {
        let obs_url = `https://iapi.chainalysis.com/observations/ips/${inputs.ip}?size=100`
        if (inputs.page) {
            obs_url + obs_url + `&page=${inputs.page}`
          }
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
        let truncated = false
        let nextPage = '';
        if (obs_response.data.nextPage != null) {
            let page = obs_response.data.nextPage
            let lastResult = { nextPage: '' };
            do {
                try {
                    let sub_url = `https://iapi.chainalysis.com/observations/ips/${inputs.ip}?size=100` + `&page=${page}`
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
                    obs_response.data.items.push.apply(obs_response.data.items, sub_response.data.items)
                } catch { new WebServiceError('pagination error') }
            } while (lastResult.nextPage !== null && obs_response.data.items < 5000)
            if (lastResult.nextPage !== null || lastResult.nextPage !== '') {
                truncated = true;
                nextPage = lastResult.nextPage;
            }
        }
        for (let y = 0; y < obs_response.data.items.length; y++) {
            let plain_asset = obs_response.data.items[y].software.match(/bitcoin|ethereum/)
            let asset: String = ''
            if (plain_asset == 'bitcoin') {
                asset = 'BTC'
            }
            if (plain_asset == 'ethereum') {
                asset = 'ETH'
            }
            let denormAddress: string[] = [];
            denormAddress.push(`${asset}:${obs_response.data.items[y].walletRootAddress}`)
            denormAddress.push(`${asset}:${obs_response.data.items[y].rootAddress}`)
            Object.assign(obs_response.data.items[y], {
                sirenDenormAddress: ([... new Set(denormAddress)]),
                id: obs_response.data.items[y].ipAddress + ':' + obs_response.data.items[y].timestamp,
                address: obs_response.data.items[y].walletRootAddress,
                rootAddress: obs_response.data.rootAddress,
                geo_location: obs_response.data.items[y].lat + ',' + obs_response.data.items[y].long
            })
        }
        return {
            observation: obs_response.data.items,
            pagination: [{
                nextPage: nextPage
            }]
        }
    }
}
