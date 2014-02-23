# See documentation on https://github.com/frankrousseau/americano#routes

index = require './index'
tasks = require './tasks'

module.exports =
    '':
        get: index.main

    'tasks':
        get: tasks.all
        post: tasks.create

    'taskID':
        param : tasks.fetch
    'tasks/:taskID':
        put: tasks.update
        del: tasks.delete

