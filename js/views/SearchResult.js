var U = U || {};
U.View = U.View || {};

U.View.SearchResult = Backbone.View.extend({
    el: "#searchResults",
    
    initialize : function() {
    	var self=this;
        this.model.bind("add", function (result) {
            new U.View.SearchResultItem({model:result}).render();
        });
    },
    
    render : function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
 });

U.View.SearchResultItem = Backbone.View.extend({
    el: "#results",

    initialize : function() {
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.close, this);
    },
    
    render: function() {
        this.$el.append(this.template(this.model.toJSON()));
        $("#result" + this.model.id).tooltip("hide");
        return this;
    }
 });