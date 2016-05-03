class Layout extends Marionette.LayoutView
  
  template: require('./templates/layout')
  
  regions:
    contentRegion: '#host-records-content-region'


class Input extends Marionette.ItemView
  
  template: require('./templates/input')
  
  triggers:
    'click #parse-host-records' : 'parse:clicked'
  
  data: ->
    @$('textarea').val()


class HostRecord extends Marionette.ItemView
  
  template: require('./templates/host-record')
  tagName:  'tr'
  
  modelEvents:
    'change' : 'render'


class HostRecords extends Marionette.CompositeView
  
  template:           require('./templates/host-records')
  childView:          HostRecord
  childViewContainer: 'tbody'
    
  ui:
    'createButton': '#create-host-records'
      
  triggers:
    'click @ui.createButton' : 'create:clicked',
    'click #create-host-start-over' : 'start:over:clicked'
  
  collectionEvents:
    'host:records:created': 'hostRecordsCreated'
  
  onCreateClicked: ->
    this.ui.createButton.closest('div').addClass 'disabled-content'
  
  hostRecordsCreated: ->
    this.ui.createButton.closest('div').removeClass 'disabled-content'


module.exports.Layout       = Layout
module.exports.Input        = Input
module.exports.HostRecord   = HostRecord
module.exports.HostRecords  = HostRecords