import { Joi, registerServices } from '@sirensolutions/web-service-interface';
import DuckDuckGoImageScraperDriver from './DuckDuckGoImageScraperDriver';
import DuckDuckGoScraperDriver from './DuckDuckGoScraperDriver';
import DuckDuckGoNewsScraperDriver from './DuckDuckGoNewsScraperDriver';

const configSchema = {};

export = registerServices('context-toolkit', [DuckDuckGoScraperDriver, DuckDuckGoImageScraperDriver, DuckDuckGoNewsScraperDriver], configSchema);
