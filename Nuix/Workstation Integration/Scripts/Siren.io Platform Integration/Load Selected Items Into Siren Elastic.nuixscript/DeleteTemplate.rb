require 'uri'
require 'net/http'

class DeleteTemplate
  def self.delete_template(elasticsearch_url, username, password, pd, elasticsearch_template_file_name)
    pd.logMessage("Deleting existing Elasticsearch index template")
    delete_template_url = "#{elasticsearch_url}/_index_template/#{elasticsearch_template_file_name.gsub(".json", "")}"
    delete_template_uri = URI.parse(delete_template_url)
    delete_template_request = Net::HTTP::Delete.new(delete_template_uri)
    delete_template_request.basic_auth(username, password) unless username == 'noauth'
    delete_template_request.add_field('Content-Type', 'application/json')
    delete_template_response = Net::HTTP.start(delete_template_uri.hostname, delete_template_uri.port, use_ssl: delete_template_uri.scheme == 'https', verify_mode: OpenSSL::SSL::VERIFY_NONE) do |http|
      http.request(delete_template_request)
    end
    if delete_template_response.code.to_i == 200
      pd.logMessage("Deleted existing Elasticsearch index template")
    elsif delete_template_response.code.to_i == 404
      pd.logMessage("No existing Elasticsearch index template found")
    else
      pd.logMessage("Error deleting Elasticsearch index template: #{delete_template_response.code} #{delete_template_response.message}")
    end
  end
end
