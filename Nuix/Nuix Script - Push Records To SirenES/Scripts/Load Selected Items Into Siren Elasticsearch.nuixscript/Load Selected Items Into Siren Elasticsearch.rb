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
  field.gsub(/[\[\]\-\s]/, '').gsub(/  +/, ' ').gsub(/ /, '_')
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

    # Remove punctuation and replace spaces with underscores in header values
    item_metadata = item_metadata.map do |k, v|
      [k.gsub(/[\[\]\-\s]/, '').gsub(/  +/, ' ').gsub(/ /, '_'), v]
    end.to_h

    # Write the metadata values to the file as JSONL
    file.puts("{ \"index\" : { \"_index\" : \"" + elasticsearch_index + "\", \"_id\" : \"" + item.get_guid + "\" } }")
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
  request_url = "#{elasticsearch_url}/_bulk"
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

