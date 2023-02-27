This web service driver consists of services for the chainalysis-iapi service group.

# Chainalysis Investigations API Integration
[](https://res.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_170,w_170,f_auto,b_white,q_auto:eco,dpr_1/jxod8zbn0gg5ryjva7ri)[](https://res.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_170,w_170,f_auto,b_white,q_auto:eco,dpr_1/qlzmdxctu1dg9ro3phcj)
[](https://www.chainalysis.com/wp-content/uploads/2022/05/solution-header-investigations.svg)

# Development
See [here](https://www.npmjs.com/package/@sirensolutions/web-service-interface) for information on how to develop web services for Investigate.

This web service driver consists of many services in a group (`ClusterCounterparties`,`ClusterCombinedInfo`,`AddressTransactions`,`ClusterObservations`, `ClusterTransactions`, `IpObservations`) registered by the [`index.ts`](src/index.ts) module. Example: Edit the [`ClusterCombinedInfo.ts`](src/ClusterCombinedInfo.ts) module to specify the inputs and outputs, and to query the web API you want to get data from.

You can test the service using the `invoke` script:
```bash
node invoke ClusterCombinedInfo --config:{token api key here} --input:asset BTC --input:address {bitcoin here}
```

# Investigate YML
Add to `Investigate.yml`
```yml
web_services:
  global:
    enabled: true
  chainalysis-iapi:
    config:
      token: '{iapi key here}'

```

# Installation
To install these services into Investigate:
1. Run `npm run package` to create a zip
1. Run `bin/investigate-plugin install file:////path/to/chainalysis-iapi/target/chainalysis-iapi.zip`

This project was first generated with Siren's [generator for web service drivers](https://www.npmjs.com/package/@sirensolutions/generator-web-service).

# To Do as of 02/26/2023
1. Allow Filters On Transactions (Cluster and Address)
2. Run Unlimited Pagination In Invocations (Currently Truncated at 400 (4x100))
3. Put Cluster Addresses Into Another Index
4. Overview Panes To Mirror Info From Reactor
5. Dashboard with Search Driven By Scripted Panel
6. Address Transaction
7. Official Icons
