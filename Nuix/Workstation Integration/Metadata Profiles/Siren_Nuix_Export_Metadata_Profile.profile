<?xml version="1.0" encoding="UTF-8"?>
<metadata-profile xmlns="http://nuix.com/fbi/metadata-profile">
  <metadata-list>
    <metadata type="DERIVED" name="Custodian">
      <metadata type="SPECIAL" name="Custodian" />
    </metadata>
    <metadata type="DERIVED" name="People - To">
      <metadata type="SPECIAL" name="To" />
    </metadata>
    <metadata type="DERIVED" name="People - From">
      <metadata type="SPECIAL" name="From" />
    </metadata>
    <metadata type="DERIVED" name="People - BCC">
      <metadata type="SPECIAL" name="Bcc" />
    </metadata>
    <metadata type="DERIVED" name="People - CC">
      <metadata type="SPECIAL" name="Cc" />
    </metadata>
    <metadata type="DERIVED" name="Document Date" customDateFormat="yyyy-MM-dd'T'HH:mm:ss.SSSZZ">
      <metadata type="SPECIAL" name="Item Date" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] Date Accessed" customDateFormat="yyyy-MM-dd'T'HH:mm:ss.SSSZZ">
      <metadata type="PROPERTY" name="File Accessed" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] Date Appmt Start" customDateFormat="yyyy-MM-dd'T'HH:mm:ss.SSSZZ">
      <first-non-blank>
        <metadata type="PROPERTY" name="Mapi-Cal-Start-Time" />
        <metadata type="PROPERTY" name="STARTDATETIME" />
        <metadata type="PROPERTY" name="Mapi-Lid-Appointment-Start-Whole" />
        <metadata type="PROPERTY" name="Mapi-Lid-Clip-Start" />
        <metadata type="PROPERTY" name="Mapi-Lid-Common-Start" />
        <metadata type="PROPERTY" name="Mapi-Start-Date" />
      </first-non-blank>
    </metadata>
    <metadata type="DERIVED" name="[Meta] Date Appmt End" customDateFormat="yyyy-MM-dd'T'HH:mm:ss.SSSZZ">
      <first-non-blank>
        <metadata type="PROPERTY" name="Mapi-Cal-End-Time" />
        <metadata type="PROPERTY" name="EndDateTime" />
        <metadata type="PROPERTY" name="Mapi-Lid-Appointment-End-Whole" />
        <metadata type="PROPERTY" name="Mapi-Lid-Clip-End" />
        <metadata type="PROPERTY" name="Mapi-Lid-Common-End" />
        <metadata type="PROPERTY" name="Mapi-End-Date" />
      </first-non-blank>
    </metadata>
    <metadata type="DERIVED" name="[Meta] Date Created" customDateFormat="yyyy-MM-dd'T'HH:mm:ss.SSSZZ">
      <first-non-blank>
        <metadata type="PROPERTY" name="File Created" />
        <metadata type="PROPERTY" name="Created" />
        <metadata type="PROPERTY" name="Notes Created" />
      </first-non-blank>
    </metadata>
    <metadata type="DERIVED" name="[Meta] Date Modified" customDateFormat="yyyy-MM-dd'T'HH:mm:ss.SSSZZ">
      <first-non-blank>
        <metadata type="PROPERTY" name="File Modified" />
        <metadata type="PROPERTY" name="PDF Modified Date" />
        <metadata type="PROPERTY" name="Last Saved" />
        <metadata type="PROPERTY" name="Notes Modified" />
      </first-non-blank>
    </metadata>
    <metadata type="DERIVED" name="[Meta] Date Received" customDateFormat="yyyy-MM-dd'T'HH:mm:ss.SSSZZ">
      <first-non-blank>
        <metadata type="PROPERTY" name="Mapi-Message-Delivery-Time" />
        <metadata type="PROPERTY" name="DeliveredDate" />
      </first-non-blank>
    </metadata>
    <metadata type="DERIVED" name="[Meta] Date Sent" customDateFormat="yyyy-MM-dd'T'HH:mm:ss.SSSZZ">
      <first-non-blank>
        <metadata type="PROPERTY" name="Mapi-Client-Submit-Time" />
        <metadata type="PROPERTY" name="PostedDate" />
        <metadata type="PROPERTY" name="DeliveredDate" />
      </first-non-blank>
    </metadata>
    <metadata type="DERIVED" name="[Meta] Date Top Family" customDateFormat="yyyy-MM-dd'T'HH:mm:ss.SSSZZ">
      <metadata type="SPECIAL" name="Top Level Item Date" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] Office Property - Date Last Printed" customDateFormat="yyyy-MM-dd'T'HH:mm:ss.SSSZZ">
      <metadata type="PROPERTY" name="Last Printed" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] Office Property - Date Last Saved" customDateFormat="yyyy-MM-dd'T'HH:mm:ss.SSSZZ">
      <first-non-blank>
        <metadata type="PROPERTY" name="Last Saved" />
        <metadata type="PROPERTY" name="PDF Modified Date" />
      </first-non-blank>
    </metadata>
    <metadata type="DERIVED" name="[Meta] Appmt Location">
      <first-non-blank>
        <metadata type="PROPERTY" name="Mapi-Lid-Where" />
        <metadata type="PROPERTY" name="Location" />
      </first-non-blank>
    </metadata>
    <metadata type="DERIVED" name="[Meta] Appmt Optional Attendees">
      <first-non-blank>
        <metadata type="PROPERTY" name="Mapi-Lid-Cc-Attendees-String" />
        <metadata type="PROPERTY" name="OptionalAttendees" />
        <metadata type="PROPERTY" name="INetOptionalNames" />
      </first-non-blank>
    </metadata>
    <metadata type="DERIVED" name="[Meta] Appmt Required Attendees">
      <first-non-blank>
        <metadata type="PROPERTY" name="Mapi-Lid-To-Attendees-String" />
        <metadata type="PROPERTY" name="RequiredAttendees" />
        <metadata type="PROPERTY" name="INetRequiredNames" />
      </first-non-blank>
    </metadata>
    <metadata type="DERIVED" name="[Meta] Conversation Index">
      <metadata type="PROPERTY" name="Mapi-Conversation-Index" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] Conversation Topic">
      <metadata type="PROPERTY" name="Mapi-Conversation-Topic" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] Email Folder">
      <first-non-blank>
        <metadata type="PROPERTY" name="Mapi-x-folder" />
        <metadata type="PROPERTY" name="X-Folder" />
      </first-non-blank>
    </metadata>
    <metadata type="DERIVED" name="[Meta] File Path">
      <metadata type="SPECIAL" name="Path Name" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] Mapi-DeliveredTo">
      <metadata type="PROPERTY" name="Mapi-delivered-to" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] Office Property - Comments">
      <metadata type="PROPERTY" name="Comments" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] File Size">
      <scripted-expression>
        <type>ruby</type>
        <script><![CDATA[item = $current_item
(item.getFileSize() == nil || item.getFileSize() < 0) ?
(item.getDigests().getInputSize() >= 0 ? item.getDigests().getInputSize() : 0) :
item.getFileSize()]]></script>
      </scripted-expression>
    </metadata>
    <metadata type="DERIVED" name="[Meta] Office Exceptions - Excel Hidden Sheet Count">
      <metadata type="PROPERTY" name="Excel Hidden Sheets Count" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] Office Exceptions - Notes Count">
      <metadata type="PROPERTY" name="Notes" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] Word-Pdf-Image Page Count">
      <metadata type="PROPERTY" name="Page Count" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] Email Delivery Receipt Request">
      <metadata type="PROPERTY" name="Mapi-Originator-Delivery-Report-Requested" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] Email Importance">
      <metadata type="PROPERTY" name="Mapi-Priority" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] Email Read Receipt Request">
      <metadata type="PROPERTY" name="Mapi-Read-Receipt-Requested" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] Email Sensitivity">
      <metadata type="PROPERTY" name="Mapi-Sensitivity" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] File Application">
      <metadata type="SPECIAL" name="File Type" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] File Extension - Original">
      <metadata type="SPECIAL" name="File Extension (Original)" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] Languages">
      <metadata type="SPECIAL" name="Language" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] PDF - Encryption Level">
      <first-non-blank>
        <metadata type="PROPERTY" name="PDF Encryption Level" />
      </first-non-blank>
    </metadata>
    <metadata type="DERIVED" name="[Meta] PDF - Portfolio">
      <first-non-blank>
        <metadata type="PROPERTY" name="PDF Portfolio" />
      </first-non-blank>
    </metadata>
    <metadata type="DERIVED" name="[Meta] Processing Time Zone" customDateFormat="zzzz">
      <metadata type="SPECIAL" name="Item Date" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] Document Category">
      <metadata type="SPECIAL" name="Item Category" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] Document Kind">
      <metadata type="SPECIAL" name="Kind" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] Entity">
      <metadata type="SPECIAL" name="Entity.credit-card-num" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] File Extension - Loaded">
      <metadata type="SPECIAL" name="File Extension (Corrected)" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] GUID">
      <metadata type="SPECIAL" name="GUID" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] GUID - Parent">
      <metadata type="SPECIAL" name="Parent GUID" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] Appmt Organizer">
      <first-non-blank>
        <metadata type="PROPERTY" name="Mapi-Sender-Name" />
        <metadata type="PROPERTY" name="From" />
        <metadata type="PROPERTY" name="INetFrom" />
      </first-non-blank>
    </metadata>
    <metadata type="DERIVED" name="[Meta] Email Message ID">
      <first-non-blank>
        <metadata type="PROPERTY" name="Mapi-Smtp-Message-Id" />
        <metadata type="PROPERTY" name="$MessageID" />
      </first-non-blank>
    </metadata>
    <metadata type="DERIVED" name="[Meta] Email Message ID Replied To">
      <metadata type="PROPERTY" name="Mapi-In-Reply-To" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] EntryID">
      <metadata type="PROPERTY" name="Mapi-EntryID" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] File Name">
      <metadata type="SPECIAL" name="Name" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] Mapi-Message-Flags">
      <metadata type="PROPERTY" name="Mapi-Message-Flags" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] Office Property - Author">
      <metadata type="PROPERTY" name="Author" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] Office Property - Company">
      <metadata type="PROPERTY" name="Company" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] Office Property - Date Last Printed Time" customDateFormat="yyyy-MM-dd'T'HH:mm:ss.SSSZZ">
      <metadata type="PROPERTY" name="Last Printed" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] Office Property - Last Author Saved By">
      <metadata type="PROPERTY" name="Last Author" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] Office Property - Title">
      <metadata type="PROPERTY" name="Title" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] Revision Number">
      <metadata type="PROPERTY" name="Revision Number" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] SHA-1">
      <metadata type="SPECIAL" name="SHA-1 Digest" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] SHA-256">
      <metadata type="SPECIAL" name="SHA-256 Digest" />
    </metadata>
    <metadata type="DERIVED" name="MD5 Hash">
      <metadata type="SPECIAL" name="MD5 Digest" />
    </metadata>
    <metadata type="DERIVED" name="[Meta] Subject">
      <first-non-blank>
        <metadata type="PROPERTY" name="Subject" />
        <metadata type="PROPERTY" name="Mapi-Subject" />
      </first-non-blank>
    </metadata>
    <metadata type="DERIVED" name="[Meta] NSF UNID">
      <metadata type="PROPERTY" name="Unid" />
    </metadata>
    <metadata type="SPECIAL" name="[Meta] Office Exceptions">
      <scripted-expression>
        <type>ruby</type>
        <script><![CDATA[props = $current_item.getProperties
rtOfficeExceptionsArr = Array.new
rtOfficeExceptionsArr << "Contains Comments" if props["Contains Comments"]
rtOfficeExceptionsArr << "Contains Hidden Slides" if props["Contains Hidden Slides"]
rtOfficeExceptionsArr << "Contains Hidden Text" if props["Contains Hidden Text"]
rtOfficeExceptionsArr << "Contains White Text" if props["Contains White Text"]
rtOfficeExceptionsArr << "Excel Hidden Columns" if props["Excel Hidden Columns"]
rtOfficeExceptionsArr << "Excel Hidden Rows" if props["Excel Hidden Rows"]
rtOfficeExceptionsArr << "Excel Hidden Sheets" if props["Excel Hidden Sheets"]
rtOfficeExceptionsArr << "Excel Hidden Workbook" if props["Excel Hidden Workbook"]
rtOfficeExceptionsArr << "Excel Protected Sheets" if props["Excel Protected Sheets"]
rtOfficeExceptionsArr << "Excel Very Hidden Sheets" if props["Excel Very Hidden Sheets"]
rtOfficeExceptionsArr << "Excel Workbook Write Protected" if props["Excel Workbook Write Protected"]
rtOfficeExceptionsArr << "Excel Print Areas" if props["Excel Print Areas"]
rtOfficeExceptionsArr << "Track Changes" if props["Contains Track Changes"] || props["Track Changes"]

return rtOfficeExceptionsArr.join(";")]]></script>
      </scripted-expression>
    </metadata>
    <metadata type="DERIVED" name="[Nuix] File Exception">
      <first-non-blank>
        <metadata type="PROPERTY" name="FailureDetail" />
        <metadata type="PROPERTY" name="FailureMessage" />
      </first-non-blank>
    </metadata>
    <metadata type="SPECIAL" name="[Meta] Processing Exceptions">
      <scripted-expression>
        <type>ruby</type>
        <script><![CDATA[kindStr = $current_item.getKind().getName
typeStr = $current_item.getType().getName
enc = $current_item.isEncrypted
txtStored = $current_item.getTextObject.isStored

rtProcExceptionsArr = Array.new
rtProcExceptionsArr << "Corrupted" if $current_item.getProperties.has_key?("FailureDetail") && enc == false
#rtProcExceptionsArr << "Date Type Conversion Failed"
rtProcExceptionsArr << "Database" if kindStr == "database"
#rtProcExceptionsArr << "Databases"
rtProcExceptionsArr << "Deleted Item" if $current_item.isDeleted
rtProcExceptionsArr << "Empty File" if typeStr == "application/x-empty"
rtProcExceptionsArr << "Encrypted" if enc
#rtProcExceptionsArr << "Export Failed"
#rtProcExceptionsArr << "Export Slipsheet"
rtProcExceptionsArr << "Extracted Text Only" if txtStored && $current_item.isFileData == false
#rtProcExceptionsArr << "Field Date Extraction Error"
#rtProcExceptionsArr << "Field Date Truncated"
#rtProcExceptionsArr << "File copy failed"
rtProcExceptionsArr << "Inaccessible Content" if typeStr == "filesystem/inaccessible"
#rtProcExceptionsArr << "License Restricted"
rtProcExceptionsArr << "Missing Hash Value" if $current_item.getDigests().empty? && $current_item.isFileData
rtProcExceptionsArr << "Multimedia" if kindStr == "multimedia"
#rtProcExceptionsArr << "NIST Item"
#rtProcExceptionsArr << "Non-Business Document"
rtProcExceptionsArr << "Non-Searchable PDF" if typeStr == "application/pdf" && enc == false && txtStored == false
rtProcExceptionsArr << "Renamed Extension" unless $current_item.getCorrectedExtension.eql?($current_item.getOriginalExtension) || $current_item.getName == ""
rtProcExceptionsArr << "System File" if kindStr == "system"
#rtProcExceptionsArr << "Text Stripped"
rtProcExceptionsArr << "Unknown Binary" if typeStr == "application/octet-stream"
return rtProcExceptionsArr.join(";")]]></script>
      </scripted-expression>
    </metadata>
    <metadata type="SPECIAL" name="Entity.company" />
    <metadata type="SPECIAL" name="Entity.country" />
    <metadata type="SPECIAL" name="Entity.credit-card-num" />
    <metadata type="SPECIAL" name="Entity.email" />
    <metadata type="SPECIAL" name="Entity.ip-address" />
    <metadata type="SPECIAL" name="Entity.money" />
    <metadata type="SPECIAL" name="Entity.person" />
    <metadata type="SPECIAL" name="Entity.personal-id-num" />
    <metadata type="SPECIAL" name="Entity.phone-number" />
    <metadata type="SPECIAL" name="Entity.url" />
    <metadata type="SPECIAL" name="Tags" />
    <metadata type="SPECIAL" name="ItemSets" />
    <metadata type="SPECIAL" name="ItemSetsAsDuplicate" />
    <metadata type="SPECIAL" name="ItemSetsAsOriginal" />
    <metadata type="SPECIAL" name="Binary Path" />
    <metadata type="SPECIAL" name="Parent GUID" />
    <metadata type="SPECIAL" name="Batch Load GUID" />
    <metadata type="SPECIAL" name="Case Guid" />
    <metadata type="SPECIAL" name="GUID" />
    <metadata type="SPECIAL" name="Near-Duplicate Guids" />
    <metadata type="SPECIAL" name="Top Level GUID" />
    <metadata type="SPECIAL" name="URI" />
    <metadata type="SPECIAL" name="DocumentIds" />
    <metadata type="DERIVED" name="geo_location.lat">
      <first-non-blank>
        <metadata type="PROPERTY" name="Latitude" />
      </first-non-blank>
    </metadata>
    <metadata type="DERIVED" name="geo_location.lon">
      <first-non-blank>
        <metadata type="PROPERTY" name="Longitude" />
      </first-non-blank>
    </metadata>
    <metadata type="SPECIAL" name="Audited" />
    <metadata type="PROPERTY" name="File Group" />
    <metadata type="PROPERTY" name="File Group SID" />
    <metadata type="PROPERTY" name="File Owner" />
    <metadata type="PROPERTY" name="File Owner SID" />
    <metadata type="SPECIAL" name="AutomaticClassifications" />
    <metadata type="SPECIAL" name="AutomaticClassifierConfidence" />
    <metadata type="SPECIAL" name="AutomaticClassifierGainConfidence" />
    <metadata type="SPECIAL" name="flag.inline" />
    <metadata type="SPECIAL" name="PhotoDNA Robust Hash" />
    <metadata type="SPECIAL" name="PDF Generation Method" />
    <metadata type="SPECIAL" name="PDF Page Count" />
    <metadata type="SPECIAL" name="Printed Image Path" />
    <metadata type="SPECIAL" name="SkinTone" />
    <metadata type="SPECIAL" name="flag.slack_space" />
    <metadata type="SPECIAL" name="SSDeep Fuzzy Hash" />
    <metadata type="SPECIAL" name="ReviewedClassifications" />
    <metadata type="PROPERTY" name="Latitude" />
    <metadata type="PROPERTY" name="Longitude" />
    <metadata type="PROPERTY" name="Elevation" />
    <metadata type="PROPERTY" name="Activation State" />
    <metadata type="PROPERTY" name="Activation Time" />
    <metadata type="PROPERTY" name="ADB ID" />
    <metadata type="PROPERTY" name="Advertising ID" />
    <metadata type="PROPERTY" name="Advertising ID (IDFA)" />
    <metadata type="PROPERTY" name="Bluetooth MAC Address" />
    <metadata type="PROPERTY" name="Bluetooth Name" />
    <metadata type="PROPERTY" name="Device Lock Value" />
    <metadata type="PROPERTY" name="Device Manufacturer" />
    <metadata type="PROPERTY" name="Device Model" />
    <metadata type="PROPERTY" name="Device Model Number" />
    <metadata type="PROPERTY" name="Device Name" />
    <metadata type="PROPERTY" name="Device Owner" />
    <metadata type="PROPERTY" name="Device Platform" />
    <metadata type="PROPERTY" name="Device Platform Version" />
    <metadata type="PROPERTY" name="Device Time" />
    <metadata type="PROPERTY" name="Device Time Zone" />
    <metadata type="PROPERTY" name="Factory Number" />
    <metadata type="PROPERTY" name="Last Used MSISDN" />
    <metadata type="PROPERTY" name="MSISDN" />
    <metadata type="PROPERTY" name="MSISDN Type" />
    <metadata type="PROPERTY" name="IMSI" />
    <metadata type="PROPERTY" name="ICCID" />
    <metadata type="PROPERTY" name="Last Used ICCID" />
    <metadata type="PROPERTY" name="Ethernet MAC Address" />
    <metadata type="PROPERTY" name="Indirizzo MAC" />
    <metadata type="PROPERTY" name="Indirizzo MAC Bluetooth" />
    <metadata type="PROPERTY" name="MAC Address" />
    <metadata type="PROPERTY" name="Machine Name" />
    <metadata type="PROPERTY" name="WiFi MAC Address" />
    <metadata type="PROPERTY" name="Location Services Enabled" />
    <metadata type="PROPERTY" name="OS Version" />
    <metadata type="PROPERTY" name="User Selected Device" />
    <metadata type="PROPERTY" name="User Selected Manufacturer" />
    <metadata type="PROPERTY" name="Cellebrite AccessGroup" />
    <metadata type="PROPERTY" name="Cellebrite Account" />
    <metadata type="PROPERTY" name="Cellebrite AccountLocationAffiliation" />
    <metadata type="PROPERTY" name="Cellebrite ActivationCount" />
    <metadata type="PROPERTY" name="Cellebrite ActiveTime" />
    <metadata type="PROPERTY" name="Cellebrite AdditionalInfo" />
    <metadata type="PROPERTY" name="Cellebrite AggregatedLocationsCount" />
    <metadata type="PROPERTY" name="Cellebrite AliasNames" />
    <metadata type="PROPERTY" name="Cellebrite AppGUID" />
    <metadata type="PROPERTY" name="Cellebrite Application" />
    <metadata type="PROPERTY" name="Cellebrite AssociatedDirectoryPaths" />
    <metadata type="PROPERTY" name="Cellebrite attachment_extracted_path" />
    <metadata type="PROPERTY" name="Cellebrite Availability" />
    <metadata type="PROPERTY" name="Cellebrite BackgroundTime" />
    <metadata type="PROPERTY" name="Cellebrite Bcc" />
    <metadata type="PROPERTY" name="Cellebrite Body" />
    <metadata type="PROPERTY" name="Cellebrite BytesReceived" />
    <metadata type="PROPERTY" name="Cellebrite CanRebuildCacheFile" />
    <metadata type="PROPERTY" name="Cellebrite Categories" />
    <metadata type="PROPERTY" name="Cellebrite Category" />
    <metadata type="PROPERTY" name="Cellebrite Cc" />
    <metadata type="PROPERTY" name="Cellebrite Cellebrite decodedBy" />
    <metadata type="PROPERTY" name="Cellebrite Cellebrite deleted" />
    <metadata type="PROPERTY" name="Cellebrite Cellebrite embedded" />
    <metadata type="PROPERTY" name="Cellebrite Cellebrite extractionId" />
    <metadata type="PROPERTY" name="Cellebrite Cellebrite fs" />
    <metadata type="PROPERTY" name="Cellebrite Cellebrite fsid" />
    <metadata type="PROPERTY" name="Cellebrite Cellebrite id" />
    <metadata type="PROPERTY" name="Cellebrite Cellebrite isrelated" />
    <metadata type="PROPERTY" name="Cellebrite Cellebrite source_index" />
    <metadata type="PROPERTY" name="Cellebrite CellularWAN" />
    <metadata type="PROPERTY" name="Cellebrite Charset" />
    <metadata type="PROPERTY" name="Cellebrite CID" />
    <metadata type="PROPERTY" name="Cellebrite City" />
    <metadata type="PROPERTY" name="Cellebrite Class" />
    <metadata type="PROPERTY" name="Cellebrite CommentCount" />
    <metadata type="PROPERTY" name="Cellebrite Confidence" />
    <metadata type="PROPERTY" name="Cellebrite ConnectivityMethod" />
    <metadata type="PROPERTY" name="Cellebrite ConnectivityNature" />
    <metadata type="PROPERTY" name="Cellebrite contactphoto_extracted_path" />
    <metadata type="PROPERTY" name="Cellebrite ContentType" />
    <metadata type="PROPERTY" name="Cellebrite Copyright" />
    <metadata type="PROPERTY" name="Cellebrite Country" />
    <metadata type="PROPERTY" name="Cellebrite CreationTime" />
    <metadata type="PROPERTY" name="Cellebrite Data" />
    <metadata type="PROPERTY" name="Cellebrite Date" />
    <metadata type="PROPERTY" name="Cellebrite DateSampled" />
    <metadata type="PROPERTY" name="Cellebrite decodedApplication" />
    <metadata type="PROPERTY" name="Cellebrite decodedBy" />
    <metadata type="PROPERTY" name="Cellebrite DecodingStatus" />
    <metadata type="PROPERTY" name="Cellebrite deleted" />
    <metadata type="PROPERTY" name="Cellebrite deleted_state" />
    <metadata type="PROPERTY" name="Cellebrite Delivered" />
    <metadata type="PROPERTY" name="Cellebrite Details" />
    <metadata type="PROPERTY" name="Cellebrite DeviceIP" />
    <metadata type="PROPERTY" name="Cellebrite DeviceLocationAffiliation" />
    <metadata type="PROPERTY" name="Cellebrite DeviceName" />
    <metadata type="PROPERTY" name="Cellebrite DeviceType" />
    <metadata type="PROPERTY" name="Cellebrite Distance" />
    <metadata type="PROPERTY" name="Cellebrite DistanceTraveled" />
    <metadata type="PROPERTY" name="Cellebrite DNSAddresses" />
    <metadata type="PROPERTY" name="Cellebrite Domain" />
    <metadata type="PROPERTY" name="Cellebrite DownloadState" />
    <metadata type="PROPERTY" name="Cellebrite DownloadURLChains" />
    <metadata type="PROPERTY" name="Cellebrite embedded" />
    <metadata type="PROPERTY" name="Cellebrite EventType" />
    <metadata type="PROPERTY" name="Cellebrite Expiry" />
    <metadata type="PROPERTY" name="Cellebrite extractionId" />
    <metadata type="PROPERTY" name="Cellebrite File Accessed" />
    <metadata type="PROPERTY" name="Cellebrite File Created" />
    <metadata type="PROPERTY" name="Cellebrite File Local Path" />
    <metadata type="PROPERTY" name="Cellebrite File Modified" />
    <metadata type="PROPERTY" name="Cellebrite File SHA256" />
    <metadata type="PROPERTY" name="Cellebrite File Tags" />
    <metadata type="PROPERTY" name="Cellebrite file_id" />
    <metadata type="PROPERTY" name="Cellebrite Filename" />
    <metadata type="PROPERTY" name="Cellebrite FileSize" />
    <metadata type="PROPERTY" name="Cellebrite FlightsClimbed" />
    <metadata type="PROPERTY" name="Cellebrite Frequency" />
    <metadata type="PROPERTY" name="Cellebrite From" />
    <metadata type="PROPERTY" name="Cellebrite fs" />
    <metadata type="PROPERTY" name="Cellebrite fsid" />
    <metadata type="PROPERTY" name="Cellebrite GenericAttribute" />
    <metadata type="PROPERTY" name="Cellebrite GpsHorizontalAccuracy" />
    <metadata type="PROPERTY" name="Cellebrite Group" />
    <metadata type="PROPERTY" name="Cellebrite id" />
    <metadata type="PROPERTY" name="Cellebrite Id" />
    <metadata type="PROPERTY" name="Cellebrite Identifier" />
    <metadata type="PROPERTY" name="Cellebrite IdInOrigin" />
    <metadata type="PROPERTY" name="Cellebrite InteractionStatuses" />
    <metadata type="PROPERTY" name="Cellebrite IsEmulatable" />
    <metadata type="PROPERTY" name="Cellebrite IsFromActivityLog" />
    <metadata type="PROPERTY" name="Cellebrite isNative" />
    <metadata type="PROPERTY" name="Cellebrite IsPhoneOwner" />
    <metadata type="PROPERTY" name="Cellebrite isrelated" />
    <metadata type="PROPERTY" name="Cellebrite Jump Target Target ID is model" />
    <metadata type="PROPERTY" name="Cellebrite Jump Target Target ID value" />
    <metadata type="PROPERTY" name="Cellebrite Key" />
    <metadata type="PROPERTY" name="Cellebrite Label" />
    <metadata type="PROPERTY" name="Cellebrite labels" />
    <metadata type="PROPERTY" name="Cellebrite Labels" />
    <metadata type="PROPERTY" name="Cellebrite LAC" />
    <metadata type="PROPERTY" name="Cellebrite LastAccessed" />
    <metadata type="PROPERTY" name="Cellebrite LastAccessTime" />
    <metadata type="PROPERTY" name="Cellebrite LastActivity" />
    <metadata type="PROPERTY" name="Cellebrite LastConnection" />
    <metadata type="PROPERTY" name="Cellebrite LastLaunch" />
    <metadata type="PROPERTY" name="Cellebrite LastUsedDate" />
    <metadata type="PROPERTY" name="Cellebrite LaunchCount" />
    <metadata type="PROPERTY" name="Cellebrite Local Path" />
    <metadata type="PROPERTY" name="Cellebrite Location" />
    <metadata type="PROPERTY" name="Cellebrite Map" />
    <metadata type="PROPERTY" name="Cellebrite MCC" />
    <metadata type="PROPERTY" name="Cellebrite MeasuredVariableType" />
    <metadata type="PROPERTY" name="Cellebrite MetaData" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ANI" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ApertureValue" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Author" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Camera Make" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Camera Model" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Capture Time" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Chunks" />
    <metadata type="PROPERTY" name="Cellebrite MetaData clen" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ColorSpace" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.assetsd.addedDate" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.assetsd.assetType" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.assetsd.avalanche.type" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.assetsd.avalanche.UUID" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.assetsd.cloudAsset.UUID" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.assetsd.creatorBundleID" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.assetsd.customCreationDate" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.assetsd.customLocation" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.assetsd.dbRebuildUuid" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.assetsd.deferredProcessing" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.assetsd.description" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.assetsd.extraDurationData" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.assetsd.favorite" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.assetsd.grouping.state" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.assetsd.hidden" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.assetsd.importedBy" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.assetsd.importedByDisplayName" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.assetsd.inProgress.publishable" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.assetsd.mediaGroupUUID" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.assetsd.originalFilename" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.assetsd.publicGlobalUUID" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.assetsd.thumbnailCameraPreviewImageAssetID" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.assetsd.timeZoneName" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.assetsd.timeZoneOffset" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.assetsd.trashed" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.assetsd.UUID" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.assetsd.videoComplementVisibility" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.cpl.delete" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.cscachefs" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.GeoServices.SHA1" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.icloud.itemName" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.install_session_uuid" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.install_uuid" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.metadata:com_apple_backup_excludeItem" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.metadata:com_apple_cloudBackup_excludeItem" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.metadata:com_apple_unencryptedBackup_excludeItem" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.MobileBackup" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.newscore.storeVersion" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.photos.captureMode" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.photos.variation-identifier" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.quicktime.camera.framereadouttimeinmicroseconds" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.quicktime.camera.identifier" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.quicktime.content.identifier" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.quicktime.live-photo.auto" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.quicktime.live-photo.vitality-score" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.quicktime.live-photo.vitality-scoring-version" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.quicktime.location.accuracy.horizontal" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.system.cprotect" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.TextEncoding" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.voicememos.audioDigest#C" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.apple.voicememos.audioFlags#N" />
    <metadata type="PROPERTY" name="Cellebrite MetaData com.whatsapp.original" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ComponentsConfiguration" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ContentIdentifier" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Copyright" />
    <metadata type="PROPERTY" name="Cellebrite MetaData CoreFileSystemFileSystemNodeChangeTime" />
    <metadata type="PROPERTY" name="Cellebrite MetaData CoreFileSystemFileSystemNodeCreationTime" />
    <metadata type="PROPERTY" name="Cellebrite MetaData CoreFileSystemFileSystemNodeDeletedTime" />
    <metadata type="PROPERTY" name="Cellebrite MetaData CoreFileSystemFileSystemNodeFileChunks" />
    <metadata type="PROPERTY" name="Cellebrite MetaData CoreFileSystemFileSystemNodeFileDataOffsetName" />
    <metadata type="PROPERTY" name="Cellebrite MetaData CoreFileSystemFileSystemNodeLastAccessTime" />
    <metadata type="PROPERTY" name="Cellebrite MetaData CoreFileSystemFileSystemNodeModifyTime" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Creation Date" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Creation time" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Creation Time" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Data offset" />
    <metadata type="PROPERTY" name="Cellebrite MetaData DateTime" />
    <metadata type="PROPERTY" name="Cellebrite MetaData DateTimeDigitized" />
    <metadata type="PROPERTY" name="Cellebrite MetaData DateTimeOriginal" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Day_Seq" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Device" />
    <metadata type="PROPERTY" name="Cellebrite MetaData DeviceSettingDescription" />
    <metadata type="PROPERTY" name="Cellebrite MetaData disk-cache-file-attr" />
    <metadata type="PROPERTY" name="Cellebrite MetaData dX" />
    <metadata type="PROPERTY" name="Cellebrite MetaData dY" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Encrypted File Path" />
    <metadata type="PROPERTY" name="Cellebrite MetaData EXIFCameraMaker" />
    <metadata type="PROPERTY" name="Cellebrite MetaData EXIFCameraModel" />
    <metadata type="PROPERTY" name="Cellebrite MetaData EXIFCaptureTime" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumApertureValue" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumArtist" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumBitsPerSample" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumBrightnessValue" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumCFAPattern" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumColorSpace" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumComponentsConfiguration" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumCompressedBitsPerPixel" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumCompression" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumContrast" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumCopyright" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumCustomRendered" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumDateTime" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumDateTimeDigitized" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumDateTimeOriginal" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumDeviceSettingDescription" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumDigitalZoomRatio" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumExifVersion" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumExposureBiasValue" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumExposureIndex" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumExposureMode" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumExposureProgram" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumExposureTime" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumFileSource" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumFlash" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumFlashpixVersion" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumFNumber" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumFocalLength" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumFocalLengthIn35mmFilm" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumFocalPlaneResolutionUnit" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumFocalPlaneXResolution" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumFocalPlaneYResolution" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumGainControl" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumGPSAltitude" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumGPSAltitudeRef" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumGPSDateStamp" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumGPSDestBearing" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumGPSDestBearingRef" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumGPSDOP" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumGPSImgDirection" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumGPSImgDirectionRef" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumGPSLatitude" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumGPSLatitudeRef" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumGPSLongitude" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumGPSLongitudeRef" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumGPSMapDatum" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumGPSProcessingMethod" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumGPSSpeed" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumGPSSpeedRef" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumGPSTimeStamp" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumGPSVersionID" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumImageDescription" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumImageLength" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumImageUniqueID" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumImageWidth" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumISOSpeedRatings" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumJPEGInterchangeFormat" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumJPEGInterchangeFormatLength" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumLightSource" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumMake" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumMaxApertureValue" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumMeteringMode" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumModel" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumOrientation" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumPhotometricInterpretation" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumPixelXDimension" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumPixelYDimension" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumPlanarConfiguration" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumResolutionUnit" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumSamplesPerPixel" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumSaturation" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumSceneCaptureType" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumSceneType" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumSensingMethod" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumSharpness" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumShutterSpeedValue" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumSoftware" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumSubjectArea" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumSubjectDistance" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumSubjectDistanceRange" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumSubsecTime" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumSubsecTimeDigitized" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumSubsecTimeOriginal" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumWhiteBalance" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumXResolution" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumYCbCrPositioning" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumYCbCrSubSampling" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifEnumYResolution" />
    <metadata type="PROPERTY" name="Cellebrite MetaData EXIFOrientation" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExifVersion" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExposureMode" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExposureProgram" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ExposureTime" />
    <metadata type="PROPERTY" name="Cellebrite MetaData File size" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Flash" />
    <metadata type="PROPERTY" name="Cellebrite MetaData FlashpixVersion" />
    <metadata type="PROPERTY" name="Cellebrite MetaData FNumber" />
    <metadata type="PROPERTY" name="Cellebrite MetaData FocalLength" />
    <metadata type="PROPERTY" name="Cellebrite MetaData gallery-icon-snap-id" />
    <metadata type="PROPERTY" name="Cellebrite MetaData GlobalNumberOfFiles" />
    <metadata type="PROPERTY" name="Cellebrite MetaData GPSAltitude" />
    <metadata type="PROPERTY" name="Cellebrite MetaData GPSAltitudeRef" />
    <metadata type="PROPERTY" name="Cellebrite MetaData GPSImgDirection" />
    <metadata type="PROPERTY" name="Cellebrite MetaData GPSImgDirectionRef" />
    <metadata type="PROPERTY" name="Cellebrite MetaData GPSLatitude" />
    <metadata type="PROPERTY" name="Cellebrite MetaData GPSLatitudeRef" />
    <metadata type="PROPERTY" name="Cellebrite MetaData GPSLongitude" />
    <metadata type="PROPERTY" name="Cellebrite MetaData GPSLongitudeRef" />
    <metadata type="PROPERTY" name="Cellebrite MetaData GPSTimeStamp" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Information" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Inode Number" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Install" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ISOSpeedRatings" />
    <metadata type="PROPERTY" name="Cellebrite MetaData kSCManagedObjectModelHash" />
    <metadata type="PROPERTY" name="Cellebrite MetaData LAD" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Lat/Lon" />
    <metadata type="PROPERTY" name="Cellebrite MetaData LightSource" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Link Path" />
    <metadata type="PROPERTY" name="Cellebrite MetaData LMD" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Location" />
    <metadata type="PROPERTY" name="Cellebrite MetaData lumberjack.log.archived" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Make" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Memory" />
    <metadata type="PROPERTY" name="Cellebrite MetaData MetaDataLatitudeAndLongitude" />
    <metadata type="PROPERTY" name="Cellebrite MetaData MetaDataPixelResolution" />
    <metadata type="PROPERTY" name="Cellebrite MetaData MetaDataResolution" />
    <metadata type="PROPERTY" name="Cellebrite MetaData MeteringMode" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Model" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Modify time" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Orientation" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Owner GID" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Owner UID" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Pixel resolution" />
    <metadata type="PROPERTY" name="Cellebrite MetaData PixelXDimension" />
    <metadata type="PROPERTY" name="Cellebrite MetaData PixelYDimension" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Protection class" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ReportTemplateFileSize" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Resolution" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ResolutionUnit" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Row count" />
    <metadata type="PROPERTY" name="Cellebrite MetaData SceneCaptureType" />
    <metadata type="PROPERTY" name="Cellebrite MetaData SensingMethod" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Sharpness" />
    <metadata type="PROPERTY" name="Cellebrite MetaData ShutterSpeedValue" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Software" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Software Used to Create" />
    <metadata type="PROPERTY" name="Cellebrite MetaData SubjectArea" />
    <metadata type="PROPERTY" name="Cellebrite MetaData SubjectDistance" />
    <metadata type="PROPERTY" name="Cellebrite MetaData TTL" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Uid" />
    <metadata type="PROPERTY" name="Cellebrite MetaData uk.co.thefoundry.Application" />
    <metadata type="PROPERTY" name="Cellebrite MetaData uk.co.thefoundry.ApplicationVersion" />
    <metadata type="PROPERTY" name="Cellebrite MetaData uk.co.thefoundry.Colorspace" />
    <metadata type="PROPERTY" name="Cellebrite MetaData uk.co.thefoundry.Writer" />
    <metadata type="PROPERTY" name="Cellebrite MetaData uk.co.thefoundry.YCbCrMatrix" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Upgrade" />
    <metadata type="PROPERTY" name="Cellebrite MetaData URL" />
    <metadata type="PROPERTY" name="Cellebrite MetaData uTTL" />
    <metadata type="PROPERTY" name="Cellebrite MetaData Version" />
    <metadata type="PROPERTY" name="Cellebrite MetaData WhiteBalance" />
    <metadata type="PROPERTY" name="Cellebrite MetaData XResolution" />
    <metadata type="PROPERTY" name="Cellebrite MetaData YCbCrPositioning" />
    <metadata type="PROPERTY" name="Cellebrite MetaData YResolution" />
    <metadata type="PROPERTY" name="Cellebrite MNC" />
    <metadata type="PROPERTY" name="Cellebrite ModifyTime" />
    <metadata type="PROPERTY" name="Cellebrite Name" />
    <metadata type="PROPERTY" name="Cellebrite Neighborhood" />
    <metadata type="PROPERTY" name="Cellebrite NetworkName" />
    <metadata type="PROPERTY" name="Cellebrite Notes" />
    <metadata type="PROPERTY" name="Cellebrite OperationMode" />
    <metadata type="PROPERTY" name="Cellebrite Origin" />
    <metadata type="PROPERTY" name="Cellebrite Original MD5 Digest" />
    <metadata type="PROPERTY" name="Cellebrite OriginalMessageID" />
    <metadata type="PROPERTY" name="Cellebrite Package" />
    <metadata type="PROPERTY" name="Cellebrite Password" />
    <metadata type="PROPERTY" name="Cellebrite Path" />
    <metadata type="PROPERTY" name="Cellebrite Permissions" />
    <metadata type="PROPERTY" name="Cellebrite Platform" />
    <metadata type="PROPERTY" name="Cellebrite PositionAddress" />
    <metadata type="PROPERTY" name="Cellebrite PostalCode" />
    <metadata type="PROPERTY" name="Cellebrite Precision" />
    <metadata type="PROPERTY" name="Cellebrite Priority" />
    <metadata type="PROPERTY" name="Cellebrite PrivacySetting" />
    <metadata type="PROPERTY" name="Cellebrite Project ID" />
    <metadata type="PROPERTY" name="Cellebrite Project Name" />
    <metadata type="PROPERTY" name="Cellebrite PurchaseDate" />
    <metadata type="PROPERTY" name="Cellebrite PurchaseTime" />
    <metadata type="PROPERTY" name="Cellebrite Quantity" />
    <metadata type="PROPERTY" name="Cellebrite ReactionsCount" />
    <metadata type="PROPERTY" name="Cellebrite RelatedApplication" />
    <metadata type="PROPERTY" name="Cellebrite Reminders" />
    <metadata type="PROPERTY" name="Cellebrite RepeatDay" />
    <metadata type="PROPERTY" name="Cellebrite RepeatInterval" />
    <metadata type="PROPERTY" name="Cellebrite RepeatRule" />
    <metadata type="PROPERTY" name="Cellebrite RepeatUntil" />
    <metadata type="PROPERTY" name="Cellebrite Role" />
    <metadata type="PROPERTY" name="Cellebrite RouterAddress" />
    <metadata type="PROPERTY" name="Cellebrite SampleSource" />
    <metadata type="PROPERTY" name="Cellebrite SearchResults" />
    <metadata type="PROPERTY" name="Cellebrite SecurityMode" />
    <metadata type="PROPERTY" name="Cellebrite SerialNumber" />
    <metadata type="PROPERTY" name="Cellebrite Server" />
    <metadata type="PROPERTY" name="Cellebrite ServerAddress" />
    <metadata type="PROPERTY" name="Cellebrite Service" />
    <metadata type="PROPERTY" name="Cellebrite ServiceType" />
    <metadata type="PROPERTY" name="Cellebrite SharesCount" />
    <metadata type="PROPERTY" name="Cellebrite SMSC" />
    <metadata type="PROPERTY" name="Cellebrite Snippet" />
    <metadata type="PROPERTY" name="Cellebrite SocialActivityType" />
    <metadata type="PROPERTY" name="Cellebrite Source Models Owner ID" />
    <metadata type="PROPERTY" name="Cellebrite Source Models Owner ID Direction" />
    <metadata type="PROPERTY" name="Cellebrite source_index" />
    <metadata type="PROPERTY" name="Cellebrite SourceDeviceType" />
    <metadata type="PROPERTY" name="Cellebrite State" />
    <metadata type="PROPERTY" name="Cellebrite Status" />
    <metadata type="PROPERTY" name="Cellebrite Steps" />
    <metadata type="PROPERTY" name="Cellebrite Street1" />
    <metadata type="PROPERTY" name="Cellebrite Street2" />
    <metadata type="PROPERTY" name="Cellebrite SubModule" />
    <metadata type="PROPERTY" name="Cellebrite Summary" />
    <metadata type="PROPERTY" name="Cellebrite Tags" />
    <metadata type="PROPERTY" name="Cellebrite TargetPath" />
    <metadata type="PROPERTY" name="Cellebrite Text" />
    <metadata type="PROPERTY" name="Cellebrite TimeCreated" />
    <metadata type="PROPERTY" name="Cellebrite TimeLastLoggedIn" />
    <metadata type="PROPERTY" name="Cellebrite TimeModified" />
    <metadata type="PROPERTY" name="Cellebrite To" />
    <metadata type="PROPERTY" name="Cellebrite TotalSampleCount" />
    <metadata type="PROPERTY" name="Cellebrite type" />
    <metadata type="PROPERTY" name="Cellebrite Type" />
    <metadata type="PROPERTY" name="Cellebrite Unit" />
    <metadata type="PROPERTY" name="Cellebrite URL" />
    <metadata type="PROPERTY" name="Cellebrite UrlCacheFile" />
    <metadata type="PROPERTY" name="Cellebrite UsagePattern" />
    <metadata type="PROPERTY" name="Cellebrite UserMapping" />
    <metadata type="PROPERTY" name="Cellebrite Username" />
    <metadata type="PROPERTY" name="Cellebrite UserType" />
    <metadata type="PROPERTY" name="Cellebrite Value" />
    <metadata type="PROPERTY" name="Cellebrite Version" />
    <metadata type="PROPERTY" name="Cellebrite VideoCall" />
    <metadata type="PROPERTY" name="Cellebrite Word" />
    <metadata type="PROPERTY" name="Exif Date Time" />
    <metadata type="PROPERTY" name="Exif Date Time Digitized" />
    <metadata type="PROPERTY" name="Exif Date Time Original" />
    <metadata type="PROPERTY" name="Exif IFD0: Copyright" />
    <metadata type="PROPERTY" name="Exif IFD0: Date/Time" />
    <metadata type="PROPERTY" name="Exif IFD0: Image Description" />
    <metadata type="PROPERTY" name="Exif IFD0: Make" />
    <metadata type="PROPERTY" name="Exif IFD0: Model" />
    <metadata type="PROPERTY" name="Exif IFD0: Orientation" />
    <metadata type="PROPERTY" name="Exif IFD0: Resolution Unit" />
    <metadata type="PROPERTY" name="Exif IFD0: Software" />
    <metadata type="PROPERTY" name="Exif IFD0: X Resolution" />
    <metadata type="PROPERTY" name="Exif IFD0: Y Resolution" />
    <metadata type="PROPERTY" name="Exif IFD0: YCbCr Positioning" />
    <metadata type="PROPERTY" name="Exif SubIFD: Color Space" />
    <metadata type="PROPERTY" name="Exif SubIFD: Components Configuration" />
    <metadata type="PROPERTY" name="Exif SubIFD: Contrast" />
    <metadata type="PROPERTY" name="Exif SubIFD: Custom Rendered" />
    <metadata type="PROPERTY" name="Exif SubIFD: Date/Time Digitized" />
    <metadata type="PROPERTY" name="Exif SubIFD: Date/Time Original" />
    <metadata type="PROPERTY" name="Exif SubIFD: Digital Zoom Ratio" />
    <metadata type="PROPERTY" name="Exif SubIFD: Exif Image Height" />
    <metadata type="PROPERTY" name="Exif SubIFD: Exif Image Width" />
    <metadata type="PROPERTY" name="Exif SubIFD: Exif Version" />
    <metadata type="PROPERTY" name="Exif SubIFD: Exposure Bias Value" />
    <metadata type="PROPERTY" name="Exif SubIFD: Exposure Mode" />
    <metadata type="PROPERTY" name="Exif SubIFD: Exposure Program" />
    <metadata type="PROPERTY" name="Exif SubIFD: Exposure Time" />
    <metadata type="PROPERTY" name="Exif SubIFD: F-Number" />
    <metadata type="PROPERTY" name="Exif SubIFD: File Source" />
    <metadata type="PROPERTY" name="Exif SubIFD: Flash" />
    <metadata type="PROPERTY" name="Exif SubIFD: FlashPix Version" />
    <metadata type="PROPERTY" name="Exif SubIFD: Focal Length" />
    <metadata type="PROPERTY" name="Exif SubIFD: Focal Length 35" />
    <metadata type="PROPERTY" name="Exif SubIFD: Gain Control" />
    <metadata type="PROPERTY" name="Exif SubIFD: ISO Speed Ratings" />
    <metadata type="PROPERTY" name="Exif SubIFD: Max Aperture Value" />
    <metadata type="PROPERTY" name="Exif SubIFD: Metering Mode" />
    <metadata type="PROPERTY" name="Exif SubIFD: Saturation" />
    <metadata type="PROPERTY" name="Exif SubIFD: Scene Capture Type" />
    <metadata type="PROPERTY" name="Exif SubIFD: Scene Type" />
    <metadata type="PROPERTY" name="Exif SubIFD: Sharpness" />
    <metadata type="PROPERTY" name="Exif SubIFD: Subject Distance Range" />
    <metadata type="PROPERTY" name="Exif SubIFD: User Comment" />
    <metadata type="PROPERTY" name="Exif SubIFD: White Balance" />
    <metadata type="PROPERTY" name="Exif SubIFD: White Balance Mode" />
    <metadata type="PROPERTY" name="Exif Thumbnail: Resolution Unit" />
    <metadata type="PROPERTY" name="Exif Thumbnail: Thumbnail Compression" />
    <metadata type="PROPERTY" name="Exif Thumbnail: Thumbnail Length" />
    <metadata type="PROPERTY" name="Exif Thumbnail: Thumbnail Offset" />
    <metadata type="PROPERTY" name="Exif Thumbnail: X Resolution" />
    <metadata type="PROPERTY" name="Exif Thumbnail: Y Resolution" />
    <metadata type="PROPERTY" name="GPS Date Time" />
    <metadata type="PROPERTY" name="GPS: GPS Altitude Ref" />
    <metadata type="PROPERTY" name="GPS: GPS Date Stamp" />
    <metadata type="PROPERTY" name="GPS: GPS Img Direction Ref" />
    <metadata type="PROPERTY" name="GPS: GPS Latitude" />
    <metadata type="PROPERTY" name="GPS: GPS Latitude Ref" />
    <metadata type="PROPERTY" name="GPS: GPS Longitude" />
    <metadata type="PROPERTY" name="GPS: GPS Longitude Ref" />
    <metadata type="PROPERTY" name="GPS: GPS Map Datum" />
    <metadata type="PROPERTY" name="GPS: GPS Satellites" />
    <metadata type="PROPERTY" name="GPS: GPS Time-Stamp" />
    <metadata type="PROPERTY" name="Case Number" />
    <metadata type="PROPERTY" name="EnCase Acquisition Time" />
    <metadata type="PROPERTY" name="EnCase Application Version" />
    <metadata type="PROPERTY" name="EnCase Case Number" />
    <metadata type="PROPERTY" name="EnCase Compression Type" />
    <metadata type="PROPERTY" name="EnCase Evidence Number" />
    <metadata type="PROPERTY" name="EnCase Examiner Name" />
    <metadata type="PROPERTY" name="EnCase File Set Identifier" />
    <metadata type="PROPERTY" name="EnCase Image Name" />
    <metadata type="PROPERTY" name="EnCase Notes" />
    <metadata type="PROPERTY" name="EnCase Operating System" />
    <metadata type="PROPERTY" name="EnCase System Time" />
    <metadata type="PROPERTY" name="FTK Compressed" />
    <metadata type="PROPERTY" name="FTK Encrypted" />
    <metadata type="PROPERTY" name="FTK File Size" />
    <metadata type="PROPERTY" name="FTK File Type Flag" />
    <metadata type="PROPERTY" name="FTK Is Actual File" />
    <metadata type="PROPERTY" name="FTK Original Path Name" />
    <metadata type="PROPERTY" name="FTK Unknown-2" />
    <metadata type="PROPERTY" name="Examiner name" />
    <metadata type="PROPERTY" name="Examiner Name" />
    <metadata type="PROPERTY" name="Case number" />
    <metadata type="PROPERTY" name="Sim Change Operation" />
    <metadata type="PROPERTY" name="SIM Change Time" />
    <metadata type="PROPERTY" name="Current Sim Phone Number" />
    <metadata type="PROPERTY" name="Contact Address Address Municipality" />
    <metadata type="PROPERTY" name="Contact Address Country" />
    <metadata type="PROPERTY" name="Contact Address Municipality" />
    <metadata type="PROPERTY" name="Contact Cellulare Phone" />
    <metadata type="PROPERTY" name="Contact Cellulare Phone (1)" />
    <metadata type="PROPERTY" name="Contact Company" />
    <metadata type="PROPERTY" name="Contact Email" />
    <metadata type="PROPERTY" name="Contact Email (1)" />
    <metadata type="PROPERTY" name="Contact Full Name" />
    <metadata type="PROPERTY" name="Contact General Phone" />
    <metadata type="PROPERTY" name="Contact General Phone (1)" />
    <metadata type="PROPERTY" name="Contact General Phone (2)" />
    <metadata type="PROPERTY" name="Contact General Phone (3)" />
    <metadata type="PROPERTY" name="Contact General Phone (4)" />
    <metadata type="PROPERTY" name="Contact General Phone (5)" />
    <metadata type="PROPERTY" name="Contact General Phone (6)" />
    <metadata type="PROPERTY" name="Contact Generale Phone" />
    <metadata type="PROPERTY" name="Contact Home Address Country" />
    <metadata type="PROPERTY" name="Contact Home Address line 1" />
    <metadata type="PROPERTY" name="Contact Home Address Municipality" />
    <metadata type="PROPERTY" name="Contact Home Address Postal Code" />
    <metadata type="PROPERTY" name="Contact Home Address Region" />
    <metadata type="PROPERTY" name="Contact Home Phone" />
    <metadata type="PROPERTY" name="Contact iPhone Phone" />
    <metadata type="PROPERTY" name="Contact Mobile Phone" />
    <metadata type="PROPERTY" name="Contact Mobile Phone (1)" />
    <metadata type="PROPERTY" name="Contact Mobile Phone (2)" />
    <metadata type="PROPERTY" name="Contact Mobile Phone (3)" />
    <metadata type="PROPERTY" name="Contact Mobile Phone (4)" />
    <metadata type="PROPERTY" name="Contact Mobile Phone (5)" />
    <metadata type="PROPERTY" name="Contact Mobile Phone (6)" />
    <metadata type="PROPERTY" name="Contact Phone" />
    <metadata type="PROPERTY" name="Contact Phone (1)" />
    <metadata type="PROPERTY" name="Contact Phone Number Phone" />
    <metadata type="PROPERTY" name="Contact Phone Number Phone (1)" />
    <metadata type="PROPERTY" name="Contact Phone Number Phone (2)" />
    <metadata type="PROPERTY" name="Contact Phone Number Phone (3)" />
    <metadata type="PROPERTY" name="Contact Phone Number Phone (4)" />
    <metadata type="PROPERTY" name="Contact Phone Number Phone (5)" />
    <metadata type="PROPERTY" name="Contact Phone Number Phone (6)" />
    <metadata type="PROPERTY" name="Contact Phone Phone" />
    <metadata type="PROPERTY" name="Contact Work Address Country" />
    <metadata type="PROPERTY" name="Contact Work Address line 1" />
    <metadata type="PROPERTY" name="Contact Work Address Municipality" />
    <metadata type="PROPERTY" name="Contact Work Address Postal Code" />
    <metadata type="PROPERTY" name="Contact Work Address Region" />
    <metadata type="PROPERTY" name="Contact Work Phone" />
    <metadata type="PROPERTY" name="Mapi-Attachment-Contact-Photo" />
    <metadata type="PROPERTY" name="Mapi-Junk-Include-Contacts" />
    <metadata type="PROPERTY" name="Time Contacted" />
    <metadata type="PROPERTY" name="Times Contacted" />
    <metadata type="PROPERTY" name="Generic" />
  </metadata-list>
</metadata-profile>
