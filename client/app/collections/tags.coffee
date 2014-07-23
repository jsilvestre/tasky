module.exports = class TagsCollection extends Backbone.Collection

    constructor: (@sortMode) ->
        super()

    comparator: (a, b) ->
        if @sortMode == 0
            # sort by -count, then +id
            [first, second, factor] = ['count', 'id', 1]
        else
            # sort by +id, then -count
            [first, second, factor] = ['id', 'count', -1]

        if a.get(first) > b.get(first)
            return -1 * factor
        else if a.get(first) is b.get(first)
            if a.get(second) < b.get(second)
                return -1 * factor
            else if a.get(second) > b.get(second)
                return 1 * factor
            else
                return 0
        else
            return 1 * factor

    @extractFromTasks: (taskCollection, excludes = [], selectedTags = [], sortMode = 0) ->
        tagsList = new TagsCollection sortMode

        taskCollection.pluck('tags').forEach (tagsOfTask) ->
            tagsOfTask.forEach (tag) ->
                tag = tag.toLowerCase()
                unless _.contains excludes, tag
                    if not tagsList.get(tag)?
                        tagsList.add new Backbone.Model
                            id: tag
                            count: 0
                            selectIndex: selectedTags.indexOf tag
                    tagInfo = tagsList.get tag
                    tagInfo.set 'count', tagInfo.get('count') + 1

        tagsList.sort()
        return tagsList

