# Load Selected Items Into Siren Elasticsearch

This Nuix script allows you to export selected items from a Nuix case to Elasticsearch using the Siren plugin. It exports the metadata and text for each item as a JSONL file and then loads the files into Elasticsearch using the `_bulk` API.

## Usage

1. Copy the `Load Selected Items Into Siren Elasticsearch.nuixscript` folder to the Nuix Scripts directory.
2. Open the Nuix case where you want to export items to Elasticsearch.
3. Load the `Siren_Nuix_Export_Metadata_Profile` metadata profile, which is based on the default field list in Nuix Discover, with some added fields.
4. Run the script from the Scripts menu or the Script Workbench.
5. Wait for the script to complete. The progress of the script will be printed to the console.
6. After the script has completed, check Elasticsearch to verify that the items were loaded successfully.

## Configuration

The script reads its configuration from a `config.yml` file in the same directory as the script. The following configuration options are available:

- `elasticsearch_url`: The URL of the Elasticsearch instance to load data into.
- `elasticsearch_index`: The name of the Elasticsearch index to load data into.
- `username`: The username to use when authenticating to Elasticsearch (if any).
- `password`: The password to use when authenticating to Elasticsearch (if any).
- `metadata_profile_name`: The name of the metadata profile to use when exporting items.
- `temp_directory`: The directory to use for temporary files created during the export process.
- `catch_count`: The number of items to export per batch.

## License

## To Do

- The Mapping and Pipeline Processing of Elasticsearch
- Modifications To the Siren Profile
- Dashboards and Scripts for Siren Investigate

This script is released under the [MIT License](https://opensource.org/licenses/MIT).
