class Content extends Marionette.ItemView

  template: require('./templates/content')

  triggers:
    'click #r2-parse-refund-orders' : 'parse:clicked'

  serializeData: ->
    data = super()
    data.ordersCount = $('#contentTable tbody tr').length
    data


class Progress extends Marionette.ItemView

  template: require('./templates/progress')

  collectionEvents:
    'pulled' : 'render'

  templateHelpers:

    pulledCount: ->
      pulled = _.filter @items, (item) -> !item['Action URL']
      _.size pulled

  triggers:
    'click #r2-export-refund-orders' : 'export:clicked'


module.exports.Content  = Content
module.exports.Progress = Progress
