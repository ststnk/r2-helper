(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var RefundOrders;

RefundOrders = require('./admin/refund-orders');

chrome.runtime.sendMessage({
  message: 'page:did:load'
}, (function(_this) {
  return function(response) {
    if (/creditcardrefund\.aspx/.test(response)) {
      return new RefundOrders();
    }
  };
})(this));


},{"./admin/refund-orders":2}],2:[function(require,module,exports){
var Entities, Objects, RefundOrders, Views,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Views = require('./refund-orders/views');

Objects = require('./refund-orders/objects');

Entities = require('./refund-orders/entities');

RefundOrders = (function(superClass) {
  extend(RefundOrders, superClass);

  function RefundOrders() {
    return RefundOrders.__super__.constructor.apply(this, arguments);
  }

  RefundOrders.prototype.initialize = function() {
    var Region, contentView;
    $('#findCCRefundOrderContentDiv').before("<div id='r2-helper-content'></div>");
    Region = Marionette.Region.extend({
      el: '#r2-helper-content'
    });
    this.region = new Region;
    this.orders = new Entities.RefundedOrdersCollection;
    contentView = new Views.Content;
    this.listenTo(contentView, 'parse:clicked', (function(_this) {
      return function() {
        var parser, progressView;
        parser = new Objects.RefundOrdersParser($('#contentTable'));
        _this.orders.add(parser.data());
        progressView = new Views.Progress({
          collection: _this.orders
        });
        _this.region.show(progressView);
        _this.orders.pullOrders();
        return _this.listenTo(progressView, 'export:clicked', function() {
          return _this.orders.toCSV();
        });
      };
    })(this));
    if ($('#contentTable').length && $('#contentTable').find('tbody tr').length) {
      return this.region.show(contentView);
    }
  };

  return RefundOrders;

})(Marionette.Object);

module.exports = RefundOrders;


},{"./refund-orders/entities":3,"./refund-orders/objects":4,"./refund-orders/views":7}],3:[function(require,module,exports){
var RefundedOrder, RefundedOrdersCollection,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

RefundedOrder = (function(superClass) {
  extend(RefundedOrder, superClass);

  function RefundedOrder() {
    return RefundedOrder.__super__.constructor.apply(this, arguments);
  }

  RefundedOrder.prototype.pull = function(queueName) {
    return $.ajaxq(queueName, {
      type: 'GET',
      url: this.get('Action URL')
    }).done((function(_this) {
      return function(data) {
        return _this.parseTable($(data).find('#contentTable:last-child'));
      };
    })(this));
  };

  RefundedOrder.prototype.parseTable = function($table) {
    this.set("Admin", this.parseColumn($table, 1));
    this.set("Description", this.parseColumn($table, 4));
    this.set("Action Date", this.parseColumn($table, 5));
    this.set("Action Comment", this.parseColumn($table, 6));
    this.unset("Action URL");
    return this.trigger("pulled");
  };

  RefundedOrder.prototype.parseColumn = function($table, col) {
    return $table.find("tbody tr td:nth-child(" + col + ")").map(function(index, td) {
      var val;
      val = $(td).text().trim();
      if (val.length) {
        return val;
      } else {
        return "-";
      }
    }).toArray();
  };

  return RefundedOrder;

})(Backbone.Model);

RefundedOrdersCollection = (function(superClass) {
  extend(RefundedOrdersCollection, superClass);

  function RefundedOrdersCollection() {
    return RefundedOrdersCollection.__super__.constructor.apply(this, arguments);
  }

  RefundedOrdersCollection.prototype.model = RefundedOrder;

  RefundedOrdersCollection.prototype.initialize = function(options) {
    this.queueName = 1;
    return this.listenTo(this, 'pulled', (function(_this) {
      return function() {
        if (_this.pulledOrders() === _this.length) {
          return _.defer(function() {
            return _this.trigger('pull:completed');
          });
        }
      };
    })(this));
  };

  RefundedOrdersCollection.prototype.pullOrders = function() {
    return this.each((function(_this) {
      return function(order) {
        return order.pull(_this.getQueueName());
      };
    })(this));
  };

  RefundedOrdersCollection.prototype.getQueueName = function() {
    var returnVal;
    returnVal = 'queue-' + this.queueName;
    if (this.queueName === 10) {
      this.queueName = 1;
    } else {
      this.queueName += 1;
    }
    return returnVal;
  };

  RefundedOrdersCollection.prototype.pulledOrders = function() {
    var pulled;
    pulled = this.filter(function(order) {
      return !order.get('Action URL');
    });
    return _.size(pulled);
  };

  RefundedOrdersCollection.prototype.toCSV = function() {
    var attributes, csvContent, data, encodedUri, link, rows;
    attributes = _.keys(this.first().attributes);
    rows = this.map(function(model) {
      return _.map(attributes, function(key) {
        return model.get(key);
      });
    });
    data = [attributes].concat(rows);
    data = _.map(data, function(row) {
      return _.map(row, function(val, key) {
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
    link.setAttribute('download', 'export.csv');
    return link.click();
  };

  return RefundedOrdersCollection;

})(Backbone.Collection);

module.exports.RefundedOrder = RefundedOrder;

module.exports.RefundedOrdersCollection = RefundedOrdersCollection;


},{}],4:[function(require,module,exports){
var RefundOrdersParser,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

RefundOrdersParser = (function(superClass) {
  extend(RefundOrdersParser, superClass);

  function RefundOrdersParser() {
    return RefundOrdersParser.__super__.constructor.apply(this, arguments);
  }

  RefundOrdersParser.prototype.initialize = function($table) {
    this.table = $table;
    return this.mapping = {
      "../images/tick-black.gif": "Totally Refunded",
      "../images/tick-gray.gif": "Partially Refunded",
      "../images/exclaim.gif": "Do Not Refund",
      "../images/exclaim-big.gif": "Voided",
      "../images/err.gif": "May Not Need Refund"
    };
  };

  RefundOrdersParser.prototype.data = function() {
    return this.table.find('tbody tr').map((function(_this) {
      return function(index, tr) {
        var actionStatus, source;
        actionStatus = $(tr).find('td').eq(8).find('div').eq(0).find('img').attr('src');
        actionStatus = actionStatus ? _this.mapping[actionStatus] : "";
        source = $(tr).find('td').eq(0).find('div').eq(1).text().trim();
        source = source.length ? source : "Credit Card";
        return {
          "Order ID": $(tr).find('td').eq(0).find('div').eq(0).text().trim(),
          "Username": $(tr).find('td').eq(1).find('div').eq(0).text().trim(),
          "Date": $(tr).find('td').eq(6).find('div').eq(1).text().trim(),
          "Payment Source": source,
          "Action URL": $(tr).find('td').eq(7).find('a').attr('href'),
          "Action Status": actionStatus
        };
      };
    })(this)).toArray();
  };

  return RefundOrdersParser;

})(Marionette.Object);

module.exports.RefundOrdersParser = RefundOrdersParser;


},{}],5:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="container"> <button id="r2-parse-refund-orders">Parse '+
((__t=( ordersCount ))==null?'':__t)+
' orders</button> </div>';
}
return __p;
};

},{}],6:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="container"> <p> Fetching orders info: '+
((__t=( pulledCount() ))==null?'':__t)+
' out of '+
((__t=( _.size(items) ))==null?'':__t)+
' in total... ';
 if (pulledCount() === _.size(items)) { 
__p+=' <button id="r2-export-refund-orders">Export orders</button> ';
}
__p+=' </p> </div>';
}
return __p;
};

},{}],7:[function(require,module,exports){
var Content, Progress,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Content = (function(superClass) {
  extend(Content, superClass);

  function Content() {
    return Content.__super__.constructor.apply(this, arguments);
  }

  Content.prototype.template = require('./templates/content');

  Content.prototype.triggers = {
    'click #r2-parse-refund-orders': 'parse:clicked'
  };

  Content.prototype.serializeData = function() {
    var data;
    data = Content.__super__.serializeData.call(this);
    data.ordersCount = $('#contentTable tbody tr').length;
    return data;
  };

  return Content;

})(Marionette.ItemView);

Progress = (function(superClass) {
  extend(Progress, superClass);

  function Progress() {
    return Progress.__super__.constructor.apply(this, arguments);
  }

  Progress.prototype.template = require('./templates/progress');

  Progress.prototype.collectionEvents = {
    'pulled': 'render'
  };

  Progress.prototype.templateHelpers = {
    pulledCount: function() {
      var pulled;
      pulled = _.filter(this.items, function(item) {
        return !item['Action URL'];
      });
      return _.size(pulled);
    }
  };

  Progress.prototype.triggers = {
    'click #r2-export-refund-orders': 'export:clicked'
  };

  return Progress;

})(Marionette.ItemView);

module.exports.Content = Content;

module.exports.Progress = Progress;


},{"./templates/content":5,"./templates/progress":6}]},{},[1]);
