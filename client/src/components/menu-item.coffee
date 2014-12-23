React = require 'react/addons'
{li, a, i, span, ul} = React.DOM

styler = React.addons.classSet

module.exports = React.createClass
    displayName: 'MenuItem'

    getInitialState: -> favorite: false

    render: ->
        {label} = @props.tag

        canBeFav = @props.onFavorite? and @props.depth is 0


        classNames = styler
            'menu-tag': true
            'active': @props.isActive
            'selected': @props.isSelected
            'magic': @props.magic

        linkStyle = 'paddingLeft': (@props.depth + 1) * 20
        linkClasses = styler
            'favorite': canBeFav and @props.tag.isFavorite

        li className: classNames,
            a href: @props.url, title: @getTitle(), style: linkStyle, className: linkClasses,
                i className: 'fa fa-tag'
                span null, "#{label} (#{@getCount()})"
                if canBeFav
                    i className: 'fa fa-star', onClick: @onFavorite
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


    onFavorite: (event) ->
        event.preventDefault()
        @props.onFavorite()
