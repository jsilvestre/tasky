BaseView = require '../lib/base_view'
Utils = require '../lib/utils'

Task = require '../models/task'

TaskView = require './task_view'
TaskFormView = require './task_form_view'

module.exports = class TaskListView extends BaseView

    el: '.container'
    template: require './templates/task_list'

    views: null
    collectionEl: 'ul#task-list'

    constructor: (options) ->
        @baseCollection = options.baseCollection
        @views = new Backbone.ChildViewContainer()
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

    beforeRender: ->
        @views.forEach (taskView) =>
            if @collection.indexOf(taskView.model) isnt -1
                taskView.$el.detach()
            else
                @stopListening taskView
                @views.remove taskView
                taskView.destroy()

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
            taskView = @views.findByModel task

            unless taskView?
                taskView = new TaskView
                            model: task
                @views.add taskView
                @listenTo taskView, 'new-task-submitted', @createNewTask
                @listenTo taskView, 'focus-up', @onFocusUp
                @listenTo taskView, 'focus-down', @onFocusDown

            $(@collectionEl).append taskView.render().$el

        #console.debug @views.pluck 'cid'

        # if an element has been created or removed, focus task accordingly
        if @taskModelCIDToFocus?
            @views.findByModelCid(@taskModelCIDToFocus).$el.find('input').focus()
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
            previousModel = @views.findByModelCid(options.previous).model
            index = @baseCollection.indexOf(previousModel) + 1
        else
            index = 0

        previousTask = @baseCollection.at index - 1
        nextTask = @baseCollection.at index
        task = new Task
            content: content
            previous: previousTask?.get('id') or previousTask?.cid
            next: nextTask?.get('id') or nextTask?.cid

        # TODO: remove
        maxID = _.max(@baseCollection.pluck('id')) + 1
        task.id = maxID
        task.set 'id', maxID

        # TODO: use id when it's available
        previousTask?.set 'next', task.cid
        nextTask?.set 'previous', task.cid

        # set the focus on the new task during next render
        @taskModelCIDToFocus = task.cid

        @baseCollection.add task, at: index

    onFocusUp: (cid) ->
        currentModel = @views.findByModelCid(cid).model
        previousIndex = @collection.indexOf(currentModel) - 1
        previousModel = @collection.at previousIndex

        if previousIndex >= 0
            @views.findByModel(previousModel).$el.find('input').focus()
        else
            @taskForm.$el.find('input').focus()

    onFocusDown: (cid) ->
        if cid?
            currentModel = @views.findByModelCid(cid).model
            nextIndex = @collection.indexOf(currentModel) + 1
            nextModel = @collection.at nextIndex
        else
            nextIndex = 0
            nextModel = @collection.at nextIndex

        if nextIndex < @views.length
            @views.findByModel(nextModel).$el.find('input').focus()

