This web service driver consists of services for the consolidatedscreeninglist service group.

# Development
See [here](https://www.npmjs.com/package/@sirensolutions/web-service-interface) for information on how to develop web services for Investigate.

This web service driver consists of one service, `Search`, registered by the [`index.ts`](src/index.ts) module. Edit the [`Search.ts`](src/Search.ts) module to specify the inputs and outputs, and to query the web API you want to get data from.

You can test the service using the `invoke` script:
```bash
node invoke Search --input:query ireland
```

# Installation
To install these services into Investigate:
1. Run `npm run package` to create a zip
1. Run `bin/investigate-plugin install file:////path/to/consolidatedscreeninglist/target/consolidatedscreeninglist.zip`

This project was generated with Siren's [generator for web service drivers](https://www.npmjs.com/package/@sirensolutions/generator-web-service).
