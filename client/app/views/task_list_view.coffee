BaseView = require '../lib/base_view'
Utils = require '../lib/utils'

Task = require '../models/task'

TaskView = require './task_view'
TaskFormView = require './task_form_view'

module.exports = class TaskListView extends BaseView

    el: '.container'
    template: require './templates/task_list'

    views: {}
    collectionEl: 'ul#task-list'

    constructor: (options) ->
        @baseCollection = options.baseCollection
        super options

    setTags: (tags) ->

        console.log "set tags"

        @tags = tags

        if @collection? and @collection isnt @baseCollection
            @stopListening @collection
            delete @collection

        @collection = @baseCollection.getByTags @tags

        @listenTo @baseCollection, 'add', =>
            console.log "added to base collection"
            @render()
        @listenTo @collection, 'remove', (task) =>
            previousTaskID = task.get 'previous'
            previousTask = @baseCollection.get previousTaskID
            @taskModelCIDToFocus = previousTask.cid if previousTask?
            @render()

    getRenderData: -> title: @getTitle()

    afterRender: ->
        console.log "render"
        if @taskForm?
            @stopListening @taskForm
            @taskForm.destroy()
        @taskForm = new TaskFormView tags: @tags
        @listenTo @taskForm, 'new-task-submitted', @createNewTask
        @listenTo @taskForm, 'focus-down', @onFocusDown
        @taskForm.render()

        @collection.forEach (task) =>
            taskView = new TaskView
                        model: task
            @views[task.cid] = taskView
            @listenTo @views[task.cid], 'new-task-submitted', @createNewTask
            @listenTo @views[task.cid], 'focus-up', @onFocusUp
            @listenTo @views[task.cid], 'focus-down', @onFocusDown
            $(@collectionEl).append taskView.render().$el

        # if an element has been created or removed, focus task accordingly
        if @taskModelCIDToFocus?
            @views[@taskModelCIDToFocus].$el.find('input').focus()
            @taskModelCIDToFocus = null
        else
            @taskForm.$el.find('input').focus()

        return @$el

    getTitle: ->
        if @collection.length is @baseCollection.length
            return "All tasks"
        else if @tags? and @tags.length is 0
            return "Untagged tasks"
        else
            tagsList = Utils.buildTagsList @tags,
                            tagPrefix: '#'
                            regularSeparator: ', '
                            lastSeparator: ' and '

            return "Tasks of #{tagsList}"

    createNewTask: (options = {}) ->
        content = options.content or ""

        if options.previous?
            index = @baseCollection.indexOf(@views[options.previous].model) + 1
        else
            index = 0

        previousTask = @baseCollection.at index - 1
        nextTask = @baseCollection.at index
        task = new Task
            content: content
            previous: previousTask?.get('id') or previousTask?.cid
            next: nextTask?.get('id') or nextTask?.cid

        maxID = _.max(@baseCollection.pluck('id')) + 1
        task.id = maxID
        task.set 'id', maxID

        # TODO: use id when it's available
        previousTask?.set 'next', task.cid
        nextTask?.set 'previous', task.cid

        # set the focus on the new task during next render
        @taskModelCIDToFocus = task.cid

        @baseCollection.add task, at: index

    # broken because Object.key @views isn't stable
    onFocusUp: (cid) ->
        cidViews = Object.keys @views
        newIndex = cidViews.indexOf(cid) - 1

        console.log "focus up", cidViews
        if newIndex >= 0
            @views[cidViews[newIndex]].$el.find('input').focus()
        else
            @taskForm.$el.find('input').focus()

    # broken
    onFocusDown: (cid) ->
        cidViews = Object.keys @views

        newIndex = if cid? then cidViews.indexOf(cid) + 1 else 0

        if newIndex < cidViews.length
            @views[cidViews[newIndex]].$el.find('input').focus()

