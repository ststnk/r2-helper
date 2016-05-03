class Layout extends Marionette.LayoutView

  template: require('./templates/layout')
  
  regions:
    contentRegion: '#marketplace-content-region'


class Input extends Marionette.ItemView
  
  template: require('./templates/input')
  
  triggers:
    'click #list-for-sale' : 'list:for:sale:clicked'
  
  onAttach: ->
    script = document.createElement 'script'
    script.textContent = '$("select.select2").select2({ minimumResultsForSearch: -1 });'
    document.head.appendChild script
    script.parentNode.removeChild script
  
  data: ->
    domains:      $('#marketplace-domains').val()
    price:        $('#marketplace-price').val()
    period:       $('#marketplace-period').val()
    description:  $('#marketplace-description').val()
    categories:   if $('#marketplace-categories').val() then $('#marketplace-categories').val().join(',') else null
    adult:        $('#marketplace-adult').val()
    sendEmails:   $('#marketplace-send-emails').val()
    

class TableRow extends Marionette.ItemView
  
  template: require('./templates/table-row')
  tagName:  'tr'
  
  modelEvents:
    'change' : 'render'


class Table extends Marionette.CompositeView
  
  template:           require('./templates/table')
  childView:          TableRow
  childViewContainer: 'tbody'
  
  ui:
    button: '#marketplace-start-over'
  
  triggers:
    'click @ui.button': 'start:over:clicked'
  
  collectionEvents:
    'listed' : 'enableButton'
  
  enableButton: ->
    this.ui.button.closest('div').removeClass 'disabled-content'


module.exports.Layout   = Layout
module.exports.Input    = Input
module.exports.TableRow = TableRow
module.exports.Table    = Table