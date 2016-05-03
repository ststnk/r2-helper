Controller = require './host-records/controller'
App        = require '../app'


class HostRecordsModule extends Marionette.Module

  startWithParent: true
  
  initialize: ->
    new Controller
      region: App.hostRecordsRegion


module.exports = HostRecordsModule