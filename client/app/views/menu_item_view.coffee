BaseView = require '../lib/base_view'
SubmenuItemView = require './submenu_item_view'

module.exports = class MenuItemView extends BaseView

    tagName: 'li'
    className: 'first-level'
    template: require './templates/menu_item'

    getRenderData: ->
        params = super()
        _.extend params, url: @buildUrl()
        return params

    afterRender: ->
        @$el.data 'menu-item', @cid

    buildUrl: ->
        return "#byTags/#{@model.get('tagName')}"