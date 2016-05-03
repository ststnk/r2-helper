class DomainsFetcher extends Marionette.Object
  
  initialize: (options) ->
    @lastAvailableChunkIndex = 0
    @totalServerItemsCount   = null
  
  fetchAll: ->
    ajax = @sendAjax()
    
    ajax.complete (data) =>
      data    = JSON.parse ajax.responseText.replace(/,,,/g, ',0,0,').replace(/,,/g, ',0,').replace(/,]/g, ',0]')
      
      domains = _.map data['Result']['Data'], (array) -> array[2]
      
      @trigger 'fetch:batch:completed', domains
      
      if domains.length is 1000
        @lastAvailableChunkIndex += 1
        if @totalServerItemsCount
          @totalServerItemsCount += 1000
        else
          @totalServerItemsCount = 1000
        @fetchAll()
      else
        @trigger 'fetch:all:completed'
  
  sendAjax: ->
    $.ajax
      type: 'POST'
      url:  'https://ap.www.namecheap.com/Domains/GetDomainsOnly'
      data:
        gridStateModel:
          ServerChunkSize:          1000
          LastAvailableChunkIndex:  @lastAvailableChunkIndex
          IsLazyLoading:            true
          TotalServerItemsCount:    @totalServerItemsCount
      beforeSend: (xhr) ->
        xhr.setRequestHeader '_NcCompliance', $('input[name="ncCompliance"]').val()


module.exports.DomainsFetcher = DomainsFetcher