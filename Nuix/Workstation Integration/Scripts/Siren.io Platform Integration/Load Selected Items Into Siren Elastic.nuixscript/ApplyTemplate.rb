require 'uri'
require 'net/http'

class ApplyTemplate
  def self.apply_template(elasticsearch_url, username, password, pd, elasticsearch_template_file_name)
    pd.logMessage("Applying Elasticsearch index template...")
    template_url = "#{elasticsearch_url}/_index_template/#{elasticsearch_template_file_name.gsub(".json", "")}"
    template_uri = URI.parse(template_url)
    template_request = Net::HTTP::Put.new(template_uri)
    template_request.basic_auth(username, password) unless username == 'noauth'
    template_request.add_field('Content-Type', 'application/json')
    template_request.body = File.read(File.join(File.dirname(__FILE__), elasticsearch_template_file_name))
    template_response = Net::HTTP.start(template_uri.hostname, template_uri.port, use_ssl: template_uri.scheme == 'https', verify_mode: OpenSSL::SSL::VERIFY_NONE) do |http|
      http.request(template_request)
    end
    if template_response.code.to_i == 200
      pd.logMessage("Elasticsearch index template applied successfully")
    else
      pd.logMessage("Error applying Elasticsearch index template: #{template_response.code} #{template_response.message}")
      exit 1
    end
  end
end
