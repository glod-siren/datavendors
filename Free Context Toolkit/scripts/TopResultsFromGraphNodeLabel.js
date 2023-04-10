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
    titleText: "Search DuckDuck Go Top 10 Search Results",
    destination: "DuckDuckGo",
    uri_1: [ // add the indices you want to allow to use this script
   ],
    WSName: 'context-toolkit',
    WSType: 'duckduckgo-scraper',
    WSStoreData: true,
    WSReturnData: true,
    bannerUrl: 'https://duckduckgo.com/_next/static/media/logo-horizontal-dark.53712807.svg',
}
var mydata = []
var ids = []
function ModalContentElement() {
    const [showLoading, setLoading] = React.useState(true);
    const [showLoaded, setLoaded] = React.useState(false);
    const [invocated, setInvocated] = React.useState(false);
    const [resultCount, setResultCount] = React.useState(0);
    const [selectedCount, setSelectedCount] = React.useState(0);
    const [selectedNodes, setSelectedNodes] = React.useState([]);
    const [foundNodes, setFoundNodes] = React.useState(false);
    const [showBad, setShowBad] = React.useState(false);
    const [searchedCount, setSearchedCount] = React.useState(0);
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
                //let queryString = node.id.split("/")[2];
                let matched = false
                if (typeof config.uri_1[0] == 'undefined') {
                    matched = true
                }
                else {
                    config.uri_1.map(uri => {
                        if (uri == node.id.split("/")[0]) {
                            matched = true
                        }
                    })
                }

                if (matched == false) {
                    setLoaded(false)
                    setLoading(false)
                    setShowBad(true)
                    throw new Error('Must Select The Right Nodes');
                }
                //let splitQuery = queryString.split('%3A');
                let invocation = await sirenapi.invokeWebService(
                    config.WSName,
                    config.WSType,
                    {
                        query: node.label,
                        numPages: 1,
                        cropNumber: 10,
                        exact_search: true
                    },
                    { storeData: config.WSStoreData, returnData: config.WSReturnData }
                )
                setSearchedCount(searchedCount + 1)
                console.log(node.id + ' ' + invocation.statusText)
                if (invocation.statusText == 'OK') {
                    //mydata.push(invocation.data.structured_content)
                    setResultCount(resultCount + invocation.data.structured_content.length)
                }
            })).then(function () {
                console.log('Done with Web Services')
                //console.log(mydata)
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
                    <EuiText>Loading {resultCount} {config.destination}, Searched {searchedCount}/{selectedCount} Selected Nodes</EuiText>
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
