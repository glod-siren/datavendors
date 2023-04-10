import { Joi, registerServices } from '@sirensolutions/web-service-interface';
import DuckDuckGoScraperDriver from './DuckDuckGoScraperDriver';

const configSchema = {
};

export = registerServices('context-toolkit', [
  DuckDuckGoScraperDriver
], configSchema);