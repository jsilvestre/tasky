React = require 'react/addons'
{div, span, a} = React.DOM

styler = React.addons.classSet

module.exports = React.createClass
    displayName: 'BreadcrumbItem'

    render: ->

        # can be tag or search query
        isTag = @props.type is 'tag'

        classes = styler
            'breadcrumb-item': true
            'excluded': @props.tag?.isExcluded
            'notice-delete-action': @state.removeHovered

        wrapperProperties =
            className: classes
            onClick: @props.toggleModeHandler
            key: @props.key

        if not isTag
            value = "\"#{@props.label}\""
        else
            value = @props.tag.label

        removeProperties =
            onMouseOver: @onMouseOver
            onMouseOut: @onMouseOut
            onClick: (event) =>
                # prevents the toggle handler to be triggered
                event.stopPropagation()
                @props.removeHandler()

        div wrapperProperties,
            span null, value
            a removeProperties, '×'

    onMouseOver: -> @setState removeHovered: true
    onMouseOut: -> @setState removeHovered: false

    getInitialState: -> return removeHovered: false
