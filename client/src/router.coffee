window.__DEV__ = true

Backbone = require 'backbone'
React = require 'react/addons'
$ = require 'jquery'

TaskActionCreator = require './actions/TaskActionCreator'
TagActionCreator = require './actions/TagActionCreator'
TaskActionCreator = require './actions/TaskActionCreator'
App = React.createFactory require './components/application'

class Router extends Backbone.Router

    routes:
        '': 'main'
        'archived': 'archived'

        'search/:query': 'mainSearch'
        'todoByTags/*tags/;search/:query': 'todoByTagsWithSearch'
        'todoByTags/;search/:query': 'todoByTagsWithSearch'
        'todoByTags/*tags': 'todoByTags'

        'archivedByTags/*tags': 'archivedByTags'


    main: (followUp = false) ->
        TaskActionCreator.setSearchQuery null
        TaskActionCreator.setArchivedMode false
        TagActionCreator.selectTags null
        React.render App(), $('div#mount-point')[0]

    mainSearch: (query) ->
        TaskActionCreator.setSearchQuery query
        TaskActionCreator.setArchivedMode false
        TagActionCreator.selectTags null
        React.render App(), $('div#mount-point')[0]

    archived: ->
        TaskActionCreator.setSearchQuery null
        TaskActionCreator.setArchivedMode true
        TagActionCreator.selectTags null
        React.render App(), $('div#mount-point')[0]

    byTags: (viewType, listView, tags, searchQuery, isArchived) ->
        if tags?
            tags = tags.split '/'

            # if the last char is '/', there is an empty element
            tags.splice tags.length - 1 if tags[tags.length - 1].length is 0
        else
            tags = []

        TaskActionCreator.setArchivedMode isArchived
        TagActionCreator.selectTags tags
        TaskActionCreator.setSearchQuery searchQuery

        React.render App(), $('div#mount-point')[0]

    todoByTags: (tags) -> @byTags '#tobedone', @taskList, tags, null, false

    todoByTagsWithSearch: (tags, query) ->
        if not query?
            query = tags
            tags = null
        @byTags '#tobedone', @taskList, tags, query

    archivedByTags: (tags) ->
        @byTags '#archived', @archivedTaskList, tags, null, true


    goToDefault: (favoriteSearch) ->

        # go to favorite search unless there is no or the user didn't load
        # the home page
        currentRoute = Backbone.history.getFragment()
        if currentRoute.length is 0 and favoriteSearch?
            url = favoriteSearch.map (tag) ->
                if tag.isExcluded
                    prefix = "!"
                else
                    prefix = ""
                return "#{prefix}#{tag.label}/"

            url = "#todoByTags/#{url}"
            @navigate url, true

module.exports = new Router()
