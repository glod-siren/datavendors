require 'net/https'
require 'uri'
require 'json'
require 'yaml'
require 'base64'
# Bootstrap the library
require_relative "NxBootstrap.rb"
# Load configuration from YAML file
config = YAML.load_file(File.join(File.dirname(__FILE__), '../config.yml'))
# Extract configuration values
elasticsearch_url = config['elasticsearch_url']
elasticsearch_metadata_index = config['elasticsearch_metadata_index']
elasticsearch_print_index = config['elasticsearch_print_index']
username = config['username']
password = config['password']
metadata_profile_name = config['metadata_profile_name']
temp_directory = config['temp_directory']
catch_count = config['catch_count']
print_preview = config['print_preview']
print_preview_page_limit = config['print_preview_page_limit']
# Specify the metadata profile to use
metadata_profile = $current_case.getMetadataProfileStore().getMetadataProfile(metadata_profile_name)
# Specify the output directory
output_directory = File.join(temp_directory, 'ES_BULK_LOAD_METADATA_' + Time.now.strftime('%Y%m%d_%H%M%S'))
print_directory = File.join(temp_directory, 'ES_BULK_LOAD_PRINT_' + Time.now.strftime('%Y%m%d_%H%M%S'))
Dir.mkdir(output_directory)
Dir.mkdir(print_directory) unless print_preview == false
# Get the selected items
selected_items = $current_selected_items
num_selected_items = selected_items.size
ProgressDialog.forBlock do |pd|
	pd.setTitle("Load Selected Items Into Siren Elasticsearch")
  pd.setAbortButtonVisible(true)
  pd.setSubProgressVisible(false)
	count = 0
	while pd.abortWasRequested == false
    # Exit our while loop if we reach the count twice
    pd.setMainProgress(count,num_selected_items)
    pd.setMainStatus("Testing Elasticsearch and Applying Templates and Pipeline")
    # Test the Elasticsearch connection and get the cluster health
    pd.logMessage("Testing Elasticsearch connection and getting cluster health...")
    request_url = "#{elasticsearch_url}/_cluster/health"
    request_uri = URI.parse(request_url)
    request = Net::HTTP::Get.new(request_uri)
    request.basic_auth(username, password) unless username == 'noauth'
    response = Net::HTTP.start(request_uri.hostname, request_uri.port, use_ssl: request_uri.scheme == 'https', verify_mode: OpenSSL::SSL::VERIFY_NONE) do |http|
      http.request(request)
    end
    if response.code.to_i == 200
      health = JSON.parse(response.body)["status"]
      pd.logMessage("Elasticsearch connection test successful")
      pd.logMessage("Cluster health: #{health}")
    else
      pd.logMessage("Error testing Elasticsearch connection: #{response.code} #{response.message}")
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
      pd.logMessage("Deleted existing Elasticsearch index template")
    elsif delete_template_response.code.to_i == 404
      pd.logMessage("No existing Elasticsearch index template found")
    else
      pd.logMessage("Error deleting Elasticsearch index template: #{delete_template_response.code} #{delete_template_response.message}")
      pd.logMessage(delete_template_response.body)
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
      pd.logMessage("Deleted existing Elasticsearch index pipeline")
    elsif delete_pipeline_response.code.to_i == 404
      pd.logMessage("No existing Elasticsearch index pipeline found")
    else
      pd.logMessage("Error deleting Elasticsearch index pipeline: #{delete_pipeline_response.code} #{delete_pipeline_response.message}")
      pd.logMessage(delete_pipeline_response.body)
    end
    # Apply Elasticsearch index template
    pd.logMessage("Applying Elasticsearch index template...")
    template_url = "#{elasticsearch_url}/_index_template/nuix_case_metadata_v1"
    template_uri = URI.parse(template_url)
    template_request = Net::HTTP::Put.new(template_uri)
    template_request.basic_auth(username, password) unless username == 'noauth'
    template_request.add_field('Content-Type', 'application/json')
    template_request.body = File.read(File.join(File.dirname(__FILE__), 'metadata_template.json'))
    template_response = Net::HTTP.start(template_uri.hostname, template_uri.port, use_ssl: template_uri.scheme == 'https', verify_mode: OpenSSL::SSL::VERIFY_NONE) do |http|
      http.request(template_request)
    end
    if template_response.code.to_i == 200
      pd.logMessage("Elasticsearch index template applied successfully")
    else
      pd.logMessage("Error applying Elasticsearch index template: #{template_response.code} #{template_response.message}")
      exit 1
    end
    # Apply Elasticsearch index pipeline
    pd.logMessage("Applying Elasticsearch index pipeline...")
    pipeline_url = "#{elasticsearch_url}/_ingest/pipeline/nuix_case_metadata_v1"
    pipeline_uri = URI.parse(pipeline_url)
    pipeline_request = Net::HTTP::Put.new(pipeline_uri)
    pipeline_request.basic_auth(username, password) unless username == 'noauth'
    pipeline_request.add_field('Content-Type', 'application/json')
    pipeline_request.body = File.read(File.join(File.dirname(__FILE__), 'metadata_pipeline.json'))
    pipeline_response = Net::HTTP.start(pipeline_uri.hostname, pipeline_uri.port, use_ssl: pipeline_uri.scheme == 'https', verify_mode: OpenSSL::SSL::VERIFY_NONE) do |http|
      http.request(pipeline_request)
    end
    if pipeline_response.code.to_i == 200
      pd.logMessage("Elasticsearch index pipeline applied successfully")
    else
      pd.logMessage("Error applying Elasticsearch index pipeline: #{pipeline_response.code} #{pipeline_response.message}")
      exit 1
    end
    pd.setMainStatus("Exporting into Temp Directory")
    pd.logMessage("Selected #{num_selected_items} item(s)")
    # Remove punctuation and replace spaces with underscores in header names
    header_fields = metadata_profile.get_metadata.map(&:get_name)
    header_fields = header_fields.map do |field|
      field.gsub(/[\[\]\-\s]/, '').gsub(/  +/, ' ').gsub(/ /, '_').gsub(/\W/, '_')
    end
    # Set up variables for file naming and writing batches
    batch_count = 0
    batch_record_count = 0
    output_file_path = File.join(output_directory, "batch_" + batch_count.to_s.rjust(7, "0") + ".jsonl")
    print_file_path = File.join(print_directory, "batch_" + batch_count.to_s.rjust(7, "0") + ".jsonl")
    file = File.open(output_file_path, "w")
    print_file = File.open(print_file_path, "w")
    # Iterate over the selected items and write metadata and text to the file
    selected_items.each_with_index do |item, index|
      begin
        pd.setMainProgress(count,num_selected_items)
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
        if item.getThumbnail().isAvailable() == true
          output_stream = java.io.ByteArrayOutputStream.new
          javax.imageio.ImageIO.write(item.getThumbnail().getPage(0).getPageImage(), "jpg", output_stream)
          item_metadata["Thumbnail_Encoded"] = Base64.encode64(output_stream.toByteArray.to_a.pack('c*')).gsub(/\s+/, "")
        end
        if item.getPrintedImage().isStored() && item.getThumbnail().isAvailable() == false && item.getKind() != "Container" && item.getKind() != "Empty" && item.getKind() != "Unrecognised" && item.getKind() != "System File"
          output_stream = java.io.ByteArrayOutputStream.new
          options = java.util.HashMap.new
          options.put("zoom", 0.3)
          javax.imageio.ImageIO.write(item.getPrintedImage().getPages()[0].getPageImage(options), "jpg", output_stream);
          item_metadata["Thumbnail_Encoded"] = Base64.encode64(output_stream.toByteArray.to_a.pack('c*')).gsub(/\s+/, "")
        end
        
        # Print Preview
        if print_preview == true && item.getPrintedImage().isStored() == true && item.getKind() != "Container" && item.getKind() != "Empty" && item.getKind() != "Unrecognised" && item.getKind() != "System File"
          page_count = [item.getPrintedImage().getPageCount(), print_preview_page_limit].min
          for i in 0..page_count-1
            output_stream = java.io.ByteArrayOutputStream.new
            options = java.util.HashMap.new
            options.put("zoom", 0.95)
            javax.imageio.ImageIO.write(item.getPrintedImage().getPages()[i].getPageImage(options), "jpg", output_stream);
            print_metadata = {}
            print_metadata["MetaGuid"] = item.getGuid
            print_metadata["PageNumber"] = i+1
            print_metadata["PlainName"] = "Page " + (i+1).to_s + " " + item.getName()
            print_metadata["PrintPreview_Encoded"] = Base64.encode64(output_stream.toByteArray.to_a.pack('c*')).gsub(/\s+/, "")
            print_file.puts("{ \"index\" : { \"_index\" : \"" + elasticsearch_print_index + $current_case.guid + "\", \"_id\" : \"" + item.get_guid + "_page_" + (i+1).to_s.rjust(7, "0") + "\" } }")
            print_file.puts(JSON.generate(print_metadata))
          end
        end
        
        # Remove punctuation and replace spaces with underscores in header values
        item_metadata = item_metadata.map do |k, v|
          [k.gsub(/[\[\]\-\s]/, '').gsub(/  +/, ' ').gsub(/ /, '_').gsub(/\W/, '_'), v]
        end.to_h
        # Write the metadata values to the file as JSONL
        file.puts("{ \"index\" : { \"_index\" : \"" + elasticsearch_metadata_index + $current_case.guid + "\", \"_id\" : \"" + item.get_guid + "\" } }")
        file.puts(JSON.generate(item_metadata))
        # Increment batch record count and provide feedback on progress
        batch_record_count += 1
        count = index + 1
        #pd.logMessage("Exported record #{index + 1} of #{num_selected_items}")
        # If the batch record count has reached the catch count, start a new batch file
        if batch_record_count == catch_count
          file.puts("")
          print_file.puts("")
          print_file.close
          file.close
          batch_count += 1
          batch_record_count = 0
          output_file_path = File.join(output_directory, "batch_" + batch_count.to_s.rjust(7, "0") + ".jsonl")
          print_file_path = File.join(print_directory, "batch_" + batch_count.to_s.rjust(7, "0") + ".jsonl")
          file = File.open(output_file_path, "w")
          print_file = File.open(print_file_path, "w")
        end
      rescue Exception => e
        pd.logMessage("Error exporting item '#{item.get_guid}': #{e.message}")
      end
    end
    # Close the last file
    file.close
    print_file.close
    # Print a message indicating that the export is complete
    pd.logMessage("Export of JSONLines complete into #{output_directory}")
    count = 1
    pd.setMainStatus("Loading Metadata/Text Into Elasticsearch")
    # Load the JSONL files into Elasticsearch
    max_retries = 5
    timeout = 30
    Dir[File.join(output_directory, '*.jsonl')].sort.each do |file_path|
      pd.setMainProgress(count,num_selected_items)
      pd.logMessage("Loading #{file_path}")
      request_url = "#{elasticsearch_url}/_bulk?pipeline=nuix_case_metadata_v1"
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
            pd.logMessage("Failed to load #{file_path}: #{response.code} #{response.message}")
            pd.logMessage(response.body)
            retry_count += 1
          end
        rescue StandardError => e
          pd.logMessage("Failed to load #{file_path}: #{e.message}")
          retry_count += 1
        end
      end
    
      if success
        #pd.logMessage("#{response.code} #{response.message}")
        #pd.logMessage(response.body)
        catch_count = File.foreach(file_path).count # Count the number of lines in the file
        count += catch_count
        pd.setMainProgress(count,num_selected_items)
      end
    end
    
  if print_preview == true
    count = 1
    pd.setMainStatus("Loading Print Previews Into Elasticsearch")
    Dir[File.join(print_directory, '*.jsonl')].sort.each do |file_path|
      pd.setMainProgress(count,num_selected_items)
      pd.logMessage("Loading #{file_path}")
      request_url = "#{elasticsearch_url}/_bulk"
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
            pd.logMessage("Failed to load #{file_path}: #{response.code} #{response.message}")
            pd.logMessage(response.body)
            retry_count += 1
          end
        rescue StandardError => e
          pd.logMessage("Failed to load #{file_path}: #{e.message}")
          retry_count += 1
        end
      end
  
      if success
        #pd.logMessage("#{response.code} #{response.message}")
        #pd.logMessage(response.body)
        catch_count = File.foreach(file_path).count # Count the number of lines in the file
        count += catch_count
        pd.setMainProgress(count,num_selected_items)
      end
    end
  end
  break
end
	# If the user aborted, show a message regarding this, else we will put the
	# progress dialog into a completed state
	if pd.abortWasRequested
		pd.setMainStatusAndLogIt("User Aborted at #{count}")
	else
		pd.setCompleted
	end
end
# Delete all JSONL files
Dir[File.join(output_directory, '*.jsonl')].each do |file_path|
  File.delete(file_path)
end
Dir[File.join(print_directory, '*.jsonl')].each do |file_path|
  File.delete(file_path)
end
# Delete the output directory
Dir.delete(output_directory)
Dir.delete(print_directory)
puts "Cleanup complete"