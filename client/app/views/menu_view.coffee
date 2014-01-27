BaseView = require '../lib/base_view'

MenuItemView = require './menu_item_view'
SubmenuView = require './submenu_view'

module.exports = class MenuView extends BaseView

    el: '#menu'
    template: require './templates/menu'

    events: 'click li.first-level': 'onClick'

    views: {}
    collectionEl: 'ul.tags'

    activeTags: null
    subMenuHandler: null

    initialize: (options) ->

        @listenTo @collection,
            'add': @onChange
            'change': @onChange
            'remove': @onChange

        super()

    getRenderData: ->
        allCount: @collection.length
        untaggedCount: @collection
                            .filter((task) ->
                                task.get('tags').length is 0
                            ).length
    beforeRender: ->
        # empty tag list
        # TODO: use $el.detach() instead
        Object.keys(@views).forEach (item) => @views[item].destroy()

    afterRender: ->
        tags = @collection.getAllTags()
        tags.forEach (tagInfo) =>
            menuItem = new MenuItemView model: new Backbone.Model
                                                tagName: tagInfo.get 'id'
                                                count: tagInfo.get 'count'
            @views[menuItem.cid] = menuItem
            $(@collectionEl).append menuItem.render().$el

        return @$el

    onChange: ->
        @render()
        @handleTagSelection()

    setActive: (tags) ->
        @activeTags = tags
        @handleTagSelection()

    handleTagSelection: ->
        # prevent buggy highlighting when browsing from task list
        @$('li.active').removeClass 'active'

        if @activeTags is null
            @$('ul.permanent li:first-of-type').addClass 'active'
            @handleSubmenu null
        else if @activeTags.length is 0
            @$('ul.permanent li:nth-of-type(2)').addClass 'active'
            @handleSubmenu null
        else
            # this can be improve
            Object.keys(@views).forEach (view) =>
                if @views[view].model.get('tagName') is @activeTags[0]
                    @views[view].$el.addClass 'active'
                    @handleSubmenu view, @activeTags

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
            @handleSubmenu menuItemId, [@views[menuItemId].model.get('tagName')]

    handleSubmenu: (menuItemId, selectedTags = []) ->
        # close previous one
        @closeSubmenu()

        # don't open submenu if there is no item to bind to
        return if not menuItemId?

        # create new one
        relatedView = @views[menuItemId]
        @submenu = new SubmenuView
                        collection: @collection
                        relatedView: relatedView
                        selectedTags: selectedTags
        @submenu.render()
        @subMenuHandler = menuItemId

    closeSubmenu: ->
        @submenu.destroy() if @submenu?
        @subMenuHandler = null
        delete @submenu





