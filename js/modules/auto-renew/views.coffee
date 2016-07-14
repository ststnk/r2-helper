class Layout extends Marionette.LayoutView

  template: require('./templates/layout')

  regions:
    contentRegion: '#auto-renew-content-region'


class Input extends Marionette.ItemView

  template: require('./templates/input')

  triggers:
    'click #update-auto-renew'  : 'update:auto:renew:clicked'

  onAttach: ->
    script = document.createElement 'script'
    script.textContent = "
      $('select.select2').select2({ minimumResultsForSearch: -1 });
      $('#auto-renew-enable').change(function(event) {
        if ($(event.target).val() === 'true') {
          $('#auto-renew-enable-only-domains-div').show(200);
          $('#auto-renew-disable-only-wg-div').hide(200);
        } else {
          $('#auto-renew-enable-only-domains-div').hide(200);
          $('#auto-renew-disable-only-wg-div').show(200);
        }
      });
      $('#auto-renew-enable').change();
    "
    document.head.appendChild script
    script.parentNode.removeChild script

  data: ->
    domains:           $('#auto-renew-domains').val()
    enable:            $('#auto-renew-enable').val()
    enableOnlyDomains: $('#auto-renew-enable-only-domains').val()
    disableOnlyWG:     $('#auto-renew-disable-only-wg').val()


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
    button: '#auto-renew-start-over'

  triggers:
    'click @ui.button': 'start:over:clicked'

  collectionEvents:
    'changed' : 'enableButton'

  enableButton: ->
    this.ui.button.closest('div').removeClass 'disabled-content'


module.exports.Layout   = Layout
module.exports.Input    = Input
module.exports.TableRow = TableRow
module.exports.Table    = Table
