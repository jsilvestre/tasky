module.exports = class TagsCollection extends Backbone.Collection

    constructor: (@sortCriteria) ->
        super()

    comparator: (a, b) ->
        if @sortCriteria is 'count'
            # sort by -count, then +id
            [first, second, factor] = ['count', 'id', 1]
        else if @sortCriteria is 'alpha'
            # sort by +id, then -count
            [first, second, factor] = ['id', 'count', -1]
        else throw new Error 'NYI'

        [af, bf] = [a.get(first), b.get(first)]
        if af > bf
            return -1 * factor
        else if af is bf
            [as, bs] = [a.get(second), b.get(second)]
            if as < bs
                return -1 * factor
            else if as > bs
                return 1 * factor
            else
                return 0
        else
            return 1 * factor

    @extractFromTasks: (taskCollection, excludes = [], selectedTags = [], sortCriteria = 'count') ->
        tagsList = new TagsCollection sortCriteria

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

