React = require 'react/addons'
_ = require 'underscore'
{div, input, label, button, i} = React.DOM

styler = require 'classnames'

module.exports = React.createClass
    displayName: 'TaskButton'

    render: ->

        classes = styler 'disabled': @props.disabled

        buttonProperties =
            className: classes
            role: 'button'

        unless @props.disabled
            buttonProperties.onClick = @props.onSubmit

        button buttonProperties,
            i className: "fa fa-#{@props.icon}"
