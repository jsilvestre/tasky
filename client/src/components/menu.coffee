React = require 'react/addons'
_ = require 'underscore'
{div, i, ul, li, a, span} = React.DOM

MenuItem = React.createFactory require './menu-item'
{SortCriterions} = require '../constants/AppConstants'
TagActionCreator = require '../actions/TagActionCreator'

classer = React.addons.classSet

module.exports = React.createClass
    displayName: 'Menu'

    render: ->

        archivedMenu =
            id: 'archived'
            link: '#archived'
            label: t 'archived'
            count: @props.numArchivedTasks

        todoMenu =
            id: 'tobedone'
            link: '#'
            label: t 'todo'
            count: @props.numTasks

        if @props.isArchivedMode
            menu = [todoMenu, archivedMenu]
        else
            menu = [archivedMenu, todoMenu]

        div id: 'menu',
            i className: 'fa fa-arrow-left'
            ul null,
                li id: menu[0].id, className: 'first-level',
                    a href: menu[0].link, "#{menu[0].label} (#{menu[0].count})"
                li id: menu[1].id, className: 'first-level active',
                    a href: menu[1].link, "#{menu[1].label} (#{menu[1].count})"
                    @getSortMenu()
                    @getSubmenu 0

    getSortMenu: ->
        classes = classer
            'selected-sort': @props.sortCriterion is SortCriterions.COUNT
        countProperties =
            className: classes
            title: 'brah'
            onClick: @onSelectCriterion.bind @, SortCriterions.COUNT

        classes = classer
            'selected-sort': @props.sortCriterion is SortCriterions.ALPHA
        alphaProperties =
            className: classes
            onClick: @onSelectCriterion.bind @, SortCriterions.ALPHA

        ul className: 'sorts',
            li alphaProperties,
                a href: '#', title: t('sort numeric'), className: 'fa fa-sort-alpha-asc', ' '
            li countProperties,
                a href: '#', title: t('sort alpha'), className: 'fa fa-sort-numeric-desc', ' '

    getSubmenu: (depth) ->
        tags = @props.tree[depth]
        ul className: 'submenu',
            if depth is 0 and @props.untaggedTasks.length > 0
                @getUntaggedMenuItem()

            tags.map (tag) =>
                @getMenuItem tag, depth

    getMenuItem: (tag, depth) ->
        label = tag.label
        selectedTagNames = @props.selectedTags?.map (tag) -> tag.label

        # if the tag is the selected tags path, then it has a submenu
        if selectedTagNames?[depth] is label
            getSubmenuHandler = @getSubmenu
        else
            getSubmenuHandler = -> #

        currentIndex = selectedTagNames?.indexOf label

        # if tag is in the selected path
        isActive = currentIndex is depth

        # if tag is the leaf of the selected path
        isLeaf = depth + 1 is selectedTagNames?.length

        tagsInUrl = selectedTagNames?.slice(0, depth) or []

        # adding if (not in the list or parent of last selected tags)
        # and not the last selected tag
        if ((not _.contains(tagsInUrl, label) \
        or selectedTagNames?.length > depth + 1)) \
        and  \
        (not (currentIndex + 1 is selectedTagNames?.length \
        and depth is currentIndex))
            tagsInUrl.push label

        if @props.isArchivedMode
            if tagsInUrl.length > 0
                prefix = 'archivedByTags'
            else
                prefix = 'archived'
        else
            if tagsInUrl.length > 0
                prefix = 'todoByTags'
            else
                prefix = ''

        url = "##{prefix}"
        if tagsInUrl.length > 0
            url = "##{prefix}/#{tagsInUrl.join '/'}"

        return MenuItem
            key: "#{label}-#{depth}"
            tag: tag
            depth: depth
            isActive: isActive
            isSelected: isActive and isLeaf
            getSubmenu: getSubmenuHandler
            onFavorite: @onFavorite.bind @, tag
            url: url

    onSelectCriterion: (criterion, event) ->
        event.preventDefault()
        TagActionCreator.selectSortCriterion criterion

    onFavorite: (tag) ->
        TagActionCreator.toggleFavorite tag.label

    getUntaggedMenuItem: ->
        # if tag is in the selected path
        isActive = @props.selectedTags?.length is 0

        if @props.isArchivedMode
            if isActive
                url = '#archived'
            else
                url = '#archivedByTags/'
        else
            if isActive
                url = '#'
            else
                url = '#todoByTags/'

        return MenuItem
            key: "untagged"
            tag:
                label: t 'untagged'
                count: @props.untaggedTasks.length
                doneCount: @props.untaggedTasks
                    .filter((task) -> task.done).length
            depth: 0
            isActive: isActive
            isSelected: isActive
            getSubmenu: ->
            url: url
            magic: true
