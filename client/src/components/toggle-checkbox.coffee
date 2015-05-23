React = require 'react/addons'
_ = require 'underscore'
{div, input, label} = React.DOM

classer = require 'classnames'

module.exports = React.createClass
    displayName: 'ToggleCheckbox'

    render: ->
        id = "checkbox-#{@props.id}"
        inputProperties =
            id: id
            type: 'checkbox'
            checked: @props.isChecked
            onChange: @props.onToggle

        div role: 'checkbox',
            input inputProperties
            label htmlFor: id
