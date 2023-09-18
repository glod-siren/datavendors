# Chainalysis Investigations API Integration With Siren Investigate
![](https://addons.siren.io/assets/images/siren-logo.png)
![](https://logosarchive.com/wp-content/uploads/2022/01/Chainalysis-logo.png)
#### Data Model
![](../screenshots/2023_02_27_Siren_Chainalysis_IAPI_DataModel.png)
### Teaser
![](../screenshots/2023_02_27_Siren_Chainalysis_IAPI_Teaser.png)


This web service driver consists of services for the chainalysis-iapi service group.

# Development
See [here](https://www.npmjs.com/package/@sirensolutions/web-service-interface) for information on how to develop web services for Investigate.

This web service driver consists of many services in a group (`ClusterCounterparties`,`ClusterCombinedInfo`,`ClusterBalance`,`AddressTransactions`,`ClusterObservations`,`ClusterExposure`, `IpObservations`) registered by the [`index.ts`](src/index.ts) module. Example: Edit the [`ClusterCombinedInfo.ts`](src/ClusterCombinedInfo.ts) module to specify the inputs and outputs, and to query the web API you want to get data from.

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
2. Use Siren Scripts In the Graph To Invoke [`sirenapi`](sirenscripts/sirenapi)

This project was first generated with Siren's [generator for web service drivers](https://www.npmjs.com/package/@sirensolutions/generator-web-service).

# To Do as of 2023-09-18
1. Advanced Search Option to Manually Specify Asset Type Instead of Auto Resolving
2. Send Larger Pagination to a Second Ingestion Service (Logstash)
3. Overview Panes To Mirror Info From Reactor and improve UX
4. Dashboard with Search Driven By Scripted Panel
5. Allow Filters On Transactions (Cluster and Address And Date)
6. Automation of Ingestion of Counterparties and Addresses through secondary ingestion service