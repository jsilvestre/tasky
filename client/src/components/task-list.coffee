React = require 'react/addons'
{div, ul, li, i, h1, p, button, span} = React.DOM

TaskActionCreator = require '../actions/TaskActionCreator'
TaskUtils = require '../utils/TaskUtil'

Breadcrumb = React.createFactory require './breadcrumb'
Task = React.createFactory require './task'
ProgressBar = React.createFactory require './progress-bar'

styler = classer = React.addons.classSet

module.exports = React.createClass
    displayName: 'TaskList'

    render: ->
        div role: 'main',
            Breadcrumb
                selectedTags: @props.selectedTags
                searchQuery: @props.searchQuery
                isArchivedMode: @props.isArchivedMode
                onOpenMenu: @props.onOpenMenu

            unless @props.isArchivedMode
                @getRenderTask
                    id: 'new-task'
                    key: "new-task"
                    index: 0
                    placeholder: @generatePlaceholder()
                    defaultValue: @generateDefaultValue()
                    isFocus: @state.focusIndex is 0

            ul id: 'task-list',
                @props.tasks.map (task, index) =>
                    # index + 1 because the new task form counts as a task
                    index = index + 1
                    @getRenderTask
                        key: "task-c#{task.cid}"
                        index: index
                        task: task
                        defaultValue: @generateDefaultValue()
                        isFocus: index is @state.focusIndex
                        isArchivedMode: @props.isArchivedMode

            unless @props.isArchivedMode
                @getActionsBar()

            unless @props.isArchivedMode
                ProgressBar
                    tasks: @props.tasks
                    tasksDone: @props.tasksDone

    # Helper to avoid adding all the handlers in every invokation
    getRenderTask: (options) ->
        currentTask = options.task or null
        options.newTaskHandler = @newTaskHandler.bind @, currentTask
        options.moveFocusUpHandler = @moveFocusUpHandler.bind @, currentTask
        options.moveFocusDownHandler = @moveFocusDownHandler.bind @, currentTask
        options.setFocusHandler = @setFocusHandler

        if currentTask?
            options.removeHandler = @removeTaskHandler.bind @, currentTask
            options.saveHandler = @saveTaskHandler.bind @, currentTask
            options.moveUpHandler = @moveTaskUpHandler.bind @, currentTask
            options.moveDownHandler = @moveTaskDownHandler.bind @, currentTask
            options.toggleStateHandler = @toggleStateHandler.bind @, currentTask
            options.restoreTaskHandler = @restoreTaskHandler.bind @, currentTask
        else
            noop = ->
            # Those handlers shouldn't do anything in the task form
            options.removeHandler = noop
            options.saveHandler = noop
            options.moveUpHandler = noop
            options.moveDownHandler = noop
            options.toggleStateHandler = noop
            options.restoreTaskHandler = noop

        return Task options

    getActionsBar: ->
        archiveStyles = classer
            'fa fa-archive': true
            disable: @props.tasksDone.length is 0

        archiveProperties =
            className: archiveStyles
            role: 'button'
            title: t('archive button title')
            onClick: @archiveHandler

        # the feature is currently not available
        saveStyles = classer
            'fa fa-bookmark disable': true

        saveProperties =
            className: saveStyles
            role: 'button'
            title: t('coming soon')

        p id: 'actions', t('actions headline'),
            i archiveProperties
            i saveProperties

    newTaskHandler: (previousTask, content = '') ->
        if content.length is 0
            content = @generateDefaultValue()

        TaskActionCreator.createTask content, previousTask

    removeTaskHandler: (task) ->
        # removing a task mechanically moves the focus down
        # we move it up unless this is the first task of the list and that there
        # is more than one task in the said list (don't go to the form unless
        # it's the only thing we can do)
        if @state.focusIndex isnt 1 or (@props.tasks.length - 1) is 0
            @moveFocusUpHandler()

        TaskActionCreator.removeTask task

    saveTaskHandler: (task, newContent) ->
        TaskActionCreator.editTask task, newContent

    moveTaskUpHandler: (task) ->
        TaskActionCreator.moveUp task

        # only move the focus to another task, not the form
        if @state.focusIndex isnt 1
            @moveFocusUpHandler()

    moveTaskDownHandler: (task) ->
        TaskActionCreator.moveDown task
        @moveFocusDownHandler()

    toggleStateHandler: (task, isDone) ->
        TaskActionCreator.toggleState task, isDone

    # Moves the focus to the previous task
    moveFocusUpHandler: ->
        if @state.focusIndex > 0
            newIndex = @state.focusIndex - 1
        else
            newIndex = 0

        @setState focusIndex: newIndex

    # Moves the focus to the next task
    moveFocusDownHandler: ->
        listLength = @props.tasks.length
        if @state.focusIndex < listLength
            newIndex = @state.focusIndex + 1
        else
            newIndex = listLength

        @setState focusIndex: newIndex

    # Sets the focus to the specified task
    setFocusHandler: (index) ->
        if index? and index >= 0
            newIndex = index
        else
            newIndex = -1

        @setState focusIndex: newIndex

    archiveHandler: ->
        TaskActionCreator.archiveTasks @props.tasksDone

    restoreTaskHandler: (task) ->
        TaskActionCreator.restoreTask task

    getInitialState: ->
        return focusIndex: 0

    generatePlaceholder: ->
        tagsList = TaskUtils.buildTagsList @props.selectedTags,
            tagPrefix: '#'
            regularSeparator: ', '
            lastSeparator: " #{t('and')} "

        if tagsList.length > 0
            return t 'form headline tags', tagsList: tagsList
        else
            return t 'form headline'

    generateDefaultValue: ->
        tagsList = TaskUtils.buildTagsList @props.selectedTags, tagPrefix: '#'
        tagsList =  "#{tagsList} " if tagsList isnt ""
        return tagsList
