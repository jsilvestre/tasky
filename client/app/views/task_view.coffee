BaseView = require '../lib/base_view'

module.exports = class TaskView extends BaseView

    tagName: 'li'
    className: 'task'
    template: require './templates/task'

    events:
        'keydown  input': 'onKeydown'
        'keyup  input': 'onKeyup'
        'focus input': 'onFocus'
        'blur input': 'onBlur'
        'click button': 'onClick'
        'mouseenter button': 'onMouseEnter'
        'mouseleave button': 'onMouseLeave'

    getRenderData: ->
        model: @model.toJSON()
        tabindex: @model.collection.indexOf(@model) + 2

    afterRender: ->
        if @model.get 'done'
            @$el.addClass 'done'
            @$('button').html t 'done button'
        else
            @$el.removeClass 'done'

    onClick: ->
        @model.set 'done', not @model.get 'done'
        if @model.get 'done'
            @model.set 'completionDate', Date.now()
        else
            @model.set 'completionDate', null
        @afterRender()
        @model.save()
        @render()

    onKeydown: (event) ->
        key = event.keyCode or event.charCode
        ctrlPressed = event.controlKey or event.metaKey

        # 'backspace' key
        if @$('input').val() is "" and key is 8
            @model.destroy()
            # prevent from going back into browser history
            event.preventDefault()

        else if key is 38 and ctrlPressed
            @trigger 'move-up', @model.cid
        else if key is 40 and ctrlPressed
            @trigger 'move-down', @model.cid

        @stopPerdiodicSave()
        @startPeriodicSave()

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

    onFocus: ->
        @startPeriodicSave()

    onBlur: ->
        @stopPerdiodicSave()
        @saveDescription()

    startPeriodicSave: ->
        @focusInterval = setInterval () =>
            @saveDescription() if @$('input').val() isnt ""
        , 2000

    stopPerdiodicSave: ->
        clearInterval @focusInterval

    saveDescription: ->
        description = @$('input').val()
        if description isnt @model.get 'description'
            # triggers the extract tags process
            @model.set 'description', description
            @model.save()

    setFocus: ->
        inputField = @$ 'input'
        inputField.focus()
        index = inputField.val().length
        inputField[0].setSelectionRange index, index

    onMouseEnter: ->
        button = @$ 'button'
        if @model.get 'done'
            button.attr 'title', t 'todo button?'
            button.html t 'todo button?'
        else
            button.attr 'title', t 'done button?'
            button.html t 'done button?'

    onMouseLeave: ->
        button = @$ 'button'
        if @model.get 'done'
            button.html t 'done button'
        else
            button.html t 'todo button'

    destroy: ->
        clearTimeout @focusInterval
        super()



