async = require 'async'
AppDispatcher = require '../AppDispatcher'
{ActionTypes, Options} = require '../constants/AppConstants'
TaskStore = require '../stores/TaskStore'
TagStore = require '../stores/TagStore'
XHRUtils = require '../utils/XHRUtils'
TaskUtil = require '../utils/TaskUtil'

module.exports = SELF =

    createTask: (content, previousTask) ->

        tasks = TaskStore.getAll()

        if previousTask?
            nextIndex = tasks.indexOf(previousTask) + 1
        else
            nextIndex = 0

        nextTask = tasks[nextIndex]
        {order, step} = TaskUtil.getNewOrder previousTask, nextTask

        rawTask =
            cid: TaskStore.getNextCid()
            description: content
            order: order
            tags: TaskUtil.extractTags content

        AppDispatcher.handleViewAction
            type: ActionTypes.CREATE_TASK
            value: {nextIndex, rawTask}

        XHRUtils.create rawTask, (error, task) ->
            # TODO: handle error

            # updates with task id
            changes =
                id: task.id
                creationDate: task.creationDate
                completionDate: task.completionDate
            cid = rawTask.cid

            AppDispatcher.handleViewAction
                type: ActionTypes.UPDATE_TASK
                value: {cid, changes}

            # Reindexes if step is too small
            SELF.reindexTasks() if step <= Options.MIN_STEP

    moveUp: (task) ->

        selectedTags = TagStore.getSelected()
        tasks = TaskStore.getAll()
        subCollection = TaskStore.getByTags selectedTags

        # we want to move up to the previous model in the base collection
        # so we need to know where is it then make get the new order
        previousIndexInSubCollection = subCollection.indexOf(task) - 1
        previous = subCollection[previousIndexInSubCollection]
        previousIndex = tasks.indexOf previous
        previousOfPrevious = tasks[previousIndex - 1] or null

        if previousIndex >= 0
            {order, step} = TaskUtil.getNewOrder previousOfPrevious, previous
            changedPiece = [task, previous]

            changes = order: order
            cid = task.cid
            AppDispatcher.handleViewAction
                type: ActionTypes.UPDATE_TASK
                value: {cid, changes}

            AppDispatcher.handleViewAction
                type: ActionTypes.REORDER_TASK
                value:
                    task: task
                    changedPiece: changedPiece
                    index: previousIndex
                    oldIndex: tasks.indexOf task

            XHRUtils.update task.id, changes, (err, task) ->
                #console.log err, task
                # Reindexes if step is too small
                SELF.reindexTasks() if step <= Options.MIN_STEP

    moveDown: (task) ->

        selectedTags = TagStore.getSelected()
        tasks = TaskStore.getAll()
        subCollection = TaskStore.getByTags selectedTags

        # we want to move up to the next model in the base collection
        # so we need to know where is it then make get the new order
        nextIndexInSubCollection = subCollection.indexOf(task) + 1
        next = subCollection[nextIndexInSubCollection]
        nextIndex = tasks.indexOf next
        nextOfNext = tasks[nextIndex + 1] or null

        # if not last item of the collection
        if nextIndex isnt tasks.length and \
           nextIndexInSubCollection isnt subCollection.length
            {order, step} = TaskUtil.getNewOrder next, nextOfNext
            changedPiece = [next, task]

            changes = order: order
            cid = task.cid
            AppDispatcher.handleViewAction
                type: ActionTypes.UPDATE_TASK
                value: {cid, changes}

            AppDispatcher.handleViewAction
                type: ActionTypes.REORDER_TASK
                value:
                    task: task
                    changedPiece: changedPiece
                    index: nextIndex
                    oldIndex: tasks.indexOf task

            XHRUtils.update task.id, changes, (err, task) ->
                #console.log err, task
                # Reindexes if step is too small
                SELF.reindexTasks() if step <= Options.MIN_STEP

    editTask: (task, newContent) ->

        changes =
            description: newContent
            tags: TaskUtil.extractTags newContent
        cid = task.cid
        AppDispatcher.handleViewAction
            type: ActionTypes.UPDATE_TASK
            value: {cid, changes}

        XHRUtils.update task.id, changes, (err, task) ->
            #console.log err, task

    toggleState: (task, isDone) ->

        if isDone
            completionDate = Date.now()
        else
            completionDate = null

        changes = done: isDone, completionDate: completionDate
        cid = task.cid
        AppDispatcher.handleViewAction
            type: ActionTypes.UPDATE_TASK
            value: {cid, changes}

        XHRUtils.update task.id, changes, (err, task) ->
            #console.log err, task

    removeTask: (task) ->

        AppDispatcher.handleViewAction
            type: ActionTypes.REMOVE_TASK
            value: task

        XHRUtils.remove task.id, (err) ->
           #console.log err

    setArchivedMode: (isArchived) ->
        AppDispatcher.handleViewAction
            type: ActionTypes.SET_ARCHIVED_MODE
            value: isArchived

    setSearchQuery: (searchQuery) ->
        AppDispatcher.handleViewAction
            type: ActionTypes.SET_SEARCH_QUERY
            value: searchQuery


    archiveTasks: (tasks) ->
        async.eachLimit tasks, 5, (task, callback) ->
            AppDispatcher.handleViewAction
                type: ActionTypes.ARCHIVE_TASK
                value: task.cid
            payload =
                isArchived: true
                completionDate: Date.now()
            XHRUtils.update task.id, payload, (err) -> callback err
        , (err) ->
            # handle error case

    restoreTask: (task) ->
        AppDispatcher.handleViewAction
            type: ActionTypes.RESTORE_TASK
            value: task.cid
        payload =
            isArchived: false
            done: false
            completionDate: null
        XHRUtils.update task.id, payload, (err, task) ->
            # handle error case

    reindexTasks: ->
        AppDispatcher.handleViewAction
            type: ActionTypes.SET_REINDEX_STATE
            value: true
        XHRUtils.reindex (err, tasks) ->

            location.reload()

            AppDispatcher.handleViewAction
                type: ActionTypes.SET_REINDEX_STATE
                value: false

