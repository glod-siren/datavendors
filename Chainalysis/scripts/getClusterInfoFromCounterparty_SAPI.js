const version = 1;
const type = "custom";
const {
    EuiLoadingSpinner,
    EuiTextAlign,
    EuiText,
    EuiImage
} = Eui;
const config = {
    expandRelations: [
    ], // give relationids if you dont want to show modal, otherwise leave blank
    titleText: "Chainalysis IAPI - Cluster",
    destination: "Chainalysis Clusters",
    uri_1: [
        "web-service-chainalysis-iapi-cluster_counterparties-results-counterparties",
   ],
    WSName: 'chainalysis-iapi',
    WSType: 'cluster_combined_info',
    WSStoreData: true,
    WSReturnData: true,
    bannerUrl: 'https://www.chainalysis.com/wp-content/uploads/2022/05/solution-header-investigations.svg'
}
var mydata = []
var ids = []
function ModalContentElement() {
    const [showLoading, setLoading] = React.useState(true);
    const [showLoaded, setLoaded] = React.useState(false);
    const [invocated, setInvocated] = React.useState(false);
    const [resultCount, setResultCount] = React.useState(0);
    const [searchedCount, setSearchedCount] = React.useState(0);
    const [selectedCount, setSelectedCount] = React.useState(0);
    const [selectedNodes, setSelectedNodes] = React.useState([]);
    const [foundNodes, setFoundNodes] = React.useState(false);
    const [showBad, setShowBad] = React.useState(false);
    const [addressCount, setAddressCount] = React.useState(0);
    const getSelectedNodes = async () => {
        let temp = await currentVisualization.selection();
        if (temp.length == 0) {
            setLoaded(false)
            setLoading(false)
            setShowBad(true)
            throw new Error('Must Select a Node');
        }
        setSelectedNodes(temp);
    };
    if (!foundNodes) {
        getSelectedNodes();
        setFoundNodes(true);
    }
    async function graphDo() {
        if (invocated == false) {
            console.log(selectedNodes)
            setSelectedCount(selectedNodes.length)
            console.log('Running Web Services')
            await Promise.all(selectedNodes.map(async node => {
                setInvocated(true)
                ids.push(node.id)
                let queryString = node.id.split("/")[2];
                let splitQuery = queryString.split('%3A');
                let matched = false
                config.uri_1.map(uri => {
                    if (uri == node.id.split("/")[0]) {
                        matched = true
                    }
                })
                if (matched == false) {
                    setLoaded(false)
                    setLoading(false)
                    setShowBad(true)
                    throw new Error('Must Select The Right Nodes');
                }
                const invocation = await sirenapi.invokeWebService(
                    config.WSName,
                    config.WSType,
                    {
                        asset: splitQuery[0].replace(/\W|"/, ''),
                        address: splitQuery[2].replace(/\W|"/, '')
                    },
                    { storeData: config.WSStoreData, returnData: config.WSReturnData }
                )
                
                console.log(splitQuery[2].replace(/\W|"/, '') + ' ' + invocation.statusText + ' next: ' + invocation.data.pagination.nextPage)
                if (invocation.statusText == 'OK') {
                    mydata.push(invocation.data.cluster)
                    setResultCount(resultCount + mydata.length)
                }
                if (invocation.data.pagination[0].nextPage) {
                    let current_page = invocation.data.pagination[0].nextPage
                    let lastResult = { nextPage: '' };
                    setAddressCount(addressCount + invocation.data.addresses.length)
                    if (invocation.data.cluster[0].cluster_balance.addressCount > 100000) {
                        setCountMessage(`WARNING: Address Count is greator than 100,000 (${invocation.data.cluster[0].cluster_balance.addressCount}),\nThis Could Take Several Mintues To Resolve Cluster`)
                    }
                    do {
                        const more_invocation = await sirenapi.invokeWebService(
                            config.WSName,
                            'cluster_address',
                            {
                                asset: splitQuery[0].replace(/\W|"/, ''),
                                address: splitQuery[1].replace(/\W|"/, ''),
                                page: current_page
                            },
                            { 
                                storeData: true, 
                                returnData: true 
                            }
                        )
                        setAddressCount(addressCount + more_invocation.data.addresses.length)
                        lastResult = more_invocation.data.pagination[0]
                        console.log(splitQuery[2].replace(/\W|"/, '') + ' pagination ' + more_invocation.statusText + ' next: ' + more_invocation.data.pagination[0].nextPage)
                        current_page =  more_invocation.data.pagination[0].nextPage
                    }
                    while (lastResult.nextPage)
                }
                setSearchedCount(searchedCount + 1)
            })).then(function () {
                    console.log('Done with Web Services')
                    console.log(mydata)
                    setLoaded(true)
                    setLoading(false)
                })
        }
    }
    if (selectedNodes.length >= 1 && !invocated) {
        graphDo()
    }
    const renderLoading = () => {
        return (
            <div>
                <EuiTextAlign textAlign="center">
                    <EuiLoadingSpinner size="xl" />
                </EuiTextAlign>
                <EuiTextAlign textAlign="center">
                    <EuiText>Loading {selectedCount} Selected Nodes</EuiText>
                </EuiTextAlign>
                <EuiTextAlign textAlign="center">
                    <EuiText>{showCountMessage}</EuiText>
                </EuiTextAlign>
                <EuiTextAlign textAlign="center">
                    <EuiText>Press OK to Expand or Cancel to close</EuiText>
                </EuiTextAlign>
            </div>
        )
    }
    const renderLoaded = () => {
        return (
            <div>
                <EuiTextAlign textAlign="center">
                    <EuiImage
                        allowFullScreen
                        url={config.bannerUrl}
                        size="l"
                        width={150}
                    />
                </EuiTextAlign>
                <EuiTextAlign textAlign="center">
                    <EuiText>Loaded {resultCount} {config.destination} for {selectedCount} Selected</EuiText>
                </EuiTextAlign>
                <EuiTextAlign textAlign="center">
                    <EuiText> Loaded: {addressCount} Cluster Addresses Into Storage</EuiText>
                </EuiTextAlign>
                <EuiTextAlign textAlign="center">
                    <EuiText>Press OK to Expand or Cancel to close</EuiText>
                </EuiTextAlign>
            </div>
        )
    }
    const renderBad = () => {
        return (
            <div>
                <EuiTextAlign textAlign="center">
                    <EuiText>Wrong Nodes or No Nodes Selected, Press Cancel to close</EuiText>
                </EuiTextAlign>
            </div>
        )
    }
    return (
        <div>
            {showLoading ? renderLoading() : null}
            {showLoaded ? renderLoaded() : null}
            {showBad ? renderBad() : null}
        </div>
    )
}
currentDashboard.openModal({
    Element: <ModalContentElement />,
    titleText: config.titleText,
    primaryText: "Expand Node",
    onPrimaryClick: () => {
        currentVisualization.expandByRelation({
            nodeIds: [],
            relationIds: config.expandRelations
        })
    },
    cancelText: "Close Panel",
    onCancel: () => {
    },
});
