# Nuix Workstation Siren.io Platform Integration

**NOTE: This script is still in production and should be used at your own risk.**



## Introduction

This is a "Classic" Nuix Workstation Ruby script for exporting metadata and text from a Nuix case into a Elasticsearch cluster for use with Siren Investigate. It also supports exporting print previews as base64-encoded images into Elasticsearch.

Delevoped by former Nuix Investigator and former Nuix supreme techincal master, The Legendary General Glod returns into the Nuix fold to bring integration between `Siren.io` and Nuix.

## Requirements

- Nuix Workstation 9.x and Above
- Elasticsearch with Siren Federate
- Siren Investigate

## Installation

1. Copy the `Siren.io Platform Integration` Folder into your Nuix Scripts Directory
2. Edit the `config.yml` as specified below

## Configuration

The following configuration variables need to be set in the script before running:

- `elasticsearch_url`: The URL of the Elasticsearch server
- `elasticsearch_metadata_index`: The name of the Elasticsearch index for the exported metadata
- `elasticsearch_print_index`: The name of the Elasticsearch index for the exported print previews
- `username`: The username for basic authentication with Elasticsearch (set to 'noauth' if not required)
- `password`: The password for basic authentication with Elasticsearch (set to 'noauth' if not required)
- `metadata_profile`: The metadata profile to use for exporting metadata
- `temp_directory`: The temp directory to output the JSONL files to before loading to Elasticsearch
- `catch_count`: The number of records to include in each JSONL batch file
- `print_preview`: Whether or not to export print previews into binary fields of the print index (set to `true` or `false`)
- `print_preview_page_limit`: Limit the number of print preview pages to be stored into elasticsearch in binary fields

## Usage

1. Open the Nuix case that you want to export metadata from
2. Open a script console and copy the script code into it
3. Set the configuration variables in the script as necessary
4. Run the script
5. Wait for the script to complete
6. Load the JSONL files into Elasticsearch using Siren Federate
7. The exported metadata can now be searched and analyzed in Siren Investigate

## Cleanup

After the script has completed, all JSONL files will be deleted and the output and print directories will be removed.

## Disclaimer

This project is not yet officially supported by Siren Solutions and is solely for the purpose of experimentation and exploration by Phil Glod. Siren Solutions makes no warranties or representations regarding the accuracy or completeness of any information contained in this project, and disclaims liability for any damages arising from its use.
