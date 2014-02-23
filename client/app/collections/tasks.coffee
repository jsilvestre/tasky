TagsCollection = require './tags'
Task = require '../models/task'

module.exports = class TaskCollection extends Backbone.Collection

    url: 'tasks'
    model: Task

    comparator: (a, b) ->
        if a.get('order') > b.get('order')
            return -1
        else if a.get('order') is b.get('order')
            return 0
        else return 1

    getNewOrder: (prev, next) ->
        nextOrder = if next? then next.get 'order' else 0.0

        if prev?
            prevOrder = prev.get 'order'
            # defined in server/controllers/index
            return prevOrder - (prevOrder - nextOrder) / DIVISOR
        else
            return nextOrder + 1.0

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

