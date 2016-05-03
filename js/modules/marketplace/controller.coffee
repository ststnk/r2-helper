Views    = require './views'
Entities = require './entities'


class Controller extends Marionette.Object
  
  initialize: (options) ->
    @region = options.region
    @layout = @getLayoutView()
    
    @listenTo @layout, 'show', =>
      @contentRegion()
    
    @region.show @layout
  
  contentRegion: ->
    inputView = @getInputView()
    
    @listenTo inputView, 'list:for:sale:clicked', =>
      domains = @getDomains inputView.data()
      
      if domains.length > 0
        tableView = @getTableView domains
        
        @listenTo tableView, 'start:over:clicked', =>
          @contentRegion()
        
        @layout.contentRegion.show tableView
        domains.listForSale()
    
    @layout.contentRegion.show inputView
  
  getTableView: (domains) ->
    new Views.Table
      collection: domains
  
  getDomains: (data) ->
    return [] if data.domains.trim().length is 0
    
    domains = _.map data.domains.split("\n"), (domain) ->
      _.chain(data).omit('domains').extend
        name: domain.trim().toLowerCase()
      .value()
    
    new Entities.DomainNamesCollection domains
  
  getInputView: ->
    new Views.Input
  
  getLayoutView: ->
    new Views.Layout


module.exports = Controller