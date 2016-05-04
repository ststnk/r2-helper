### Features

##### Add Host Records

Allows setting up host records in bulk. Always created new host records, existing records are left intact. Currently supported record types are A, CNAME, TXT, REDIRECT, FRAME, AAAA, NS and 301.

Host records must be provided in specific format: `host domain recordType value`. Example:

`@ example.com A 12.23.34.45
www another.net CNAME example.com`

##### Domains Info

Allows exporting details about all domains in the account in CSV format. Available attributes are: registrant contacts, administrator contacts, technical contacts, billing contacts, WhoisGuard status, nameservers type, expiration date, autorenew status.

##### Marketplace

Allows listing domains for sale in bulk. All provided domain names will be listed for sale with the same attributes provided/selected in the form.

---

### Installation

* Download [archived build](https://github.com/stas-tanko/r2-helper/blob/master/r2-helper.zip?raw=true) and unpack it
* Go to `chrome://extensions` in Google Chrome
* Enable developer mode (checkbox on top)
* Click 'Load unpacked extension...'
* Choose the diectory with unpacked content

---

### Changelog

##### v1.0.0
Initial release