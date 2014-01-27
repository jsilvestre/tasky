module.exports = class TagsCollection extends Backbone.Collection

    comparator: (a, b) ->
        if a.get('count') > b.get('count')
            return -1
        else if a.get('count') is b.get('count')
            return 0
        else
            return 1

    @extractFromTasks: (taskCollection, excludes = []) ->
        tagsList = new TagsCollection()
        taskCollection.pluck('tags').forEach (tagsOfTask) ->
            tagsOfTask.forEach (tag) ->
                tag = tag.toLowerCase()
                unless _.contains excludes, tag
                    if not tagsList.get(tag)?
                        tagsList.add new Backbone.Model id: tag, count: 0
                    tagInfo = tagsList.get(tag)
                    tagInfo.set 'count', tagInfo.get('count') + 1

        tagsList.sort()
        return tagsList
