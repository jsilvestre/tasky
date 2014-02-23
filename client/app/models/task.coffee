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
            return _.every tags, _.partial(_.contains, @get('tags'))

    getPreviousWithTags: (tags) ->

        if tags is null
            return @collection.get @get 'previous'

        previousTask = @collection.get @get 'previous'
        previousPosition = @collection.indexOf previousTask

        until not previousTask? or previousTask.containsTags tags
            previousTask = @collection.get previousTask.get 'previous'
            previousPosition = @collection.indexOf previousTask

        if previousTask? and previousTask.containsTags tags
            return previousTask
        else
            return null

    @regex: /#([\w\d\-_\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)/g
    # helper function to extract tag from description
    @extractTags: (desc) ->
        # weird stuff are for accentated characters
        # see http://stackoverflow.com/questions/1073412/javascript-validation-issue-with-international-characters
        tags = desc.match Task.regex
        tags = _.unique tags
        tags = _.map tags, (tag) -> tag.replace '#', ''

        return tags
