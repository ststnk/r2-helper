class HostRecord extends Backbone.Model
  
  initialize: ->
    @set 'type',   @get('type').toUpperCase()
    @set 'typeId', @typeIdFor(@get('type'))
  
  typeIdFor: (type) ->
    @typeMapping[type]
  
  typeMapping:
    'A':        1,
    'CNAME':    2,
    'TXT':      5,
    'REDIRECT': 6,
    'FRAME':    7,
    'AAAA':     8,
    'NS':       9,
    '301':      10
  
  defaults:
    status:    'New'
    _complete: false
  
  create: ->
    @set '_complete', false
    @set 'status',    'Pending'
    
    $.ajaxq @get('domain'),
      url:  "https://ap.www.namecheap.com/Domains/dns/AddOrUpdateHostRecord"
      data:
        model:
          HostId:     -1
          Host:       @get('host')
          Data:       @get('value')
          IsDynDns:   false
          RecordType: @get('typeId')
          Ttl:        1799
        domainName:      @get('domain')
        isAddNewProcess: true
      type:       'POST'
      beforeSend: (xhr) ->
        xhr.setRequestHeader '_NcCompliance', $('input[name="ncCompliance"]').val()

    .done (data) =>
      if data['Error']
        @set 'error',   data['Msg']
        @set 'status', 'Error'
      else
        @set 'status', 'Done'
      
      @set '_complete', true


class HostRecordsCollection extends Backbone.Collection
  
  model: HostRecord
  
  initialize: ->
    @listenTo @, 'change', =>
      complete = @every (model) -> model.get '_complete'
      this.trigger 'host:records:created' if complete
  
  createHostRecords: ->
    @each (model) -> model.create()


module.exports.HostRecord             = HostRecord
module.exports.HostRecordsCollection  = HostRecordsCollection