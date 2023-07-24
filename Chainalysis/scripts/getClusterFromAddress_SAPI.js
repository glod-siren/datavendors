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
const cryptoRegexPatterns = {
    'BTC': '(?<=^|\\s|\'|"|:)((bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39})(?=$|\\s|,|\'|"|:)', // Bitcoin (BTC) including bech32 addresses
    'ETH': '(?<=^|\\s|\'|"|:)((?:0x)?[a-fA-F0-9]{40,42})(?=$|\\s|,|\'|"|:)', // Ethereum
    'USDT': '(?<=^|\\s|\'|"|:)(1[1-9][a-zA-Z0-9]{24,33})(?=$|\\s|,|\'|"|:)', // Tether
    'XRP': '(?<=^|\\s|\'|"|:)(r[0-9a-zA-Z]{24,34})(?=$|\\s|,|\'|"|:)', // Ripple
    'BNB': '(?<=^|\\s|\'|"|:)(bnb[0-9a-zA-Z]{38})(?=$|\\s|,|\'|"|:)', // Binance Coin
    'ADA': '(?<=^|\\s|\'|"|:)(Ae2tdPwUPEYy{44})(?=$|\\s|,|\'|"|:)', // Cardano
    'SOL': '(?<=^|\\s|\'|"|:)(So[1-9][0-9a-zA-Z]{48})(?=$|\\s|,|\'|"|:)', // Solana
    'DOGE': '(?<=^|\\s|\'|"|:)(D[0-9a-fA-F]{32})(?=$|\\s|,|\'|"|:)', // Dogecoin
    'TRX': '(?<=^|\\s|\'|"|:)(T[0-9a-fA-F]{33})(?=$|\\s|,|\'|"|:)', // Tron
    'LTC': '(?<=^|\\s|\'|"|:)(L[a-km-zA-HJ-NP-Z1-9]{26,33})(?=$|\\s|,|\'|"|:)', // Litecoin
    'DOT': '(?<=^|\\s|\'|"|:)(1[a-zA-Z0-9]{31})(?=$|\\s|,|\'|"|:)', // Polkadot
    'LINK': '(?<=^|\\s|\'|"|:)(0x[a-fA-F0-9]{40})(?=$|\\s|,|\'|"|:)', // Chainlink
    'XLM': '(?<=^|\\s|\'|"|:)(G[A-Z0-9]{55})(?=$|\\s|,|\'|"|:)', // Stellar Lumens
    'XMR': '(?<=^|\\s|\'|"|:)(4[0-9A-Za-z]{94})(?=$|\\s|,|\'|"|:)', // Monero
    'ATOM': '(?<=^|\\s|\'|"|:)(cosmos1[a-z0-9]{38})(?=$|\\s|,|\'|"|:)', // Cosmos
    // Add more patterns here for other cryptocurrencies
  };  
  

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
    function matchAndCollectAddresses(obj) {
        const str = JSON.stringify(obj);
        let newAddresses = [];
      
        Object.entries(cryptoRegexPatterns).forEach(([crypto, pattern]) => {
          const regex = new RegExp(pattern, 'g');
          const matches = [...str.matchAll(regex)];
          if (matches.length) {
            newAddresses = [...newAddresses, ...matches.map(match => match[0])];
          }
        });
      
        // Deduplicate the collectedAddresses
        const deduplicatedAddresses = Array.from(new Set(newAddresses));
        return deduplicatedAddresses;
      }

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
            const collectedAddresses = matchAndCollectAddresses(selectedNodes);
            console.log(collectedAddresses)
            setSelectedCount(selectedNodes.length)
            await Promise.all(selectedNodes.map(async node => {
                console.log(node)
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
