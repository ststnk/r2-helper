Controller = require './domains-info/controller'
App        = require '../app'


class DomainsInfoModule extends Marionette.Module

  startWithParent: true
  
  initialize: ->
    new Controller
      region: App.domainsInfoRegion


module.exports = DomainsInfoModule