request = require 'superagent'

module.exports =

    create: (rawTask, callback) ->

        request.post "tasks"
        .send rawTask
        .set 'Accept', 'application/json'
        .end (err, res) ->
            if res.ok
                callback null, res.body
            else
                callback "Something went wrong -- #{res.body}"

    update: (taskID, attributes, callback) ->

        request.put "tasks/#{taskID}"
        .send attributes
        .set 'Accept', 'application/json'
        .end (err, res) ->
            if res.ok
                callback null, res.body
            else
                callback "Something went wrong -- #{res.body}"

    remove: (taskID, callback) ->

        request.del "tasks/#{taskID}"
        .set 'Accept', 'application/json'
        .end (err, res) ->
            if res.ok
                callback null
            else
                callback "Something went wrong -- #{res.body}"

    reindex: (callback) ->
        request.post 'tasks/reindex'
        .end (err, res) ->
            if res.ok
                callback null, res.body
            else
                callback "Something went wrong -- #{res.body}"

    markTagAsFavorite: (label, callback) ->
        request.post 'tags'
        .send {label}
        .end (err, res) ->
            if res.ok
                callback null
            else
                callback "Something went wrong -- #{res.body}"

    unmarkTagAsFavorite: (label, callback) ->
        request.del 'tags'
        .send {label}
        .end (err, res) ->
            if res.ok
                callback null
            else
                callback "Something went wrong -- #{res.body}"


    markSearchAsFavorite: (search) ->
        json = JSON.stringify search
        localStorage.setItem 'tasky.favorite_search', json


