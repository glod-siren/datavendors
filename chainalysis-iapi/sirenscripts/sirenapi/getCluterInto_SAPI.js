const version = 1;
const type = "custom";
console.log('Hi')
const config = {
    expandRelations: [
        'chainalysis1:relation:4d4f94d0-adcf-11ed-bcbb-6bce064db907'
    ],
    WSName: 'chainalysis-iapi',
    WSType: 'cluster_combined_info',
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
        console.log(node.label + ' ' + JSON.stringify(response.statusText))
    })).then(async function () {
        await Promise.resolve(currentVisualization.expandByRelation({
            nodeIds: ids,
            relationIds: config.expandRelations
        }))
    })
}
graphDo()
