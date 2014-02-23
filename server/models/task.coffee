# See documentation on https://github.com/frankrousseau/americano-cozy/#models

americano = require 'americano'

module.exports = Task = americano.getModel 'Task',
    'done':
        type: Boolean, default: false
    'creationDate':
        type: Date, default: Date.now
    'completionDate':
        type: Date, default: null
    'description': String
    'order': Number
    'tags': type: JSON

Task.all = (callback) ->
    Task.request 'all', {}, (err, tasks) ->
        err = err or tasks.error
        callback err, tasks

Task.allByState = (isDone, callback) ->
    Task.request 'byState', key: isDone, (err, tasks) ->
        err = err or tasks.error
        callback err, tasks

