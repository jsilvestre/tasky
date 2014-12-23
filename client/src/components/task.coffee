React = require 'react/addons'
$ = require 'jquery'
moment = require 'moment'
{div, button, input, p} = React.DOM

{KeyboardKeys, Options} = require '../constants/AppConstants'

classer = React.addons.classSet

module.exports = React.createClass

    displayName: 'Task'
    interval: null

    render: ->
        buttonText = @getButtonText()
        buttonProperties =
            className: classer
                'toggle-state': true
                'button': true
                # only relevant if the component is a creation form
                'disabled': not @props.task and @state.inputValue.length is 0
            title: buttonText
            onMouseOver: @onMouseOver
            onMouseOut: @onMouseOut
            onClick: @onClick

        inputProperties =
            # For some reason tabIndex should start to 1
            tabIndex: @props.index + 1
            ref: 'task-content'
            placeholder: @props.placeholder or ''
            value: @state.inputValue
            onChange: @onChange
            onKeyUp: @onKeyUp
            onKeyDown: @onKeyDown
            onFocus: @onFocus
            onBlur: @onBlur

        wrapperClasses = classer
            'task': true
            'done': @props.task?.done
            'new-task': @isNewTaskForm()
            'is-creating': not @props.task?.id?

        div className: wrapperClasses,
            div className: 'task-container',
                button buttonProperties, buttonText
                div className: 'todo-field',
                    div className: 'task-input-wrapper',
                        input inputProperties

            if @props.isArchivedMode
                if @props.task.completionDate?
                    completionDate = moment @props.task.completionDate
                    formattedDate = completionDate.format t 'archived date format'
                else
                    formattedDate = ''
                div className: 'todo-completionDate',
                    p null, "#{t 'completed headline'} #{formattedDate}"

    # Returns button text based on component state.
    # The component can represent a task or be a creation form.
    getButtonText: ->
        # if there is a task, it can be toggled (todo/done)
        if @props.task?
            isDone = @props.task.done
            isArchived = @props.task.isArchived
            # Changes the button text depending on its state
            if @state.buttonHover and isArchived
                buttonText = t 'restore button?'
            else if @state.buttonHover and isDone
                buttonText = t 'todo button?'
            else if @state.buttonHover and not isDone
                buttonText = t 'done button?'
            else if not @state.buttonHover and isDone
                buttonText = t 'done button'
            else if not @state.buttonHover and not isDone
                buttonText = t 'todo button'

        # otherwise it's just a creation form
        else
            buttonText = t 'new button'

        return buttonText

    componentDidMount: -> @componentDidUpdate()
    componentDidUpdate: ->
        if @props.isFocus
            # Starts the periodical save if it's not a creation form
            # and if it's not already started
            if @props.task? and not @interval?
                @startPeriodocalSave()

            # Only selects the content when the task is focused (first render)
            if @state.selectContent
                node = @refs['task-content'].getDOMNode()
                $(node).focus()

                index = node.value.length
                node.setSelectionRange 0, index
                @setState selectContent: false

    getInitialState: ->
        return {
            buttonHover: false
            inputValue: @props.task?.description or ''
            selectContent: true
        }

    # Toggles button's state
    onMouseOver: -> @setState buttonHover: true
    onMouseOut: -> @setState buttonHover: false

    # Binds the input value to the component's state
    onChange: ->
        node = @refs['task-content'].getDOMNode()
        @setState inputValue: node.value

    # Moves the task (re-ordering) with ctrl+top/bottom arrow keys
    # Removes the task if it's empty with 'backspace' key
    # If it's a form, adds the selected tags at the beginning
    onKeyDown: (event) ->
        node = @refs['task-content'].getDOMNode()
        key = event.keyCode or event.charCode
        ctrlPressed = event.ctrlKey or event.metaKey
        comboKeyPressed = event.metaKey or event.ctrlKey or event.altKey

        # neutral keys shouldn't add the tags list
        # backspace, space, tab, enter, top/bottom/left/right arrows
        neutralKeys = [
            KeyboardKeys.BACKSPACE
            KeyboardKeys.SPACE
            KeyboardKeys.TAB
            KeyboardKeys.ENTER
            KeyboardKeys.ARROW_TOP
            KeyboardKeys.ARROW_DOWN
            KeyboardKeys.ARROW_LEFT
            KeyboardKeys.ARROW_RIGHT
        ]

        # sharp key on OSX, Ctrl+V is authorized
        authorizedComboKeys = [KeyboardKeys.OSX_SHARP, KeyboardKeys.V]

        if @isNewTaskForm() and node.value.length is 0 \
        and key not in neutralKeys \
        and (not comboKeyPressed or key in authorizedComboKeys)
            @setState inputValue: @props.defaultValue
        else if node.value.length is 0 and key is KeyboardKeys.BACKSPACE
            event.preventDefault()
            @props.removeHandler()
        else if key is KeyboardKeys.ARROW_TOP and ctrlPressed
            @props.moveUpHandler()
        else if key is KeyboardKeys.ARROW_DOWN and ctrlPressed
            @props.moveDownHandler()
        else if key is KeyboardKeys.ARROW_TOP
            @props.moveFocusUpHandler()
        else if key is KeyboardKeys.ARROW_DOWN
            @props.moveFocusDownHandler()

    # Changes focus with top/bottom keys
    # Creates new task with 'enter' key
    onKeyUp: (event) ->
        key = event.keyCode or event.charCode

        if key is KeyboardKeys.ENTER
            @createNewTask() unless @props.isArchivedMode

    # Handles focus by mouse click
    onFocus: ->
        unless @props.isFocus
            @props.setFocusHandler @props.index or 0

        @startPeriodocalSave()

    # Handles blur by mouse click
    onBlur: ->
        # removes the focus
        @props.setFocusHandler null if @props.isFocus

        # necessary so the content can be select on next focus
        @setState selectContent: true

        @stopPeriodicalSave()
        @saveDescription()

    onClick: ->
        if @props.task?
            if @props.task.isArchived
                @props.restoreTaskHandler()
            else
                @props.toggleStateHandler not @props.task.done
        else
            @createNewTask()

    createNewTask: ->
        # if the task already exist, we want to create an empty one
        content = if @props.task? then null else @state.inputValue
        @props.newTaskHandler content

        # resets the form field if it's a form
        @setState inputValue: "" unless @props.task?

        # moves the focus to the newly created task if it's not the form
        if @props.task?
            @props.setFocusHandler @props.index + 1


    # Starts a timer that saves the task content every
    # `Options.SAVE_INTERVAL_TIME` ms
    startPeriodocalSave: ->
        unless @interlval?
            @interval = setInterval =>
                @saveDescription()
            , Options.SAVE_INTERVAL_TIME

    saveDescription: ->
        ref = @refs['task-content']
        if ref?
            node = ref.getDOMNode()
            if node.value isnt @props.task?.description
                @props.saveHandler node.value

    stopPeriodicalSave: ->
        clearInterval @interval
        @interval = null

    componentWillUnmount: ->
        @stopPeriodicalSave()

    isNewTaskForm: ->
        return @props.placeholder?






