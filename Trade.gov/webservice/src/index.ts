import { Joi, registerServices } from '@sirensolutions/web-service-interface';
import Search from './Search';
import Sources from './Sources';
const configSchema = {subscription_key: Joi.string().default('change-me')};
// ok
export = registerServices('consolidatedscreeninglist', [Search, Sources], configSchema);