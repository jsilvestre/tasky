_ = require 'underscore'
Store = require '../libs/flux/store/Store'

TaskStore = require './TaskStore'

{ActionTypes, SortCriterions} = require '../constants/AppConstants'

class TagStore extends Store

    ###
        Initialization.
        Defines private variables here.
    ###
    _selectedTags = null

    _favoriteTags = window.favoriteTags or []

    fromLocalStorage = localStorage.getItem 'sort-criterion'
    _sortCriterion = fromLocalStorage or SortCriterions.COUNT

    __bindHandlers: (handle) ->

        handle ActionTypes.SELECT_TAGS, (tags) ->
            _selectedTags = tags?.map (tag) ->
                isExcluded = tag.indexOf('!') isnt -1
                label = tag.replace '!', ''
                return {label, isExcluded}

            @emit 'change'

        handle ActionTypes.SELECT_SORT_CRITERION, (criterion) ->
            _sortCriterion = criterion
            @emit 'change'

        handle ActionTypes.TOGGLE_FAVORITE_TAG, (tag) ->
            tagIndex = _favoriteTags.indexOf tag

            if tagIndex is -1
                _favoriteTags.push tag
            else
                _favoriteTags.splice tagIndex, 1

            @emit 'change'

    getSelected: -> return _selectedTags

    getSelectedNames: -> _selectedTags?.map (tag) -> tag.label

    getSortCriterion: -> return _sortCriterion

    getFavoriteTags: -> return _favoriteTags

    getTree: ->
        selectedTagNames = @getSelectedNames()
        maxDepth = selectedTagNames?.length or 0

        tree = []

        # Initializes an empty array for all depth
        tree.push {} for depth in [0..maxDepth] by 1

        # count number of tasks for each tag at the relevant depth
        buildTree = (depth, list, isDone, excludeList = []) ->

            # only count a task once for a tag
            uniqList = _.uniq list

            uniqList.forEach (tag) ->
                if tag not in excludeList
                    # initialize if it doesn't exist yet
                    tree[depth][tag] ?= global: 0, done: 0
                    tree[depth][tag]['global']++
                    tree[depth][tag]['done']++ if isDone

        # Processes each tasks to build the tag tree (based on selected tags)
        TaskStore.getAll()
            .forEach (task) ->
                tagsOfTask = task.tags
                isDone = task.done

                # all tags are represented at depth 0
                buildTree 0, tagsOfTask, isDone

                # build the tree with task's tags if relevant
                for depth in [1..maxDepth] by 1

                    # we don't count this task for tags already processed
                    # at previous depth
                    processedSelection = selectedTagNames?.slice 0, depth

                    intersection = _.intersection processedSelection, tagsOfTask
                    if intersection.length is processedSelection.length
                        buildTree depth, tagsOfTask, isDone, processedSelection

        # tree is now complete
        aTree = []
        if _sortCriterion is 'count'
            # sort by -count, then +label
            [firstCriterion, secondCriterion, factor] = ['count', 'label', 1]
        else if _sortCriterion is 'alpha'
            # sort by +label, then -count
            [firstCriterion, secondCriterion, factor] = ['label', 'count', -1]


        for branch in tree
            depths = []
            for tag, count of branch
                depths.push
                    label: tag
                    count: count.global
                    doneCount: count.done
                    isFavorite: _favoriteTags.indexOf(tag) isnt -1

            depths.sort (a, b) ->

                if a.isFavorite and not b.isFavorite
                    return -1
                else if not a.isFavorite and b.isFavorite
                    return 1
                else
                    aFirst = a[firstCriterion]
                    bFirst = b[firstCriterion]
                    if aFirst > bFirst
                        return -1 * factor
                    else if aFirst < bFirst
                        return 1 * factor
                    else
                        aSecond = a[secondCriterion]
                        bSecond = b[secondCriterion]
                        if aSecond > bSecond
                            return -1 * factor
                        else if aSecond < bSecond
                            return 1 * factor
                        else
                            return 0

            aTree.push depths

        return aTree

module.exports = new TagStore()
