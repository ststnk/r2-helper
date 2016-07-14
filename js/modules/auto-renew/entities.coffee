class DomainName extends Backbone.Model

  defaults:
    status:    'New'
    _complete: false

  getDomainStatus: ->
    if @get('enable') is 'true'
      true
    else
      @get('disableOnlyWG') is 'true'

  getWGStatus: ->
    if @get('enable') is 'true'
      @get('enableOnlyDomains') is 'false'
    else
      false

  update: ->
    $.ajax
      type: 'GET'
      url:  'https://ap.www.namecheap.com/Domains/ChangeDomainAndWGAutoRenew'
      data:
        autoRenewFor:      'DOMAIN'
        domainName:        @get('name')
        isDomainAutoRenew: @getDomainStatus()
        isWGAutoRenew:     @getWGStatus()
      beforeSend: (xhr) ->
        xhr.setRequestHeader '_NcCompliance', $('input[name="ncCompliance"]').val()

    .done (data) =>
      @set 'message', data['Msg']
      if data['Error'] then @set('status', 'Error') else @set('status', 'Done')
      @set '_complete', true


class DomainNamesCollection extends Backbone.Collection

  model: DomainName

  initialize: ->
    @listenTo @, 'change', ->
      complete = @every (model) -> model.get '_complete'
      @trigger('changed') if complete

  updateAutoRenew: ->
    @each (model) ->
      model.set 'status', 'Enqueued'
      model.update()


module.exports.DomainName            = DomainName
module.exports.DomainNamesCollection = DomainNamesCollection
