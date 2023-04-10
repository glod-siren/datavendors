import { DataIndexResults, InputSchema, OutputConfiguration, ServiceDefinition, WebServiceError } from '@sirensolutions/web-service-interface';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
export default class ClusterExposure extends ServiceDefinition {
    readonly name = 'cluster_exposure';
    readonly inputSchema: InputSchema = {
        address: { type: 'text', required: true },
        asset: { type: 'text', required: true },
        outputAsset: { type: 'text', required: false },
    };
    readonly outputConfiguration: OutputConfiguration = {
        exposure: {
            'percentage': 'long',
            'value': 'long'
        }
    }
    async invoke(inputs: {
        address: string,
        asset: string,
        outputAsset: string,
    }): Promise<DataIndexResults> {
        if (!inputs.outputAsset) { inputs.outputAsset = 'NATIVE' }
        const exposure_paths = ['SENDING', 'RECEIVING', 'SENDING/services', 'RECEIVING/services']
        let exposure: object[] = [];
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
                        type: 'Service',
                        exposure: 'indirectExposure',
                        direction: exposure_paths[z],
                        outputAsset: exposure_response.data.outputAsset,
                        asset: exposure_response.data.asset,
                        inputAddress: exposure_response.data.rootAddress,
                        id: exposure_response.data.asset + ':' + exposure_response.data.rootAddress + ':indirectExposure:' + exposure_paths[z] + ':' + exposure_response.data.indirectExposure.services[b].rootAddress,
                        sirenDenormRootAddress: exposure_response.data.asset + ':' + exposure_response.data.rootAddress,
                        sirenDenormExposureAddress: exposure_response.data.asset + ':' + exposure_response.data.indirectExposure.services[b].rootAddress,
                    })
                    exposure.push(exposure_response.data.indirectExposure.services[b])
                }
            } catch { }
            try {
                for (let b = 0; exposure_response.data.directExposure.services.length; b++) {
                    Object.assign(exposure_response.data.directExposure.services[b], {
                        type: 'Service',
                        exposure: 'directExposure',
                        direction: exposure_paths[z],
                        outputAsset: exposure_response.data.outputAsset,
                        asset: exposure_response.data.asset,
                        inputAddress: exposure_response.data.rootAddress,
                        id: exposure_response.data.asset + ':' + exposure_response.data.rootAddress + ':directExposure:' + exposure_paths[z] + ':' + exposure_response.data.directExposure.services[b].rootAddress,
                        sirenDenormRootAddress: exposure_response.data.asset + ':' + exposure_response.data.rootAddress,
                        sirenDenormExposureAddress: exposure_response.data.asset + ':' + exposure_response.data.directExposure.services[b].rootAddress,
                    })
                    exposure.push(exposure_response.data.directExposure.services[b])
                }
            } catch { }
            try {
                for (let b = 0; exposure_response.data.indirectExposure.categories.length; b++) {
                    Object.assign(exposure_response.data.indirectExposure.categories[b], {
                        type: 'Category',
                        exposure: 'indirectExposure',
                        direction: exposure_paths[z],
                        outputAsset: exposure_response.data.outputAsset,
                        asset: exposure_response.data.asset,
                        inputAddress: exposure_response.data.rootAddress,
                        id: exposure_response.data.asset + ':' + exposure_response.data.rootAddress + ':indirectExposure:' + exposure_paths[z] + ':' + exposure_response.data.indirectExposure.categories[b].category,
                        sirenDenormRootAddress: exposure_response.data.asset + ':' + exposure_response.data.rootAddress
                    })
                    exposure.push(exposure_response.data.indirectExposure.categories[b])
                }
            } catch { }
            try {
                for (let b = 0; exposure_response.data.directExposure.categories.length; b++) {
                    Object.assign(exposure_response.data.directExposure.categories[b], {
                        type: 'Category',
                        exposure: 'directExposure',
                        direction: exposure_paths[z],
                        outputAsset: exposure_response.data.outputAsset,
                        asset: exposure_response.data.asset,
                        inputAddress: exposure_response.data.rootAddress,
                        id: exposure_response.data.asset + ':' + exposure_response.data.rootAddress + ':directExposure:' + exposure_paths[z] + ':' + exposure_response.data.directExposure.categories[b].category,
                        sirenDenormRootAddress: exposure_response.data.asset + ':' + exposure_response.data.rootAddress,
                    })
                    exposure.push(exposure_response.data.directExposure.categories[b])
                }
            } catch { }
        }
        return {
            exposure: exposure
        }
    }
}
