class RefundOrdersParser extends Marionette.Object

  initialize: ($table) ->
    @table = $table

    @mapping =
      "../images/tick-black.gif"  : "Totally Refunded"
      "../images/tick-gray.gif"   : "Partially Refunded"
      "../images/exclaim.gif"     : "Do Not Refund"
      "../images/exclaim-big.gif" : "Voided"
      "../images/err.gif"         : "May Not Need Refund"

  data: ->
    @table.find('tbody tr').map (index, tr) =>
      actionStatus = $(tr).find('td').eq(8).find('div').eq(0).find('img').attr('src')
      actionStatus = if actionStatus then @mapping[actionStatus] else ""

      source = $(tr).find('td').eq(0).find('div').eq(1).text().trim()
      source = if source.length then source else "Credit Card"

      "Order ID"      : $(tr).find('td').eq(0).find('div').eq(0).text().trim()
      "Username"      : $(tr).find('td').eq(1).find('div').eq(0).text().trim()
      "Date"          : $(tr).find('td').eq(6).find('div').eq(1).text().trim()
      "Payment Source": source
      "Action URL"    : $(tr).find('td').eq(7).find('a').attr('href')
      "Action Status" : actionStatus
    .toArray()


module.exports.RefundOrdersParser = RefundOrdersParser
