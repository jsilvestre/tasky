BaseView = require '../lib/base_view'
Utils = require '../lib/utils'

Task = require '../models/task'

TaskView = require './task_view'
TaskFormView = require './task_form_view'
BreadcrumbView = require './breadcrumb_view'

module.exports = class TaskListView extends BaseView

    el: '.container'
    template: require './templates/task_list'

    views: null
    collectionEl: 'ul#task-list'

    isReindexing: false

    events:
        'click #archive-action': 'onArchiveClicked'
        #'click h1': 'reindex'
        'onkeydown h1 input': 'onKeyDownMenuInput'

    reindex: ->
        @baseCollection.reindex()

    constructor: (options) ->
        @baseCollection = options.baseCollection
        @views = new Backbone.ChildViewContainer()
        super options

    initialize: ->
        @listenTo @baseCollection, 'reindexing', ->
            @isReindexing = true
            $('#block').show()
            $('#modal').show()

        @listenTo @baseCollection, 'reindexed', (error) ->
            @isReindexing = false
            $('#block').hide()
            $('#modal').hide()
            console.log error if error?

    setSearchQuery: (searchQuery) -> @searchQuery = searchQuery

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

        # we hide the form is there is a search to prevent the user
        # from adding a task and not being able to see it
        unless @searchQuery?
            @taskForm = new TaskFormView tags: @selectedTags
            @listenTo @taskForm, 'new-task-submitted', @createNewTask
            @listenTo @taskForm, 'focus-down', @onFocusDown
            @taskForm.render()

        if @searchQuery?
            regex = new RegExp @searchQuery, 'i'
            list = @collection.filter (task) ->
                regex.test task.get('description')
        else
            list = @collection

        list.forEach (task) =>
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

        @renderFormTitle()

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
            # if there is a search, the form is not displayed
            @taskForm.$el.find('input').focus() if @taskForm?

        return @$el

    renderFormTitle: ->
        breadcrumbView = new BreadcrumbView
                            selectedTags: @selectedTags
                            collectionLength: @collection.length
                            baseCollection: @baseCollection
                            searchQuery: @searchQuery
        breadcrumbView.render()

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

            tagsList = ''
            return t 'tasks of',
                tagsList: tagsList
                smart_count: @selectedTags.length

    createNewTask: (options = {}) ->
        return if @isReindexing

        tagsList = Utils.buildTagsList @selectedTags, tagPrefix: '#'
        tagsList =  "#{tagsList} " if tagsList isnt ""
        content = options.content or tagsList

        if options.previous?
            previous = @views.findByModelCid(options.previous).model
            nextIndex = @baseCollection.indexOf(previous) + 1
            newNext = @baseCollection.at nextIndex
            {order, step} = @baseCollection.getNewOrder previous, newNext
            index = nextIndex
        else
            newNext = @baseCollection.at 0
            {order, step} = @baseCollection.getNewOrder null, newNext
            index = 0

        task = new Task
            description: content
            order: order
            tags: Task.extractTags content

        # set the focus on the new task during next render
        @taskModelCIDToFocus = if options.previous? then task.cid else null

        @baseCollection.create task, at: index

        @checkIfReindexationIsNeeded step

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
        return if @isReindexing

        # we want to move up to the previous model in the base collection
        # so we need to know where is it then make get the new order
        currentModel = @views.findByModelCid(cid).model
        previousIndexInSubCollection = @collection.indexOf(currentModel) - 1
        previous = @collection.at previousIndexInSubCollection
        previousIndex = @baseCollection.indexOf previous
        previousOfPrevious = @baseCollection.at(previousIndex - 1) or null

        if previousIndex >= 0
            newOrder = @baseCollection.getNewOrder previousOfPrevious, previous
            {order, step} = newOrder
            currentModel.set 'order', order
            currentModel.save()
            @baseCollection.sort()
            @taskModelCIDToFocus = if toFocus? then toFocus else cid
            @render()

            @checkIfReindexationIsNeeded step

    onMoveDown: (cid) ->
        return if @isReindexing

        # we want to move up to the next model in the base collection
        # so we need to know where is it then make get the new order
        currentModel = @views.findByModelCid(cid).model
        nextIndexInSubCollection = @collection.indexOf(currentModel) + 1
        next = @collection.at nextIndexInSubCollection
        nextIndex = @baseCollection.indexOf next
        nextOfNextModel = @baseCollection.at(nextIndex + 1) or null

        # if not last item of the collection
        if nextIndex isnt @baseCollection.length and \
           nextIndexInSubCollection isnt @collection.length
            newOrder = @baseCollection.getNewOrder next, nextOfNextModel
            {order, step} = newOrder
            currentModel.set 'order', order
            currentModel.save()
            @baseCollection.sort()
            @taskModelCIDToFocus = if toFocus? then toFocus else cid
            @render()

            @checkIfReindexationIsNeeded step

    updateArchiveButtonState: ->
        if @collection.where(done: true).length > 0
            @$('#archive-action').removeClass 'disable'
        else
            @$('#archive-action').addClass 'disable'

    onArchiveClicked: ->
        return if @isReindexing

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

    checkIfReindexationIsNeeded: (step) ->

        threshold = Math.pow 10, 8
        maxThreshold = Number.MAX_VALUE / (@baseCollection.length + 1)
        threshold = maxThreshold if maxThreshold < threshold

        @baseCollection.reindex() if step <= threshold

