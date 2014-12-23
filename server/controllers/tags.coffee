async = require 'async'
FavoriteTag = require '../models/favorite_tag'

module.exports.create = (req, res) ->
    label = req.body.label

    FavoriteTag.ByLabelForTasky label, (err, tags) ->
        if err? or tags?.length > 0
            err = err or 'tag is already favorite'
            res.send 500, err
        else
            FavoriteTag.create label: label, application: 'tasky', ->
                res.send 201

module.exports.delete = (req, res) ->
    label = req.body.label

    FavoriteTag.ByLabelForTasky label, (err, tags) ->
        if err? or tags?.length is 0
            err = err or 'tag is not favorite'
            res.send 500, err
        else
            async.eachSeries tags, (tag, done) ->
                tag.destroy done
            , -> res.send 204
