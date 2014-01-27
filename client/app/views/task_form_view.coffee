BaseView = require '../lib/base_view'
Utils = require '../lib/utils'

TaskView = require './task_view'

module.exports = class TaskListView extends BaseView

    el: '#new-task'
    template: require './templates/task_form'

    events:
        'keydown input': 'onKeydown'
        'keyup input': 'onKeyup'
        'click button': 'onSubmit'

    initialize: (options) ->
        super()
        @tags = options.tags

    onKeydown: (event) ->
        key = event.keyCode or event.charCode
        inputVal = @$('input').val()
        tagsList = Utils.buildTagsList @tags, tagPrefix: '#'
        tagsList =  "#{tagsList} " if tagsList isnt ""

        # neutral keys shouldn't add the tags list
        # backspace, space, tab, enter
        neutralKeys = [
            8, 32, 9, 13
        ]
        if inputVal.length is 0 and key not in neutralKeys \
           and not (event.metaKey or event.ctrlKey or event.altKey)
            @$('input').val tagsList
            inputVal = tagsList

    onKeyup: (event) ->
        key = event.keyCode or event.charCode
        inputVal = @$('input').val()

        # change the submit button state
        if inputVal.length is 0
            @$('button').addClass 'disabled'
            @$('button').html "New"
        else
            @$('button').removeClass 'disabled'
            @$('button').html "Add"

        # 'enter' submit the form
        @onSubmit() if key is 13

        # move the focus to the first task when key is 'arrow bottom'
        @trigger 'focus-down' if key is 40

    onSubmit: ->
        inputVal = @$('input').val()
        @trigger 'new-task-submitted', content: inputVal if inputVal.length > 0

    getRenderData: ->
        formPlaceholder: @getFormPlaceholder()

    getFormPlaceholder: ->
        tagsList = Utils.buildTagsList @tags,
                            tagPrefix: '#'
                            regularSeparator: ', '
                            lastSeparator: ' and '

        if tagsList.length > 0
            return "What's next with #{tagsList}?"
        else
            return "What's next?"
