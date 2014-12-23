AppDispatcher = require '../AppDispatcher'
{ActionTypes} = require '../constants/AppConstants'
XHRUtils = require '../utils/XHRUtils'
TagStore = require '../stores/TagStore'

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

    toggleFavorite: (label) ->

        favoriteTags = TagStore.getFavoriteTags()
        # fav the tag
        if favoriteTags.indexOf(label) is -1
            AppDispatcher.handleViewAction
                type: ActionTypes.TOGGLE_FAVORITE_TAG
                value: label

            XHRUtils.markTagAsFavorite label, ->

        # unfav the tag
        else
            AppDispatcher.handleViewAction
                type: ActionTypes.TOGGLE_FAVORITE_TAG
                value: label

            XHRUtils.unmarkTagAsFavorite label, ->
