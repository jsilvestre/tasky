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

    events:
        'click #archive-action': 'onArchiveClicked'

    constructor: (options) ->
        @baseCollection = options.baseCollection
        @views = new Backbone.ChildViewContainer()
        super options

    setTags: (tags) ->
        @selectedTags = tags

        if @collection?
            @stopListening @collection
            delete @collection

        @collection = @baseCollection.getByTags @selectedTags
        @listenTo @collection, 'add', @render
        @listenTo @collection, 'remove', (task) =>
            # set the focus to the previous view
            previousVisibleTask = task.getPreviousWithTags @selectedTags
            if previousVisibleTask?
                @taskModelCIDToFocus = previousVisibleTask.cid

            @render()

        @listenTo @collection, 'change', (task) => @updateArchiveButtonState()

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

        @updateArchiveButtonState()

        if @taskForm?
            @stopListening @taskForm
            @taskForm.destroy()
        @taskForm = new TaskFormView tags: @selectedTags
        @listenTo @taskForm, 'new-task-submitted', @createNewTask
        @listenTo @taskForm, 'focus-down', @onFocusDown
        @taskForm.render()

        @collection.forEach (task) =>
            taskView = @views.findByModel task
            unless taskView?
                taskView = new TaskView model: task
                @views.add taskView
                @listenTo taskView, 'new-task-submitted', @createNewTask
                @listenTo taskView, 'focus-up', @onFocusUp
                @listenTo taskView, 'focus-down', @onFocusDown
                @listenTo taskView, 'move-up', @onMoveUp
                @listenTo taskView, 'move-down', @onMoveDown
            else
                taskView.delegateEvents()

            $(@collectionEl).append taskView.render().$el

        # if an element has been created or removed, focus task accordingly
        if @taskModelCIDToFocus?
            view =  @views.findByModelCid @taskModelCIDToFocus
            if view?
                view.setFocus()
            else
                console.log "something went wrong trying to focus"
                @taskForm.$el.find('input').focus()
            @taskModelCIDToFocus = null
        else
            @taskForm.$el.find('input').focus()

        return @$el

    getTitle: ->
        if @collection.length is @baseCollection.length
            return t 'all tasks'
        else if @selectedTags? and @selectedTags.length is 0
            return t 'untagged tasks'
        else
            tagsList = Utils.buildTagsList @selectedTags,
                            tagPrefix: '#'
                            regularSeparator: ', '
                            lastSeparator: " #{t('and')} "

            return t 'tasks of',
                tagsList: tagsList
                smart_count: @selectedTags.length

    createNewTask: (options = {}) ->
        tagsList = Utils.buildTagsList @selectedTags, tagPrefix: '#'
        tagsList =  "#{tagsList} " if tagsList isnt ""
        content = options.content or tagsList

        if options.previous?
            previous = @views.findByModelCid(options.previous).model
            nextIndex = @baseCollection.indexOf(previous) + 1
            newNext = @baseCollection.at nextIndex
            order = @baseCollection.getNewOrder previous, newNext
            index = nextIndex
        else
            newNext = @baseCollection.at 0
            order = @baseCollection.getNewOrder null, newNext

        task = new Task
            description: content
            order: order
            tags: Task.extractTags content

        # set the focus on the new task during next render
        @taskModelCIDToFocus = if options.previous? then task.cid else null

        @baseCollection.create task, at: index

    onFocusUp: (cid) ->
        currentModel = @views.findByModelCid(cid).model
        previousIndex = @collection.indexOf(currentModel) - 1
        previousModel = @collection.at previousIndex

        if previousIndex >= 0
            @views.findByModel(previousModel).setFocus()
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
            @views.findByModel(nextModel).setFocus()

    onMoveUp: (cid, toFocus = null) ->
        currentModel = @views.findByModelCid(cid).model
        previousIndex = @baseCollection.indexOf(currentModel) - 1
        previous = @baseCollection.at previousIndex

        if previousIndex >= 1
            newOrder = null
            newPrevious = @baseCollection.at previousIndex - 1
            newOrder = @baseCollection.getNewOrder newPrevious, previous
        else if previousIndex is 0
            newOrder = @baseCollection.getNewOrder null, previous

        else newOrder = null

        if newOrder?
            currentModel.set 'order', newOrder
            currentModel.save()
            @baseCollection.sort()
            @taskModelCIDToFocus = if toFocus? then toFocus else cid
            @render()

    onMoveDown: (cid) ->
        currentModel = @views.findByModelCid(cid).model
        nextIndex = @baseCollection.indexOf(currentModel) + 1
        nextModel = @baseCollection.at nextIndex

        # moving down is moving up the next element
        if nextModel?
            nextView = @views.findByModelCid(nextModel.cid)
            @onMoveUp nextModel.cid, cid

    updateArchiveButtonState: ->
        if @collection.where(done: true).length > 0
            @$('#archive-action').removeClass 'disable'
        else
            @$('#archive-action').addClass 'disable'

    onArchiveClicked: ->
        tasksToArchive = @collection.where done: true
        counterToArchive = tasksToArchive.length
        counterArchived = 0

        if counterToArchive > 0
            @$('#archive-action').html '&nbsp;'
            @$('#archive-action').spin 'tiny', '#fff'

        done = (task) =>
            counterArchived++
            taskView = @views.findByModel task
            # when all requests are done
            if counterArchived is counterToArchive
                @stopListening taskView
                @views.remove taskView
                taskView.$el.fadeOut =>
                    taskView.destroy()
                    @$('#archive-action').html t 'archive button'
                    @trigger 'archive-tasks', tasksToArchive
            else
                @stopListening taskView
                @views.remove taskView
                taskView.$el.fadeOut ->
                    taskView.destroy()

        tasksToArchive.forEach (task) ->
            task.set 'isArchived', true
            task.once 'sync', done
            task.save()
