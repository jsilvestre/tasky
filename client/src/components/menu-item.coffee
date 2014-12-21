React = require 'react/addons'
{li, a, i, span, ul} = React.DOM

styler = React.addons.classSet

module.exports = React.createClass
    displayName: 'MenuItem'

    render: ->
        {label} = @props.tag
        classNames = styler
            'menu-tag': true
            'active': @props.isActive
            'selected': @props.isSelected
            'magic': @props.magic

        linkStyle = 'paddingLeft': (@props.depth + 1) * 20

        li className: classNames,
            a href: @props.url, title: @getTitle(), style: linkStyle,
                i className: 'tag-icon'
                span null, "#{label} (#{@getCount()})"
            @props.getSubmenu @props.depth + 1

    getCount: ->
        {count, doneCount} = @props.tag
        todoCount = count - doneCount
        if todoCount isnt count and todoCount isnt 0
            return "#{todoCount} / #{count}"
        else
            return count

    getTitle: ->
        {label, count, doneCount} = @props.tag
        todoCount = count - doneCount
        smart_count = doneCount
        return t 'tag title', {label, todoCount, smart_count}



