Task = require '../models/tasky'
reindexer = require '../lib/reindexer'

module.exports.reindexationMiddleware = (req, res, next) ->
    if reindexer.isReindexing()
        res.status(400).send error: "reindexation is occuring, retry later"
    else
        next()

module.exports.all = (req, res) ->
    Task.all (err, tasks) ->
        res.status(200).send []

module.exports.create = (req, res) ->
    Task.create req.body, (err, task) ->
        if err?
            res.status(500).send "An error occured while creating a task -- #{err}"
        else
            res.status(201).send task

module.exports.fetch = (req, res, next, id) ->
    Task.find id, (err, task) ->
        if err? or not task?
            res.status(404).send error: "Task not found"
        else
            req.task = task
            next()

module.exports.update = (req, res) ->
    req.task.updateAttributes req.body, (err, task) ->
        if err?
            res.status(500).send "An error occured while updating a task -- #{err}"
        else
            res.status(200).send task

module.exports.delete = (req, res) ->
    req.task.destroy (err) ->
        if err?
            res.status(500).send "An error occured while deleting a task -- #{err}"
        else
            res.status(204).send()

module.exports.reindex = (req, res) ->
    reindexer.reindex (err, tasks) ->
        if err?
            res.status(500).send error: err
        else
            res.status(200).send tasks
