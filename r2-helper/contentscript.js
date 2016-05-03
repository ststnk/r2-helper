(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var App;

App = new Marionette.Application;

App.addRegions({
  hostRecordsRegion: '#host-records-region',
  domainsInfoRegion: '#domains-info-region',
  marketplaceRegion: '#marketplace-region'
});

App.on('start', function() {
  return App.isStarted = true;
});

module.exports = App;


},{}],2:[function(require,module,exports){
var App, DomainsInfo, HostRecords, Marketplace, template;

App = require('./app');

HostRecords = require('./modules/host-records');

DomainsInfo = require('./modules/domains-info');

Marketplace = require('./modules/marketplace');

$('#apnav ul:first-child').append("<li class='r2-d2'><a href=''><span>R2-D2 Helper</span></a></li>");

template = "<div class='row normal-vertical-spacing'> <div class='columns'><h1 class='section-title'>R2-D2 Helper</h1></div> </div> <div class='row add-margin-bottom-30'><hr></div> <div id='host-records-region'></div> <div id='domains-info-region'></div> <div id='marketplace-region'></div>";

$('#apnav ul .r2-d2').click(function() {
  if (!App.isStarted) {
    $('#apnav ul .selected').removeClass('selected');
    $('#apnav ul .r2-d2').addClass('selected');
    $('#maincontent').addClass('r2-d2').html(template);
    App.module('HostRecords', HostRecords);
    App.module('DomainsInfo', DomainsInfo);
    App.module('Marketplace', Marketplace);
    return App.start();
  }
});


},{"./app":1,"./modules/domains-info":3,"./modules/host-records":12,"./modules/marketplace":21}],3:[function(require,module,exports){
var App, Controller, DomainsInfoModule,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Controller = require('./domains-info/controller');

App = require('../app');

DomainsInfoModule = (function(superClass) {
  extend(DomainsInfoModule, superClass);

  function DomainsInfoModule() {
    return DomainsInfoModule.__super__.constructor.apply(this, arguments);
  }

  DomainsInfoModule.prototype.startWithParent = true;

  DomainsInfoModule.prototype.initialize = function() {
    return new Controller({
      region: App.domainsInfoRegion
    });
  };

  return DomainsInfoModule;

})(Marionette.Module);

module.exports = DomainsInfoModule;


},{"../app":1,"./domains-info/controller":4}],4:[function(require,module,exports){
var Controller, Entities, Objects, Views,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Views = require('./views');

Objects = require('./objects');

Entities = require('./entities');

Controller = (function(superClass) {
  extend(Controller, superClass);

  function Controller() {
    return Controller.__super__.constructor.apply(this, arguments);
  }

  Controller.prototype.initialize = function(options) {
    this.region = options.region;
    this.layout = this.getLayoutView();
    this.listenTo(this.layout, 'show', function() {
      return this.contentRegion();
    });
    return this.region.show(this.layout);
  };

  Controller.prototype.contentRegion = function() {
    var exportView;
    exportView = this.getExportView();
    this.listenTo(exportView, 'fetch:clicked', (function(_this) {
      return function() {
        var domains;
        domains = new Entities.DomainNamesCollection;
        _this.getDomains(domains);
        _this.listenTo(domains, 'fetch:all:completed', function() {
          var progressView;
          progressView = _this.getProgressView(domains);
          _this.layout.contentRegion.show(progressView);
          return domains.pullDomains();
        });
        return _this.listenTo(domains, 'pull:completed', function() {
          var csvView;
          csvView = _this.getCsvView(domains);
          _this.listenTo(csvView, 'export:clicked', function() {
            var attrs, username;
            username = $('[data-username]').text();
            attrs = csvView.selectedAttributes();
            return domains.toCSV(username, attrs);
          });
          _this.listenTo(csvView, 'start:over:clicked', function() {
            return this.contentRegion();
          });
          return _this.layout.contentRegion.show(csvView);
        });
      };
    })(this));
    return this.layout.contentRegion.show(exportView);
  };

  Controller.prototype.getCsvView = function(domains) {
    return new Views.Csv({
      collection: domains
    });
  };

  Controller.prototype.getProgressView = function(domains) {
    return new Views.PullProgress({
      collection: domains
    });
  };

  Controller.prototype.getDomains = function(domainsCollection) {
    var fetcher;
    fetcher = new Objects.DomainsFetcher;
    this.listenTo(fetcher, 'fetch:batch:completed', function(domains) {
      var models;
      models = _.map(domains, function(domain) {
        return {
          'Domain Name': domain
        };
      });
      return domainsCollection.add(models);
    });
    this.listenTo(fetcher, 'fetch:all:completed', function() {
      return domainsCollection.trigger('fetch:all:completed');
    });
    return fetcher.fetchAll();
  };

  Controller.prototype.getExportView = function() {
    return new Views.Export;
  };

  Controller.prototype.getLayoutView = function() {
    return new Views.Layout;
  };

  return Controller;

})(Marionette.Object);

module.exports = Controller;


},{"./entities":5,"./objects":6,"./views":11}],5:[function(require,module,exports){
var DomainName, DomainNamesCollection,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

DomainName = (function(superClass) {
  extend(DomainName, superClass);

  function DomainName() {
    return DomainName.__super__.constructor.apply(this, arguments);
  }

  DomainName.prototype.pull = function(queueName) {
    return $.ajaxq(queueName, {
      type: 'GET',
      url: 'https://ap.www.namecheap.com/Domains/DomainDetails/GetDomainDetailsTabOverView',
      data: {
        domainName: this.get('Domain Name')
      }
    }).done((function(_this) {
      return function(data) {
        var ref;
        if (data['Error']) {
          _this.set('Error', data['Msg']);
        } else if (_.isNull(JSON.parse(data['Result'])['DomainName'])) {
          _this.set('Error', 'Looks like this domains does not belong to this account');
        } else {
          data = JSON.parse(data['Result']);
          _this.setContacts(data, 'RegistrantContactDetails', 'Registrant Contacts');
          _this.setContacts(data, 'AdminContactDetails', 'Administrator Contacts');
          _this.setContacts(data, 'TechContactDetails', 'Technical Contacts');
          _this.setContacts(data, 'BillingContactDetails', 'Billing Contacts');
          _this.setWhoisGuardStatus((ref = data.WGDetails) != null ? ref.WGActiveStatus : void 0);
          _this.setNameserversType(data.NameServerDetails);
          _this.setExpirationDate(data.ExpiryDateTime);
          _this.setAutoRenew(data.AutoRenew);
        }
        return _this.trigger('pulled');
      };
    })(this));
  };

  DomainName.prototype.setContacts = function(data, key, attrName) {
    var contacts, extracted, ref;
    if (contacts = (ref = data.ContactDetails) != null ? ref[key] : void 0) {
      extracted = this.extractContacts(contacts);
      return this.set(attrName, extracted);
    }
  };

  DomainName.prototype.extractContacts = function(contacts) {
    var extracted;
    extracted = {};
    _.each(this.contactsMapping, function(val, key) {
      if (contacts[key]) {
        return extracted[val] = contacts[key];
      }
    });
    return extracted;
  };

  DomainName.prototype.contactsMapping = {
    FirstName: 'First Name',
    LastName: 'Last Name',
    Organization: 'Company Name',
    JobTitle: 'Job Title',
    Address1: 'Address',
    Address2: 'Address 2',
    City: 'City',
    StateProvince: 'State/Province',
    PostalCode: 'Zip/Postal Code',
    Country: 'Country',
    Phone: 'Phone Number',
    Fax: 'Fax Number',
    EmailAddress: 'Email Address'
  };

  DomainName.prototype.setWhoisGuardStatus = function(data) {
    var status;
    status = data ? 'Yes' : 'No';
    return this.set('WhoisGuard Enabled', status);
  };

  DomainName.prototype.setNameserversType = function(data) {
    this.set('Nameservers Type', data.DnsServerType);
    if (this.get('Nameservers Type') === 'Custom') {
      this.set('Nameservers Type', 'CustomDNS');
      this.set('Nameservers', data.NameserversList);
    }
    if (this.get('Nameservers Type') === 'Enom') {
      this.set('Nameservers Type', 'BackupDNS');
    }
    if (this.get('Nameservers Type') === 'NameCheapDefault') {
      this.set('Nameservers Type', 'BasicDNS');
    }
    if (this.get('Nameservers Type') === 'Premium') {
      this.set('Nameservers Type', 'PremiumDNS');
    }
    if (this.get('Nameservers Type') === 'DNS_com') {
      return this.set('Nameservers Type', 'HostingDNS');
    }
  };

  DomainName.prototype.setExpirationDate = function(data) {
    var date, day, month, monthNames, year;
    if (data) {
      monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      date = new Date(data);
      day = date.getDate();
      month = monthNames[date.getMonth()];
      year = date.getFullYear();
      return this.set('Expiration Date', day + " " + month + " " + year);
    }
  };

  DomainName.prototype.setAutoRenew = function(data) {
    var status;
    status = data ? 'Yes' : 'No';
    return this.set('AutoRenew Enabled', status);
  };

  return DomainName;

})(Backbone.Model);

DomainNamesCollection = (function(superClass) {
  extend(DomainNamesCollection, superClass);

  function DomainNamesCollection() {
    return DomainNamesCollection.__super__.constructor.apply(this, arguments);
  }

  DomainNamesCollection.prototype.model = DomainName;

  DomainNamesCollection.prototype.initialize = function(options) {
    this.listenTo(this, 'pulled', (function(_this) {
      return function() {
        if (_this.pulledDomains() === _this.length) {
          return _.defer(function() {
            return _this.trigger('pull:completed');
          });
        }
      };
    })(this));
    return this.queueName = 1;
  };

  DomainNamesCollection.prototype.pulledDomains = function() {
    var pulled;
    pulled = this.filter(function(domain) {
      return _.size(domain.attributes) > 1;
    });
    return _.size(pulled);
  };

  DomainNamesCollection.prototype.pullDomains = function() {
    return this.each((function(_this) {
      return function(domain) {
        return domain.pull(_this.getQueueName());
      };
    })(this));
  };

  DomainNamesCollection.prototype.getQueueName = function() {
    var returnVal;
    returnVal = 'queue-' + this.queueName;
    if (this.queueName === 10) {
      this.queueName = 1;
    } else {
      this.queueName += 1;
    }
    return returnVal;
  };

  DomainNamesCollection.prototype.toCSV = function(downloadName, attributes) {
    var csvContent, data, encodedUri, link, rows;
    _.defaults(function() {
      return {
        downloadName: 'export'
      };
    });
    rows = this.map(function(model) {
      return _.map(attributes, function(key) {
        return model.get(key) || '-';
      });
    });
    data = [attributes].concat(rows);
    data = _.map(data, function(row) {
      return _.map(row, function(val, key) {
        if (_.isObject(val)) {
          val = _.map(val, function(value, key) {
            return key + ": " + value;
          });
        }
        if (_.isArray(val)) {
          val = val.join("\n");
        }
        if (_.isString(val) && val.match(/,|\n|"/)) {
          val = '"' + val.trim() + '"';
        }
        return val;
      });
    });
    csvContent = "data:text/csv;charset=utf-8,";
    data.forEach(function(infoArray, index) {
      var dataString;
      dataString = infoArray.join(",");
      return csvContent += (index < data.length ? dataString + "\n" : dataString);
    });
    encodedUri = encodeURI(csvContent);
    link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', downloadName + '.csv');
    return link.click();
  };

  return DomainNamesCollection;

})(Backbone.Collection);

module.exports.DomainName = DomainName;

module.exports.DomainNamesCollection = DomainNamesCollection;


},{}],6:[function(require,module,exports){
var DomainsFetcher,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

DomainsFetcher = (function(superClass) {
  extend(DomainsFetcher, superClass);

  function DomainsFetcher() {
    return DomainsFetcher.__super__.constructor.apply(this, arguments);
  }

  DomainsFetcher.prototype.initialize = function(options) {
    this.lastAvailableChunkIndex = 0;
    return this.totalServerItemsCount = null;
  };

  DomainsFetcher.prototype.fetchAll = function() {
    var ajax;
    ajax = this.sendAjax();
    return ajax.complete((function(_this) {
      return function(data) {
        var domains;
        data = JSON.parse(ajax.responseText.replace(/,,,/g, ',0,0,').replace(/,,/g, ',0,').replace(/,]/g, ',0]'));
        domains = _.map(data['Result']['Data'], function(array) {
          return array[2];
        });
        _this.trigger('fetch:batch:completed', domains);
        if (domains.length === 1000) {
          _this.lastAvailableChunkIndex += 1;
          if (_this.totalServerItemsCount) {
            _this.totalServerItemsCount += 1000;
          } else {
            _this.totalServerItemsCount = 1000;
          }
          return _this.fetchAll();
        } else {
          return _this.trigger('fetch:all:completed');
        }
      };
    })(this));
  };

  DomainsFetcher.prototype.sendAjax = function() {
    return $.ajax({
      type: 'POST',
      url: 'https://ap.www.namecheap.com/Domains/GetDomainsOnly',
      data: {
        gridStateModel: {
          ServerChunkSize: 1000,
          LastAvailableChunkIndex: this.lastAvailableChunkIndex,
          IsLazyLoading: true,
          TotalServerItemsCount: this.totalServerItemsCount
        }
      },
      beforeSend: function(xhr) {
        return xhr.setRequestHeader('_NcCompliance', $('input[name="ncCompliance"]').val());
      }
    });
  };

  return DomainsFetcher;

})(Marionette.Object);

module.exports.DomainsFetcher = DomainsFetcher;


},{}],7:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="smaller"> <div class="row form add-margin-bottom-30"> <div class="columns xlarge-2"> <label for="domains-info-attributes">Attributes</label> </div> <div class="columns xlarge-8"> <select class="select2" id="domains-info-attributes" multiple="multiple"> ';
 _.each(attrs, function(attribute) { 
__p+=' <option value="'+
((__t=( attribute ))==null?'':__t)+
'" selected="selected">'+
((__t=( attribute ))==null?'':__t)+
'</option> ';
 }); 
__p+=' </select> <a class="btn btn-small-uppercase btn-green" id="domains-info-export">Export</a> <a class="alt-action alt-action-small" id="domains-info-start-over" href>Start Over</a> </div> <div class="columns xlarge-2"></div> </div> </div> <div class="row add-margin-bottom-30"><hr></div>';
}
return __p;
};

},{}],8:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="smaller"> <div class="row"> <div class="columns xlarge-2"></div> <div class="columns xlarge-10"> <a class="btn btn-small-uppercase btn-green" id="fetch-domains-info">Fetch Info</a> </div> </div> </div> <div class="row add-margin-bottom-30"><hr></div>';
}
return __p;
};

},{}],9:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="smaller"> <div class="row"> <div class="columns xlarge-2"> <span class="h-ribbon grey">Domains Info</span> </div> <div class="columns xlarge-10"> <p>Allows exporting domains info in CSV format.</p> </div> </div> </div> <div id="domains-info-content-region"></div>';
}
return __p;
};

},{}],10:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="smaller"> <div class="row"> <div class="columns xlarge-2"></div> <div class="columns xlarge-10"> <p>Fetching domains info: '+
((__t=( pulledCount() ))==null?'':__t)+
' out of '+
((__t=( _.size(items) ))==null?'':__t)+
' in total...</p> </div> </div> </div> <br> <div class="row add-margin-bottom-30"><hr></div>';
}
return __p;
};

},{}],11:[function(require,module,exports){
var Csv, Export, Layout, PullProgress,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Layout = (function(superClass) {
  extend(Layout, superClass);

  function Layout() {
    return Layout.__super__.constructor.apply(this, arguments);
  }

  Layout.prototype.template = require('./templates/layout');

  Layout.prototype.regions = {
    contentRegion: '#domains-info-content-region'
  };

  return Layout;

})(Marionette.LayoutView);

Export = (function(superClass) {
  extend(Export, superClass);

  function Export() {
    return Export.__super__.constructor.apply(this, arguments);
  }

  Export.prototype.template = require('./templates/export');

  Export.prototype.ui = {
    fetchButton: '#fetch-domains-info'
  };

  Export.prototype.triggers = {
    'click @ui.fetchButton': 'fetch:clicked'
  };

  Export.prototype.onFetchClicked = function() {
    this.ui.fetchButton.closest('div').addClass('disabled-content');
    return this.ui.fetchButton.html('Fetching...');
  };

  return Export;

})(Marionette.ItemView);

PullProgress = (function(superClass) {
  extend(PullProgress, superClass);

  function PullProgress() {
    return PullProgress.__super__.constructor.apply(this, arguments);
  }

  PullProgress.prototype.template = require('./templates/pull-progress');

  PullProgress.prototype.collectionEvents = {
    'pulled': 'render'
  };

  PullProgress.prototype.templateHelpers = {
    pulledCount: function() {
      var pulled;
      pulled = _.filter(this.items, function(item) {
        return _.size(_.keys(item)) > 1;
      });
      return _.size(pulled);
    }
  };

  return PullProgress;

})(Marionette.ItemView);

Csv = (function(superClass) {
  extend(Csv, superClass);

  function Csv() {
    return Csv.__super__.constructor.apply(this, arguments);
  }

  Csv.prototype.template = require('./templates/csv');

  Csv.prototype.serializeData = function() {
    var attrs;
    attrs = this.collection.chain().map(function(model) {
      return _.keys(model.attributes);
    }).flatten().uniq().value();
    return {
      attrs: attrs
    };
  };

  Csv.prototype.onAttach = function() {
    var script;
    script = document.createElement('script');
    script.textContent = '$("select.select2").select2({ minimumResultsForSearch: -1 });';
    document.head.appendChild(script);
    return script.parentNode.removeChild(script);
  };

  Csv.prototype.triggers = {
    'click #domains-info-export': 'export:clicked',
    'click #domains-info-start-over': 'start:over:clicked'
  };

  Csv.prototype.selectedAttributes = function() {
    return this.$('#domains-info-attributes').val();
  };

  return Csv;

})(Marionette.ItemView);

module.exports.Layout = Layout;

module.exports.Export = Export;

module.exports.PullProgress = PullProgress;

module.exports.Csv = Csv;


},{"./templates/csv":7,"./templates/export":8,"./templates/layout":9,"./templates/pull-progress":10}],12:[function(require,module,exports){
var App, Controller, HostRecordsModule,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Controller = require('./host-records/controller');

App = require('../app');

HostRecordsModule = (function(superClass) {
  extend(HostRecordsModule, superClass);

  function HostRecordsModule() {
    return HostRecordsModule.__super__.constructor.apply(this, arguments);
  }

  HostRecordsModule.prototype.startWithParent = true;

  HostRecordsModule.prototype.initialize = function() {
    return new Controller({
      region: App.hostRecordsRegion
    });
  };

  return HostRecordsModule;

})(Marionette.Module);

module.exports = HostRecordsModule;


},{"../app":1,"./host-records/controller":13}],13:[function(require,module,exports){
var Controller, Entities, Objects, Views,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Views = require('./views');

Objects = require('./objects');

Entities = require('./entities');

Controller = (function(superClass) {
  extend(Controller, superClass);

  function Controller() {
    return Controller.__super__.constructor.apply(this, arguments);
  }

  Controller.prototype.initialize = function(options) {
    this.region = options.region;
    this.layout = this.getLayoutView();
    this.listenTo(this.layout, 'show', (function(_this) {
      return function() {
        return _this.contentRegion();
      };
    })(this));
    return this.region.show(this.layout);
  };

  Controller.prototype.contentRegion = function() {
    var inputView;
    inputView = this.getInputView();
    this.listenTo(inputView, 'parse:clicked', (function(_this) {
      return function() {
        var records, recordsView;
        records = _this.getHostRecordsCollection(inputView.data());
        if (records.length > 0) {
          recordsView = _this.getRecordsView(records);
          _this.listenTo(recordsView, 'create:clicked', function() {
            return records.createHostRecords();
          });
          _this.listenTo(recordsView, 'start:over:clicked', function() {
            return _this.contentRegion();
          });
          return _this.layout.contentRegion.show(recordsView);
        }
      };
    })(this));
    return this.layout.contentRegion.show(inputView);
  };

  Controller.prototype.getRecordsView = function(records) {
    return new Views.HostRecords({
      collection: records
    });
  };

  Controller.prototype.getHostRecordsCollection = function(data) {
    var parsed;
    parsed = new Objects.RecordsParser(data).domains();
    return new Entities.HostRecordsCollection(parsed);
  };

  Controller.prototype.getInputView = function() {
    return new Views.Input;
  };

  Controller.prototype.getLayoutView = function() {
    return new Views.Layout;
  };

  return Controller;

})(Marionette.Object);

module.exports = Controller;


},{"./entities":14,"./objects":15,"./views":20}],14:[function(require,module,exports){
var HostRecord, HostRecordsCollection,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

HostRecord = (function(superClass) {
  extend(HostRecord, superClass);

  function HostRecord() {
    return HostRecord.__super__.constructor.apply(this, arguments);
  }

  HostRecord.prototype.initialize = function() {
    this.set('type', this.get('type').toUpperCase());
    return this.set('typeId', this.typeIdFor(this.get('type')));
  };

  HostRecord.prototype.typeIdFor = function(type) {
    return this.typeMapping[type];
  };

  HostRecord.prototype.typeMapping = {
    'A': 1,
    'CNAME': 2,
    'TXT': 5,
    'REDIRECT': 6,
    'FRAME': 7,
    'AAAA': 8,
    'NS': 9,
    '301': 10
  };

  HostRecord.prototype.defaults = {
    status: 'New',
    _complete: false
  };

  HostRecord.prototype.create = function() {
    this.set('_complete', false);
    this.set('status', 'Pending');
    return $.ajaxq(this.get('domain'), {
      url: "https://ap.www.namecheap.com/Domains/dns/AddOrUpdateHostRecord",
      data: {
        model: {
          HostId: -1,
          Host: this.get('host'),
          Data: this.get('value'),
          IsDynDns: false,
          RecordType: this.get('typeId'),
          Ttl: 1799
        },
        domainName: this.get('domain'),
        isAddNewProcess: true
      },
      type: 'POST',
      beforeSend: function(xhr) {
        return xhr.setRequestHeader('_NcCompliance', $('input[name="ncCompliance"]').val());
      }
    }).done((function(_this) {
      return function(data) {
        if (data['Error']) {
          _this.set('error', data['Msg']);
          _this.set('status', 'Error');
        } else {
          _this.set('status', 'Done');
        }
        return _this.set('_complete', true);
      };
    })(this));
  };

  return HostRecord;

})(Backbone.Model);

HostRecordsCollection = (function(superClass) {
  extend(HostRecordsCollection, superClass);

  function HostRecordsCollection() {
    return HostRecordsCollection.__super__.constructor.apply(this, arguments);
  }

  HostRecordsCollection.prototype.model = HostRecord;

  HostRecordsCollection.prototype.initialize = function() {
    return this.listenTo(this, 'change', (function(_this) {
      return function() {
        var complete;
        complete = _this.every(function(model) {
          return model.get('_complete');
        });
        if (complete) {
          return _this.trigger('host:records:created');
        }
      };
    })(this));
  };

  HostRecordsCollection.prototype.createHostRecords = function() {
    return this.each(function(model) {
      return model.create();
    });
  };

  return HostRecordsCollection;

})(Backbone.Collection);

module.exports.HostRecord = HostRecord;

module.exports.HostRecordsCollection = HostRecordsCollection;


},{}],15:[function(require,module,exports){
var RecordsParser,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

RecordsParser = (function(superClass) {
  extend(RecordsParser, superClass);

  function RecordsParser() {
    return RecordsParser.__super__.constructor.apply(this, arguments);
  }

  RecordsParser.prototype.initialize = function(data) {
    return this.lines = _.compact(data.split("\n"));
  };

  RecordsParser.prototype.domains = function() {
    return _.map(this.lines, function(line) {
      var values;
      values = _.compact(line.split(/\s/));
      return {
        host: values[0],
        domain: values[1],
        type: values[2],
        value: values[3]
      };
    });
  };

  return RecordsParser;

})(Marionette.Object);

module.exports.RecordsParser = RecordsParser;


},{}],16:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<td>'+
((__t=( domain ))==null?'':__t)+
'</td> <td>'+
((__t=( host ))==null?'':__t)+
'</td> <td>'+
((__t=( type ))==null?'':__t)+
'</td> <td>'+
((__t=( value ))==null?'':__t)+
'</td> ';
 if (status === 'New') { 
__p+=' <td><p class="badge">New</p></td> ';
 } else if (status === 'Pending') { 
__p+=' <td><p class="badge grace">Pending</p></td> ';
 } else if (status === 'Enqueued') { 
__p+=' <td><p class="badge warning">Enqueued</p></td> ';
 } else if (status === 'Done') { 
__p+=' <td><p class="badge ok">Done</p></td> ';
 } else if (status === 'Error') { 
__p+=' <td><p class="badge danger">Error</p> <p class="message">'+
((__t=( error ))==null?'':__t)+
'</p></td> ';
 } 
__p+='';
}
return __p;
};

},{}],17:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="smaller form"> <div class="row"> <div class="columns"> <div class="table-display"> <table> <thead> <tr> <th>Domain</th> <th>Host</th> <th>Type</th> <th>Value</th> <th>Status</th> </tr> </thead> <tbody></tbody> </table> <hr> </div> <div class="left"> <a class="btn btn-small-uppercase btn-green" id="create-host-records">Create</a> <a class="alt-action alt-action-small" id="create-host-start-over" href>Start Over</a> </div> </div> </div> </div> <div class="row add-margin-bottom-30"><hr></div>';
}
return __p;
};

},{}],18:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="smaller"> <div class="row add-margin-bottom-30 form"> <div class="columns xlarge-2"> <label for="host-records-source">Host Records</label> </div> <div class="columns xlarge-8"> <textarea placeholder="@ example.com A 12.23.34.45" id="host-records-source"></textarea> <a class="btn btn-small-uppercase btn-green" id="parse-host-records">Parse</a> </div> <div class="columns xlarge-2"></div> </div> </div> <div class="row add-margin-bottom-30"><hr></div>';
}
return __p;
};

},{}],19:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="smaller"> <div class="row"> <div class="columns xlarge-2"> <span class="h-ribbon grey">Add Host Records</span> </div> <div class="columns xlarge-10"> <p> Allows setting up host records in bulk. Always creates new records, existing host records are left intact. Currently supported record types are A, CNAME, TXT, REDIRECT, FRAME, AAAA, NS and 301. </p> </div> </div> </div> <div id="host-records-content-region"></div>';
}
return __p;
};

},{}],20:[function(require,module,exports){
var HostRecord, HostRecords, Input, Layout,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Layout = (function(superClass) {
  extend(Layout, superClass);

  function Layout() {
    return Layout.__super__.constructor.apply(this, arguments);
  }

  Layout.prototype.template = require('./templates/layout');

  Layout.prototype.regions = {
    contentRegion: '#host-records-content-region'
  };

  return Layout;

})(Marionette.LayoutView);

Input = (function(superClass) {
  extend(Input, superClass);

  function Input() {
    return Input.__super__.constructor.apply(this, arguments);
  }

  Input.prototype.template = require('./templates/input');

  Input.prototype.triggers = {
    'click #parse-host-records': 'parse:clicked'
  };

  Input.prototype.data = function() {
    return this.$('textarea').val();
  };

  return Input;

})(Marionette.ItemView);

HostRecord = (function(superClass) {
  extend(HostRecord, superClass);

  function HostRecord() {
    return HostRecord.__super__.constructor.apply(this, arguments);
  }

  HostRecord.prototype.template = require('./templates/host-record');

  HostRecord.prototype.tagName = 'tr';

  HostRecord.prototype.modelEvents = {
    'change': 'render'
  };

  return HostRecord;

})(Marionette.ItemView);

HostRecords = (function(superClass) {
  extend(HostRecords, superClass);

  function HostRecords() {
    return HostRecords.__super__.constructor.apply(this, arguments);
  }

  HostRecords.prototype.template = require('./templates/host-records');

  HostRecords.prototype.childView = HostRecord;

  HostRecords.prototype.childViewContainer = 'tbody';

  HostRecords.prototype.ui = {
    'createButton': '#create-host-records'
  };

  HostRecords.prototype.triggers = {
    'click @ui.createButton': 'create:clicked',
    'click #create-host-start-over': 'start:over:clicked'
  };

  HostRecords.prototype.collectionEvents = {
    'host:records:created': 'hostRecordsCreated'
  };

  HostRecords.prototype.onCreateClicked = function() {
    return this.ui.createButton.closest('div').addClass('disabled-content');
  };

  HostRecords.prototype.hostRecordsCreated = function() {
    return this.ui.createButton.closest('div').removeClass('disabled-content');
  };

  return HostRecords;

})(Marionette.CompositeView);

module.exports.Layout = Layout;

module.exports.Input = Input;

module.exports.HostRecord = HostRecord;

module.exports.HostRecords = HostRecords;


},{"./templates/host-record":16,"./templates/host-records":17,"./templates/input":18,"./templates/layout":19}],21:[function(require,module,exports){
var App, Controller, MarketplaceModule,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Controller = require('./marketplace/controller');

App = require('../app');

MarketplaceModule = (function(superClass) {
  extend(MarketplaceModule, superClass);

  function MarketplaceModule() {
    return MarketplaceModule.__super__.constructor.apply(this, arguments);
  }

  MarketplaceModule.prototype.startWithParent = true;

  MarketplaceModule.prototype.initialize = function() {
    return new Controller({
      region: App.marketplaceRegion
    });
  };

  return MarketplaceModule;

})(Marionette.Module);

module.exports = MarketplaceModule;


},{"../app":1,"./marketplace/controller":22}],22:[function(require,module,exports){
var Controller, Entities, Views,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Views = require('./views');

Entities = require('./entities');

Controller = (function(superClass) {
  extend(Controller, superClass);

  function Controller() {
    return Controller.__super__.constructor.apply(this, arguments);
  }

  Controller.prototype.initialize = function(options) {
    this.region = options.region;
    this.layout = this.getLayoutView();
    this.listenTo(this.layout, 'show', (function(_this) {
      return function() {
        return _this.contentRegion();
      };
    })(this));
    return this.region.show(this.layout);
  };

  Controller.prototype.contentRegion = function() {
    var inputView;
    inputView = this.getInputView();
    this.listenTo(inputView, 'list:for:sale:clicked', (function(_this) {
      return function() {
        var domains, tableView;
        domains = _this.getDomains(inputView.data());
        if (domains.length > 0) {
          tableView = _this.getTableView(domains);
          _this.listenTo(tableView, 'start:over:clicked', function() {
            return _this.contentRegion();
          });
          _this.layout.contentRegion.show(tableView);
          return domains.listForSale();
        }
      };
    })(this));
    return this.layout.contentRegion.show(inputView);
  };

  Controller.prototype.getTableView = function(domains) {
    return new Views.Table({
      collection: domains
    });
  };

  Controller.prototype.getDomains = function(data) {
    var domains;
    if (data.domains.trim().length === 0) {
      return [];
    }
    domains = _.map(data.domains.split("\n"), function(domain) {
      return _.chain(data).omit('domains').extend({
        name: domain.trim().toLowerCase()
      }).value();
    });
    return new Entities.DomainNamesCollection(domains);
  };

  Controller.prototype.getInputView = function() {
    return new Views.Input;
  };

  Controller.prototype.getLayoutView = function() {
    return new Views.Layout;
  };

  return Controller;

})(Marionette.Object);

module.exports = Controller;


},{"./entities":23,"./views":28}],23:[function(require,module,exports){
var DomainName, DomainNamesCollection,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

DomainName = (function(superClass) {
  extend(DomainName, superClass);

  function DomainName() {
    return DomainName.__super__.constructor.apply(this, arguments);
  }

  DomainName.prototype.defaults = {
    status: 'New',
    _complete: false
  };

  DomainName.prototype.list = function() {
    return $.ajax({
      type: 'POST',
      url: 'https://ap.www.namecheap.com/domains/AddDomainToMarketplaceListing',
      data: {
        model: {
          DomainName: this.get('name'),
          Description: this.get('description'),
          AskingPrice: this.get('price'),
          Period: this.get('period'),
          IsAdultListing: this.get('adult'),
          SaleEmailNotification: this.get('sendEmails'),
          SelectedCategory: this.get('categories')
        }
      },
      beforeSend: function(xhr) {
        return xhr.setRequestHeader('_NcCompliance', $('input[name="ncCompliance"]').val());
      }
    }).done((function(_this) {
      return function(data) {
        _this.set('message', data['Msg']);
        if (data['Error']) {
          _this.set('status', 'Error');
        } else {
          _this.set('status', 'Done');
        }
        return _this.set('_complete', true);
      };
    })(this));
  };

  return DomainName;

})(Backbone.Model);

DomainNamesCollection = (function(superClass) {
  extend(DomainNamesCollection, superClass);

  function DomainNamesCollection() {
    return DomainNamesCollection.__super__.constructor.apply(this, arguments);
  }

  DomainNamesCollection.prototype.model = DomainName;

  DomainNamesCollection.prototype.initialize = function() {
    return this.listenTo(this, 'change', function() {
      var complete;
      complete = this.every(function(model) {
        return model.get('_complete');
      });
      if (complete) {
        return this.trigger('listed');
      }
    });
  };

  DomainNamesCollection.prototype.listForSale = function() {
    return this.each(function(model) {
      model.set('status', 'Enqueued');
      return model.list();
    });
  };

  return DomainNamesCollection;

})(Backbone.Collection);

module.exports.DomainName = DomainName;

module.exports.DomainNamesCollection = DomainNamesCollection;


},{}],24:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="smaller"> <div class="row add-margin-bottom-30 form"> <div class="row"> <div class="columns"> <div class="columns xlarge-2"> <label for="marketplace-domains">Domain Names</label> </div> <div class="columns xlarge-8"> <textarea id="marketplace-domains"></textarea> </div> <div class="columns xlarge-2"></div> </div> </div> <div class="row"> <div class="columns"> <div class="columns xlarge-2"> <label for="marketplace-price">Asking Price ($)</label> </div> <div class="columns xlarge-8"> <input type="number" id="marketplace-price"> </div> <div class="columns xlarge-2"></div> </div> </div> <div class="row"> <div class="columns"> <div class="columns xlarge-2"> <label for="marketplace-period">List Period</label> </div> <div class="columns xlarge-8"> <select class="select2" id="marketplace-period"> <option value="7">7 days</option> <option value="15">15 days</option> <option value="30">30 days</option> <option value="60">60 days</option> <option value="90">90 days</option> </select> </div> <div class="columns xlarge-2"></div> </div> </div> <div class="row"> <div class="columns"> <div class="columns xlarge-2"> <label for="marketplace-description">Description</label> </div> <div class="columns xlarge-8"> <textarea id="marketplace-description"></textarea> </div> <div class="columns xlarge-2"></div> </div> </div> <div class="row"> <div class="columns"> <div class="columns xlarge-2"> <label for="marketplace-categories">Categories</label> </div> <div class="columns xlarge-8"> <select class="select2" id="marketplace-categories" multiple="multiple"> <option value="01">Acronyms</option> <option value="02">Advertising</option> <option value="03">Auto</option> <option value="17">Brand/ Name Identity</option> <option value="04">Business</option> <option value="20">Careers</option> <option value="21">Computers</option> <option value="05">Education</option> <option value="06">Entertainment</option> <option value="24">Family Life</option> <option value="16">Fashion/ Apparel</option> <option value="22">Financial</option> <option value="07">Health</option> <option value="23">Home</option> <option value="08">Internet</option> <option value="10">People</option> <option value="30">Photography</option> <option value="11">Real Estate</option> <option value="25">Reference</option> <option value="26">Region</option> <option value="12">Science</option> <option value="29">Shopping</option> <option value="27">Society</option> <option value="28">Special Events</option> <option value="13">Sports</option> <option value="14">Technology</option> <option value="15">Travel</option> <option value="19">Typo</option> <option value="09">Other</option> </select> </div> <div class="columns xlarge-2"></div> </div> </div> <div class="row"> <div class="columns"> <div class="columns xlarge-2"> <label for="marketplace-adult">Adult Listing</label> </div> <div class="columns xlarge-8"> <select class="select2" id="marketplace-adult"> <option value="true">Yes</option> <option value="false">No</option> </select> </div> <div class="columns xlarge-2"></div> </div> </div> <div class="row"> <div class="columns"> <div class="columns xlarge-2"> <label for="marketplace-send-emails">Send Emails</label> </div> <div class="columns xlarge-8"> <select class="select2" id="marketplace-send-emails"> <option value="true">Yes</option> <option value="false">No</option> </select> </div> <div class="columns xlarge-2"></div> </div> </div> <div class="row"> <div class="columns"> <div class="columns xlarge-2"></div> <div class="columns xlarge-10"> <a class="btn btn-small-uppercase btn-green" id="list-for-sale">List for Sale</a> </div> </div> </div> </div> </div> <div class="row add-margin-bottom-30"><hr></div>';
}
return __p;
};

},{}],25:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="smaller"> <div class="row"> <div class="columns xlarge-2"> <span class="h-ribbon grey">Marketplace</span> </div> <div class="columns xlarge-10"> <p>Allows listing domains for sale in bulk.</p> </div> </div> </div> <div id="marketplace-content-region"></div>';
}
return __p;
};

},{}],26:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<td>'+
((__t=( name ))==null?'':__t)+
'</td> ';
 if (status === 'New') { 
__p+=' <td><p class="badge">New</p></td> ';
 } else if (status === 'Enqueued') { 
__p+=' <td><p class="badge warning">Enqueued</p></td> ';
 } else if (status === 'Done') { 
__p+=' <td><p class="badge ok">Done</p> <p class="message">'+
((__t=( message ))==null?'':__t)+
'</p></td> ';
 } else if (status === 'Error') { 
__p+=' <td><p class="badge danger">Error</p> <p class="message">'+
((__t=( message ))==null?'':__t)+
'</p></td> ';
 } 
__p+='';
}
return __p;
};

},{}],27:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="smaller form"> <div class="row"> <div class="columns"> <div class="table-display"> <table> <thead> <tr> <th>Domain</th> <th>Status</th> </tr> </thead> <tbody></tbody> </table> <hr> </div> </div> </div> <div class="row"> <div class="columns disabled-content"> <a class="alt-action alt-action-small no-margin" id="marketplace-start-over" href>Start Over</a> </div> </div> </div>';
}
return __p;
};

},{}],28:[function(require,module,exports){
var Input, Layout, Table, TableRow,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Layout = (function(superClass) {
  extend(Layout, superClass);

  function Layout() {
    return Layout.__super__.constructor.apply(this, arguments);
  }

  Layout.prototype.template = require('./templates/layout');

  Layout.prototype.regions = {
    contentRegion: '#marketplace-content-region'
  };

  return Layout;

})(Marionette.LayoutView);

Input = (function(superClass) {
  extend(Input, superClass);

  function Input() {
    return Input.__super__.constructor.apply(this, arguments);
  }

  Input.prototype.template = require('./templates/input');

  Input.prototype.triggers = {
    'click #list-for-sale': 'list:for:sale:clicked'
  };

  Input.prototype.onAttach = function() {
    var script;
    script = document.createElement('script');
    script.textContent = '$("select.select2").select2({ minimumResultsForSearch: -1 });';
    document.head.appendChild(script);
    return script.parentNode.removeChild(script);
  };

  Input.prototype.data = function() {
    return {
      domains: $('#marketplace-domains').val(),
      price: $('#marketplace-price').val(),
      period: $('#marketplace-period').val(),
      description: $('#marketplace-description').val(),
      categories: $('#marketplace-categories').val() ? $('#marketplace-categories').val().join(',') : null,
      adult: $('#marketplace-adult').val(),
      sendEmails: $('#marketplace-send-emails').val()
    };
  };

  return Input;

})(Marionette.ItemView);

TableRow = (function(superClass) {
  extend(TableRow, superClass);

  function TableRow() {
    return TableRow.__super__.constructor.apply(this, arguments);
  }

  TableRow.prototype.template = require('./templates/table-row');

  TableRow.prototype.tagName = 'tr';

  TableRow.prototype.modelEvents = {
    'change': 'render'
  };

  return TableRow;

})(Marionette.ItemView);

Table = (function(superClass) {
  extend(Table, superClass);

  function Table() {
    return Table.__super__.constructor.apply(this, arguments);
  }

  Table.prototype.template = require('./templates/table');

  Table.prototype.childView = TableRow;

  Table.prototype.childViewContainer = 'tbody';

  Table.prototype.ui = {
    button: '#marketplace-start-over'
  };

  Table.prototype.triggers = {
    'click @ui.button': 'start:over:clicked'
  };

  Table.prototype.collectionEvents = {
    'listed': 'enableButton'
  };

  Table.prototype.enableButton = function() {
    return this.ui.button.closest('div').removeClass('disabled-content');
  };

  return Table;

})(Marionette.CompositeView);

module.exports.Layout = Layout;

module.exports.Input = Input;

module.exports.TableRow = TableRow;

module.exports.Table = Table;


},{"./templates/input":24,"./templates/layout":25,"./templates/table":27,"./templates/table-row":26}]},{},[2]);
