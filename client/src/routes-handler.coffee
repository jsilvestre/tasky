TaskActionCreator = require './actions/TaskActionCreator'
TagActionCreator = require './actions/TagActionCreator'
TaskActionCreator = require './actions/TaskActionCreator'

module.exports = Handlers =

    main: ->
        TaskActionCreator.setSearchQuery null
        TaskActionCreator.setArchivedMode false
        TagActionCreator.selectTags null


    mainSearch: (query) ->
        TaskActionCreator.setSearchQuery query
        TaskActionCreator.setArchivedMode false
        TagActionCreator.selectTags null


    archived: ->
        TaskActionCreator.setSearchQuery null
        TaskActionCreator.setArchivedMode true
        TagActionCreator.selectTags null


    todoByTags: (tags) ->
        Handlers.byTags tags, null, false


    todoByTagsWithSearch: (tags, search) ->
        Handlers.byTags tags, search, false


    archivedByTags: (tags) ->
        Handlers.byTags tags, null, true


    byTags: (tags, searchQuery, isArchived) ->

        if tags?
            tags = tags.split '/'

            # if the last char is '/', there is an empty element
            tags.splice tags.length - 1 if tags[tags.length - 1].length is 0
        else
            tags = []

        TaskActionCreator.setArchivedMode isArchived
        TagActionCreator.selectTags tags
        TaskActionCreator.setSearchQuery searchQuery
