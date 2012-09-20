var U =  U || {};
U.Router = U.Router || {};
U.View = U.View || {};
U.Collection = U.Collection || {};


/* **************** *
         ROUTER
 * **************** */
 U.Router.Router = Backbone.Router.extend({
    routes : {
        "search/:query" : "search",
        "component/:id" : "displayComponent"
    },

    initialize: function() {
        
        this.results = new U.Collection.ComponentSearchResult();
        this.searchView = new U.View.SearchResult({model:this.results});
        
        this.mainView = new U.View.ComponentMain();

        var self=this;
        $("#search").on("click", function(event) {
            var searchVal = $("#urb-search-query").val();
            self.navigate("search/"+searchVal, {trigger: true});
        });
    },

    search: function(query){  
        $("#main").hide();
        $("#searchResults").show();
        this.searchView.render();
        this.results.search(query);
    },

    displayComponent: function(componentId) {
        $("#main").show();
        $("#searchResults").hide();
        this.mainView.render();
    }
 });

U.Util.TemplateLoader.load(
    ["SearchResultItem", "SearchResult", "ComponentMain"],
    function() {
        app = new U.Router.Router();
        Backbone.history.start();
    });

$('#selected-component').popover("hide");
