import { DataIndexResults, InputSchema, OutputConfiguration, ServiceDefinition, WebServiceError } from '@sirensolutions/web-service-interface';
import DDG = require('duck-duck-scrape');
import crypto from 'crypto';

export default class DuckDuckGoImageScraperDriver extends ServiceDefinition {
  readonly name = 'duckduckgo-image-scraper';

  readonly inputSchema: InputSchema = {
    query: { type: 'text', required: true },
    cropNumber: { type: 'long', required: true },
    exact_search: { type: 'text', required: false },
    site_search: { type: 'text', required: false },
  };

  readonly outputConfiguration: OutputConfiguration = {
    structured_content: {
      url: 'keyword',
      source: 'text',
      title: 'text',
      height: 'long',
      width: 'long',
      thumbnail: 'keyword',
      position: 'long',
      retrievedAt: 'date'
    },
    debug: { resultCount: 'long' }
  };

  async invoke(inputs: {
    query: string,
    cropNumber: number,
    exact_search: string | undefined,
    site_search: string | undefined,
  }): Promise<DataIndexResults> {
    const { query, cropNumber, exact_search, site_search } = inputs;
  
    // Wrap query in double quotes if exact_search is true
    const searchQuery = exact_search === 'true' ? `+${query.split(' ').join(' AND +')} AND "${query}"` : query;
  
    // Append site search string if provided
    const siteQuery = site_search ? ` AND site:${site_search}` : '';
  
    const searchOptions: DDG.ImageSearchOptions = { offset: 0 };
    const results = await DDG.searchImages(searchQuery + siteQuery, { offset: 0 })
      .catch(err => Promise.reject(err.response && err.response.status < 500 ? new WebServiceError(err.response.data) : err));
  
    const croppedResults = results.results.slice(0, cropNumber);
  
    const structured_content = croppedResults.map((result, index) => {
      return {
        id: crypto.createHash('sha256')
          .update(`${query}|${result.url}`)
          .digest('hex'),
        query,
        url: result.url,
        source: result.source,
        title: result.title,
        height: result.height,
        width: result.width,
        thumbnail: result.thumbnail,
        position: index + 1,
        retrievedAt: new Date().toISOString(),
      };
    });
  
    return {
      structured_content,
      debug: [{
        resultCount: croppedResults.length
      }]
    };
  }
}
