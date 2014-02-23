async = require 'async'
Task = require '../models/task'
CozyInstance = require '../models/cozy_instance'

module.exports.main = (req, res) ->
    async.parallel [
        (callback) -> Task.all (err, tasks) =>
            return callback err if err?
            callback null, tasks

        (callback) -> CozyInstance.getLocale (err, locale) ->
            return callback err if err?
            callback null, locale

    ], (err, results) =>

        divisor = 1.01
        if err? then res.send
            error: 'Server error occurred while retrieving data'
            stack: err.stack
        else
            [tasks, locale] = results
            res.render 'index.jade', imports: """
                window.locale = "#{locale}";
                window.initTasks = #{JSON.stringify(tasks)};
                window.DIVISOR = #{divisor};
            """