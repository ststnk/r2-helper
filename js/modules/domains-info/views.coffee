class Layout extends Marionette.LayoutView

  template: require('./templates/layout')
  
  regions:
    contentRegion: '#domains-info-content-region'

class Export extends Marionette.ItemView
  
  template: require('./templates/export')
  
  ui:
    fetchButton: '#fetch-domains-info'
  
  triggers:
    'click @ui.fetchButton' : 'fetch:clicked'
  
  onFetchClicked: ->
    this.ui.fetchButton.closest('div').addClass 'disabled-content'
    this.ui.fetchButton.html 'Fetching...'


class PullProgress extends Marionette.ItemView
  
  template: require('./templates/pull-progress')
  
  collectionEvents:
    'pulled' : 'render'
  
  templateHelpers:
    
    pulledCount: ->
      pulled = _.filter @items, (item) -> _.size(_.keys(item)) > 1
      _.size pulled


class Csv extends Marionette.ItemView
  
  template: require('./templates/csv')
  
  serializeData: ->
    attrs = @collection.chain().map (model) ->
      _.keys(model.attributes)
    .flatten().uniq().value()
    
    attrs: attrs
  
  onAttach: ->
    script = document.createElement 'script'
    script.textContent = '$("select.select2").select2({ minimumResultsForSearch: -1 });'
    document.head.appendChild script
    script.parentNode.removeChild script
  
  triggers:
    'click #domains-info-export':     'export:clicked'
    'click #domains-info-start-over': 'start:over:clicked'
  
  selectedAttributes: ->
    @$('#domains-info-attributes').val()


module.exports.Layout       = Layout
module.exports.Export       = Export
module.exports.PullProgress = PullProgress
module.exports.Csv          = Csv