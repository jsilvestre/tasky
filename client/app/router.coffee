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
        'archived': 'archived'

        'search/:query': 'mainSearch'
        'todoByTags/*tags/;search/:query': 'todoByTagsWithSearch'
        'todoByTags/;search/:query': 'todoByTagsWithSearch'
        'todoByTags/*tags': 'todoByTags'

        'archivedByTags/*tags': 'archivedByTags'

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

    main: (followUp = false) ->

        # if called by another route, must be called with
        # followUp to true
        @taskList.setSearchQuery null unless followUp

        @taskList.setTags null
        @taskList.render()
        @menu.setViewType '#tobedone'
        @menu.setActive null
        @menu.render()

    mainSearch: (query) ->
        @taskList.setSearchQuery query
        @main true

    archived: ->
        @archivedTaskList.setTags null
        @archivedTaskList.render()
        @menu.setViewType '#archived'
        @menu.setActive null
        @menu.render()

    byTags: (viewType, listView, tags, searchQuery = null) ->

        if tags?
            tags = tags.split '/'

            # if the last char is '/', there is an empty element
            delete tags[tags.length - 1] if tags[tags.length - 1].length is 0
        else
            tags = []

        listView.setTags tags
        if viewType is '#tobedone'
            listView.setSearchQuery searchQuery
        listView.render()
        @menu.setViewType viewType
        @menu.setActive tags
        @menu.render()

    todoByTags: (tags) -> @byTags '#tobedone', @taskList, tags
    todoByTagsWithSearch: (tags, query) ->
        if not query?
            query = tags
            tags = null
        @byTags '#tobedone', @taskList, tags, query

    archivedByTags: (tags) -> @byTags '#archived', @archivedTaskList, tags


