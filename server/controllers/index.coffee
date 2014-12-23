fs = require 'fs'
path = require 'path'
async = require 'async'
Task = require '../models/tasky'
CozyInstance = require '../models/cozy_instance'
FavoriteTag = require '../models/favorite_tag'

getTemplateExtension = ->
    # If run from build/, templates are compiled to JS
    # otherwise, they are in jade
    filePath = path.resolve __dirname, '../../client/index.js'
    runFromBuild = fs.existsSync filePath
    extension = if runFromBuild then 'js' else 'jade'
    return extension

module.exports.main = (req, res) ->
    async.parallel {
        tasks: (done) -> Task.allNotArchived done
        archivedTasks: (done) -> Task.allArchived done
        locale: (done) -> CozyInstance.getLocale done
        favoriteTags: (done) -> FavoriteTag.allForTasky done
    }, (err, results) ->

        if err? then res.send
            error: 'Server error occurred while retrieving data'
            stack: err.stack
        else
            {tasks, archivedTasks, locale, favoriteTags} = results
            extension = getTemplateExtension()
            res.render "index.#{extension}", imports: """
                window.locale = "#{locale}";
                window.tasks = #{JSON.stringify(tasks)};
                window.archivedTasks = #{JSON.stringify(archivedTasks)};
                window.favoriteTags = #{JSON.stringify(favoriteTags)};
            """
