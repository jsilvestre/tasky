module.exports = class TagsCollection extends Backbone.Collection

    comparator: (a, b) ->
        if a.get('count') > b.get('count')
            return -1
        else if a.get('count') is b.get('count')
            if a.get('selectIndex') is -1 and b.get('selectIndex') is -1
                return 0
            else if a.get('selectIndex') > -1 and b.get('selectIndex') is -1
                return -1
            else if a.get('selectIndex') is -1 and b.get('selectIndex') > -1
                return 1
            else
                if a.get('selectIndex') < b.get('selectIndex')
                    return -1
                else
                    return 1
        else
            return 1

    @extractFromTasks: (taskCollection, excludes = [], selectedTags = []) ->
        tagsList = new TagsCollection()

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
