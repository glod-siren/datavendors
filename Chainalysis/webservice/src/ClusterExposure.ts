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

export default class ClusterExposure extends ServiceDefinition {
    readonly name = 'cluster_exposure';
    readonly inputSchema: InputSchema = {
        address: { type: 'text', required: true },
        asset: { type: 'text', required: false },
        outputAsset: { type: 'text', required: false },
    };
    readonly outputConfiguration: OutputConfiguration = {
        exposure: {
            'percentage': 'long',
            'value': 'long'
        }
    }

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
        let overallExposure: any[] = [];
        for (const asset of matchedAssets) {
            const exposure_paths = ['SENDING', 'RECEIVING', 'SENDING/services', 'RECEIVING/services']
            let exposure: object[] = [];
            for (let z = 0; z < exposure_paths.length; z++) {
                let exposure_url = `https://iapi.chainalysis.com/exposures/clusters/${inputs.address}/${asset}/directions/${exposure_paths[z]}?outputAsset=${inputs.outputAsset}`
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
                    for (let b = 0; exposure_response.data.indirectExposure.services && b < exposure_response.data.indirectExposure.services.length; b++) {
                        Object.assign(exposure_response.data.indirectExposure.services[b], {
                            type: 'Service',
                            exposure: 'indirectExposure',
                            direction: exposure_paths[z],
                            outputAsset: exposure_response.data.outputAsset,
                            asset: exposure_response.data.asset,
                            inputAddress: exposure_response.data.rootAddress,
                            id: `${exposure_response.data.asset}:${exposure_response.data.rootAddress}:indirectExposure:${exposure_paths[z]}:${exposure_response.data.indirectExposure.services[b].rootAddress}`,
                            sirenDenormRootAddress: `${exposure_response.data.asset}:${exposure_response.data.rootAddress}`,
                            sirenDenormExposureAddress: `${exposure_response.data.asset}:${exposure_response.data.indirectExposure.services[b].rootAddress}`,
                        })
                        exposure.push(exposure_response.data.indirectExposure.services[b])
                    }
                } catch { }
                try {
                    for (let b = 0; exposure_response.data.directExposure.services && b < exposure_response.data.directExposure.services.length; b++) {
                        Object.assign(exposure_response.data.directExposure.services[b], {
                            type: 'Service',
                            exposure: 'directExposure',
                            direction: exposure_paths[z],
                            outputAsset: exposure_response.data.outputAsset,
                            asset: exposure_response.data.asset,
                            inputAddress: exposure_response.data.rootAddress,
                            id: `${exposure_response.data.asset}:${exposure_response.data.rootAddress}:directExposure:${exposure_paths[z]}:${exposure_response.data.directExposure.services[b].rootAddress}`,
                            sirenDenormRootAddress: `${exposure_response.data.asset}:${exposure_response.data.rootAddress}`,
                            sirenDenormExposureAddress: `${exposure_response.data.asset}:${exposure_response.data.directExposure.services[b].rootAddress}`,
                        })
                        exposure.push(exposure_response.data.directExposure.services[b])
                    }
                } catch { }
                try {
                    for (let b = 0; exposure_response.data.indirectExposure.categories && b < exposure_response.data.indirectExposure.categories.length; b++) {
                        Object.assign(exposure_response.data.indirectExposure.categories[b], {
                            type: 'Category',
                            exposure: 'indirectExposure',
                            direction: exposure_paths[z],
                            outputAsset: exposure_response.data.outputAsset,
                            asset: exposure_response.data.asset,
                            inputAddress: exposure_response.data.rootAddress,
                            id: `${exposure_response.data.asset}:${exposure_response.data.rootAddress}:indirectExposure:${exposure_paths[z]}:${exposure_response.data.indirectExposure.categories[b].category}`,
                            sirenDenormRootAddress: `${exposure_response.data.asset}:${exposure_response.data.rootAddress}`
                        })
                        exposure.push(exposure_response.data.indirectExposure.categories[b])
                    }
                } catch { }
                try {
                    for (let b = 0; exposure_response.data.directExposure.categories && b < exposure_response.data.directExposure.categories.length; b++) {
                        Object.assign(exposure_response.data.directExposure.categories[b], {
                            type: 'Category',
                            exposure: 'directExposure',
                            direction: exposure_paths[z],
                            outputAsset: exposure_response.data.outputAsset,
                            asset: exposure_response.data.asset,
                            inputAddress: exposure_response.data.rootAddress,
                            id: `${exposure_response.data.asset}:${exposure_response.data.rootAddress}:directExposure:${exposure_paths[z]}:${exposure_response.data.directExposure.categories[b].category}`,
                            sirenDenormRootAddress: `${exposure_response.data.asset}:${exposure_response.data.rootAddress}`,
                        })
                        exposure.push(exposure_response.data.directExposure.categories[b])
                    }
                } catch { }
            }
            overallExposure.push(...exposure);
        }
        return {
            exposure: overallExposure
        }
    }
}
