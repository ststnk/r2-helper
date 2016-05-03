class RecordsParser extends Marionette.Object

  initialize: (data) ->
    @lines = _.compact data.split("\n")

  domains: ->
    _.map @lines, (line) ->
      values = _.compact line.split(/\s/)
      
      host:   values[0]
      domain: values[1]
      type:   values[2]
      value:  values[3]


module.exports.RecordsParser = RecordsParser