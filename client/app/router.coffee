AppView = require 'views/app_view'

MenuView = require 'views/menu_view'
TaskListView = require 'views/task_list_view'
ArchivedTaskListView = require 'views/archive_list_view'

TaskCollection = require 'collections/tasks'
ArchivedTaskCollection = require 'collections/archived_tasks'
Task = require 'models/task'

module.exports = class Router extends Backbone.Router

    routes:
        '': 'main'
        'untagged': 'untagged'
        'archived': 'archived'
        'byTags/*tags': 'byTags'

    initialize: ->
        @collection = new TaskCollection initTasks
        @archivedCollection = new ArchivedTaskCollection archivedTasks

        @mainView = new AppView()
        @mainView.render()

        @menu = new MenuView
            baseCollection: @collection
            archivedCollection: @archivedCollection

        @taskList = new TaskListView baseCollection: @collection
        @listenTo @taskList, 'archive-tasks', (tasks) =>
            @collection.remove tasks
            @archivedCollection.add tasks
            @taskList.render()
        @archivedTaskList = new ArchivedTaskListView baseCollection: @archivedCollection
        @listenTo @archivedTaskList, 'restore-task', (task) =>
            @archivedCollection.remove task
            @collection.add task
            @archivedTaskList.render()

    main: ->
        tags = null
        @taskList.setTags tags
        @taskList.render()
        @menu.setHighlightedItem 1
        @menu.setActive tags

    untagged: ->
        tags = []
        @taskList.setTags tags
        @taskList.render()
        @menu.setHighlightedItem 2
        @menu.setActive tags

    archived: ->
        tags =  undefined
        @archivedTaskList.setTags tags
        @archivedTaskList.render()
        @menu.setHighlightedItem 3
        @menu.setActive tags

    byTags: (tags) ->
        tags = tags.split '/'

        # if the last char is '/', there is an empty element
        delete tags[tags.length - 1] if tags[tags.length - 1] is ""

        @taskList.setTags tags
        @taskList.render()
        @menu.setHighlightedItem null
        @menu.setActive tags


