AppDispatcher = require '../AppDispatcher'
{ActionTypes} = require '../constants/AppConstants'

module.exports =

    selectTags: (tags) ->
        AppDispatcher.handleViewAction
            type: ActionTypes.SELECT_TAGS
            value: tags

    selectSortCriterion: (criterion) ->
        AppDispatcher.handleViewAction
            type: ActionTypes.SELECT_SORT_CRITERION
            value: criterion

        localStorage.setItem 'sort-criterion', criterion
