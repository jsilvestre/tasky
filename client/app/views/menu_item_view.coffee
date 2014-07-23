BaseView = require '../lib/base_view'

TagsCollection = require '../collections/tags'

module.exports = class MenuItemView extends BaseView

    tagName: 'li'
    className: 'menu-tag'
    template: require './templates/menu_item'
    collectionEl: 'ul.submenu'
    views: null
    events: 'click': 'onClick'

    constructor: (options) ->
        @baseCollection = options.baseCollection
        @archivedCollection = options.archivedCollection
        @selectedTags = options.selectedTags
        @depth = options.depth
        @viewType = options.viewType
        @sortCriteria = options.sortCriteria

        @views = new Backbone.ChildViewContainer()
        super options

    getRenderData: ->
        params = super()
        _.extend params, url: @buildUrl()
        return params

    buildUrl: ->
        tagsInUrl = @selectedTags?.slice(0, @depth) or []
        currentIndex = @selectedTags?.indexOf @model.get 'tagName'

        # adding if (not in the list or parent of last selected tags)
        # and not the last selected tag
        if ((not _.contains(tagsInUrl, @model.get 'tagName') \
        or @selectedTags?.length > @depth + 1)) \
        and  \
        (not (currentIndex + 1 is @selectedTags?.length \
        and @depth is currentIndex))
            tagsInUrl.push @model.get 'tagName'

        if @viewType is "#tobedone"
            url = "#"
            prefix = 'todoByTags'
        else
            url = "#archived"
            prefix = 'archivedByTags'
        if tagsInUrl.length > 0
            url = "##{prefix}"
            tagsInUrl.forEach (item) -> url = "#{url}/#{item}"

        return url

    beforeRender: -> @$el.addClass 'magic' if @model.get 'isMagic'

    afterRender: ->
        currentIndex = @selectedTags?.indexOf @model.get 'tagName'
        if  currentIndex is @depth
            @$el.addClass 'active'
            if @depth + 1 is @selectedTags.length then @$el.addClass 'selected'

        leftPadding = (@depth + 1) * 25
        @$('a').css 'padding-left', leftPadding

        if @selectedTags? and @selectedTags[@depth] is @model.get('tagName')
            tags = @buildTagsList()
            tags.forEach (tagInfo) =>
                menuItem = new MenuItemView
                                model: new Backbone.Model
                                    tagName: tagInfo.get 'id'
                                    count: tagInfo.get 'count'
                                selectedTags: @selectedTags
                                depth: @depth + 1
                                viewType: @viewType
                                sortCriteria: @sortCriteria
                                baseCollection: @baseCollection
                                archivedCollection: @archivedCollection

                @views.add menuItem
                @$el.children(@collectionEl).append menuItem.render().$el

    buildTagsList: ->
        excludedItems = @selectedTags or []
        excludedItems = excludedItems.slice 0, @depth + 1

        includedTags = @selectedTags or []
        includedTags = includedTags.slice 0, @depth + 1


        delete @collection if @collection?

        if @viewType is "#tobedone" then collection = @baseCollection
        else collection = @archivedCollection

        @collection = collection.getByTags includedTags
        tagsList = TagsCollection.extractFromTasks @collection,
                                                    excludedItems,
                                                    @selectedTags,
                                                    @sortCriteria
        return tagsList
