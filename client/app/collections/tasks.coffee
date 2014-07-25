TagsCollection = require './tags'
Task = require '../models/task'

module.exports = class TaskCollection extends Backbone.Collection

    url: 'tasks'
    model: Task

    comparator: (a, b) ->
        if a.get('order') < b.get('order')
            return -1
        else if a.get('order') is b.get('order')
            return 0
        else return 1

    getNewOrder: (prev, next) ->

        topBoundary = if next? then next.get 'order' else Number.MAX_VALUE
        lowBoundary = if prev? then prev.get 'order' else 0.0

        step = (topBoundary - lowBoundary) / 2
        order = lowBoundary + step

        return {order, step}

    # Returns tags once
    getAllTags: (sortCriteria) -> return TagsCollection.extractFromTasks @, [], [], sortCriteria

    getByTags: (tags) ->

        # all the tasks, no matter how tagged they are
        return @ if tags is undefined or tags is null

        # untagged tasks
        if tags.length is 0
            return new BackboneProjections.Filtered @,
                filter: (task) -> task.get('tags').length is 0

        includedTags = _.filter tags, (tag) -> return tag.indexOf('!') isnt 0
        excludedTags = _.filter tags, (tag) -> return tag.indexOf('!') is 0
        excludedTags = _.map excludedTags, (tag) -> return tag.substr 1

        return new BackboneProjections.Filtered @,
                filter: (task) ->
                    task.containsTags(includedTags) and task.doesntContainsTags(excludedTags)

    reindex: ->
        @trigger 'reindexing'
        $.ajax 'tasks/reindex',
            method: 'POST'
            success: (data) =>
                data.forEach (task) => @get(task.id).set 'order', task.order
                @trigger 'reindexed'
            error: (data) =>
                @trigger 'reindexed', data
