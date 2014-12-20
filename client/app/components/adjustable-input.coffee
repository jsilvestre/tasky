React = require 'react/addons'
{input, span} = React.DOM
{KeyboardKeys} = require '../constants/AppConstants'

module.exports = React.createClass
    displayName: 'AdjustableInput'

    render: ->

        inputAttributes =
            style: width: @state.width
            ref: 'input'
            type: 'text'
            value: @state.content
            onChange: @onChange
            onBlur: @onBlur
            onKeyUp: @onKeyUp
            className: @props.className
            placeholder: @props.placeholder

        spanAttributes =
            ref: 'size-calculator'
            className: 'size-calculator'

        span null,
            input inputAttributes
            span spanAttributes, @state.content

    onChange: ->
        node = @refs['input'].getDOMNode()
        @setState content: node.value

    onKeyUp: (event) ->
        key = event.keyCode or event.charCode

        if key is KeyboardKeys.ENTER
            @props.onSubmitHandler @state.content
            @setState content: ''

    onBlur: ->
        node = @refs['input'].getDOMNode()
        if node.value.length is 0
            @setState width: 150

    componentDidUpdate: ->
        node = @refs['size-calculator'].getDOMNode()
        width = node.getClientRects()[0].width

        notInitialState = @state.content.length > 0 or @state.width > 150
        if @state.width isnt width and notInitialState
            @setState width: width

    getInitialState: -> width: 150, content: ''
