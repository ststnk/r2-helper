class RecordsParser extends Marionette.Object

  initialize: (data) ->
    @lines = _.compact data.split("\n")

  domains: ->
    _.map @lines, (line) =>
      values = _.compact @_split(line, 4)
      
      host:   values[0]
      domain: values[1]
      type:   values[2]
      value:  values[3]

  _split: (str, count) ->
    result = []
    while result.length < count - 1
      index = str.search /\s/
      result.push str.slice(0, index)
      str = str.slice(index).trim()
    result.push str
    result


module.exports.RecordsParser = RecordsParser