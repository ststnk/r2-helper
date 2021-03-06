class DomainName extends Backbone.Model

  defaults:
    status:    'New'
    _complete: false

  list: ->
    $.ajax
      type: 'POST'
      url:  'https://ap.www.namecheap.com/domains/AddDomainToMarketplaceListing'
      data:
        model:
          DomainName:             @get('name')
          Description:            @get('description')
          AskingPrice:            @get('price')
          Period:                 @get('period')
          IsAdultListing:         @get('adult')
          SaleEmailNotification:  @get('sendEmails')
          SelectedCategory:       @get('categories')
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
      @trigger('listed') if complete

  listForSale: ->
    @each (model) ->
      model.set 'status', 'Enqueued'
      model.list()


module.exports.DomainName            = DomainName
module.exports.DomainNamesCollection = DomainNamesCollection
