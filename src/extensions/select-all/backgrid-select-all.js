/*
  backgrid-select-all
  http://github.com/wyuenho/backgrid

  Copyright (c) 2013 Jimmy Yuen Ho Wong
  Licensed under the MIT @license.
*/
(function (window, $, _, Backbone, Backgrid)  {

  /**
     Renders a checkbox for row selection.

     @class Backgrid.Extension.SelectRowCell
     @extends Backbone.View
   */
  var SelectRowCell = Backgrid.Extension.SelectRowCell = Backbone.View.extend({

    /** @property */
    className: "select-row-cell",

    /** @property */
    tagName: "td",

    /** @property */
    events: {
      "change :checkbox": "onChange"
    },

    /**
       Initializer. If the underlying model triggers a `select` event, this cell
       will change its checked value according to the event's `selected` value.

       @param {Object} options
       @param {Backgrid.Column} options.column
       @param {Backbone.Model} options.model
     */
    initialize: function (options) {

      this.column = options.column;
      if (!(this.column instanceof Backgrid.Column)) {
        this.column = new Backgrid.Column(this.column);
      }

      this.listenTo(this.model, "select", function (model, selected) {
        this.$el.find(":checkbox").prop("checked", selected).change();
      });

    },

    /**
       When the checkbox's value changes, this method will trigger a Backbone
       `selected` event with a reference of the model and the checkbox's
       `checked` value.
     */
    onChange: function (e) {
      this.model.trigger("selected", this.model, $(e.target).prop("checked"));
    },

    /**
       Renders a checkbox in a table cell.
     */
    render: function () {
      this.$el.empty().append('<input type="checkbox" />');
      return this;
    }

  });

  /**
     Renders a checkbox to select all rows on the current page.

     @class Backgrid.Extension.SelectAllHeaderCell
     @extends Backgrid.Extension.SelectRowCell
   */
  Backgrid.Extension.SelectAllHeaderCell = SelectRowCell.extend({

    /** @property */
    className: "select-all-header-cell",

    /** @property */
    tagName: "th",

    /**
       Initializer. When this cell's checkbox is checked, a Backbone `select`
       event will be triggered for each model for the current page in the
       underlying collection. If a `SelectRowCell` instance exists for the rows
       representing the models, they will check themselves. If any of the
       SelectRowCell instances trigger a Backbone `selected` event with a
       `false` value, this cell will uncheck its checkbox. In the event of a
       Backbone `backgrid:refresh` event, which is triggered when the body
       refreshes its rows, which can happen under a number of conditions such as
       paging or the columns were reset, this cell will still remember the
       previously selected models and trigger a Backbone `select` event on them
       such that the SelectRowCells can recheck themselves upon refreshing.

       @param {Object} options
       @param {Backgrid.Column} options.column
       @param {Backbone.Collection} options.collection
     */
    initialize: function (options) {

      this.column = options.column;
      if (!(this.column instanceof Backgrid.Column)) {
        this.column = new Backgrid.Column(this.column);
      }

      var collection = this.collection;
      var selectedModels = this.selectedModels = {};
      this.listenTo(collection, "selected", function (model, selected) {
        if (selected) selectedModels[model.id || model.cid] = model;
        else {
          delete selectedModels[model.id || model.cid];
          this.$el.find(":checkbox").prop("checked", false);
        }
      });

      this.listenTo(collection, "remove", function (model) {
        delete selectedModels[model.cid];
      });

      this.listenTo(Backbone, "backgrid:refresh", function () {
        this.$el.find(":checkbox").prop("checked", false);
        for (var i = 0; i < collection.length; i++) {
          var model = collection.at(i);
          if (selectedModels[model.id || model.cid]) {
            model.trigger('select', model, true);
          }
        }
      });
    },

    /**
       Progagates the checked value of this checkbox to all the models of the
       underlying collection by triggering a Backbone `select` event on the
       models themselves, passing each model and the current `checked` value of
       the checkbox in each event.
     */
    onChange: function (e) {
      var checked = $(e.target).prop("checked");

      var collection = this.collection;
      collection.each(function (model) {
        model.trigger("select", model, checked);
      });
    }

  });

}(window, jQuery, _, Backbone, Backgrid));
