{li, a, i, span, ul} = React.DOM

styler = React.addons.classSet

module.exports = React.createClass
    displayName: 'MenuItem'

    render: ->
        classNames = styler
            'menu-tag': true
            'active': @props.isActive
            'selected': @props.isSelected
            'magic': @props.magic

        linkStyle = 'padding-left': (@props.depth + 1) * 20

        li className: classNames,
            a href: @props.url, title: @props.label, style: linkStyle,
                i className: 'tag-icon'
                span null, "#{@props.label} (#{@props.count})"
            @props.getSubmenu @props.depth + 1


