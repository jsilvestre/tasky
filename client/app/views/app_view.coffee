BaseView = require '../lib/base_view'

MenuView = require './menu_view'
TaskListView = require './task_list_view'

module.exports = class AppView extends BaseView

    el: 'body'
    template: require './templates/home'
