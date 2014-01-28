(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    definition(module.exports, localRequire(name), module);
    var exports = cache[name] = module.exports;
    return exports;
  };

  var require = function(name) {
    var path = expand(name, '.');

    if (has(cache, path)) return cache[path];
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex];
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.brunch = true;
})();

window.require.register("application", function(exports, require, module) {
  module.exports = {
    initialize: function() {
      var Router;

      Router = require('router');
      this.router = new Router();
      Backbone.history.start();
      if (typeof Object.freeze === 'function') {
        return Object.freeze(this);
      }
    }
  };
  
});
window.require.register("collections/tags", function(exports, require, module) {
  var TagsCollection, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = TagsCollection = (function(_super) {
    __extends(TagsCollection, _super);

    function TagsCollection() {
      _ref = TagsCollection.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    TagsCollection.prototype.comparator = function(a, b) {
      if (a.get('count') > b.get('count')) {
        return -1;
      } else if (a.get('count') === b.get('count')) {
        if (a.get('selectIndex') === -1 && b.get('selectIndex') === -1) {
          return 0;
        } else if (a.get('selectIndex') > -1 && b.get('selectIndex') === -1) {
          return -1;
        } else if (a.get('selectIndex') === -1 && b.get('selectIndex') > -1) {
          return 1;
        } else {
          if (a.get('selectIndex') < b.get('selectIndex')) {
            return -1;
          } else {
            return 1;
          }
        }
      } else {
        return 1;
      }
    };

    TagsCollection.extractFromTasks = function(taskCollection, excludes, selectedTags) {
      var tagsList;

      if (excludes == null) {
        excludes = [];
      }
      if (selectedTags == null) {
        selectedTags = [];
      }
      tagsList = new TagsCollection();
      taskCollection.pluck('tags').forEach(function(tagsOfTask) {
        return tagsOfTask.forEach(function(tag) {
          var tagInfo;

          tag = tag.toLowerCase();
          if (!_.contains(excludes, tag)) {
            if (tagsList.get(tag) == null) {
              tagsList.add(new Backbone.Model({
                id: tag,
                count: 0,
                selectIndex: selectedTags.indexOf(tag)
              }));
            }
            tagInfo = tagsList.get(tag);
            return tagInfo.set('count', tagInfo.get('count') + 1);
          }
        });
      });
      tagsList.sort();
      return tagsList;
    };

    return TagsCollection;

  })(Backbone.Collection);
  
});
window.require.register("collections/tasks", function(exports, require, module) {
  var TagsCollection, TaskCollection, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TagsCollection = require('./tags');

  module.exports = TaskCollection = (function(_super) {
    __extends(TaskCollection, _super);

    function TaskCollection() {
      _ref = TaskCollection.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    TaskCollection.prototype.url = 'tasks';

    TaskCollection.prototype.getAllTags = function() {
      return TagsCollection.extractFromTasks(this);
    };

    TaskCollection.prototype.getByTags = function(tags) {
      if (tags === void 0 || tags === null) {
        return this;
      }
      if (tags.length === 0) {
        return new BackboneProjections.Filtered(this, {
          filter: function(task) {
            return task.get('tags').length === 0;
          }
        });
      }
      return new BackboneProjections.Filtered(this, {
        filter: function(task) {
          return task.containsTags(tags);
        }
      });
    };

    TaskCollection.prototype.add = function(task, options) {
      var nextTask, previousTask;

      if (options == null) {
        options = {};
      }
      if (task.get('previous') === null) {
        options.at = 0;
      } else if (task.get('next') === null) {
        options.at = this.length;
      } else {
        previousTask = this.get(task.get('previous'));
        nextTask = this.get(task.get('next'));
        if (previousTask !== void 0) {
          options.at = this.indexOf(previousTask) + 1;
        } else if (nextTask !== void 0) {
          options.at = this.indexOf(nextTask);
        }
      }
      return TaskCollection.__super__.add.call(this, task, options);
    };

    TaskCollection.prototype.remove = function(task, options) {
      var nextTask, nextTaskID, previousTask, previousTaskID;

      if (options == null) {
        options = {};
      }
      previousTask = this.get(task.get('previous'));
      nextTask = this.get(task.get('next'));
      previousTaskID = previousTask != null ? previousTask.get('id') : null;
      nextTaskID = nextTask != null ? nextTask.get('id') : null;
      if (previousTask != null) {
        previousTask.set('next', nextTaskID);
      }
      if (nextTask != null) {
        nextTask.set('previous', previousTaskID);
      }
      return TaskCollection.__super__.remove.call(this, task, options);
    };

    return TaskCollection;

  })(Backbone.Collection);
  
});
window.require.register("initialize", function(exports, require, module) {
  var app;

  app = require('application');

  $(function() {
    return app.initialize();
  });
  
});
window.require.register("lib/base_view", function(exports, require, module) {
  var BaseView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = BaseView = (function(_super) {
    __extends(BaseView, _super);

    function BaseView() {
      _ref = BaseView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    BaseView.prototype.template = function() {};

    BaseView.prototype.initialize = function() {};

    BaseView.prototype.getRenderData = function() {
      var _ref1;

      return {
        model: (_ref1 = this.model) != null ? _ref1.toJSON() : void 0
      };
    };

    BaseView.prototype.render = function() {
      this.beforeRender();
      this.$el.html(this.template(this.getRenderData()));
      this.afterRender();
      return this;
    };

    BaseView.prototype.beforeRender = function() {};

    BaseView.prototype.afterRender = function() {};

    BaseView.prototype.destroy = function() {
      this.undelegateEvents();
      this.$el.removeData().unbind();
      this.remove();
      return Backbone.View.prototype.remove.call(this);
    };

    return BaseView;

  })(Backbone.View);
  
});
window.require.register("lib/utils", function(exports, require, module) {
  module.exports.buildTagsList = function(tags, options) {
    var lastSeparator, regularSeparator, tagPrefix, tagsList;

    if (options == null) {
      options = {};
    }
    tagPrefix = options.tagPrefix || '';
    regularSeparator = options.regularSeparator || ' ';
    lastSeparator = options.lastSeparator || ' ';
    if (tags == null) {
      return "";
    }
    tagsList = "";
    tags.forEach(function(tag) {
      if (tags.indexOf(tag) === 0) {
        return tagsList = "" + tagPrefix + tag;
      } else if (tags.indexOf(tag) === (tags.length - 1)) {
        return tagsList = "" + tagsList + lastSeparator + tagPrefix + tag;
      } else {
        return tagsList = "" + tagsList + regularSeparator + tagPrefix + tag;
      }
    });
    return tagsList;
  };
  
});
window.require.register("lib/view_collection", function(exports, require, module) {
  var BaseView, ViewCollection, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BaseView = require('lib/base_view');

  module.exports = ViewCollection = (function(_super) {
    __extends(ViewCollection, _super);

    function ViewCollection() {
      this.removeItem = __bind(this.removeItem, this);
      this.addItem = __bind(this.addItem, this);    _ref = ViewCollection.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    ViewCollection.prototype.itemview = null;

    ViewCollection.prototype.views = {};

    ViewCollection.prototype.template = function() {
      return '';
    };

    ViewCollection.prototype.itemViewOptions = function() {};

    ViewCollection.prototype.collectionEl = null;

    ViewCollection.prototype.onChange = function() {
      return this.$el.toggleClass('empty', _.size(this.views) === 0);
    };

    ViewCollection.prototype.appendView = function(view) {
      return this.$collectionEl.append(view.el);
    };

    ViewCollection.prototype.initialize = function() {
      var collectionEl;

      ViewCollection.__super__.initialize.apply(this, arguments);
      this.views = {};
      this.listenTo(this.collection, "reset", this.onReset);
      this.listenTo(this.collection, "add", this.addItem);
      this.listenTo(this.collection, "remove", this.removeItem);
      if (this.collectionEl == null) {
        return collectionEl = el;
      }
    };

    ViewCollection.prototype.render = function() {
      var id, view, _ref1;

      _ref1 = this.views;
      for (id in _ref1) {
        view = _ref1[id];
        view.$el.detach();
      }
      return ViewCollection.__super__.render.apply(this, arguments);
    };

    ViewCollection.prototype.afterRender = function() {
      var id, view, _ref1;

      this.$collectionEl = $(this.collectionEl);
      _ref1 = this.views;
      for (id in _ref1) {
        view = _ref1[id];
        this.appendView(view.$el);
      }
      this.onReset(this.collection);
      return this.onChange(this.views);
    };

    ViewCollection.prototype.remove = function() {
      this.onReset([]);
      return ViewCollection.__super__.remove.apply(this, arguments);
    };

    ViewCollection.prototype.onReset = function(newcollection) {
      var id, view, _ref1;

      _ref1 = this.views;
      for (id in _ref1) {
        view = _ref1[id];
        view.remove();
      }
      return newcollection.forEach(this.addItem);
    };

    ViewCollection.prototype.addItem = function(model) {
      var options, view;

      options = _.extend({}, {
        model: model
      }, this.itemViewOptions(model));
      view = new this.itemView(options);
      this.views[model.cid] = view.render();
      this.appendView(view);
      return this.onChange(this.views);
    };

    ViewCollection.prototype.removeItem = function(model) {
      this.views[model.cid].remove();
      delete this.views[model.cid];
      return this.onChange(this.views);
    };

    return ViewCollection;

  })(BaseView);
  
});
window.require.register("models/task", function(exports, require, module) {
  var Task, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = Task = (function(_super) {
    __extends(Task, _super);

    function Task() {
      _ref = Task.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Task.prototype.initialize = function(options) {
      this.extractTags();
      return Task.__super__.initialize.call(this, options);
    };

    Task.prototype.set = function(attributes, options) {
      Task.__super__.set.call(this, attributes, options);
      if (attributes === "content") {
        return this.extractTags();
      }
    };

    Task.prototype.extractTags = function() {
      var tags;

      tags = this.get('content').match(/#([a-zA-Z0-9_]+)/g);
      tags = _.unique(tags);
      tags = _.map(tags, function(tag) {
        return tag.replace('#', '');
      });
      return this.set('tags', tags);
    };

    Task.prototype.containsTags = function(tags) {
      if (!(tags instanceof Array)) {
        tags = [tags];
      }
      if (tags.length === 0) {
        return this.get('tags').length === 0;
      } else {
        return _.every(tags, _.partial(_.contains, this.get('tags')));
      }
    };

    Task.prototype.getPreviousWithTags = function(tags) {
      var previousPosition, previousTask;

      if (tags === null) {
        return this.collection.get(this.get('previous'));
      }
      previousTask = this.collection.get(this.get('previous'));
      previousPosition = this.collection.indexOf(previousTask);
      while (!((previousTask == null) || previousTask.containsTags(tags))) {
        previousTask = this.collection.get(previousTask.get('previous'));
        previousPosition = this.collection.indexOf(previousTask);
      }
      if ((previousTask != null) && previousTask.containsTags(tags)) {
        return previousTask;
      } else {
        return null;
      }
    };

    return Task;

  })(Backbone.Model);
  
});
window.require.register("router", function(exports, require, module) {
  var AppView, MenuView, Router, Task, TaskCollection, TaskListView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  AppView = require('views/app_view');

  MenuView = require('views/menu_view');

  TaskListView = require('views/task_list_view');

  TaskCollection = require('collections/tasks');

  Task = require('models/task');

  module.exports = Router = (function(_super) {
    __extends(Router, _super);

    function Router() {
      _ref = Router.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Router.prototype.routes = {
      '': 'main',
      'untagged': 'untagged',
      'byTags/*tags': 'byTags'
    };

    Router.prototype.initialize = function() {
      this.collection = new TaskCollection();
      this.collection.add(new Task({
        content: '2 #cozy #todos',
        id: 2,
        previous: 1,
        next: 3,
        isDone: false
      }));
      this.collection.add(new Task({
        content: '5 #cozy #calendar #feature',
        id: 5,
        previous: 4,
        next: 6,
        isDone: false
      }));
      this.collection.add(new Task({
        content: '6 #cozy #todos #bug',
        id: 6,
        previous: 5,
        next: 7,
        isDone: false
      }));
      this.collection.add(new Task({
        content: '9 #cozy #mesinfos #feature',
        id: 9,
        previous: 8,
        next: 10,
        isDone: false
      }));
      this.collection.add(new Task({
        content: '4 #cozy #todos #feature',
        id: 4,
        previous: 3,
        next: 5,
        isDone: false
      }));
      this.collection.add(new Task({
        content: '7 #cozy #feature',
        id: 7,
        previous: 6,
        next: 8,
        isDone: false
      }));
      this.collection.add(new Task({
        content: '8 #cozy #mesinfos',
        id: 8,
        previous: 7,
        next: 9,
        isDone: false
      }));
      this.collection.add(new Task({
        content: '3 #cozy #todos',
        id: 3,
        previous: 2,
        next: 4,
        isDone: false
      }));
      this.collection.add(new Task({
        content: '10 #cozy #mesinfos #bug',
        id: 10,
        previous: 9,
        next: 11,
        isDone: false
      }));
      this.collection.add(new Task({
        content: '11',
        id: 11,
        previous: 10,
        next: 12,
        isDone: false
      }));
      this.collection.add(new Task({
        content: '12',
        id: 12,
        previous: 11,
        next: null,
        isDone: false
      }));
      this.collection.add(new Task({
        content: '1 Call the doctor #personal',
        id: 1,
        previous: null,
        next: 2,
        isDone: false
      }));
      this.mainView = new AppView();
      this.mainView.render();
      this.menu = new MenuView({
        baseCollection: this.collection
      });
      this.menu.render();
      return this.taskList = new TaskListView({
        baseCollection: this.collection
      });
    };

    Router.prototype.main = function() {
      var tags;

      tags = null;
      this.taskList.setTags(tags);
      this.taskList.render();
      return this.menu.setActive(tags);
    };

    Router.prototype.untagged = function() {
      var tags;

      tags = [];
      this.taskList.setTags(tags);
      this.taskList.render();
      return this.menu.setActive(tags);
    };

    Router.prototype.byTags = function(tags) {
      tags = tags.split('/');
      if (tags[tags.length - 1] === "") {
        delete tags[tags.length - 1];
      }
      this.taskList.setTags(tags);
      this.taskList.render();
      return this.menu.setActive(tags);
    };

    return Router;

  })(Backbone.Router);
  
});
window.require.register("views/app_view", function(exports, require, module) {
  var AppView, BaseView, MenuView, TaskListView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BaseView = require('../lib/base_view');

  MenuView = require('./menu_view');

  TaskListView = require('./task_list_view');

  module.exports = AppView = (function(_super) {
    __extends(AppView, _super);

    function AppView() {
      _ref = AppView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    AppView.prototype.el = 'body';

    AppView.prototype.template = require('./templates/home');

    return AppView;

  })(BaseView);
  
});
window.require.register("views/menu_item_view", function(exports, require, module) {
  var BaseView, MenuItemView, SubmenuItemView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BaseView = require('../lib/base_view');

  SubmenuItemView = require('./submenu_item_view');

  module.exports = MenuItemView = (function(_super) {
    __extends(MenuItemView, _super);

    function MenuItemView() {
      _ref = MenuItemView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    MenuItemView.prototype.tagName = 'li';

    MenuItemView.prototype.className = 'first-level';

    MenuItemView.prototype.template = require('./templates/menu_item');

    MenuItemView.prototype.getRenderData = function() {
      var params;

      params = MenuItemView.__super__.getRenderData.call(this);
      _.extend(params, {
        url: this.buildUrl()
      });
      return params;
    };

    MenuItemView.prototype.afterRender = function() {
      return this.$el.data('menu-item', this.cid);
    };

    MenuItemView.prototype.buildUrl = function() {
      return "#byTags/" + (this.model.get('tagName'));
    };

    return MenuItemView;

  })(BaseView);
  
});
window.require.register("views/menu_view", function(exports, require, module) {
  var BaseView, MenuItemView, MenuView, SubmenuView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BaseView = require('../lib/base_view');

  MenuItemView = require('./menu_item_view');

  SubmenuView = require('./submenu_view');

  module.exports = MenuView = (function(_super) {
    __extends(MenuView, _super);

    MenuView.prototype.el = '#menu';

    MenuView.prototype.template = require('./templates/menu');

    MenuView.prototype.events = {
      'click li.first-level': 'onClick'
    };

    MenuView.prototype.views = {};

    MenuView.prototype.collectionEl = 'ul.tags';

    MenuView.prototype.activeTags = null;

    MenuView.prototype.subMenuHandler = null;

    function MenuView(options) {
      this.baseCollection = options.baseCollection;
      MenuView.__super__.constructor.call(this, options);
    }

    MenuView.prototype.initialize = function(options) {
      this.listenTo(this.baseCollection, {
        'add': this.onChange,
        'change': this.onChange,
        'remove': this.onChange
      });
      return MenuView.__super__.initialize.call(this, options);
    };

    MenuView.prototype.getRenderData = function() {
      return {
        allCount: this.baseCollection.length,
        untaggedCount: this.baseCollection.filter(function(task) {
          return task.get('tags').length === 0;
        }).length
      };
    };

    MenuView.prototype.beforeRender = function() {
      var _this = this;

      Object.keys(this.views).forEach(function(item) {
        return _this.views[item].destroy();
      });
      return this.views = {};
    };

    MenuView.prototype.afterRender = function() {
      var tags,
        _this = this;

      tags = this.baseCollection.getAllTags();
      tags.forEach(function(tagInfo) {
        var menuItem;

        menuItem = new MenuItemView({
          model: new Backbone.Model({
            tagName: tagInfo.get('id'),
            count: tagInfo.get('count')
          })
        });
        _this.views[menuItem.cid] = menuItem;
        return $(_this.collectionEl).append(menuItem.render().$el);
      });
      return this.$el;
    };

    MenuView.prototype.onChange = function() {
      this.render();
      return this.handleTagSelection();
    };

    MenuView.prototype.setActive = function(tags) {
      this.activeTags = tags;
      return this.handleTagSelection();
    };

    MenuView.prototype.handleTagSelection = function() {
      var _this = this;

      this.$('li.active').removeClass('active');
      if (this.activeTags === null) {
        this.$('ul.permanent li:first-of-type').addClass('active');
        return this.handleSubmenu(null);
      } else if (this.activeTags.length === 0) {
        this.$('ul.permanent li:nth-of-type(2)').addClass('active');
        return this.handleSubmenu(null);
      } else {
        return Object.keys(this.views).forEach(function(view) {
          if (_this.views[view].model.get('tagName') === _this.activeTags[0]) {
            _this.views[view].$el.addClass('active');
            return _this.handleSubmenu(view, _this.activeTags);
          }
        });
      }
    };

    MenuView.prototype.onClick = function(event) {
      var domElement, menuItemId;

      this.$('li.active').removeClass('active');
      domElement = $(event.currentTarget);
      domElement.addClass('active');
      menuItemId = domElement.data('menu-item');
      if (menuItemId === this.subMenuHandler) {
        return this.closeSubmenu();
      } else if (this.subMenuHandler === null && menuItemId !== void 0) {
        return this.handleSubmenu(menuItemId, [this.views[menuItemId].model.get('tagName')]);
      }
    };

    MenuView.prototype.handleSubmenu = function(menuItemId, selectedTags) {
      var relatedView;

      if (selectedTags == null) {
        selectedTags = [];
      }
      this.closeSubmenu();
      if (menuItemId == null) {
        return;
      }
      relatedView = this.views[menuItemId];
      this.submenu = new SubmenuView({
        baseCollection: this.baseCollection,
        relatedView: relatedView,
        selectedTags: selectedTags
      });
      this.submenu.render();
      return this.subMenuHandler = menuItemId;
    };

    MenuView.prototype.closeSubmenu = function() {
      if (this.submenu != null) {
        this.submenu.destroy();
      }
      this.subMenuHandler = null;
      return delete this.submenu;
    };

    return MenuView;

  })(BaseView);
  
});
window.require.register("views/submenu_item_view", function(exports, require, module) {
  var BaseView, SubmenuItemView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BaseView = require('../lib/base_view');

  module.exports = SubmenuItemView = (function(_super) {
    __extends(SubmenuItemView, _super);

    function SubmenuItemView() {
      _ref = SubmenuItemView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    SubmenuItemView.prototype.tagName = 'li';

    SubmenuItemView.prototype.template = require('./templates/menu_item');

    SubmenuItemView.prototype.events = {
      'click': 'onClick'
    };

    SubmenuItemView.prototype.afterRender = function() {
      if (_.contains(this.model.get('selectedTags'), this.model.get('tagName'))) {
        return this.$el.addClass('selected');
      }
    };

    SubmenuItemView.prototype.getRenderData = function() {
      var params;

      params = SubmenuItemView.__super__.getRenderData.call(this);
      _.extend(params, {
        url: this.buildUrl()
      });
      return params;
    };

    SubmenuItemView.prototype.buildUrl = function() {
      var tagsInUrl, url,
        _this = this;

      tagsInUrl = _.clone(this.model.get('selectedTags'));
      if (!_.contains(tagsInUrl, this.model.get('tagName'))) {
        tagsInUrl.push(this.model.get('tagName'));
      } else if (_.contains(tagsInUrl, this.model.get('tagName'))) {
        tagsInUrl = _.without(tagsInUrl, this.model.get('tagName'));
      }
      url = "#byTags";
      tagsInUrl.forEach(function(item) {
        return url = "" + url + "/" + item;
      });
      return url;
    };

    SubmenuItemView.prototype.onClick = function() {
      var isActivated;

      isActivated = this.$el.hasClass('selected');
      if (isActivated) {
        this.trigger('unselect', this.model.get('tagName'));
        return this.$el.removeClass('selected');
      } else {
        this.trigger('select', this.model.get('tagName'));
        return this.$el.addClass('selected');
      }
    };

    return SubmenuItemView;

  })(BaseView);
  
});
window.require.register("views/submenu_view", function(exports, require, module) {
  var BaseView, SubmenuItemView, SubmenuView, TagsCollection,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BaseView = require('../lib/base_view');

  SubmenuItemView = require('./submenu_item_view');

  TagsCollection = require('../collections/tags');

  module.exports = SubmenuView = (function(_super) {
    __extends(SubmenuView, _super);

    SubmenuView.prototype.tagName = 'ul';

    SubmenuView.prototype.className = 'submenu';

    SubmenuView.prototype.views = {};

    function SubmenuView(options) {
      this.baseCollection = options.baseCollection;
      this.relatedView = options.relatedView;
      this.selectedTags = options.selectedTags || [];
      SubmenuView.__super__.constructor.call(this, options);
    }

    SubmenuView.prototype.getRootTagName = function() {
      return this.relatedView.model.get('tagName');
    };

    SubmenuView.prototype.buildTagsList = function() {
      if (this.collection != null) {
        delete this.collection;
      }
      this.collection = this.baseCollection;
      return this.tagsList = TagsCollection.extractFromTasks(this.collection, [this.getRootTagName()], this.selectedTags);
    };

    SubmenuView.prototype.beforeRender = function() {
      this.buildTagsList();
      return this.reset();
    };

    SubmenuView.prototype.afterRender = function() {
      var _this = this;

      this.relatedView.$el.append(this.$el);
      return this.tagsList.forEach(function(tagInfo) {
        var menuItem;

        menuItem = new SubmenuItemView({
          model: new Backbone.Model({
            tagName: tagInfo.get('id'),
            count: tagInfo.get('count'),
            selectedTags: _this.selectedTags
          })
        });
        _this.views[menuItem.cid] = menuItem;
        return _this.$el.append(menuItem.render().$el);
      });
    };

    SubmenuView.prototype.reset = function() {
      this.$el.empty();
      return this.views = {};
    };

    SubmenuView.prototype.destroy = function() {
      this.reset();
      return SubmenuView.__super__.destroy.call(this);
    };

    return SubmenuView;

  })(BaseView);
  
});
window.require.register("views/task_form_view", function(exports, require, module) {
  var BaseView, TaskListView, TaskView, Utils, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  BaseView = require('../lib/base_view');

  Utils = require('../lib/utils');

  TaskView = require('./task_view');

  module.exports = TaskListView = (function(_super) {
    __extends(TaskListView, _super);

    function TaskListView() {
      _ref = TaskListView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    TaskListView.prototype.el = '#new-task';

    TaskListView.prototype.template = require('./templates/task_form');

    TaskListView.prototype.events = {
      'keydown input': 'onKeydown',
      'keyup input': 'onKeyup',
      'click button': 'onSubmit'
    };

    TaskListView.prototype.initialize = function(options) {
      TaskListView.__super__.initialize.call(this);
      return this.tags = options.tags;
    };

    TaskListView.prototype.onKeydown = function(event) {
      var inputVal, key, neutralKeys, tagsList;

      key = event.keyCode || event.charCode;
      inputVal = this.$('input').val();
      tagsList = Utils.buildTagsList(this.tags, {
        tagPrefix: '#'
      });
      if (tagsList !== "") {
        tagsList = "" + tagsList + " ";
      }
      neutralKeys = [8, 32, 9, 13, 38, 40, 37, 39];
      if (inputVal.length === 0 && __indexOf.call(neutralKeys, key) < 0 && !(event.metaKey || event.ctrlKey || event.altKey)) {
        this.$('input').val(tagsList);
        return inputVal = tagsList;
      }
    };

    TaskListView.prototype.onKeyup = function(event) {
      var inputVal, key;

      key = event.keyCode || event.charCode;
      inputVal = this.$('input').val();
      if (inputVal.length === 0) {
        this.$('button').addClass('disabled');
        this.$('button').html("New");
      } else {
        this.$('button').removeClass('disabled');
        this.$('button').html("Add");
      }
      if (key === 13) {
        this.onSubmit();
      }
      if (key === 40) {
        return this.trigger('focus-down');
      }
    };

    TaskListView.prototype.onSubmit = function() {
      var inputVal;

      inputVal = this.$('input').val();
      if (inputVal.length > 0) {
        return this.trigger('new-task-submitted', {
          content: inputVal
        });
      }
    };

    TaskListView.prototype.getRenderData = function() {
      return {
        formPlaceholder: this.getFormPlaceholder()
      };
    };

    TaskListView.prototype.getFormPlaceholder = function() {
      var tagsList;

      tagsList = Utils.buildTagsList(this.tags, {
        tagPrefix: '#',
        regularSeparator: ', ',
        lastSeparator: ' and '
      });
      if (tagsList.length > 0) {
        return "What's next with " + tagsList + "?";
      } else {
        return "What's next?";
      }
    };

    return TaskListView;

  })(BaseView);
  
});
window.require.register("views/task_list_view", function(exports, require, module) {
  var BaseView, Task, TaskFormView, TaskListView, TaskView, Utils,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BaseView = require('../lib/base_view');

  Utils = require('../lib/utils');

  Task = require('../models/task');

  TaskView = require('./task_view');

  TaskFormView = require('./task_form_view');

  module.exports = TaskListView = (function(_super) {
    __extends(TaskListView, _super);

    TaskListView.prototype.el = '.container';

    TaskListView.prototype.template = require('./templates/task_list');

    TaskListView.prototype.views = null;

    TaskListView.prototype.collectionEl = 'ul#task-list';

    function TaskListView(options) {
      this.baseCollection = options.baseCollection;
      this.views = new Backbone.ChildViewContainer();
      TaskListView.__super__.constructor.call(this, options);
    }

    TaskListView.prototype.setTags = function(tags) {
      var _this = this;

      this.selectedTags = tags;
      if (this.collection != null) {
        this.stopListening(this.collection);
        delete this.collection;
      }
      this.collection = this.baseCollection.getByTags(this.selectedTags);
      this.listenTo(this.collection, 'add', this.render);
      return this.listenTo(this.collection, 'remove', function(task) {
        var previousVisibleTask;

        previousVisibleTask = task.getPreviousWithTags(_this.selectedTags);
        if (previousVisibleTask != null) {
          _this.taskModelCIDToFocus = previousVisibleTask.cid;
        }
        return _this.render();
      });
    };

    TaskListView.prototype.getRenderData = function() {
      return {
        title: this.getTitle()
      };
    };

    TaskListView.prototype.beforeRender = function() {
      var _this = this;

      return this.views.forEach(function(taskView) {
        if (_this.collection.indexOf(taskView.model) !== -1) {
          return taskView.$el.detach();
        } else {
          _this.stopListening(taskView);
          _this.views.remove(taskView);
          return taskView.destroy();
        }
      });
    };

    TaskListView.prototype.afterRender = function() {
      var view,
        _this = this;

      if (this.taskForm != null) {
        this.stopListening(this.taskForm);
        this.taskForm.destroy();
      }
      this.taskForm = new TaskFormView({
        tags: this.selectedTags
      });
      this.listenTo(this.taskForm, 'new-task-submitted', this.createNewTask);
      this.listenTo(this.taskForm, 'focus-down', this.onFocusDown);
      this.taskForm.render();
      this.collection.forEach(function(task) {
        var taskView;

        taskView = _this.views.findByModel(task);
        if (taskView == null) {
          taskView = new TaskView({
            model: task
          });
          _this.views.add(taskView);
          _this.listenTo(taskView, 'new-task-submitted', _this.createNewTask);
          _this.listenTo(taskView, 'focus-up', _this.onFocusUp);
          _this.listenTo(taskView, 'focus-down', _this.onFocusDown);
        }
        return $(_this.collectionEl).append(taskView.render().$el);
      });
      if (this.taskModelCIDToFocus != null) {
        view = this.views.findByModelCid(this.taskModelCIDToFocus);
        if (view != null) {
          view.setFocus();
        } else {
          console.log("something went wrong trying to focus");
        }
        this.taskModelCIDToFocus = null;
      } else {
        this.taskForm.$el.find('input').focus();
      }
      return this.$el;
    };

    TaskListView.prototype.getTitle = function() {
      var tagsList;

      if (this.collection.length === this.baseCollection.length) {
        return "All tasks";
      } else if ((this.selectedTags != null) && this.selectedTags.length === 0) {
        return "Untagged tasks";
      } else {
        tagsList = Utils.buildTagsList(this.selectedTags, {
          tagPrefix: '#',
          regularSeparator: ', ',
          lastSeparator: ' and '
        });
        return "Tasks of " + tagsList;
      }
    };

    TaskListView.prototype.createNewTask = function(options) {
      var content, index, nextTask, previousModel, previousTask, tagsList, task;

      if (options == null) {
        options = {};
      }
      tagsList = Utils.buildTagsList(this.selectedTags, {
        tagPrefix: '#'
      });
      if (tagsList !== "") {
        tagsList = "" + tagsList + " ";
      }
      content = options.content || tagsList;
      if (options.previous != null) {
        previousModel = this.views.findByModelCid(options.previous).model;
        index = this.baseCollection.indexOf(previousModel) + 1;
      } else {
        index = 0;
      }
      previousTask = this.baseCollection.at(index - 1);
      nextTask = this.baseCollection.at(index);
      task = new Task({
        content: content,
        previous: (previousTask != null ? previousTask.get('id') : void 0) || (previousTask != null ? previousTask.cid : void 0),
        next: (nextTask != null ? nextTask.get('id') : void 0) || (nextTask != null ? nextTask.cid : void 0)
      });
      /*
      maxID = _.max(@baseCollection.pluck('id')) + 1
      maxID = 1 if maxID is -Infinity
      task.id = maxID
      task.set 'id', maxID
      */

      if (previousTask != null) {
        previousTask.set('next', task.cid);
      }
      if (nextTask != null) {
        nextTask.set('previous', task.cid);
      }
      this.taskModelCIDToFocus = options.previous != null ? task.cid : null;
      return this.baseCollection.add(task, {
        at: index
      });
    };

    TaskListView.prototype.onFocusUp = function(cid) {
      var currentModel, previousIndex, previousModel;

      currentModel = this.views.findByModelCid(cid).model;
      previousIndex = this.collection.indexOf(currentModel) - 1;
      previousModel = this.collection.at(previousIndex);
      if (previousIndex >= 0) {
        return this.views.findByModel(previousModel).$el.find('input').focus();
      } else {
        return this.taskForm.$el.find('input').focus();
      }
    };

    TaskListView.prototype.onFocusDown = function(cid) {
      var currentModel, nextIndex, nextModel;

      if (cid != null) {
        currentModel = this.views.findByModelCid(cid).model;
        nextIndex = this.collection.indexOf(currentModel) + 1;
        nextModel = this.collection.at(nextIndex);
      } else {
        nextIndex = 0;
        nextModel = this.collection.at(nextIndex);
      }
      if (nextIndex < this.views.length) {
        return this.views.findByModel(nextModel).$el.find('input').focus();
      }
    };

    return TaskListView;

  })(BaseView);
  
});
window.require.register("views/task_view", function(exports, require, module) {
  var BaseView, TaskView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BaseView = require('../lib/base_view');

  module.exports = TaskView = (function(_super) {
    __extends(TaskView, _super);

    function TaskView() {
      _ref = TaskView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    TaskView.prototype.tagName = 'li';

    TaskView.prototype.className = 'task';

    TaskView.prototype.template = require('./templates/task');

    TaskView.prototype.events = {
      'keydown  input': 'onKeydown',
      'keyup  input': 'onKeyup',
      'blur input': 'onBlur',
      'click button': 'onClick',
      'mouseenter button': 'onMouseEnter',
      'mouseleave button': 'onMouseLeave'
    };

    TaskView.prototype.getRenderData = function() {
      return {
        model: this.model.toJSON(),
        tabindex: this.model.collection.indexOf(this.model) + 2
      };
    };

    TaskView.prototype.afterRender = function() {
      var button;

      if (this.model.get('isDone')) {
        button = this.$('button');
        button.addClass('done');
        return button.html('Done');
      }
    };

    TaskView.prototype.onClick = function() {
      this.model.set('isDone', !this.model.get('isDone'));
      return this.render();
    };

    TaskView.prototype.onKeydown = function(event) {
      var key;

      key = event.keyCode || event.charCode;
      if (this.$('input').val() === "" && key === 8) {
        this.model.destroy();
        return event.preventDefault();
      }
    };

    TaskView.prototype.onKeyup = function(event) {
      var key;

      key = event.keyCode || event.charCode;
      if (key === 13) {
        this.onBlur();
        return this.trigger('new-task-submitted', {
          content: '',
          previous: this.model.cid
        });
      } else if (key === 38) {
        return this.trigger('focus-up', this.model.cid);
      } else if (key === 40) {
        return this.trigger('focus-down', this.model.cid);
      }
    };

    TaskView.prototype.onBlur = function() {
      return this.model.set('content', this.$('input').val());
    };

    TaskView.prototype.setFocus = function() {
      var index, inputField;

      inputField = this.$('input');
      inputField.focus();
      index = inputField.val().length;
      return inputField[0].setSelectionRange(index, index);
    };

    TaskView.prototype.onMouseEnter = function() {
      var button;

      button = this.$('button');
      if (this.model.get('isDone')) {
        return button.html('Todo?');
      } else {
        return button.html('Done?');
      }
    };

    TaskView.prototype.onMouseLeave = function() {
      var button;

      button = this.$('button');
      if (this.model.get('isDone')) {
        return button.html('Done');
      } else {
        return button.html('Todo');
      }
    };

    return TaskView;

  })(BaseView);
  
});
window.require.register("views/templates/home", function(exports, require, module) {
  module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
  attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
  var buf = [];
  with (locals || {}) {
  var interp;
  buf.push('<div id="menu"></div><div class="container"></div>');
  }
  return buf.join("");
  };
});
window.require.register("views/templates/menu", function(exports, require, module) {
  module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
  attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
  var buf = [];
  with (locals || {}) {
  var interp;
  buf.push('<ul class="permanent"><li class="first-level"><a href="#">All (' + escape((interp = allCount) == null ? '' : interp) + ')</a></li><li class="first-level"><a href="#untagged">Untagged (' + escape((interp = untaggedCount) == null ? '' : interp) + ')</a></li></ul><ul class="tags"></ul>');
  }
  return buf.join("");
  };
});
window.require.register("views/templates/menu_item", function(exports, require, module) {
  module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
  attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
  var buf = [];
  with (locals || {}) {
  var interp;
  buf.push('<a');
  buf.push(attrs({ 'href':("" + (url) + "") }, {"href":true}));
  buf.push('><i class="tag-icon"></i><span>' + escape((interp = model.tagName) == null ? '' : interp) + ' (' + escape((interp = model.count) == null ? '' : interp) + ')</span></a>');
  }
  return buf.join("");
  };
});
window.require.register("views/templates/task", function(exports, require, module) {
  module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
  attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
  var buf = [];
  with (locals || {}) {
  var interp;
  buf.push('<div class="task-container"><button class="toggle-state button">Todo</button><div class="todo-field"><input');
  buf.push(attrs({ 'value':("" + (model.content) + ""), 'tabindex':("" + (tabindex) + "") }, {"value":true,"tabindex":true}));
  buf.push('/></div></div>');
  }
  return buf.join("");
  };
});
window.require.register("views/templates/task_form", function(exports, require, module) {
  module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
  attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
  var buf = [];
  with (locals || {}) {
  var interp;
  buf.push('<div class="task-container"><button class="toggle-state button disabled">New</button><div class="todo-field"><input');
  buf.push(attrs({ 'tabindex':("1"), 'placeholder':("" + (formPlaceholder) + "") }, {"tabindex":true,"placeholder":true}));
  buf.push('/></div></div>');
  }
  return buf.join("");
  };
});
window.require.register("views/templates/task_list", function(exports, require, module) {
  module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
  attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
  var buf = [];
  with (locals || {}) {
  var interp;
  buf.push('<h1>' + escape((interp = title) == null ? '' : interp) + '</h1><div id="new-task" class="task"></div><ul id="task-list"></ul>');
  }
  return buf.join("");
  };
});
