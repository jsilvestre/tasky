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
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';

    if (has(cache, path)) return cache[path].exports;
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex].exports;
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
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

  var list = function() {
    var result = [];
    for (var item in modules) {
      if (has(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.list = list;
  globals.require.brunch = true;
})();
require.register("application", function(exports, require, module) {
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

;require.register("collections/archived_tasks", function(exports, require, module) {
var ArchivedTaskCollection, TaskCollection, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

TaskCollection = require('./tasks');

module.exports = ArchivedTaskCollection = (function(_super) {
  __extends(ArchivedTaskCollection, _super);

  function ArchivedTaskCollection() {
    _ref = ArchivedTaskCollection.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  ArchivedTaskCollection.prototype.comparator = function(a, b) {
    if (a.get('completionDate') > b.get('completionDate')) {
      return -1;
    } else if (a.get('completionDate') === b.get('completionDate')) {
      return 0;
    } else {
      return 1;
    }
  };

  return ArchivedTaskCollection;

})(TaskCollection);

});

;require.register("collections/tags", function(exports, require, module) {
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

;require.register("collections/tasks", function(exports, require, module) {
var TagsCollection, Task, TaskCollection, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

TagsCollection = require('./tags');

Task = require('../models/task');

module.exports = TaskCollection = (function(_super) {
  __extends(TaskCollection, _super);

  function TaskCollection() {
    _ref = TaskCollection.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  TaskCollection.prototype.url = 'tasks';

  TaskCollection.prototype.model = Task;

  TaskCollection.prototype.comparator = function(a, b) {
    if (a.get('order') > b.get('order')) {
      return -1;
    } else if (a.get('order') === b.get('order')) {
      return 0;
    } else {
      return 1;
    }
  };

  TaskCollection.prototype.getNewOrder = function(prev, next) {
    var nextOrder, prevOrder;

    nextOrder = next != null ? next.get('order') : 0.0;
    if (prev != null) {
      prevOrder = prev.get('order');
      return prevOrder - (prevOrder - nextOrder) / DIVISOR;
    } else {
      return nextOrder + 1.0;
    }
  };

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

  return TaskCollection;

})(Backbone.Collection);

});

;require.register("initialize", function(exports, require, module) {
var app;

app = require('application');

$(function() {
  $.fn.spin = function(opts, color) {
    var presets;

    presets = {
      tiny: {
        lines: 8,
        length: 2,
        width: 2,
        radius: 3
      },
      small: {
        lines: 8,
        length: 1,
        width: 2,
        radius: 4
      },
      medium: {
        lines: 10,
        length: 4,
        width: 3,
        radius: 6
      },
      large: {
        lines: 10,
        length: 8,
        width: 4,
        radius: 8
      },
      extralarge: {
        lines: 8,
        length: 3,
        width: 10,
        radius: 20,
        top: 30,
        left: 50
      }
    };
    if (typeof Spinner !== "undefined" && Spinner !== null) {
      return this.each(function() {
        var $this, spinner;

        $this = $(this);
        spinner = $this.data("spinner");
        if (spinner != null) {
          spinner.stop();
          return $this.data("spinner", null);
        } else if (opts !== false) {
          if (typeof opts === "string") {
            if (opts in presets) {
              opts = presets[opts];
            } else {
              opts = {};
            }
            if (color) {
              opts.color = color;
            }
          }
          spinner = new Spinner(opts);
          spinner.spin(this);
          return $this.data("spinner", spinner);
        }
      });
    }
  };
  return app.initialize();
});

});

;require.register("lib/base_view", function(exports, require, module) {
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

;require.register("lib/utils", function(exports, require, module) {
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

;require.register("lib/view_collection", function(exports, require, module) {
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

;require.register("models/task", function(exports, require, module) {
var Task, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = Task = (function(_super) {
  __extends(Task, _super);

  function Task() {
    _ref = Task.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Task.prototype.set = function(attributes, options) {
    var tags;

    Task.__super__.set.call(this, attributes, options);
    if (attributes === "description") {
      tags = Task.extractTags(this.get('description'));
      return this.set('tags', tags);
    }
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

  Task.regex = /#([\w\d\-_\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)/g;

  Task.extractTags = function(desc) {
    var tags;

    tags = desc.match(Task.regex);
    tags = _.unique(tags);
    tags = _.map(tags, function(tag) {
      return tag.replace('#', '');
    });
    return tags;
  };

  return Task;

})(Backbone.Model);

});

;require.register("router", function(exports, require, module) {
var AppView, ArchivedTaskCollection, ArchivedTaskListView, MenuView, Router, Task, TaskCollection, TaskListView, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppView = require('views/app_view');

MenuView = require('views/menu_view');

TaskListView = require('views/task_list_view');

ArchivedTaskListView = require('views/archive_list_view');

TaskCollection = require('collections/tasks');

ArchivedTaskCollection = require('collections/archived_tasks');

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
    'archived': 'archived',
    'byTags/*tags': 'byTags'
  };

  Router.prototype.initialize = function() {
    var _this = this;

    this.collection = new TaskCollection(initTasks);
    this.archivedCollection = new ArchivedTaskCollection(archivedTasks);
    this.mainView = new AppView();
    this.mainView.render();
    this.menu = new MenuView({
      baseCollection: this.collection,
      archivedCollection: this.archivedCollection
    });
    this.menu.render();
    this.taskList = new TaskListView({
      baseCollection: this.collection
    });
    this.listenTo(this.taskList, 'archive-tasks', function(tasks) {
      _this.collection.remove(tasks);
      _this.archivedCollection.add(tasks);
      return _this.taskList.render();
    });
    this.archivedTaskList = new ArchivedTaskListView({
      baseCollection: this.archivedCollection
    });
    return this.listenTo(this.archivedTaskList, 'restore-task', function(task) {
      _this.archivedCollection.remove(task);
      _this.collection.add(task);
      return _this.archivedTaskList.render();
    });
  };

  Router.prototype.main = function() {
    var tags;

    tags = null;
    this.taskList.setTags(tags);
    this.taskList.render();
    this.menu.setHighlightedItem(1);
    return this.menu.setActive(tags);
  };

  Router.prototype.untagged = function() {
    var tags;

    tags = [];
    this.taskList.setTags(tags);
    this.taskList.render();
    this.menu.setHighlightedItem(2);
    return this.menu.setActive(tags);
  };

  Router.prototype.archived = function() {
    var tags;

    tags = void 0;
    this.archivedTaskList.setTags(tags);
    this.archivedTaskList.render();
    this.menu.setHighlightedItem(3);
    return this.menu.setActive(tags);
  };

  Router.prototype.byTags = function(tags) {
    tags = tags.split('/');
    if (tags[tags.length - 1] === "") {
      delete tags[tags.length - 1];
    }
    this.taskList.setTags(tags);
    this.taskList.render();
    this.menu.setHighlightedItem(null);
    return this.menu.setActive(tags);
  };

  return Router;

})(Backbone.Router);

});

;require.register("views/app_view", function(exports, require, module) {
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

;require.register("views/archive_list_view", function(exports, require, module) {
var ArchiveListView, ArchiveTaskView, BaseView, Task, TaskFormView, Utils,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

Utils = require('../lib/utils');

Task = require('../models/task');

ArchiveTaskView = require('./archive_task_view');

TaskFormView = require('./task_form_view');

module.exports = ArchiveListView = (function(_super) {
  __extends(ArchiveListView, _super);

  ArchiveListView.prototype.el = '.container';

  ArchiveListView.prototype.template = require('./templates/task_list_archive');

  ArchiveListView.prototype.views = null;

  ArchiveListView.prototype.collectionEl = 'ul#task-list';

  function ArchiveListView(options) {
    this.baseCollection = options.baseCollection;
    this.views = new Backbone.ChildViewContainer();
    ArchiveListView.__super__.constructor.call(this, options);
  }

  ArchiveListView.prototype.setTags = function(tags) {
    var _this = this;

    this.selectedTags = tags;
    if (this.collection != null) {
      this.stopListening(this.collection);
      delete this.collection;
    }
    this.collection = this.baseCollection.getByTags(this.selectedTags);
    this.listenTo(this.collection, 'add', this.render);
    this.listenTo(this.collection, 'remove', this.render);
    return this.listenTo(this.collection, 'change', function(task) {
      var taskView;

      if (!(task != null ? task.get('isArchived') : void 0)) {
        taskView = _this.views.findByModel(task);
        return taskView.$el.fadeOut(function() {
          _this.stopListening(taskView);
          _this.views.remove(taskView);
          taskView.destroy();
          return _this.trigger('restore-task', task);
        });
      }
    });
  };

  ArchiveListView.prototype.getRenderData = function() {
    return {
      title: this.getTitle()
    };
  };

  ArchiveListView.prototype.beforeRender = function() {
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

  ArchiveListView.prototype.afterRender = function() {
    var _this = this;

    this.collection.forEach(function(task) {
      var taskView;

      taskView = _this.views.findByModel(task);
      if (taskView == null) {
        taskView = new ArchiveTaskView({
          model: task
        });
        _this.views.add(taskView);
      } else {
        taskView.delegateEvents();
      }
      return $(_this.collectionEl).append(taskView.render().$el);
    });
    return this.$el;
  };

  ArchiveListView.prototype.getTitle = function() {
    var tagsList;

    if (this.collection.length === this.baseCollection.length) {
      return "All archived tasks";
    } else {
      tagsList = Utils.buildTagsList(this.selectedTags, {
        tagPrefix: '#',
        regularSeparator: ', ',
        lastSeparator: ' and '
      });
      return "Archived tasks of " + tagsList;
    }
  };

  return ArchiveListView;

})(BaseView);

});

;require.register("views/archive_task_view", function(exports, require, module) {
var ArchiveTaskView, TaskView, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

TaskView = require('./task_view');

module.exports = ArchiveTaskView = (function(_super) {
  __extends(ArchiveTaskView, _super);

  function ArchiveTaskView() {
    _ref = ArchiveTaskView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  ArchiveTaskView.prototype.tagName = 'li';

  ArchiveTaskView.prototype.className = 'task archive done';

  ArchiveTaskView.prototype.template = require('./templates/task_archive');

  ArchiveTaskView.prototype.getRenderData = function() {
    var date;

    date = Date.create(this.model.get('completionDate'));
    return _.extend(ArchiveTaskView.__super__.getRenderData.call(this), {
      competionDate: date.format("{dd}/{MM}/{yyyy} at {hh}:{mm}")
    });
  };

  ArchiveTaskView.prototype.afterRender = function() {};

  ArchiveTaskView.prototype.onClick = function() {
    this.model.set('done', false);
    this.model.set('completionDate', null);
    this.model.set('isArchived', false);
    this.model.save();
    return this.render();
  };

  ArchiveTaskView.prototype.onMouseEnter = function() {
    var button;

    button = this.$('button');
    if (this.model.get('done')) {
      return button.html('Restore?');
    }
  };

  ArchiveTaskView.prototype.onMouseLeave = function() {
    var button;

    button = this.$('button');
    if (this.model.get('done')) {
      return button.html('Done');
    }
  };

  return ArchiveTaskView;

})(TaskView);

});

;require.register("views/menu_item_view", function(exports, require, module) {
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

;require.register("views/menu_view", function(exports, require, module) {
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

  MenuView.prototype.views = null;

  MenuView.prototype.collectionEl = 'ul.tags';

  MenuView.prototype.activeTags = null;

  MenuView.prototype.subMenuHandler = null;

  function MenuView(options) {
    this.baseCollection = options.baseCollection;
    this.archivedCollection = options.archivedCollection;
    this.views = new Backbone.ChildViewContainer();
    MenuView.__super__.constructor.call(this, options);
  }

  MenuView.prototype.initialize = function(options) {
    this.listenTo(this.baseCollection, {
      'add': this.onChange,
      'change': this.onChange,
      'remove': this.onChange
    });
    this.listenTo(this.archivedCollection, {
      'add': this.onChange,
      'change': this.onChange,
      'remove': this.onChange
    });
    return MenuView.__super__.initialize.call(this, options);
  };

  MenuView.prototype.getRenderData = function() {
    var archivedCount;

    if (this.archivedCollection.length > 1000) {
      archivedCount = 'Over 9000++';
    } else {
      archivedCount = this.archivedCollection.length;
    }
    return {
      allCount: this.baseCollection.length,
      untaggedCount: this.baseCollection.filter(function(task) {
        return task.get('tags').length === 0;
      }).length,
      archivedCount: archivedCount
    };
  };

  MenuView.prototype.beforeRender = function() {
    var tagsList,
      _this = this;

    tagsList = this.baseCollection.getAllTags();
    return this.views.forEach(function(taskView) {
      if (tagsList.indexOf(taskView.model.get('tagName')) !== -1) {
        return taskView.$el.detach();
      } else {
        _this.stopListening(taskView);
        _this.views.remove(taskView);
        return taskView.destroy();
      }
    });
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
      _this.views.add(menuItem);
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
    return this.handleTagSelection(tags);
  };

  MenuView.prototype.setHighlightedItem = function(highlightedItem) {
    return this.highlightedItem = highlightedItem;
  };

  MenuView.prototype.handleTagSelection = function(itemNumToSelect) {
    var _this = this;

    if (itemNumToSelect == null) {
      itemNumToSelect = null;
    }
    this.$('li.active').removeClass('active');
    if (this.highlightedItem != null) {
      this.$("ul.permanent li:nth-of-type(" + this.highlightedItem + ")").addClass('active');
      this.handleSubmenu(null);
      return this.handleSubmenu(null);
    } else {
      return this.views.some(function(view) {
        if (view.model.get('tagName') === _this.activeTags[0]) {
          view.$el.addClass('active');
          _this.handleSubmenu(view.cid, _this.activeTags);
          return true;
        }
      });
    }
  };

  MenuView.prototype.onClick = function(event) {
    var domElement, menuItemId, rootTag;

    this.$('li.active').removeClass('active');
    domElement = $(event.currentTarget);
    domElement.addClass('active');
    menuItemId = domElement.data('menu-item');
    if (menuItemId === this.subMenuHandler) {
      return this.closeSubmenu();
    } else if (this.subMenuHandler === null && menuItemId !== void 0) {
      rootTag = this.views.findByCid(menuItemId).model.get('tagName');
      return this.handleSubmenu(menuItemId, [rootTag]);
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
    relatedView = this.views.findByCid(menuItemId);
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

;require.register("views/submenu_item_view", function(exports, require, module) {
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

;require.register("views/submenu_view", function(exports, require, module) {
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

  SubmenuView.prototype.views = null;

  function SubmenuView(options) {
    this.baseCollection = options.baseCollection;
    this.relatedView = options.relatedView;
    this.selectedTags = options.selectedTags || [];
    this.views = new Backbone.ChildViewContainer();
    SubmenuView.__super__.constructor.call(this, options);
  }

  SubmenuView.prototype.getRootTagName = function() {
    return this.relatedView.model.get('tagName');
  };

  SubmenuView.prototype.buildTagsList = function() {
    if (this.collection != null) {
      delete this.collection;
    }
    this.collection = this.baseCollection.getByTags(this.selectedTags);
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
      _this.views.add = menuItem;
      return _this.$el.append(menuItem.render().$el);
    });
  };

  SubmenuView.prototype.reset = function() {
    var _this = this;

    return this.views.forEach(function(taskView) {
      if (_this.tagsList.indexOf(taskView.model.get('tagName')) !== -1) {
        return taskView.$el.detach();
      } else {
        _this.stopListening(taskView);
        _this.views.remove(taskView);
        return taskView.destroy();
      }
    });
  };

  SubmenuView.prototype.destroy = function() {
    this.reset();
    return SubmenuView.__super__.destroy.call(this);
  };

  return SubmenuView;

})(BaseView);

});

;require.register("views/task_form_view", function(exports, require, module) {
var BaseView, TaskFormView, TaskView, Utils, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

BaseView = require('../lib/base_view');

Utils = require('../lib/utils');

TaskView = require('./task_view');

module.exports = TaskFormView = (function(_super) {
  __extends(TaskFormView, _super);

  function TaskFormView() {
    _ref = TaskFormView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  TaskFormView.prototype.el = '#new-task';

  TaskFormView.prototype.template = require('./templates/task_form');

  TaskFormView.prototype.events = {
    'keydown input': 'onKeydown',
    'keyup input': 'onKeyup',
    'click button': 'onSubmit'
  };

  TaskFormView.prototype.initialize = function(options) {
    TaskFormView.__super__.initialize.call(this);
    return this.tags = options.tags;
  };

  TaskFormView.prototype.onKeydown = function(event) {
    var authorizedComboKeys, inputVal, key, neutralKeys, tagsList;

    key = event.keyCode || event.charCode;
    inputVal = this.$('input').val();
    tagsList = Utils.buildTagsList(this.tags, {
      tagPrefix: '#'
    });
    if (tagsList !== "") {
      tagsList = "" + tagsList + " ";
    }
    neutralKeys = [8, 32, 9, 13, 38, 40, 37, 39];
    authorizedComboKeys = [220, 86];
    if (inputVal.length === 0 && __indexOf.call(neutralKeys, key) < 0 && (!(event.metaKey || event.ctrlKey || event.altKey) || __indexOf.call(authorizedComboKeys, key) >= 0)) {
      this.$('input').val(tagsList);
      return inputVal = tagsList;
    }
  };

  TaskFormView.prototype.onKeyup = function(event) {
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

  TaskFormView.prototype.onSubmit = function() {
    var inputVal;

    inputVal = this.$('input').val();
    if (inputVal.length > 0) {
      return this.trigger('new-task-submitted', {
        content: inputVal
      });
    }
  };

  TaskFormView.prototype.getRenderData = function() {
    return {
      formPlaceholder: this.getFormPlaceholder()
    };
  };

  TaskFormView.prototype.getFormPlaceholder = function() {
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

  return TaskFormView;

})(BaseView);

});

;require.register("views/task_list_view", function(exports, require, module) {
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

  TaskListView.prototype.events = {
    'click #archive-action': 'onArchiveClicked'
  };

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
    this.listenTo(this.collection, 'remove', function(task) {
      var previousVisibleTask;

      previousVisibleTask = task.getPreviousWithTags(_this.selectedTags);
      if (previousVisibleTask != null) {
        _this.taskModelCIDToFocus = previousVisibleTask.cid;
      }
      return _this.render();
    });
    return this.listenTo(this.collection, 'change', function(task) {
      return _this.updateArchiveButtonState();
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

    this.updateArchiveButtonState();
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
        _this.listenTo(taskView, 'move-up', _this.onMoveUp);
        _this.listenTo(taskView, 'move-down', _this.onMoveDown);
      } else {
        taskView.delegateEvents();
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
    var content, index, newNext, nextIndex, order, previous, tagsList, task;

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
      previous = this.views.findByModelCid(options.previous).model;
      nextIndex = this.baseCollection.indexOf(previous) + 1;
      newNext = this.baseCollection.at(nextIndex);
      order = this.baseCollection.getNewOrder(previous, newNext);
      index = nextIndex;
    } else {
      newNext = this.baseCollection.at(0);
      order = this.baseCollection.getNewOrder(null, newNext);
    }
    task = new Task({
      description: content,
      order: order,
      tags: Task.extractTags(content)
    });
    this.taskModelCIDToFocus = options.previous != null ? task.cid : null;
    return this.baseCollection.create(task, {
      at: index
    });
  };

  TaskListView.prototype.onFocusUp = function(cid) {
    var currentModel, previousIndex, previousModel;

    currentModel = this.views.findByModelCid(cid).model;
    previousIndex = this.collection.indexOf(currentModel) - 1;
    previousModel = this.collection.at(previousIndex);
    if (previousIndex >= 0) {
      return this.views.findByModel(previousModel).setFocus();
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
      return this.views.findByModel(nextModel).setFocus();
    }
  };

  TaskListView.prototype.onMoveUp = function(cid, toFocus) {
    var currentModel, newOrder, newPrevious, previous, previousIndex;

    if (toFocus == null) {
      toFocus = null;
    }
    currentModel = this.views.findByModelCid(cid).model;
    previousIndex = this.baseCollection.indexOf(currentModel) - 1;
    previous = this.baseCollection.at(previousIndex);
    if (previousIndex >= 1) {
      newOrder = null;
      newPrevious = this.baseCollection.at(previousIndex - 1);
      newOrder = this.baseCollection.getNewOrder(newPrevious, previous);
    } else if (previousIndex === 0) {
      newOrder = this.baseCollection.getNewOrder(null, previous);
    } else {
      newOrder = null;
    }
    if (newOrder != null) {
      currentModel.set('order', newOrder);
      currentModel.save();
      this.baseCollection.sort();
      this.taskModelCIDToFocus = toFocus != null ? toFocus : cid;
      return this.render();
    }
  };

  TaskListView.prototype.onMoveDown = function(cid) {
    var currentModel, nextIndex, nextModel, nextView;

    currentModel = this.views.findByModelCid(cid).model;
    nextIndex = this.baseCollection.indexOf(currentModel) + 1;
    nextModel = this.baseCollection.at(nextIndex);
    if (nextModel != null) {
      nextView = this.views.findByModelCid(nextModel.cid);
      return this.onMoveUp(nextModel.cid, cid);
    }
  };

  TaskListView.prototype.updateArchiveButtonState = function() {
    if (this.collection.where({
      done: true
    }).length > 0) {
      return this.$('#archive-action').removeClass('disable');
    } else {
      return this.$('#archive-action').addClass('disable');
    }
  };

  TaskListView.prototype.onArchiveClicked = function() {
    var counterArchived, counterToArchive, done, tasksToArchive,
      _this = this;

    tasksToArchive = this.collection.where({
      done: true
    });
    counterToArchive = tasksToArchive.length;
    counterArchived = 0;
    if (counterToArchive > 0) {
      this.$('#archive-action').html('&nbsp;');
      this.$('#archive-action').spin('tiny', '#fff');
    }
    done = function(task) {
      var taskView;

      counterArchived++;
      taskView = _this.views.findByModel(task);
      if (counterArchived === counterToArchive) {
        _this.stopListening(taskView);
        _this.views.remove(taskView);
        return taskView.$el.fadeOut(function() {
          taskView.destroy();
          _this.$('#archive-action').html('Archive all done tasks');
          return _this.trigger('archive-tasks', tasksToArchive);
        });
      } else {
        _this.stopListening(taskView);
        _this.views.remove(taskView);
        return taskView.$el.fadeOut(function() {
          return taskView.destroy();
        });
      }
    };
    return tasksToArchive.forEach(function(task) {
      task.set('isArchived', true);
      task.once('sync', done);
      return task.save();
    });
  };

  return TaskListView;

})(BaseView);

});

;require.register("views/task_view", function(exports, require, module) {
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
    'focus input': 'onFocus',
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
    if (this.model.get('done')) {
      this.$el.addClass('done');
      return this.$('button').html('Done');
    } else {
      return this.$el.removeClass('done');
    }
  };

  TaskView.prototype.onClick = function() {
    this.model.set('done', !this.model.get('done'));
    if (this.model.get('done')) {
      this.model.set('completionDate', Date.now());
    } else {
      this.model.set('completionDate', null);
    }
    this.afterRender();
    this.model.save();
    return this.render();
  };

  TaskView.prototype.onKeydown = function(event) {
    var ctrlPressed, key;

    key = event.keyCode || event.charCode;
    ctrlPressed = event.controlKey || event.metaKey;
    if (this.$('input').val() === "" && key === 8) {
      this.model.destroy();
      return event.preventDefault();
    } else if (key === 38 && ctrlPressed) {
      return this.trigger('move-up', this.model.cid);
    } else if (key === 40 && ctrlPressed) {
      return this.trigger('move-down', this.model.cid);
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

  TaskView.prototype.onFocus = function() {
    var _this = this;

    return this.focusInterval = setInterval(function() {
      return _this.saveDescription();
    }, 2000);
  };

  TaskView.prototype.onBlur = function() {
    clearInterval(this.focusInterval);
    return this.saveDescription();
  };

  TaskView.prototype.saveDescription = function() {
    var description;

    description = this.$('input').val();
    if (description !== this.model.get('description')) {
      this.model.set('description', description);
      return this.model.save();
    }
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
    if (this.model.get('done')) {
      return button.html('Todo?');
    } else {
      return button.html('Done?');
    }
  };

  TaskView.prototype.onMouseLeave = function() {
    var button;

    button = this.$('button');
    if (this.model.get('done')) {
      return button.html('Done');
    } else {
      return button.html('Todo');
    }
  };

  TaskView.prototype.destroy = function() {
    clearTimeout(this.focusInterval);
    return TaskView.__super__.destroy.call(this);
  };

  return TaskView;

})(BaseView);

});

;require.register("views/templates/home", function(exports, require, module) {
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

;require.register("views/templates/menu", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<ul class="permanent"><li class="first-level"><a href="#">All (' + escape((interp = allCount) == null ? '' : interp) + ')</a></li><li class="first-level"><a href="#untagged">Untagged (' + escape((interp = untaggedCount) == null ? '' : interp) + ')</a></li><li class="first-level"><a href="#archived">Archived (' + escape((interp = archivedCount) == null ? '' : interp) + ')</a></li></ul><ul class="tags"></ul>');
}
return buf.join("");
};
});

;require.register("views/templates/menu_item", function(exports, require, module) {
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

;require.register("views/templates/task", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="task-container"><button class="toggle-state button">Todo</button><div class="todo-field"><input');
buf.push(attrs({ 'value':("" + (model.description) + ""), 'tabindex':("" + (tabindex) + "") }, {"value":true,"tabindex":true}));
buf.push('/></div></div>');
}
return buf.join("");
};
});

;require.register("views/templates/task_archive", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="task-container"><button class="toggle-state button">Done</button><div class="todo-field"><input');
buf.push(attrs({ 'value':("" + (model.description) + ""), 'tabindex':("" + (tabindex) + "") }, {"value":true,"tabindex":true}));
buf.push('/></div></div><div class="todo-completionDate"><p>Completed on ' + escape((interp = competionDate) == null ? '' : interp) + '</p></div>');
}
return buf.join("");
};
});

;require.register("views/templates/task_form", function(exports, require, module) {
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

;require.register("views/templates/task_list", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<h1>' + escape((interp = title) == null ? '' : interp) + '</h1><p id="actions">Actions:<button id="archive-action" class="button disable">Archive all done tasks</button></p><div id="new-task" class="task"></div><ul id="task-list"></ul>');
}
return buf.join("");
};
});

;require.register("views/templates/task_list_archive", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<h1>' + escape((interp = title) == null ? '' : interp) + '</h1><ul id="task-list"></ul>');
}
return buf.join("");
};
});

;
//# sourceMappingURL=app.js.map