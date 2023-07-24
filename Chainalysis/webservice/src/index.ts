import { Joi, registerServices } from '@sirensolutions/web-service-interface';
import ClusterAddresses from './ClusterAddresses';
import ClusterBalance from './ClusterBalance';
import ClusterCounterparties from './ClusterCounterparties'
import ClusterCombinedInfo from './ClusterCombinedInfo'
import AddressTransactions from './AddressTransactions'
import ClusterObservations from './ClusterObservations'
import ClusterExposure from './ClusterExposure'
import IpObservations from './IpObservations'
const configSchema = {token: Joi.string().default('change-me')};
// This is the syntax for registering the 'ClusterAddresses' service into the group 'chainalysis-iapi'
export = registerServices('chainalysis-iapi', [
    ClusterAddresses,
    ClusterBalance,
    ClusterCounterparties,
    ClusterCombinedInfo,
    AddressTransactions,
    ClusterObservations,
    ClusterExposure,
    IpObservations,
], configSchema);
// Removed From Register: 