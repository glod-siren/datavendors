import { DataIndexResults, InputSchema, OutputConfiguration, ServiceDefinition, WebServiceError } from '@sirensolutions/web-service-interface';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
export default class ClusterObservations extends ServiceDefinition {
    readonly name = 'cluster_observations';
    readonly inputSchema: InputSchema = {
        address: { type: 'text', required: true },
        asset: { type: 'text', required: true },
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
    async invoke(inputs: {
        address: string,
        asset: string,
        startTime: string,
        endTime: string
    }): Promise<DataIndexResults> {
        let obs_url = `https://iapi.chainalysis.com/observations/clusters/${inputs.address}/${inputs.asset}?`
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
            denormAddress.push(`${inputs.asset}:${obs_response.data.observations[y].walletRootAddress}`)
            denormAddress.push(`${inputs.asset}:${obs_response.data.address}`)
            denormAddress.push(`${inputs.asset}:${obs_response.data.rootAddress}`)
            Object.assign(obs_response.data.observations[y], {
                sirenDenormAdress: ([... new Set(denormAddress)]),
                id: obs_response.data.observations[y].walletRootAddress + ':' + obs_response.data.observations[y].timestamp,
                address: obs_response.data.observations[y].walletRootAddress,
                rootAddress: obs_response.data.rootAddress,
                geo_location: obs_response.data.observations[y].lat + ',' + obs_response.data.observations[y].long
            })
        }
        return {
            observation: obs_response.data.observations
        }
    }
}
