Views    = require './views'
Objects  = require './objects'
Entities = require './entities'

class Controller extends Marionette.Object

  initialize: (options) ->
    @region = options.region
    @layout = @getLayoutView()

    @listenTo @layout, 'show', ->
      @contentRegion()

    @region.show @layout

  contentRegion: ->
    exportView = @getExportView()

    @listenTo exportView, 'fetch:clicked', =>
      domains = new Entities.DomainNamesCollection
      @getDomains domains

      @listenTo domains, 'fetch:all:completed', =>
        progressView = @getProgressView domains
        @layout.contentRegion.show progressView

        domains.pullDomains()

      @listenTo domains, 'pull:completed', =>
        csvView = @getCsvView domains

        @listenTo csvView, 'export:clicked', ->
          username = $('[data-username]').text()
          attrs    = csvView.selectedAttributes()

          domains.toCSV username, attrs

        @listenTo csvView, 'start:over:clicked', ->
          @contentRegion()

        @layout.contentRegion.show csvView

    @layout.contentRegion.show exportView

  getCsvView: (domains) ->
    new Views.Csv
      collection: domains

  getProgressView: (domains) ->
    new Views.PullProgress
      collection: domains

  getDomains: (domainsCollection) ->
    fetcher = new Objects.DomainsFetcher

    @listenTo fetcher, 'fetch:batch:completed', (domains) ->
      models = _.map domains, (domain) -> 'Domain Name': domain
      domainsCollection.add models

    @listenTo fetcher, 'fetch:all:completed', ->
      domainsCollection.trigger 'fetch:all:completed'

    fetcher.fetchAll()

  getExportView: ->
    new Views.Export

  getLayoutView: ->
    new Views.Layout


module.exports = Controller
