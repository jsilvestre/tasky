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
        super options

    render: ->

        noTagSelected = @selectedTags? and @selectedTags.length is 0
        unless @selectedTags?
            @$el.append t 'all tasks'
        else if noTagSelected
            @$el.append t 'untagged tasks'
        else
            @$el.append t 'tasks of', smart_count: @selectedTags.length

        if @selectedTags?
            for tag in @selectedTags
                tagInput = $ '<input type="text" value="#' + tag + '" />'
                @$el.append tagInput
                tagInput.change @onInputChange
                tagInput.keydown @adjustInputSize
                tagInput.keydown (evt) =>
                    key = evt.keyCode
                    inputEl = $ evt.currentTarget
                    if inputEl.val().length is 0 and key is 8
                        @onInputChange evt
                @adjustInputSize currentTarget: tagInput, false

        unless noTagSelected
            className = "class='add-tag'"
            placeholder = "placeholder='#{t('search tag input')}'"
            newTagInput = $ "<input #{className} type='text' #{placeholder}/>"
            @$el.append newTagInput
            newTagInput.change @onInputChange

    onInputChange: (evt) =>

        # correct the input to have only one tag
        inputEl = $ evt.currentTarget
        detectedTags = inputEl.val().match Task.regex
        if detectedTags?
            inputEl.val detectedTags[0]
            @adjustInputSize evt

        tags = []
        for input in @$ 'input'
            tag = $(input).val()
            tag = tag.replace '#', ''
            tags.push tag if tag.length > 0

        tags = _.uniq tags
        console.log tags
        if tags? and tags.length is 0
            app.router.navigate "#", true
        else
            allTags = @baseCollection.getAllTags().pluck 'id'

            # if the tag doesn't exist, we don't process the change
            if _.every tags, ((tag) -> tag in allTags)

                # if the new combination of tags doesn't have related tasks
                # we don't process the change
                hasTasksRelatedTo = @baseCollection.getByTags(tags).length > 0
                if hasTasksRelatedTo
                    tags = tags.join '/'
                    app.router.navigate "#todoByTags/#{tags}", true
                else
                    $(evt.currentTarget).addClass 'error'

            else
                $(evt.currentTarget).addClass 'error'

    adjustInputSize: (evt) ->
        inputEl = $ evt.currentTarget
        key = evt.keyCode

        # characters that will take space into the input: alpha numeric, sharp
        writtenChars = (48 <= key <= 57 or 65 <= key <= 90) or key is 220
        suffix = if not writtenChars then '' else 'a'
        content = _.escape inputEl.val() + suffix
        widthToSet = content.length * 13
        inputEl.width widthToSet

