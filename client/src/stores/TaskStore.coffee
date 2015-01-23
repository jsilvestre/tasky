_ = require 'underscore'
Store = require '../libs/flux/store/Store'
TaskUtils = require '../utils/TaskUtil'

{ActionTypes} = require '../constants/AppConstants'

class TaskStore extends Store

    ###
        Initialization.
        Defines private variables here.
    ###

    # cid are internal client IDs to identify a model even if
    # it has not an ID in the database yet. Not persisted.
    _cid = 0

    # Creates an OrderedMap of tasks
    ###
    _tasks = Immutable.Sequence window.tasks

        # sets task ID as index
        .mapKeys (_, task) -> return task.id

        # makes task object an immutable Map
        .map (task) -> Immutable.fromJS task

        .toOrderedMap()
    ###

    _archivedMode = false
    _archivedTasks = window.archivedTasks
    _tasks = window.tasks
    _searchQuery = null
    _isReindexing = false
    _cache = {}

    # TODO: retrieve the tasks sorted server-side
    _archivedTasks.sort (a, b) ->
        if a.completionDate > b.completionDate
            return 1
        else if a.completionDate < b.completionDate
            return -1
        else
            return 0

    _tasks.sort (a, b) ->
        if a.order > b.order
            return 1
        else if a.order < b.order
            return -1
        else
            return 0

    _tasksByCid = {}
    for task in _tasks
        task.cid = _cid++
        _tasksByCid[task.cid] = task

    _archivedTasksByCid = {}
    for task in _archivedTasks
        task.cid = _cid++
        _archivedTasksByCid[task.cid] = task

    _getTaskLists = ->
        if _archivedMode
            tasksList = _archivedTasks
            tasksListByCid = _archivedTasksByCid
        else
            tasksList = _tasks
            tasksListByCid = _tasksByCid

        return {tasksList, tasksListByCid}

    # invalid all cached lists if they contain the task
    _invalidCache = (task) ->
        tags = task.tags
        cacheKeys = Object.keys _cache
        for cacheKey in cacheKeys
            i = 0
            while i < tags.length and cacheKey.indexOf(tags[i]) is -1
                i++

            # invalidate the cache if the task is in it
            if cacheKey.indexOf(tags[i]) isnt -1
                delete _cache[cacheKey]

    __bindHandlers: (handle) ->
        handle ActionTypes.CREATE_TASK, (payload) ->
            {nextIndex, rawTask} = payload

            # insert rawTask at index nextIndex
            _tasks.splice nextIndex, 0, rawTask

            # adds the task to the cid index
            _tasksByCid[rawTask.cid] = rawTask

            # invalid cache
            _invalidCache rawTask

            @emit 'change'

        handle ActionTypes.REMOVE_TASK, (task) ->
            {tasksList, tasksListByCid} = _getTaskLists()

            index = tasksList.indexOf task
            tasksList.splice index, 1

            # removes task from cid index
            delete tasksListByCid[task.cid]

            # invalid cache
            _invalidCache task

            @emit 'change'

        handle ActionTypes.UPDATE_TASK, (payload) ->
            {tasksList, tasksListByCid} = _getTaskLists()
            {cid, changes} = payload
            task = tasksListByCid[cid]

            # invalid cache
            _invalidCache task

            for field, value of changes
                task[field] = value

            # invalid cache if the tags have changed
            if changes.tags?
                _invalidCache task

            @emit 'change'

        handle ActionTypes.REORDER_TASK, (payload) ->
            {tasksList, tasksListByCid} = _getTaskLists()
            {changedPiece, index, oldIndex, task} = payload
            [task1, task2] = changedPiece

            index = Math.max index, 0

            # No need to sort the list, just insert at the right spot
            tasksList.splice oldIndex, 1
            tasksList.splice index, 0, task

            # invalid cache
            _invalidCache task

            @emit 'change'

        handle ActionTypes.SET_ARCHIVED_MODE, (isArchived) ->
            _archivedMode = isArchived
            @emit 'change'

        handle ActionTypes.SET_SEARCH_QUERY, (searchQuery) ->
            _searchQuery = searchQuery
            @emit 'change'

        handle ActionTypes.ARCHIVE_TASK, (cid) ->
            task = _tasksByCid[cid]

            if task?
                # removes from list of tasks to do
                index = _tasks.indexOf task
                delete _tasksByCid[cid]
                _tasks.splice index, 1

                # changes boolean indicator
                task.isArchived = true

                # adds to the archived list of tasks
                _archivedTasksByCid[cid] = task
                index = _.sortedIndex _archivedTasks, task, (task) -> -(new Date(task.completionDate).getTime())
                _archivedTasks.splice index, 0, task

                # invalid cache
                _invalidCache task

                @emit 'change'

        handle ActionTypes.RESTORE_TASK, (cid) ->
            task = _archivedTasksByCid[cid]

            if task?
                # removes from list of archived tasks
                index = _archivedTasks.indexOf task
                delete _archivedTasksByCid[cid]
                _archivedTasks.splice index, 1

                # changes boolean indicator
                task.isArchived = false
                task.done = false

                # adds to the list of tasks to do
                _tasksByCid[cid] = task
                index = _.sortedIndex _tasks, task, (task) -> task.order
                _tasks.splice index, 0, task

                # invalid cache
                _invalidCache task

                @emit 'change'

        handle ActionTypes.SET_REINDEX_STATE, (isReindexing) ->
            _isReindexing = isReindexing
            @emit 'change'

    getAll: ->
        {tasksList} = _getTaskLists()
        return tasksList

    getUntagged: ->
        {tasksList} = _getTaskLists()
        return tasksList.filter (task) -> task.tags.length is 0

    getByTags: (tags) ->
        {tasksList} = _getTaskLists()

        # returns all unselected tags if the tag filter is empty
        if tags? and tags.length is 0
            return tasksList.filter (task) -> task.tags.length is 0

        # filter by tag
        else
            filteredTasksList = tasksList

            if tags?
                mapValue = (tag) -> tag.label
                includedTags = tags
                    .filter (tag) -> not tag.isExcluded
                    .map mapValue
                noInclusion = includedTags.length is 0

                excludedTags = tags
                    .filter (tag) -> tag.isExcluded
                    .map mapValue

                # the cache key is a unique hash based on tag selection
                cacheKey = [].concat tags # clone the tags

                    # sort the tag list so the cache is stable. I.e. cache is
                    # the same for tag1/tag2 and tag2/tag1
                    .sort (a, b) ->
                        if a.label > b.label
                            return 1
                        else if a.label > b.label
                            return -1
                        else
                            return 0

                    # lists are different if they have the same tags but some
                    # of them are included and others are excluded
                    .map (tag) ->
                        prefix = if tag.isExcluded then '!' else ''
                        return "#{prefix}#{tag.label}"

                    # '#' is the safest separator because it's used to mark the
                    # beginning of a tag
                    .join '#'

                cachedList = _cache[cacheKey]
                if cachedList?
                    filteredTasksList = cachedList
                else
                    # When there are no included tags, it means all tasks should
                    # be selected.
                    filteredTasksList = filteredTasksList.filter (task) ->
                        return (TaskUtils.containsTags(task, includedTags) or \
                               noInclusion) and \
                               TaskUtils.doesntContainsTags(task, excludedTags)

                    # add in cache
                    _cache[cacheKey] = filteredTasksList

            if _searchQuery?
                regex = new RegExp _searchQuery, 'i'
                filteredTasksList = filteredTasksList.filter (task) ->
                    regex.test task.description

            return filteredTasksList

    getNextCid: -> return _cid++

    isArchivedMode: -> return _archivedMode

    getNumTasks: -> return _tasks.length
    getNumArchivedTasks: -> return _archivedTasks.length

    getSearchQuery: -> return _searchQuery

    isReindexing: -> return _isReindexing

module.exports = new TaskStore()
