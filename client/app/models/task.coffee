module.exports = class Task extends Backbone.Model

    set: (attributes, options) ->
        super attributes, options

        if attributes is "description"
            tags = Task.extractTags @get('description')
            @set 'tags', tags

    containsTags: (tags) ->
        tags = [tags] unless tags instanceof Array
        if tags.length is 0
            return @get('tags').length is 0
        else
            lowerCasedTags = @get('tags').map (tag) -> tag.toLowerCase()
            return _.every tags, _.partial(_.contains, lowerCasedTags)

    doesntContainsTags: (tags) ->
        tags = [tags] unless tags instanceof Array
        # no task to excluse, it cannot contain it
        if tags.length is 0
            return true
        else
            lowerCasedTags = @get('tags').map (tag) -> tag.toLowerCase()
            return not _.some tags, _.partial(_.contains, lowerCasedTags)

    getPreviousWithTags: (tags) ->
        order = @get 'order'
        subCollection = @collection.getByTags tags
        nextTask = subCollection.find (task) ->
            return \
            (tags? and task.get('order') > order and task.containsTags(tags)) \
            or (not tags? and task.get('order') > order)

        nextIndex = subCollection.indexOf nextTask
        if nextIndex is -1
            return _.last subCollection.toArray()
        else
            return subCollection.at nextIndex - 1

    # weird stuff are for accentated characters
    # see http://stackoverflow.com/questions/1073412/javascript-validation-issue-with-international-characters
    @regex: /(^|\s)#([\w\d\-_\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)(?=\s|$)/g

    # helper function to extract tag from description
    @extractTags: (desc) ->
        tags = desc.match Task.regex
        tags = _.map tags, (tag) -> tag.trim().replace '#', ''
        tags = _.uniq tags
        return tags
