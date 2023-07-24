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
    ], 
    titleText: "Chainalysis IAPI - Cluster",
    destination: "Chainalysis Clusters",
    secondsearch: "web-service-chainalysis-iapi-cluster_counterparties-results-counterparties",
    WSName: 'chainalysis-iapi',
    WSType: 'cluster_combined_info',
    WSStoreData: true,
    WSReturnData: true,
    bannerUrl: 'https://www.chainalysis.com/wp-content/uploads/2022/05/solution-header-investigations.svg'
}
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
    const [errorMessage, setErrorMessage] = React.useState('');  // Added for better error handling

    const getSelectedNodes = async () => {
        let temp = await currentVisualization.selection();
        setSelectedNodes(temp);
        if (temp.length === 0) {
            setErrorMessage('Must Select a Node');
            setLoaded(true);
            setLoading(false);
        }
    };
    if (!foundNodes) {
        getSelectedNodes();
        setFoundNodes(true);
    }
    async function graphDo() {
        if (selectedNodes.length < 1) {
            setErrorMessage('Must Select a Node');
            setLoaded(false);
            setLoading(false);
            return;
        }
        if (invocated) {
            return;
        }
        try {
            console.log(selectedNodes)
            setSelectedCount(selectedNodes.length)
            console.log('Running Web Services')
            await Promise.all(selectedNodes.map(async node => {
                setInvocated(true)
                ids.push(node.id)
                const invocation = await sirenapi.invokeWebService(
                    config.WSName,
                    config.WSType,
                    {
                        address: node.label
                    },
                    { storeData: config.WSStoreData, returnData: config.WSReturnData }
                )
                console.log(node.label + ' ' + invocation.statusText)
                console.log(invocation.data.cluster)
                console.log(invocation.data.addresses)
                console
                if (invocation.statusText == 'OK') {
                    setResultCount(resultCount + invocation.data.cluster.length)
                    setSearchedCount(searchedCount + 1)
                } else {
                }
            })).then(function () {
                console.log('Done with Web Services')
                setLoaded(true)
                setLoading(false)
            })
        } catch (error) {
            console.error(`Error during operation: ${error}`);
            setErrorMessage('An error occurred during the operation. Please check the console for details.');
            setLoaded(true);
            setLoading(false);
        }
    }
    if (!invocated && selectedNodes.length >= 1) {
        graphDo();
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
                    <EuiText>{errorMessage}</EuiText>
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
                    <EuiText>{errorMessage}</EuiText>
                </EuiTextAlign>
                <EuiTextAlign textAlign="center">
                    <EuiText>Press OK to Expand or Cancel to close</EuiText>
                </EuiTextAlign>
            </div>
        )
    }
    return (
        <div>
            {showLoading ? renderLoading() : null}
            {showLoaded ? renderLoaded() : null}
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
