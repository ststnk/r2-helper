Controller = require './marketplace/controller'
App        = require '../app'


class MarketplaceModule extends Marionette.Module
  
  startWithParent: true
  
  initialize: ->
    new Controller
      region: App.marketplaceRegion


module.exports = MarketplaceModule