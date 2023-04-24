require 'net/https'
require 'uri'
require 'json'
require 'yaml'
require 'base64'
require 'time'
# Require libraries
require_relative 'NxBootstrap.rb'
require_relative 'DeleteTemplate'
require_relative 'ApplyTemplate'
require_relative 'DeletePipeline'
require_relative 'ApplyPipeline'
require_relative 'JSONBulkLoader'

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
max_text_length_bytes = config['max_text_length_bytes']
catch_count = config['catch_count']
print_preview = config['print_preview']
print_preview_page_limit = config['print_preview_page_limit']
print_preview_include_kinds = config['print_preview_include_kinds']
template_files = config['template_files']
pipeline_files = config['pipeline_files']
primary_pipeline = config['primary_pipeline']

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

begin
  ProgressDialog.forBlock do |pd|
    pd.setTitle("Load Selected Items Into Siren Elasticsearch")
    pd.setAbortButtonVisible(true)
    pd.setSubProgressVisible(false)
    count = 0
    batch_count = 0
    batch_record_count = 0

    while !pd.abortWasRequested
      # Test Elasticsearch connection and get cluster health
      pd.setMainStatus('Testing Elasticsearch and Applying Templates and Pipeline')
      pd.logMessage('Testing Elasticsearch connection and getting cluster health...')
      request_url = "#{elasticsearch_url}/_cluster/health"
      request_uri = URI.parse(request_url)
      request = Net::HTTP::Get.new(request_uri)
      request.basic_auth(username, password) unless username == 'noauth'
      response = Net::HTTP.start(request_uri.hostname, request_uri.port, use_ssl: request_uri.scheme == 'https', verify_mode: OpenSSL::SSL::VERIFY_NONE) do |http|
        http.request(request)
      end

      if response.code.to_i == 200
        health = JSON.parse(response.body)['status']
        pd.logMessage('Elasticsearch connection test successful')
        pd.logMessage("Cluster health: #{health}")
      else
        pd.logMessage("Error testing Elasticsearch connection: #{response.code} #{response.message}")
        exit 1
      end

      # Delete and apply Elasticsearch index templates
      template_files.each do |template_file|
        # Delete any existing Elasticsearch index templates
        DeleteTemplate.delete_template(elasticsearch_url, username, password, pd, template_file)

        # Apply Elasticsearch index template
        ApplyTemplate.apply_template(elasticsearch_url, username, password, pd, template_file)
      end

      # Delete and apply Elasticsearch index pipelines
      pipeline_files.each do |pipeline_file|
        # Delete any existing Elasticsearch index pipelines
        DeletePipeline.delete_pipeline(elasticsearch_url, username, password, pd, pipeline_file)
        # Apply Elasticsearch index pipeline
        ApplyPipeline.apply_pipeline(elasticsearch_url, username, password, pd, pipeline_file)
      end
      pd.setMainProgress(4,5)
      
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
          break if pd.abortWasRequested
          pd.setMainStatus("Exporting item #{index + 1} of #{num_selected_items} into Temp Directory")
          pd.setMainProgress(index + 1, num_selected_items)
      
          # Get the metadata field values for the item
          item_metadata = {}
          metadata_profile.get_metadata.each do |field_def|
            field_value = field_def.evaluate(item)
            item_metadata[field_def.get_name] = field_value
          end
      
          # Get the item text
          item_text_object = item.getTextObject
          item_text_truncated = false
      
          if item_text_object.length > max_text_length_bytes
            item_text_object = item_text_object.slice(0, max_text_length_bytes)
            item_text_truncated = true
          end
      
          item_text = item_text_object.toString
      
          # Add the item text to the metadata hash for the item
          item_metadata["Item_Text"] = item_text
          item_metadata["Item_Text_Truncated"] = item_text_truncated
          item_metadata["CaseName"] = $current_case.name
          current_time = Time.now.iso8601
          item_metadata["@last_exported"] = current_time
      
          # Convert the array values to lowercase for case-insensitive comparisons
          print_preview_include_kinds = print_preview_include_kinds.map { |kind| kind.downcase }
      
          if item.getThumbnail().isAvailable() == true
            output_stream = java.io.ByteArrayOutputStream.new
            javax.imageio.ImageIO.write(item.getThumbnail().getPage(0).getPageImage(), "jpg", output_stream)
            item_metadata["Thumbnail_Encoded"] = Base64.encode64(output_stream.toByteArray.to_a.pack('c*')).gsub(/\s+/, "")
          end
      
          if item.getPrintedImage().isStored() && item.getThumbnail().isAvailable() == false && print_preview_include_kinds.include?(item.getKind().to_s.downcase)
            output_stream = java.io.ByteArrayOutputStream.new
            options = java.util.HashMap.new
            options.put("zoom", 0.3)
            javax.imageio.ImageIO.write(item.getPrintedImage().getPages()[0].getPageImage(options), "jpg", output_stream)
            item_metadata["Thumbnail_Encoded"] = Base64.encode64(output_stream.toByteArray.to_a.pack('c*')).gsub(/\s+/, "")
          end
          # Print Preview
          if print_preview == true && item.getPrintedImage().isStored() == true && print_preview_include_kinds.include?(item.getKind().to_s.downcase)
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
          # If the batch record count has reached the catch count, start a new batch file
          if batch_record_count == catch_count
            if File.size(output_file_path) == 0
              File.delete(output_file_path)
            else
              file.puts("")
            end
            
            if File.size(print_file_path) == 0
              File.delete(print_file_path)
            else
              print_file.puts("")
            end
          
            print_file.close
            file.close
            batch_count += 1
            batch_record_count = 0
            output_file_path = File.join(output_directory, "batch_" + batch_count.to_s.rjust(7, "0") + ".jsonl")
            print_file_path = File.join(print_directory, "batch_" + batch_count.to_s.rjust(7, "0") + ".jsonl")
            file = File.open(output_file_path, "w")
            print_file = File.open(print_file_path, "w")
          end
          break if pd.abortWasRequested
        rescue Exception => e
          pd.logMessage("Error exporting item '#{item.get_guid}': #{e.message}")
          pd.logMessage(e.backtrace.inspect)
          next
        end
        break if pd.abortWasRequested
      end
      break if pd.abortWasRequested
      # Close the last file
      file.close
      print_file.close
      # Print a message indicating that the export is complete
      pd.logMessage("Export of JSONLines complete into #{output_directory} and #{print_directory}")
          # Load the JSONL files into Elasticsearch
      max_retries = 5
      timeout = 30
      JSONBulkLoader.load_jsonl_files(elasticsearch_url, username, password, pd, Dir[File.join(output_directory, '*.jsonl')].sort, primary_pipeline, num_selected_items, max_retries, timeout,"Metadata and Text")
      if print_preview == true
        print_preview_files = Dir[File.join(print_directory, '*.jsonl')].sort
        if print_preview_files.any?
          JSONBulkLoader.load_jsonl_files(elasticsearch_url, username, password, pd, print_preview_files, primary_pipeline, num_selected_items, max_retries, timeout,"Print Previews")
        else
          pd.logMessage("No print preview files found in directory: #{print_directory}")
        end
      end
      break if pd.abortWasRequested   
      # If the user aborted, show a message regarding this, else we will put the
      break
    end
    # If the user aborted, show a message regarding this, else we will put the progress dialog into a completed state
    if pd.abortWasRequested
      pd.setMainStatusAndLogIt("User Aborted at #{count}")
    else
      pd.setCompleted
    end
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
      
