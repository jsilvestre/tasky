BaseView = require '../lib/base_view'
SubmenuItemView = require './submenu_item_view'

TagsCollection = require '../collections/tags'

module.exports = class SubmenuView extends BaseView

    tagName: 'ul'
    className: 'submenu'

    views: {}

    initialize: (options) ->
        @baseCollection = @collection
        @relatedView = options.relatedView
        @selectedTags = options.selectedTags or []

    getRootTagName: -> return @relatedView.model.get 'tagName'

    # Get the tags from displayed tasks
    buildTagsList: ->
        @collection = @baseCollection.getByTags @selectedTags unless @collection?
        @tagsList = TagsCollection.extractFromTasks @collection,
                                                    [@getRootTagName()]

    beforeRender: ->
        @buildTagsList()
        @reset()

    afterRender: ->
        @relatedView.$el.append @$el
        @tagsList.forEach (tagInfo) =>
            menuItem = new SubmenuItemView
                        model: new Backbone.Model
                                tagName: tagInfo.get('id')
                                count: tagInfo.get('count')
                                selectedTags: @selectedTags
            @views[menuItem.cid] = menuItem
            @$el.append menuItem.render().$el

    # clean the current submenu
    reset: ->
        @$el.empty()
        @views = {}

    destroy: ->
        @reset()
        super()
