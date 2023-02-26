const version = 1;
const type = "custom";
console.log('Hi')
const config = {
    expandRelations: [
        'chainalysis1:relation:e56c29e0-adcf-11ed-94d6-0382844a832c',
        'chainalysis1:relation:f5422e40-b389-11ed-a146-318f6c329604',
        'chainalysis1:relation:e56d1440-adcf-11ed-bcbb-6bce064db907',
        'chainalysis1:relation:f542a370-b389-11ed-8bec-4d4ea0e3c446'
    ],
    WSName: 'chainalysis-iapi',
    WSType: 'cluster_counterparties',
    WSStoreData: true,
    WSReturnData: true,
}
async function graphDo() {
    let selected = await currentVisualization.selection();
    let ids = []
    await Promise.all(selected.map(async node => {
        ids.push(node.id)
        let splitQuery = node.label.split(':');
        let response = await sirenapi.invokeWebService(
            config.WSName,
            config.WSType,
            {
                asset: splitQuery[0],
                address: splitQuery[1]
            },
            { storeData: config.WSStoreData, returnData: config.WSReturnData }
        )
        console.log(node.label + ' ' + JSON.stringify(response.statusText + ' next: ' + response.data.pagination.nextPage))
        if (typeof response.data.pagination.nextPage !== 'undefined') {
            let current_page = response.data.pagination.nextPage
            do {
                let sub_response  = await sirenapi.invokeWebService(
                config.WSName,
                config.WSType,
                {
                    asset: splitQuery[0],
                    address: splitQuery[1],
                    page: current_page
                },
                { storeData: config.WSStoreData, returnData: config.WSReturnData }
            )
            current_page = sub_response.data.pagination.nextPage
            console.log('paginated ' + node.label + ' ' + sub_response.statusText + ' next: ' + sub_response.data.pagination.nextPage)
            } while (typeof current_page !=='undefined')
        }
    })).then(async function () {
        await Promise.resolve(currentVisualization.expandByRelation({
            nodeIds: ids,
            relationIds: config.expandRelations
        }))
    })
}
graphDo()
