BaseView = require '../lib/base_view'
Utils = require '../lib/utils'

Task = require '../models/task'

ArchiveTaskView = require './archive_task_view'
TaskFormView = require './task_form_view'

module.exports = class ArchiveListView extends BaseView

    el: '.container'
    template: require './templates/task_list_archive'

    views: null
    collectionEl: 'ul#task-list'

    constructor: (options) ->
        @baseCollection = options.baseCollection
        @views = new Backbone.ChildViewContainer()
        super options

    # Override
    setTags: (tags) ->
        @selectedTags = tags

        if @collection?
            @stopListening @collection
            delete @collection

        @collection = @baseCollection.getByTags @selectedTags

        @listenTo @collection, 'add', @render
        @listenTo @collection, 'remove', @render
        @listenTo @collection, 'change', (task) =>
            unless task?.get('isArchived')
                taskView = @views.findByModel task
                taskView.$el.fadeOut =>
                    @stopListening taskView
                    @views.remove taskView
                    taskView.destroy()
                    @trigger 'restore-task', task

    getRenderData: -> title: @getTitle()

    beforeRender: ->
        @views.forEach (taskView) =>
            if @collection.indexOf(taskView.model) isnt -1
                taskView.$el.detach()
            else
                @stopListening taskView
                @views.remove taskView
                taskView.destroy()

    # Override
    afterRender: ->
        @collection.forEach (task) =>
            taskView = @views.findByModel task
            unless taskView?
                taskView = new ArchiveTaskView model: task
                @views.add taskView
            else
                taskView.delegateEvents()

            $(@collectionEl).append taskView.render().$el

        return @$el

    # Override
    getTitle: ->
        if @collection.length is @baseCollection.length
            return t 'all archived tasks'
        else
            tagsList = Utils.buildTagsList @selectedTags,
                            tagPrefix: '#'
                            regularSeparator: ', '
                            lastSeparator: " #{t('and')} "

            return t 'archived tasks of',
                tagsList: tagsList
                smart_count: @selectedTags.length

