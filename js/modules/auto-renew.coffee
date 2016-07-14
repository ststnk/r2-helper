Controller = require './auto-renew/controller'
App        = require '../app'

class AutoRenewModule extends Marionette.Module

  startWithParent: true

  initialize: ->
    new Controller
      region: App.autoRenewRegion


module.exports = AutoRenewModule
