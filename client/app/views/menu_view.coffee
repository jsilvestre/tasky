BaseView = require '../lib/base_view'

MenuItemView = require './menu_item_view'
SubmenuView = require './submenu_view'

module.exports = class MenuView extends BaseView

    el: '#menu'
    template: require './templates/menu'

    events: 'click li.first-level': 'onClick'

    views: null
    collectionEl: 'ul.tags'

    activeTags: null
    subMenuHandler: null

    constructor: (options) ->
        @baseCollection = options.baseCollection
        @archivedCollection = options.archivedCollection
        @views = new Backbone.ChildViewContainer()
        super options

    initialize: (options) ->
        @listenTo @baseCollection,
            'add': @onChange
            'change': @onChange
            'remove': @onChange

        @listenTo @archivedCollection,
            'add': @onChange
            'change': @onChange
            'remove': @onChange

        super options

    getRenderData: ->

        if @archivedCollection.length > 1000 then archivedCount = 'Over 9000++'
        else archivedCount = @archivedCollection.length

        # return
        allCount: @baseCollection.length
        untaggedCount: @baseCollection
                            .filter((task) ->
                                task.get('tags').length is 0
                            ).length
        archivedCount: archivedCount

    beforeRender: ->
        tagsList = @baseCollection.getAllTags()
        @views.forEach (taskView) =>
            if tagsList.indexOf(taskView.model.get('tagName')) isnt -1
                taskView.$el.detach()
            else
                @stopListening taskView
                @views.remove taskView
                taskView.destroy()

    afterRender: ->
        tags = @baseCollection.getAllTags()
        tags.forEach (tagInfo) =>
            menuItem = new MenuItemView
                            model: new Backbone.Model
                                tagName: tagInfo.get 'id'
                                count: tagInfo.get 'count'
            @views.add menuItem
            $(@collectionEl).append menuItem.render().$el

        return @$el

    onChange: ->
        @render()
        @handleTagSelection()

    setActive: (tags) ->
        @activeTags = tags
        @handleTagSelection tags

    setHighlightedItem: (highlightedItem) ->
        @highlightedItem = highlightedItem

    handleTagSelection: (itemNumToSelect = null) ->
        # prevent buggy highlighting when browsing from task list
        @$('li.active').removeClass 'active'

        if @highlightedItem?
            @$("ul.permanent li:nth-of-type(#{@highlightedItem})").addClass 'active'
            @handleSubmenu null
            @handleSubmenu null
        else
            @views.some (view) =>
                if view.model.get('tagName') is @activeTags[0]
                    view.$el.addClass 'active'
                    @handleSubmenu view.cid, @activeTags
                    return true

    onClick: (event) ->
        # set active style on menu items
        @$('li.active').removeClass 'active'
        domElement = $ event.currentTarget
        domElement.addClass 'active'

        # manage submenu toggle on first level tag
        menuItemId = domElement.data 'menu-item'
        if menuItemId is @subMenuHandler
            @closeSubmenu()
        else if @subMenuHandler is null and menuItemId isnt undefined
            rootTag = @views.findByCid(menuItemId).model.get 'tagName'
            @handleSubmenu menuItemId, [rootTag]

    handleSubmenu: (menuItemId, selectedTags = []) ->

        # close previous one
        @closeSubmenu()

        # don't open submenu if there is no item to bind to
        return if not menuItemId?

        # create new one
        relatedView = @views.findByCid menuItemId
        @submenu = new SubmenuView
                        baseCollection: @baseCollection
                        relatedView: relatedView
                        selectedTags: selectedTags
        @submenu.render()
        @subMenuHandler = menuItemId

    closeSubmenu: ->
        @submenu.destroy() if @submenu?
        @subMenuHandler = null
        delete @submenu





