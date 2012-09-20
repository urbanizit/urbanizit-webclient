var U = U || {};
U.View = U.View || {};

U.View.ComponentMain = Backbone.View.extend({
    el: "#main",
    render : function() {
        this.$el.html(this.template());
        return this;
    }
});