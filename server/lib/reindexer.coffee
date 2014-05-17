async = require 'async'
Task = require '../models/tasky'

isReindexing = false

module.exports.isReindexing = -> return isReindexing

module.exports.reindex = (callback) ->

    isReindexing = true

    Task.allInInterval {}, (err, tasks) ->
        console.log err if err?

        minOrder = 0
        maxOrder = Number.MAX_VALUE
        numTasks = tasks.length
        step  = (maxOrder - minOrder) / (numTasks + 1)

        # create a properly scoped function to update a task
        updateFactory = (task, order) -> (callback) ->
            task.updateAttributes order: order, callback

        # we don't pass the full task to lower the response size
        returnTasks = []
        updateActions = []
        for task in tasks
            newOrder = minOrder + (tasks.indexOf(task) + 1) * step
            returnTasks.push
                id: task.id
                order: newOrder
            updateActions.push updateFactory task, newOrder

        async.parallel updateActions, (err) ->
            if err?
                msg = "Something went wrong while reindexing tasks -- #{err}"
                console.log msg
            else
                console.log "Tasks have been successfully reindexed"
            isReindexing = false
            callback err, returnTasks