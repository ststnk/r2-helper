class RefundedOrder extends Backbone.Model

  pull: (queueName) ->
    $.ajaxq queueName,
      type: 'GET'
      url:  @get('Action URL')

    .done (data) =>
      @parseTable $(data).find('#contentTable:last-child')

  parseTable: ($table) ->
    @set "Admin",          @parseColumn $table, 1
    @set "Description",    @parseColumn $table, 4
    @set "Action Date",    @parseColumn $table, 5
    @set "Action Comment", @parseColumn $table, 6

    @unset "Action URL"
    @trigger "pulled"

  parseColumn: ($table, col) ->
    $table.find("tbody tr td:nth-child(#{col})").map (index, td) ->
      val = $(td).text().trim()
      if val.length then val else "-"
    .toArray()


class RefundedOrdersCollection extends Backbone.Collection

  model: RefundedOrder

  initialize: (options) ->
    @queueName = 1

    @listenTo @, 'pulled', =>
      if @pulledOrders() is @length
        _.defer => @trigger 'pull:completed'

  pullOrders: ->
    @each (order) => order.pull @getQueueName()

  getQueueName: ->
    returnVal = 'queue-' + @queueName

    if @queueName is 10
      @queueName = 1
    else
      @queueName += 1

    returnVal

  pulledOrders: ->
    pulled = @filter (order) -> !order.get('Action URL')
    _.size pulled

  toCSV: ->
    attributes = _.keys @first().attributes

    rows = @map (model) ->
      _.map attributes, (key) -> model.get(key)

    data = [attributes].concat(rows)

    data = _.map data, (row) ->
      _.map row, (val, key) ->
        val = val.join("\n")         if _.isArray(val)
        val = '"' + val.trim() + '"' if _.isString(val) and val.match(/,|\n|"/)
        val

    csvContent = "data:text/csv;charset=utf-8,"

    data.forEach (infoArray, index) ->
      dataString = infoArray.join ","
      csvContent += (if index < data.length then dataString + "\n" else dataString)

    encodedUri = encodeURI csvContent
    link = document.createElement 'a'
    link.setAttribute 'href', encodedUri
    link.setAttribute 'download', 'export.csv'

    link.click()


module.exports.RefundedOrder            = RefundedOrder
module.exports.RefundedOrdersCollection = RefundedOrdersCollection
