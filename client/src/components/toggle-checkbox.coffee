React = require 'react/addons'
_ = require 'underscore'
{div, input, label} = React.DOM

classer = React.addons.classSet

module.exports = React.createClass
    displayName: 'ToggleCheckbox'

    render: ->
        id = "checkbox-#{@props.id}"
        inputProperties =
            id: id
            type: 'checkbox'
            checked: @props.isChecked
            onChange: @props.onToggle

        div className: 'toggle-checkbox',
            input inputProperties
            label htmlFor: id
