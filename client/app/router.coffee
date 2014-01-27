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

        @collection = new TaskCollection()
        @collection.add new Task
                        content: '2 #cozy #todos'
                        id: 2
                        previous: 1
                        next: 3
        @collection.add new Task
                        content: '5 #cozy #calendar #feature'
                        id: 5
                        previous: 4
                        next: 6
        @collection.add new Task
                        content: '6 #cozy #todos #bug'
                        id: 6
                        previous: 5
                        next: 7
        @collection.add new Task
                        content: '9 #cozy #mesinfos #feature'
                        id: 9
                        previous: 8
                        next: 10
        @collection.add new Task
                        content: '4 #cozy #todos #feature'
                        id: 4
                        previous: 3
                        next: 5
        @collection.add new Task
                        content: '7 #cozy #feature'
                        id: 7
                        previous: 6
                        next: 8
        @collection.add new Task
                        content: '8 #cozy #mesinfos'
                        id: 8
                        previous: 7
                        next: 9
        @collection.add new Task
                        content: '3 #cozy #todos'
                        id: 3
                        previous: 2
                        next: 4
        @collection.add new Task
                        content: '10 #cozy #mesinfos #bug'
                        id: 10
                        previous: 9
                        next: 11
        @collection.add new Task
                        content: '11'
                        id: 11
                        previous: 10
                        next: 12
        @collection.add new Task
                        content: '12'
                        id: 12
                        previous: 11
                        next: null
        @collection.add new Task
                        content: '1 Call the doctor #personal'
                        id: 1
                        previous: null
                        next: 2

        @mainView = new AppView()
        @mainView.render()

        @menu = new MenuView collection: @collection
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


