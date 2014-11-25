async = require 'async'
Task = require '../models/tasky'
CozyInstance = require '../models/cozy_instance'

module.exports.main = (req, res) ->
    async.parallel [
        (callback) -> Task.allNotArchived (err, tasks) ->
            if err? then return callback err
            else return callback null, tasks

        (callback) -> Task.allArchived (err, tasks) ->
            if err? then return callback err
            else return callback null, tasks

        (callback) -> CozyInstance.getLocale (err, locale) ->
            if err? then return callback err
            else return callback null, locale

    ], (err, results) ->

        if err? then res.send
            error: 'Server error occurred while retrieving data'
            stack: err.stack
        else
            [tasks, archivedTasks, locale] = results
            res.render 'index.jade', imports: """
                window.locale = "#{locale}";
                window.tasks = #{JSON.stringify(tasks)};
                window.archivedTasks = #{JSON.stringify(archivedTasks)};
            """
