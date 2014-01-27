module.exports = class Task extends Backbone.Model

    initialize: (options) ->
        @extractTags()
        super options

    set: (attributes, options) ->
        super attributes, options

        @extractTags() if attributes is "content"

    extractTags:->
        tags = @get('content').match /#([a-zA-Z0-9_]+)/g
        tags = _.unique tags
        tags = _.map tags, (tag) -> tag.replace '#', ''

        @set 'tags', tags

    containsTags: (tags) ->
        tags = [tags] unless tags instanceof Array
        return _.every tags, _.partial(_.contains, @get('tags'))
