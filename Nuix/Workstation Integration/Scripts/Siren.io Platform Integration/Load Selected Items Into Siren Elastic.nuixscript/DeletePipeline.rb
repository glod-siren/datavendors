require 'uri'
require 'net/http'

class DeletePipeline
  def self.delete_pipeline(elasticsearch_url, username, password, pd, elasticsearch_pipeline_file_name)
    pd.logMessage("Deleting existing Elasticsearch index pipeline")
    delete_pipeline_url = "#{elasticsearch_url}/_ingest/pipeline/#{elasticsearch_pipeline_file_name.gsub(".json", "")}"
    delete_pipeline_uri = URI.parse(delete_pipeline_url)
    delete_pipeline_request = Net::HTTP::Delete.new(delete_pipeline_uri)
    delete_pipeline_request.basic_auth(username, password) unless username == 'noauth'
    delete_pipeline_request.add_field('Content-Type', 'application/json')
    delete_pipeline_response = Net::HTTP.start(delete_pipeline_uri.hostname, delete_pipeline_uri.port, use_ssl: delete_pipeline_uri.scheme == 'https', verify_mode: OpenSSL::SSL::VERIFY_NONE) do |http|
      http.request(delete_pipeline_request)
    end
    if delete_pipeline_response.code.to_i == 200
      pd.logMessage("Deleted existing Elasticsearch index pipeline")
    elsif delete_pipeline_response.code.to_i == 404
      pd.logMessage("No existing Elasticsearch index pipeline found")
    else
      pd.logMessage("Error deleting Elasticsearch index pipeline: #{delete_pipeline_response.code} #{delete_pipeline_response.message}")
    end
  end
end
