AppView = require 'views/app_view'

MenuView = require 'views/menu_view'
TaskListView = require 'views/task_list_view'

TaskCollection = require 'collections/tasks'
Task = require 'models/task'

module.exports = class Router extends Backbone.Router

    routes:
        '': 'main'
        'untagged': 'untagged'
        'byTags/*tags': 'byTags'

    initialize: ->
        @collection = new TaskCollection initTasks

        @mainView = new AppView()
        @mainView.render()

        @menu = new MenuView baseCollection: @collection
        @menu.render()

        @taskList = new TaskListView baseCollection: @collection

    main: ->
        tags = null
        @taskList.setTags tags
        @taskList.render()
        @menu.setActive tags

    untagged: ->
        tags = []
        @taskList.setTags tags
        @taskList.render()
        @menu.setActive tags

    byTags: (tags) ->
        tags = tags.split '/'

        # if the last char is '/', there is an empty element
        delete tags[tags.length - 1] if tags[tags.length - 1] is ""

        @taskList.setTags tags
        @taskList.render()
        @menu.setActive tags


