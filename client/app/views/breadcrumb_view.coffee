BaseView = require '../lib/base_view'
BreadcrumbItemView = require './breadcrumb_item'
Utils = require '../lib/utils'
app = require '../application'
Task = require '../models/task'

module.exports = class BreadcrumbView extends BaseView

    el: '#breadcrumb'
    views: null

    constructor: (options) ->
        @baseCollection = options.baseCollection
        @selectedTags = options.selectedTags
        @collectionLength = options.collectionLength
        @searchQuery = options.searchQuery
        @views = new Backbone.ChildViewContainer()
        super options

    render: ->
        @noTagSelected = not @selectedTags? or @selectedTags?.length is 0

        unless @selectedTags?
            @$el.append t 'all tasks'
        else if @noTagSelected
            @$el.append t 'untagged tasks'
        else
            @$el.append t 'tasks of', smart_count: @selectedTags.length

        if @selectedTags?
            @renderSelectedTags()

        if @searchQuery?
            @renderSearchInput()

        if not @selectedTags? or (@selectedTags? and not @noTagSelected)
            @renderDefaultInput()

    renderSelectedTags: ->
        for tag in @selectedTags
            breadcrumbItem = new BreadcrumbItemView model: tag, type: 'tag'
            @listenTo breadcrumbItem, 'remove', =>
                @views.remove breadcrumbItem
            @listenTo breadcrumbItem, 'change remove', @onInputChange
            @views.add breadcrumbItem
            tagInput = breadcrumbItem.render().$el
            @$el.append tagInput

    renderSearchInput: ->
        translationKey = 'match criterion'
        if @noTagSelected
            translationKey = "#{translationKey} no tag"
        else
            translationKey = "#{translationKey} with tag"

        breadcrumbItem = new BreadcrumbItemView model: @searchQuery, type: 'searcg'
        @listenTo breadcrumbItem, 'remove', =>
            @views.remove breadcrumbItem
        @listenTo breadcrumbItem, 'change remove', @onInputChange
        @views.add breadcrumbItem
        searchInput = breadcrumbItem.render().$el
        @$el.append searchInput

    renderDefaultInput: ->
        # size calcultor is used to compute width of the input field
        @$sizeCalculator = $ '<span class="size-calculator"></span>'
        @$el.append @$sizeCalculator

        className = "class='add-tag'"
        placeholder = "placeholder='#{t('search tag input')}'"
        newTagInput = $ "<input #{className} type='text' #{placeholder}/>"
        @$el.find('.size-calculator').before newTagInput
        @bindInputEvents newTagInput

    bindInputEvents: (input) ->
        @adjustInputSize currentTarget: input
        input.change @onInputChange
        input.keypress @adjustInputSize

    onInputChange: (evt) =>
        if evt?
            # correct the input to have only one tag
            inputEl = $ evt.currentTarget
            detectedTags = inputEl.val().match Task.regex
            if detectedTags?
                inputEl.val detectedTags[0]
                @adjustInputSize evt

        tags = []
        @views.forEach (view) ->
            value = view.model

            if view.type is 'tag'
                tag = value.replace '#', ''
                tags.push tag if tag.length > 0
            else
                # cut the first and last <"> characters
                query = value.substr 1, value.length - 2

        # we manage individually the default input
        # it can hold a tag search or a plain text search
        newInput = @$ 'input.add-tag'
        newInputVal = newInput.val()
        if newInput? and (newInputVal = newInput.val()).length > 0
            if newInputVal.indexOf('#') is 0 or newInputVal.indexOf('!#') is 0
                newInputVal = newInputVal.replace '#', ''
                tags.push newInputVal
            else
                # if there is already a query, we append to it
                if query?
                    query = "#{query} #{newInputVal}"
                else
                    query = newInputVal

        tags = _.uniq tags

        # if the user hasn't input a new search
        unless query?
            searchInput = @$ 'input.search'
            if searchInput? and (searchInputVal = searchInput.val())?.length > 0
                query = searchInputVal
            else
                query = null

        if tags? and tags.length is 0
            if query?
                location = "#search/#{query}"
            else
                location = '#'
            app.router.navigate location, true
        else
            allTags = @baseCollection.getAllTags().pluck 'id'

            # if the tag doesn't exist, we don't process the change
            rawTags = _.map tags, (tag) ->
                if tag.indexOf('!') is 0
                    return tag.substr 1
                else
                    return tag

            if _.every rawTags, ((tag) -> tag in allTags)

                # if the new combination of tags doesn't have related tasks
                # we don't process the change
                hasTasksRelatedTo = @baseCollection.getByTags(tags).length > 0
                if hasTasksRelatedTo
                    tags = tags.join '/'
                    searchLocation = if query? then "/;search/#{query}" else ''
                    location = "#todoByTags/#{tags}#{searchLocation}"
                    app.router.navigate location, true
                else
                    $(evt.currentTarget).addClass 'error' if evt?

            else
                $(evt.currentTarget).addClass 'error' if evt?

    adjustInputSize: (evt) =>
        inputEl = $ evt.currentTarget
        key = evt.keyCode or evt.charCode
        char = String.fromCharCode key
        inputVal = inputEl.val()

        # for the default input
        if inputVal.length is 0
            inputVal = inputEl.prop 'placeholder'

        @$sizeCalculator.text inputVal + char
        widthToSet = @$sizeCalculator.width()
        inputEl.width widthToSet

    destroy: ->
        @views.forEach (view) -> @stopListening view

