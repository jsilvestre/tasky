Store = require '../libs/flux/store/Store'

TaskStore = require './TaskStore'

{ActionTypes, SortCriterions} = require '../constants/AppConstants'

class TagStore extends Store

    ###
        Initialization.
        Defines private variables here.
    ###
    _selectedTags = null

    fromLocalStorage = localStorage.getItem 'sort-criterion'
    _sortCriterion = fromLocalStorage or SortCriterions.COUNT

    __bindHandlers: (handle) ->

        handle ActionTypes.SELECT_TAGS, (tags) ->
            _selectedTags = tags?.map (tag) ->
                isExcluded = tag.indexOf('!') isnt -1
                value = tag.replace '!', ''
                return {value, isExcluded}

            @emit 'change'

        handle ActionTypes.SELECT_SORT_CRITERION, (criterion) ->
            _sortCriterion = criterion
            @emit 'change'

    getSelected: -> return _selectedTags

    getSelectedNames: -> _selectedTags?.map (tag) -> tag.value

    getSortCriterion: -> return _sortCriterion

    getTree: ->
        selectedTagNames = @getSelectedNames()
        maxDepth = selectedTagNames?.length or 0

        tree = []

        # Initializes an empty array for all depth
        tree.push {} for depth in [0..maxDepth] by 1

        # count number of tasks for each tag at the relevant depth
        buildTree = (depth, list, excludeList = []) ->

            # only count a task once for a tag
            uniqList = _.uniq list

            uniqList.forEach (tag) ->
                if tag not in excludeList
                    # initialize if it doesn't exist yet
                    tree[depth][tag] ?= 0
                    tree[depth][tag]++

        # Processes each tasks to build the tag tree (based on selected tags)
        TaskStore.getAll()
            .map (task) -> task.tags
            .forEach (tagsOfTask) ->
                # all tags are represented at depth 0
                buildTree 0, tagsOfTask

                # build the tree with task's tags if relevant
                for depth in [1..maxDepth] by 1

                    # we don't count this task for tags already processed
                    # at previous depth
                    processedSelection = selectedTagNames?.slice 0, depth

                    intersection = _.intersection processedSelection, tagsOfTask
                    if intersection.length is processedSelection.length
                        buildTree depth, tagsOfTask, processedSelection

        # tree is now complete
        aTree = []
        if _sortCriterion is 'count'
            # sort by -count, then +value
            [firstCriterion, secondCriterion, factor] = ['count', 'value', 1]
        else if _sortCriterion is 'alpha'
            # sort by +value, then -count
            [firstCriterion, secondCriterion, factor] = ['value', 'count', -1]


        for branch in tree
            depths = []
            depths.push value: tag, count: count for tag, count of branch
            depths.sort (a, b) ->
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
