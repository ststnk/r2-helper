App         = require './app'
HostRecords = require './modules/host-records'
DomainsInfo = require './modules/domains-info'
Marketplace = require './modules/marketplace'

$('#apnav ul:first-child').append "<li class='r2-d2'><a href=''><span>R2-D2 Helper</span></a></li>"

template = "<div class='row normal-vertical-spacing'>
              <div class='columns'><h1 class='section-title'>R2-D2 Helper</h1></div>
            </div>
            <div class='row add-margin-bottom-30'><hr></div>
            <div id='host-records-region'></div>
            <div id='domains-info-region'></div>
            <div id='marketplace-region'></div>"

$('#apnav ul .r2-d2').click ->
  
  unless App.isStarted
    $('#apnav ul .selected').removeClass 'selected'
    $('#apnav ul .r2-d2').addClass 'selected'
    $('#maincontent').addClass('r2-d2').html template
    
    App.module 'HostRecords', HostRecords
    App.module 'DomainsInfo', DomainsInfo
    App.module 'Marketplace', Marketplace
    
    App.start()