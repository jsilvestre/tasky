React = require 'react/addons'
TaskActionCreator = require '../actions/TaskActionCreator'
TagActionCreator = require '../actions/TagActionCreator'
{div, i} = React.DOM

styler = require 'classnames'

module.exports = React.createClass
    displayName: 'ActionsBar'

    render: ->
        archiveStyles = styler
            'fa fa-archive': true
            disable: @props.tasksDone.length is 0

        archiveProperties =
            className: archiveStyles
            role: 'button'
            title: t('archive button title')
            onClick: @onArchiveClicked

        # the feature is currently not available
        saveStyles = styler
            'fa fa-bookmark disable': true

        saveProperties =
            className: saveStyles
            role: 'button'
            title: t('coming soon')

        # the feature is currently not available
        serializedSelectedTags = JSON.stringify @props.selectedTags
        serializedFavoriteSearch = JSON.stringify @props.favoriteSearch
        favoriteStyles = styler
            'fa fa-star': true
            'is-favorite': serializedFavoriteSearch is serializedSelectedTags

        favoriteProperties =
            className: favoriteStyles
            role: 'button'
            title: t('favorite button title')
            onClick: @onFavoriteClicked

        div id: 'actions', t('actions headline'),
            i archiveProperties
            i saveProperties
            i favoriteProperties


    onFavoriteClicked: ->
        TagActionCreator.markCurrentSearchAsFavorite()

    onArchiveClicked: ->
        TaskActionCreator.archiveTasks @props.tasksDone
