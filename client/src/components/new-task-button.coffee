React = require 'react/addons'
_ = require 'underscore'
{div, input, label, button} = React.DOM

styler = React.addons.classSet

module.exports = React.createClass
    displayName: 'NewTaskButton'

    render: ->

        classes = styler
            'create-new-task': true
            'disabled': @props.disabled

        buttonProperties = className: classes

        unless @props.disabled
            buttonProperties.onClick = @props.onSubmit

        button buttonProperties, '+'
