let cluster_search = "chainalysis1:search:ce989dd0-adce-11ed-bcbb-6bce064db907"
let query = {};
let eids = [];
let entities = [];
query = { "query": { "bool": { "must": [] } } };
async function invokedItems(graphSelection) {
    const items = graphSelection
    for (let i = 0; i < items.length; i++) {
        queryString = items[i].split("/")[2];
        splitQuery = queryString.split('%3A');
        payload = {
            "asset": splitQuery[0].replace(/\W|"/, ''),
            "address": splitQuery[1].replace(/\W|"/, '')
        };
        let Http = new XMLHttpRequest();
        let url = '../../api/web_services/chainalysis-iapi/cluster_combined_info/_invokeAndReturn?returnData=true';
        Http.open("POST", url);
        Http.setRequestHeader("Content-Type", "application/json");
        Http.setRequestHeader("kbn-xsrf", "kibana");
        Http.send(JSON.stringify(payload))
        await Promise.resolve(Http.responseText)
        eids.push('"' + payload.asset + ':' + payload.address + '"');
        console.log(Http)
    }
    let queryClause = { simple_query_string: { query: eids.join('|'), fields: ['sirenDenormAddress'] } };
    query.query.bool.must.push(queryClause)
}
async function beforeAll(graphId, graphModel, graphSelection) {
    console.log(graphSelection);
    return await Promise.resolve(invokedItems(graphSelection))
        .then(async function () {
            console.log("Finished ChainAlysis Invoke")
            let searchResults = await f.executeEsSearch("web-service-chainalysis-iapi-cluster_combined_info-results-cluster", "", query, 500)
            await Promise.resolve(searchResults)
                .then(async function (searchResults) {
                    console.log(searchResults.hits.hits)
                    await Promise.resolve(f.graphCounts.executeCounts(graphId))
                    searchResults.hits.hits.map(hit => {
                        entities.push(`web-service-chainalysis-iapi-cluster_combined_info-results-cluster/_doc/${hit._id}`)
                    })
                    console.log(entities)
                    await Promise.resolve(f._fetchVerticesAdd(graphId, entities, cluster_search))
                        .then(async results => {
                            console.log(results)
                            await Promise.resolve(f.addResultsToGraph(graphId, graphSelection, results))
                        })
                })
        })
}