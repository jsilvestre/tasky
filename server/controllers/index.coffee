fs = require 'fs'
path = require 'path'
async = require 'async'
Task = require '../models/tasky'
CozyInstance = require '../models/cozy_instance'

getTemplateExtension = ->
    # If run from build/, templates are compiled to JS
    # otherwise, they are in jade
    filePath = path.resolve __dirname, '../../client/index.js'
    runFromBuild = fs.existsSync filePath
    extension = if runFromBuild then 'js' else 'jade'
    return extension

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
            extension = getTemplateExtension()
            res.render "index.#{extension}", imports: """
                window.locale = "#{locale}";
                window.tasks = #{JSON.stringify(tasks)};
                window.archivedTasks = #{JSON.stringify(archivedTasks)};
            """
