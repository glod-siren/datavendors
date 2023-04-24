require 'uri'
require 'net/http'

class ApplyPipeline
  def self.apply_pipeline(elasticsearch_url, username, password, pd, elasticsearch_pipeline_file_name)
    pd.logMessage("Applying Elasticsearch index pipeline...")
    pipeline_url = "#{elasticsearch_url}/_ingest/pipeline/#{elasticsearch_pipeline_file_name.gsub(".json", "")}"
    pipeline_uri = URI.parse(pipeline_url)
    pipeline_request = Net::HTTP::Put.new(pipeline_uri)
    pipeline_request.basic_auth(username, password) unless username == 'noauth'
    pipeline_request.add_field('Content-Type', 'application/json')
    pipeline_request.body = File.read(File.join(File.dirname(__FILE__), elasticsearch_pipeline_file_name))
    pipeline_response = Net::HTTP.start(pipeline_uri.hostname, pipeline_uri.port, use_ssl: pipeline_uri.scheme == 'https', verify_mode: OpenSSL::SSL::VERIFY_NONE) do |http|
      http.request(pipeline_request)
    end
    if pipeline_response.code.to_i == 200
      pd.logMessage("Elasticsearch index pipeline applied successfully")
   else
      pd.logMessage("Error applying Elasticsearch index pipeline: #{pipeline_response.code} #{pipeline_response.message}")
      exit 1
    end
  end
end
