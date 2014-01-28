TagsCollection = require './tags'

module.exports = class TaskCollection extends Backbone.Collection

    url: 'tasks'

    # Returns tags once
    getAllTags: -> return TagsCollection.extractFromTasks @

    getByTags: (tags) ->

        # all the tasks, no matter how tagged they are
        return @ if tags is undefined or tags is null

        # untagged tasks
        if tags.length is 0
            return new BackboneProjections.Filtered @,
                filter: (task) -> task.get('tags').length is 0

        return new BackboneProjections.Filtered @,
                filter: (task) -> task.containsTags tags

    add: (task, options =  {}) ->

        if task.get('previous') is null
            options.at = 0
        else if task.get('next') is null
            options.at = @length
        else
            previousTask = @get task.get 'previous'
            nextTask = @get task.get 'next'

            if previousTask isnt undefined
                options.at = @indexOf(previousTask) + 1
            else if nextTask isnt undefined
                options.at = @indexOf nextTask

        super task, options

    remove: (task, options = {}) ->
        previousTask = @get task.get 'previous'
        nextTask = @get task.get 'next'

        previousTaskID = if previousTask? then previousTask.get 'id' else null
        nextTaskID = if nextTask? then nextTask.get 'id' else null

        previousTask.set 'next', nextTaskID if previousTask?
        nextTask.set 'previous', previousTaskID if nextTask?

        super task, options





