# See documentation on https://github.com/frankrousseau/americano-cozy/#models
americano = require 'americano'

module.exports = FavoriteTag = americano.getModel 'FavoriteTag',
    'label': String
    'application': String

FavoriteTag.allForTasky = (callback) ->
    FavoriteTag.request 'allByApp', key: 'tasky', (err, tags) ->
        err = err or tags.error
        if err? then callback err
        else
            labels = tags.map (tag) -> tag.label
            callback null, labels

FavoriteTag.ByLabelForTasky = (label, callback) ->
    options = key: ['tasky', label]
    FavoriteTag.request 'byAppByLabel', options, callback
