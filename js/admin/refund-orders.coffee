Views    = require './refund-orders/views'
Objects  = require './refund-orders/objects'
Entities = require './refund-orders/entities'

class RefundOrders extends Marionette.Object

  initialize: ->
    $('#findCCRefundOrderContentDiv').before("<div id='r2-helper-content'></div>")
    Region = Marionette.Region.extend(el: '#r2-helper-content')

    @region = new Region
    @orders = new Entities.RefundedOrdersCollection

    contentView = new Views.Content

    @listenTo contentView, 'parse:clicked', =>
      parser = new Objects.RefundOrdersParser $('#contentTable')
      @orders.add parser.data()

      progressView = new Views.Progress collection: @orders
      @region.show progressView

      @orders.pullOrders()

      @listenTo progressView, 'export:clicked', =>
        @orders.toCSV()

    if $('#contentTable').length and $('#contentTable').find('tbody tr').length
      @region.show contentView


module.exports = RefundOrders
