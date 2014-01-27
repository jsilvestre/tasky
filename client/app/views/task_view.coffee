BaseView = require '../lib/base_view'

module.exports = class TaskView extends BaseView

    tagName: 'li'
    className: 'task'
    template: require './templates/task'

    events:
        'keydown  input': 'onKeydown'
        'keyup  input': 'onKeyup'
        'blur input': 'onBlur'

    onKeydown: (event) ->
        key = event.keyCode or event.charCode

        # 'backspace' key
        if @$('input').val() is "" and key is 8
            @model.destroy()
            # prevent from going back into browser history
            event.preventDefault()

    onKeyup: (event) ->
        key = event.keyCode or event.charCode

        # 'enter' key
        if key is 13
            @onBlur() # save the current task
            @trigger 'new-task-submitted',
                content: ''
                previous: @model.cid
        else if key is 38 # top arrow
            @trigger 'focus-up', @model.cid
        else if key is 40 # bottom arrow
            @trigger 'focus-down', @model.cid

    onBlur: ->
        @model.set 'content', @$('input').val()

