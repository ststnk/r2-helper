class DomainName extends Backbone.Model

  pull: (queueName) ->  
    $.ajaxq queueName,
      type: 'GET'
      url:  'https://ap.www.namecheap.com/Domains/DomainDetails/GetDomainDetailsTabOverView'
      data:
        domainName: @get('Domain Name')
        
    .done (data) =>
      
      if data['Error']
        @set 'Error', data['Msg']
      else if _.isNull(JSON.parse(data['Result'])['DomainName'])
        @set 'Error', 'Looks like this domains does not belong to this account'
      else
        data = JSON.parse data['Result']
        
        @setContacts          data, 'RegistrantContactDetails',  'Registrant Contacts'
        @setContacts          data, 'AdminContactDetails',       'Administrator Contacts'
        @setContacts          data, 'TechContactDetails',        'Technical Contacts'
        @setContacts          data, 'BillingContactDetails',     'Billing Contacts'
        @setWhoisGuardStatus  data.WGDetails?.WGActiveStatus
        @setWGForwardedEmail  data.WGDetails
        @setNameserversType   data.NameServerDetails
        @setExpirationDate    data.ExpiryDateTime
        @setAutoRenew         data.AutoRenew

      @trigger 'pulled'
      
  setContacts: (data, key, attrName) ->
    if contacts = data.ContactDetails?[key]
      extracted = @extractContacts contacts
      @set attrName, extracted
      
  extractContacts: (contacts) ->
    extracted = {}
    _.each @contactsMapping, (val, key) ->
      extracted[val] = contacts[key] if contacts[key]
    extracted
    
  contactsMapping:
    FirstName:      'First Name'
    LastName:       'Last Name'
    Organization:   'Company Name'
    JobTitle:       'Job Title'
    Address1:       'Address'
    Address2:       'Address 2'
    City:           'City'
    StateProvince:  'State/Province'
    PostalCode:     'Zip/Postal Code'
    Country:        'Country'
    Phone:          'Phone Number'
    Fax:            'Fax Number'
    EmailAddress:   'Email Address'
      
  setWhoisGuardStatus: (data) ->
    status = if data then 'Yes' else 'No'
    @set 'WhoisGuard Enabled', status
      
  setNameserversType: (data) ->
    @set 'Nameservers Type', data.DnsServerType

    if @get('Nameservers Type') is 'Custom'
      @set 'Nameservers Type', 'CustomDNS'
      @set 'Nameservers',      data.NameserversList
      
    @set('Nameservers Type', 'BackupDNS')   if @get('Nameservers Type') is 'Enom'
    @set('Nameservers Type', 'BasicDNS')    if @get('Nameservers Type') is 'NameCheapDefault'
    @set('Nameservers Type', 'PremiumDNS')  if @get('Nameservers Type') is 'Premium'
    @set('Nameservers Type', 'HostingDNS')  if @get('Nameservers Type') is 'DNS_com'
      
  setExpirationDate: (data) ->
    if data
      monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      date       = new Date data
      day        = date.getDate()
      month      = monthNames[date.getMonth()]
      year       = date.getFullYear()
      @set 'Expiration Date', "#{day} #{month} #{year}"
      
  setAutoRenew: (data) ->
    status = if data then 'Yes' else 'No'
    @set 'AutoRenew Enabled', status

  setWGForwardedEmail: (data) ->
    @set('WG Forwarded Email', data.WGAssociatedEmailForwardedTo) if data.WGAssociatedEmailForwardedTo


class DomainNamesCollection extends Backbone.Collection
  
  model: DomainName
  
  initialize: (options) ->
    @listenTo @, 'pulled', =>
      if @pulledDomains() is @length
        _.defer => @trigger 'pull:completed'
    
    @queueName = 1
  
  pulledDomains: ->
    pulled = @filter (domain) -> _.size(domain.attributes) > 1
    _.size pulled
  
  pullDomains: ->
    @each (domain) => domain.pull @getQueueName()
  
  getQueueName: ->
    returnVal = 'queue-' + @queueName
    
    if @queueName is 10
      @queueName = 1
    else
      @queueName += 1
    
    returnVal
  
  toCSV: (downloadName, attributes) ->
    _.defaults ->
      downloadName: 'export'
	  
    rows = @map (model) ->
      _.map attributes, (key) ->
        model.get(key) or '-'
  
    data = [attributes].concat(rows)
	      
    data = _.map data, (row) ->
      _.map row, (val, key) ->
        val = (_.map val, (value, key) -> "#{key}: #{value}") if _.isObject(val)
        val = val.join("\n")                                  if _.isArray(val)
        val = '"' + val.trim() + '"'                          if _.isString(val) and val.match(/,|\n|"/)
        val
	  
    csvContent = "data:text/csv;charset=utf-8,"
    
    data.forEach (infoArray, index) ->
      dataString = infoArray.join ","
      csvContent += (if index < data.length then dataString + "\n" else dataString)
	
    encodedUri = encodeURI csvContent
    link = document.createElement 'a'
    link.setAttribute 'href', encodedUri
    link.setAttribute 'download', downloadName + '.csv'
    
    link.click()


module.exports.DomainName            = DomainName
module.exports.DomainNamesCollection = DomainNamesCollection