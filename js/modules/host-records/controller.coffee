Views      = require './views'
Objects    = require './objects'
Entities   = require './entities'


class Controller extends Marionette.Object
  
  initialize: (options) ->
    @region = options.region
    @layout = @getLayoutView()
    
    @listenTo @layout, 'show', =>
      @contentRegion()
    
    @region.show @layout
  
  contentRegion: ->
    inputView = @getInputView()
    
    @listenTo inputView, 'parse:clicked', =>
      records = @getHostRecordsCollection inputView.data()
      
      if records.length > 0
        recordsView = @getRecordsView records
        
        @listenTo recordsView, 'create:clicked', ->
          records.createHostRecords()
        
        @listenTo recordsView, 'start:over:clicked', =>
          @contentRegion()
        
        @layout.contentRegion.show recordsView
    
    @layout.contentRegion.show inputView
  
  getRecordsView: (records) ->
    new Views.HostRecords
      collection: records
  
  getHostRecordsCollection: (data) ->
    parsed = new Objects.RecordsParser(data).domains()
    new Entities.HostRecordsCollection parsed
  
  getInputView: ->
    new Views.Input
  
  getLayoutView: ->
    new Views.Layout


module.exports = Controller