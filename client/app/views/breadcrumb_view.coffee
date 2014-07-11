BaseView = require '../lib/base_view'
Utils = require '../lib/utils'
app = require '../application'
Task = require '../models/task'

module.exports = class BreadcrumbView extends BaseView

    el: '#breadcrumb'

    constructor: (options) ->
        @baseCollection = options.baseCollection
        @selectedTags = options.selectedTags
        @collectionLength = options.collectionLength
        @searchQuery = options.searchQuery
        super options

    render: ->
        @noTagSelected = not @selectedTags? or @selectedTags?.length is 0

        unless @selectedTags?
            @$el.append t 'all tasks'
        else if @noTagSelected
            @$el.append t 'untagged tasks'
        else
            @$el.append t 'tasks of', smart_count: @selectedTags.length

        # size calcultor is used to compute width of each input field
        @$sizeCalculator = $ '<span class="size-calculator"></span>'
        @$el.append @$sizeCalculator

        if @selectedTags?
            @renderSelectedTags()

        if @searchQuery?
            @renderSearchInput()

        if (not @selectedTags? or @selectedTags.length is 0) and not @searchQuery
            @renderDefaultInput()

    renderSelectedTags: ->
        for tag in @selectedTags
            tagInput = $ '<input type="text" value="#' + tag + '" />'
            @$el.find('.size-calculator').before tagInput
            @bindInputEvents tagInput
        @renderDefaultInput() unless @noTagSelected

    renderSearchInput: ->
        translationKey = 'match criterion'
        if @noTagSelected
            translationKey = "#{translationKey} no tag"
        else
            translationKey = "#{translationKey} with tag"

        searchInput = $ '<input class="search" type="text" value="' + @searchQuery + '" />'
        @$el.find('.size-calculator').before " #{t translationKey} \""
        @$el.find('.size-calculator').before searchInput
        @$el.find('.size-calculator').before '"'
        @bindInputEvents searchInput

        @renderDefaultInput() if @noTagSelected

    renderDefaultInput: ->
        className = "class='add-tag'"
        placeholder = "placeholder='#{t('search tag input')}'"
        newTagInput = $ "<input #{className} type='text' #{placeholder}/>"
        @$el.find('.size-calculator').before newTagInput
        @bindInputEvents newTagInput

    bindInputEvents: (input) ->
        @adjustInputSize currentTarget: input
        input.change @onInputChange
        input.keypress @adjustInputSize

        # triggers the change handler if the field is empty
        # and the user strokes backspace
        input.keydown (evt) =>
            key = evt.keyCode
            if input.val().length is 0 and key is 8
                evt.preventDefault()
                @onInputChange evt

    onInputChange: (evt) =>
        # correct the input to have only one tag
        inputEl = $ evt.currentTarget
        detectedTags = inputEl.val().match Task.regex
        if detectedTags?
            inputEl.val detectedTags[0]
            @adjustInputSize evt

        tags = []
        for input in @$ 'input:not(.search):not(.add-tag)'
            tag = $(input).val()
            tag = tag.replace '#', ''
            tags.push tag if tag.length > 0

        # we manage individually the default input
        # it can hold a tag search or a plain text search
        newInput = @$ 'input.add-tag'
        newInputVal = newInput.val()
        if newInput? and (newInputVal = newInput.val()).length > 0
            if newInputVal.indexOf('#') is 0
                newInputVal = newInputVal.replace '#', ''
                tags.push newInputVal
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
            if _.every tags, ((tag) -> tag in allTags)

                # if the new combination of tags doesn't have related tasks
                # we don't process the change
                hasTasksRelatedTo = @baseCollection.getByTags(tags).length > 0
                if hasTasksRelatedTo
                    tags = tags.join '/'
                    searchLocation = if query? then "/;search/#{query}" else ''
                    location = "#todoByTags/#{tags}#{searchLocation}"
                    app.router.navigate location, true
                else
                    $(evt.currentTarget).addClass 'error'

            else
                $(evt.currentTarget).addClass 'error'

    adjustInputSize: (evt) =>
        inputEl = $ evt.currentTarget
        key = evt.keyCode
        char = String.fromCharCode key
        inputVal = inputEl.val()

        # for the default input
        if inputVal.length is 0
            inputVal = inputEl.prop 'placeholder'

        @$sizeCalculator.text inputVal + char
        widthToSet = @$sizeCalculator.width()
        inputEl.width widthToSet

