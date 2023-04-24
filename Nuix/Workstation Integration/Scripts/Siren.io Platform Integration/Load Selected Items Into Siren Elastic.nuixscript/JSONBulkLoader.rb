require 'uri'
require 'net/http'

class JSONBulkLoader
  def self.load_jsonl_files(elasticsearch_url, username, password, pd, files, primary_pipeline, num_selected_items, max_retries, timeout, type)
    file_count = files.length
    pd.setMainProgress(0, file_count)
    files.each_with_index do |file_path, index|
      pd.setMainStatus("Exporting Type #{type} bulk load file: #{index + 1} of #{file_count} into Siren Elastic")
      pd.logMessage("Loading #{file_path}")
      request_url = "#{elasticsearch_url}/_bulk?pipeline=#{primary_pipeline}"
      request_uri = URI.parse(request_url)
      request = Net::HTTP::Post.new(request_uri)
      request.basic_auth(username, password) unless username == 'noauth'
      request.add_field('Content-Type', 'application/x-ndjson')
      request.body = File.read(file_path)
      retry_count = 0
      success = false
      while !success && retry_count < max_retries do
        begin
          response = Net::HTTP.start(request_uri.hostname, request_uri.port, use_ssl: request_uri.scheme == 'https', verify_mode: OpenSSL::SSL::VERIFY_NONE, open_timeout: timeout, read_timeout: timeout) do |http|
            http.instance_variable_set(:@httpclient_request_size_limit, 524_288_000)
            http.request(request)
          end
          if response.is_a?(Net::HTTPSuccess)
            success = true
          else
            pd.logMessage("Failed to load #{file_path}: #{response.code} #{response.message} on attempt #{retry_count + 1}, retrying... (max retries: #{max_retries})")
            retry_count += 1
          end
        rescue StandardError => e
          pd.logMessage("JRuby Exception Loading #{file_path}: #{e.message} on attempt #{retry_count + 1}, retrying... (max retries: #{max_retries})")
          retry_count += 1
        end
      end
      if success
        pd.setMainProgress(index + 1, file_count)
        pd.logMessage("Successfully loaded #{file_path}: #{response.code} #{response.message} on attempt #{retry_count + 1}")
        #pd.logMessage(response.body)
      end
    end
  end
end
