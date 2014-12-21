Task = require '../models/tasky'
reindexer = require '../lib/reindexer'

module.exports.reindexationMiddleware = (req, res, next) ->
    if reindexer.isReindexing()
        res.send 400, error: "reindexation is occuring, retry later"
    else
        next()

module.exports.all = (req, res) ->
    Task.all (err, tasks) ->
        res.send 200, []

module.exports.create = (req, res) ->
    Task.create req.body, (err, task) ->
        if err?
            res.send 500, "An error occured while creating a task -- #{err}"
        else
            res.send 201, task

module.exports.fetch = (req, res, next, id) ->
    Task.find id, (err, task) ->
        if err? or not task?
            res.send 404, error: "Task not found"
        else
            req.task = task
            next()

module.exports.update = (req, res) ->
    req.task.updateAttributes req.body, (err, task) ->
        if err?
            res.send 500, "An error occured while updating a task -- #{err}"
        else
            res.send 200, task

module.exports.delete = (req, res) ->
    req.task.destroy (err) ->
        if err?
            res.send 500, "An error occured while deleting a task -- #{err}"
        else
            res.send 204, success: true

module.exports.reindex = (req, res) ->
    reindexer.reindex (err, tasks) ->
        if err?
            res.send 500, error: error
        else
            res.send 200, tasks
