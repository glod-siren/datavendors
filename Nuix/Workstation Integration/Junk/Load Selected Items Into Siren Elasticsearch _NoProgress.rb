require 'net/https'
require 'uri'
require 'json'
require 'yaml'

# Load configuration from YAML file
config = YAML.load_file(File.join(File.dirname(__FILE__), 'config.yml'))

# Extract configuration values
elasticsearch_url = config['elasticsearch_url']
elasticsearch_index = config['elasticsearch_index']
username = config['username']
password = config['password']
metadata_profile_name = config['metadata_profile_name']
temp_directory = config['temp_directory']
catch_count = config['catch_count']

# Specify the metadata profile to use
metadata_profile = $current_case.getMetadataProfileStore().getMetadataProfile(metadata_profile_name)

# Test the Elasticsearch connection and get the cluster health
puts "Testing Elasticsearch connection and getting cluster health..."
request_url = "#{elasticsearch_url}/_cluster/health"
request_uri = URI.parse(request_url)
request = Net::HTTP::Get.new(request_uri)
request.basic_auth(username, password) unless username == 'noauth'
response = Net::HTTP.start(request_uri.hostname, request_uri.port, use_ssl: request_uri.scheme == 'https', verify_mode: OpenSSL::SSL::VERIFY_NONE) do |http|
  http.request(request)
end

if response.code.to_i == 200
  health = JSON.parse(response.body)["status"]
  puts "Elasticsearch connection test successful"
  puts "Cluster health: #{health}"
else
  puts "Error testing Elasticsearch connection: #{response.code} #{response.message}"
  exit 1
end

# Delete any existing Elasticsearch index templates
delete_template_url = "#{elasticsearch_url}/_index_template/nuix_case_metadata_v1"
delete_template_uri = URI.parse(delete_template_url)
delete_template_request = Net::HTTP::Delete.new(delete_template_uri)
delete_template_request.basic_auth(username, password) unless username == 'noauth'
delete_template_request.add_field('Content-Type', 'application/json')
delete_template_response = Net::HTTP.start(delete_template_uri.hostname, delete_template_uri.port, use_ssl: delete_template_uri.scheme == 'https', verify_mode: OpenSSL::SSL::VERIFY_NONE) do |http|
  http.request(delete_template_request)
end

if delete_template_response.code.to_i == 200
  puts "Deleted existing Elasticsearch index template"
elsif delete_template_response.code.to_i == 404
  puts "No existing Elasticsearch index template found"
else
  puts "Error deleting Elasticsearch index template: #{delete_template_response.code} #{delete_template_response.message}"
  puts delete_template_response.body
end

# Delete any existing Elasticsearch index pipelines
delete_pipeline_url = "#{elasticsearch_url}/_ingest/pipeline/nuix_case_metadata_v1"
delete_pipeline_uri = URI.parse(delete_pipeline_url)
delete_pipeline_request = Net::HTTP::Delete.new(delete_pipeline_uri)
delete_pipeline_request.basic_auth(username, password) unless username == 'noauth'
delete_pipeline_request.add_field('Content-Type', 'application/json')
delete_pipeline_response = Net::HTTP.start(delete_pipeline_uri.hostname, delete_pipeline_uri.port, use_ssl: delete_pipeline_uri.scheme == 'https', verify_mode: OpenSSL::SSL::VERIFY_NONE) do |http|
  http.request(delete_pipeline_request)
end

if delete_pipeline_response.code.to_i == 200
  puts "Deleted existing Elasticsearch index pipeline"
elsif delete_pipeline_response.code.to_i == 404
  puts "No existing Elasticsearch index pipeline found"
else
  puts "Error deleting Elasticsearch index pipeline: #{delete_pipeline_response.code} #{delete_pipeline_response.message}"
  puts delete_pipeline_response.body
end

# Apply Elasticsearch index template
puts "Applying Elasticsearch index template..."
template_url = "#{elasticsearch_url}/_index_template/nuix_case_metadata_v1"
template_uri = URI.parse(template_url)
template_request = Net::HTTP::Put.new(template_uri)
template_request.basic_auth(username, password) unless username == 'noauth'
template_request.add_field('Content-Type', 'application/json')
template_request.body = File.read(File.join(File.dirname(__FILE__), 'template.json'))
puts template_request.body
puts template_uri
template_response = Net::HTTP.start(template_uri.hostname, template_uri.port, use_ssl: template_uri.scheme == 'https', verify_mode: OpenSSL::SSL::VERIFY_NONE) do |http|
  http.request(template_request)
end

if template_response.code.to_i == 200
  puts "Elasticsearch index template applied successfully"
else
  puts "Error applying Elasticsearch index template: #{template_response.code} #{template_response.message}"
  exit 1
end

# Apply Elasticsearch index pipeline
puts "Applying Elasticsearch index pipeline..."
pipeline_url = "#{elasticsearch_url}/_ingest/pipeline/nuix_case_metadata_v1"
pipeline_uri = URI.parse(pipeline_url)
pipeline_request = Net::HTTP::Put.new(pipeline_uri)
pipeline_request.basic_auth(username, password) unless username == 'noauth'
pipeline_request.add_field('Content-Type', 'application/json')
pipeline_request.body = File.read(File.join(File.dirname(__FILE__), 'pipeline.json'))
puts pipeline_request.body
puts pipeline_uri
pipeline_response = Net::HTTP.start(pipeline_uri.hostname, pipeline_uri.port, use_ssl: pipeline_uri.scheme == 'https', verify_mode: OpenSSL::SSL::VERIFY_NONE) do |http|
  http.request(pipeline_request)
end

if pipeline_response.code.to_i == 200
  puts "Elasticsearch index pipeline applied successfully"
else
  puts "Error applying Elasticsearch index pipeline: #{pipeline_response.code} #{pipeline_response.message}"
  exit 1
end

# Specify the output directory
output_directory = File.join(temp_directory, 'ES_BULK_LOAD_' + Time.now.strftime('%Y%m%d_%H%M%S'))
Dir.mkdir(output_directory)

# Get the selected items
selected_items = $current_selected_items
num_selected_items = selected_items.size
puts "Selected #{num_selected_items} item(s)"

# Remove punctuation and replace spaces with underscores in header names
header_fields = metadata_profile.get_metadata.map(&:get_name)
header_fields = header_fields.map do |field|
  field.gsub(/[\[\]\-\s]/, '').gsub(/  +/, ' ').gsub(/ /, '_').gsub(/\W/, '_')
end

# Set up variables for file naming and writing batches
batch_count = 0
batch_record_count = 0
output_file_path = File.join(output_directory, "batch_" + batch_count.to_s.rjust(7, "0") + ".jsonl")
file = File.open(output_file_path, "w")

# Iterate over the selected items and write metadata and text to the file
selected_items.each_with_index do |item, index|
  begin
    # Get the metadata field values for the item
    item_metadata = {}
    metadata_profile.get_metadata.each do |field_def|
      field_value = field_def.evaluate(item)
      item_metadata[field_def.get_name] = field_value
    end

    # Get the item text
    item_text = item.getTextObject.toString

    # Add the item text to the metadata hash for the item
    item_metadata["Item_Text"] = item_text
    item_metadata["CaseName"] = $current_case.name

    # Remove punctuation and replace spaces with underscores in header values
    item_metadata = item_metadata.map do |k, v|
      [k.gsub(/[\[\]\-\s]/, '').gsub(/  +/, ' ').gsub(/ /, '_').gsub(/\W/, '_'), v]
    end.to_h

    # Write the metadata values to the file as JSONL
    file.puts("{ \"index\" : { \"_index\" : \"" + elasticsearch_index + $current_case.guid + "\", \"_id\" : \"" + item.get_guid + "\" } }")
    file.puts(JSON.generate(item_metadata))

    # Increment batch record count and provide feedback on progress
    batch_record_count += 1
    puts "Exported record #{index + 1} of #{num_selected_items}"

    # If the batch record count has reached the catch count, start a new batch file
    if batch_record_count == catch_count
      file.close
      batch_count += 1
      batch_record_count = 0
      output_file_path = File.join(output_directory, "batch_" + batch_count.to_s.rjust(7, "0") + ".jsonl")
      file = File.open(output_file_path, "w")
    end
  rescue Exception => e
    puts "Error exporting item '#{item.get_guid}': #{e.message}"
  end
end

# Close the last file
file.close

# Print a message indicating that the export is complete
puts "Export of JSONLines complete into #{output_directory}"

# Load the JSONL files into Elasticsearch
Dir[File.join(output_directory, '*.jsonl')].sort.each do |file_path|
  puts "Loading #{file_path}"
  request_url = "#{elasticsearch_url}/_bulk?pipeline=nuix_case_metadata_v1"
  request_uri = URI.parse(request_url)
  request = Net::HTTP::Post.new(request_uri)
  request.basic_auth(username, password) unless username == 'noauth'
  request.add_field('Content-Type', 'application/x-ndjson')
  request.body = File.read(file_path)
  response = Net::HTTP.start(request_uri.hostname, request_uri.port, use_ssl: request_uri.scheme == 'https', verify_mode: OpenSSL::SSL::VERIFY_NONE) do |http|
    http.request(request)
  end
  puts "#{response.code} #{response.message}"
  puts response.body
end

puts "Batch loading complete"

# Delete all JSONL files
Dir[File.join(output_directory, '*.jsonl')].each do |file_path|
  File.delete(file_path)
end

# Delete the output directory
Dir.delete(output_directory)

puts "Cleanup complete"

