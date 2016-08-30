RefundOrders = require './admin/refund-orders'

chrome.runtime.sendMessage message: 'page:did:load', (response) =>

  if /creditcardrefund\.aspx/.test response
    new RefundOrders()
