App = new Marionette.Application


App.addRegions
  hostRecordsRegion: '#host-records-region'
  domainsInfoRegion: '#domains-info-region'
  marketplaceRegion: '#marketplace-region'

App.on 'start', -> App.isStarted = true


module.exports = App