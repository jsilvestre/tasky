React = require 'react/addons'
{div, p} = React.DOM

styler = React.addons.classSet

module.exports = React.createClass
    displayName: 'ProgressBar'

    render: ->
        progress = (@props.tasksDone.length / @props.tasks.length) * 100
        progress = Math.round progress, 1
        styles = styler 'expanded': @state.expanded
        wrapperAttributes =
            id: 'progressbar'
            className: styles
            onMouseOver: @onMouseOver
            onMouseOut: @onMouseOut

        fillerAttributes =
            style: width: "#{progress}%"

        div wrapperAttributes,
            div fillerAttributes
            p null, "#{progress}%"


    onMouseOver: -> @setState expanded: true
    onMouseOut: -> @setState expanded: false
    getInitialState: -> expanded: false
