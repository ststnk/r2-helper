chrome.runtime.onMessage.addListener (request, sender, sendResponse) =>

  if request.message is 'page:did:load'
    sendResponse sender.url

  true
