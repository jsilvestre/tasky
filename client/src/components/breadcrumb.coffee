React = require 'react/addons'
{h1, span, input} = React.DOM

BreadcrumbItem = React.createFactory require './breadcrumb-item'
AdjustableInput = React.createFactory require './adjustable-input'

module.exports = React.createClass
    displayName: 'Breadcrumb'

    render: ->
        title = @getTitle()

        h1 id: 'breadcrumb', title,
            if @props.selectedTags?
                @renderSelectedTags()

            if @props.searchQuery?
                @renderSearchInput()

            if not @props.selectedTags? or (@props.selectedTags? and not @hasNoTagSelected())
                AdjustableInput
                    className: 'add-tag'
                    placeholder: t 'search tag input'
                    onSubmitHandler: @onSubmit

    renderSelectedTags: ->
        @props.selectedTags.map (tag, index) =>
            BreadcrumbItem
                key: index
                type: 'tag'
                tag: tag
                removeHandler: @removeHandler.bind @, tag
                toggleModeHandler: @toggleModeHandler.bind @, tag

    renderSearchInput: ->
        translationKey = 'match criterion'
        if @hasNoTagSelected()
            translationKey = "#{translationKey} no tag"
        else
            translationKey = "#{translationKey} with tag"

        BreadcrumbItem
            key: 'search-query'
            type: 'search'
            label: @props.searchQuery
            removeHandler: @removeHandler

    removeHandler: (tag) ->
        newTagsList = @props.selectedTags?.slice 0
        if tag? and newTagsList?
            index = newTagsList.indexOf tag
            newTagsList.splice index, 1
        else
            searchQuery = null

        @buildUrl newTagsList, searchQuery

    toggleModeHandler: (tag) ->
        newTagsList = @props.selectedTags?.slice 0
        if newTagsList?
            index = @props.selectedTags.indexOf tag
            newTagsList[index] =
                label: tag.label
                isExcluded: not tag.isExcluded

        @buildUrl newTagsList, @props.searchQuery

    onSubmit: (newTagValue) ->

        searchQuery = @props.searchQuery
        newTagsList = @props.selectedTags?.slice 0


        # tag or search query?
        if newTagValue.indexOf('#') is 0 or newTagValue.indexOf('!#') is 0
            isExcluded = newTagValue.indexOf('!') is 0

            # removes tag and exclusion markers
            newTagValue = newTagValue.replace /[!#]*/, ''

            if newTagsList?
                newTagsList.push label: newTagValue, isExcluded: isExcluded
            else
                newTagsList = [label: newTagValue, isExcluded: isExcluded]
        else
            searchQuery = newTagValue

        @buildUrl newTagsList, searchQuery

    buildUrl: (tagsList, searchQuery) ->
        if tagsList?
            formattedList = tagsList.map (tag) ->
                if tag.isExcluded
                    return "!#{tag.label}"
                else
                    return "#{tag.label}"

            formattedList = formattedList.join '/'
        else
            formattedList = ''

        query = ""
        # if tags are selected
        if tagsList?.length > 0
            if @props.isArchivedMode
                prefix = 'archivedByTags'
            else
                prefix = 'todoByTags/'

            if searchQuery?
                query = "/;search/#{searchQuery}"

        # if there is just a search query
        else if searchQuery?
            prefix = 'search/'
            query = searchQuery

        # nothing selected
        else
            if @props.isArchivedMode
                prefix = 'archived'
            else
                prefix = '#'


        location = "##{prefix}#{formattedList}#{query}"
        window.router.navigate location, true

    hasNoTagSelected: ->
        return not @props.selectedTags? or @props.selectedTags?.length is 0

    getInitialState: ->
        return inputContent: ''

    getTitle: ->
        unless @props.selectedTags?
            if @props.isArchivedMode
                title = t 'all archived tasks'
            else
                title = t 'all tasks'
        else if @hasNoTagSelected()
            title = t 'untagged tasks'
        else
            option = smart_count: @props.selectedTags.length
            if @props.isArchivedMode
                title = t 'archived tasks of', option
            else
                title = t 'tasks of', option

        return title

