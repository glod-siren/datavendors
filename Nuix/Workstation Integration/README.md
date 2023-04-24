# Nuix Workstation Siren.io Platform Integration

![Siren.io](https://siren.io/wp-content/uploads/img-siren-logo-thumbnail.png)
[Nuix.com](https://www.google.com/url?sa%3Di%26url%3Dhttps%3A%2F%2Finvestors.nuix.com%2F%26psig%3DAOvVaw2fSec1jx3IAqBAPMJMtVPO%26ust%3D1682458028812000%26source%3Dimages%26cd%3Dvfe%26ved%3D0CBAQjRxqFwoTCNDbjNu6w_4CFQAAAAAdAAAAABAE)

**NOTE: This script is still in production and should be used at your own risk.**

## Introduction

This is a "Classic" Push-Style JRuby Nuix Workstation Ruby script for exporting metadata and text from a Nuix case into a Elasticsearch cluster for use with Siren Investigate.
It also supports exporting print previews as base64-encoded images into Elasticsearch.

Delevoped by former Nuix Investigator and former Nuix supreme techincal master, The Legendary General Glod returns into the Nuix fold to bring integration between Siren.io and Nuix. ChatGPT Helped me Speed this along!. Credit also to JuicyDragon (JasonWells) for his NX.jar Helpers that gave me a interface for this (<https://github.com/Nuix/Nx>)

SirenNLP is used to Extract Emails, Cyrpto, URLs, and Phone Numbers, however Nuix Named Entities is also utilized

## Requirements

- Nuix Workstation 9.x and Above <https://www.nuix.com/>
- Elasticsearch with Siren Federate and SirenNLP Plugins <https://siren.io/downloads/?product=siren-federate>
- Siren Investigate <https://siren.io/getting%20started/>

## Installation

1. Copy the `Siren.io Platform Integration` Folder into your Nuix Scripts Directory
2. Edit the `config.yml` as specified below
3. Import the `nuix-siren-saved-objects-yyyy-mm-dd.json` into your Siren Platform
4. Import the Siren Created Nuix Metadata Profile `Siren_Nuix_Export_Metadata_Profile.profile` into Nuix

## Configuration

The following configuration variables need to be set in the script before running:

- `elasticsearch_url`: The URL of the Elasticsearch server
- `elasticsearch_metadata_index`: The prefix name of the Elasticsearch index for the exported metadata, the nuix case guid will be appended to this
- `elasticsearch_print_index`: The prefix name of the Elasticsearch index for the exported print previews, the nuix caes guid will be appended to this
- `username`: The username for basic authentication with Elasticsearch (set to 'noauth' if not required)
- `password`: The password for basic authentication with Elasticsearch (set to 'noauth' if not required)
- `metadata_profile`: The metadata profile to use for exporting metadata
- `temp_directory`: The temp directory to output the JSONL files to before loading to Elasticsearch
- `catch_count`: The number of records to include in each JSONL batch file
- `print_preview`: Whether or not to export print previews into binary fields of the print index (set to `true` or `false`)
- `print_preview_page_limit`: Limit the number of print preview pages to be stored into elasticsearch in binary fields
- `pipeline_files`: These are the pipeline .json files in the `Load Selected Items Into Siren Elastic.nuixscript` folder that will be applied into Elastic, they will overwrite the existing. These should be ready to go for most users.
- `primary_pipeline`: This is the pipeline that will be called by the _bulk operation
- `template_files`: These are the template .json file in the `Load Selected Items Into Siren Elastic.nuixscript` folder that will be applied to Elastic, they will overwrite the existing. These should be ready to go for most users.
- `max_text_length_bytes`: art
- `print_preview_include_kinds`: these are kinds that will exported print previews of (if exists), by default `["Email", "Calendar", "Contact", "Document", "Presentation", "Spreadsheet", "Multimedia", "Image"]`

print_preview_include_kinds: ["Email", "Calendar", "Contact", "Document", "Presentation", "Spreadsheet", "Multimedia", "Image"]

## Usage

After Configuration, Select Items you want to export in Nuix and run the script from the Scripts Menu.

## Temp Folder Cleanup

After the script has completed, all JSONL files will be deleted and the output and print directories will be removed.

## Removing NLP

If you do not wish to use SirenNLP to Extract Crypto and Phone Number the way I do (Maybe instead use Nuix Named Entities), just remove this block from the `nuix_case_metadata_pipeline_v1.json`

```json
        {
            "pipeline": {
                "name": "nuix_case_ner_extraction_v1",
                "ignore_failure": true
            }
        },
```

## Disclaimer

This project is not yet officially supported by Siren Solutions and is solely for the purpose of experimentation and exploration by Phil Glod. Siren Solutions makes no warranties or representations regarding the accuracy or completeness of any information contained in this project, and disclaims liability for any damages arising from its use.
