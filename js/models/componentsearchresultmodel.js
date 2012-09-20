var U =  U || {};

U.Model = U.Model || {};
U.Collection = U.Collection || {};

/* **************** *
         MODEL
 * **************** */
U.Model.Component = Backbone.Model.extend({
    defaults: {
        id:'',
        name:'',
        filename:'',
        sha1:'',
        type:''
    },
    initialize: function(){
    }
});

/* **************** *
      COLLECTION
 * **************** */
U.Collection.ComponentSearchResult = Backbone.Collection.extend({
    model : U.Model.Component, 

    search: function(query) {
        console.log("search: " + query);
        this.reset();
        this.add({
            id:1,
            name: query,
            filename: "component-1.0.0.ear",
            sha1: "954c31d4ce11bd8df6604ca503423e659e6ba534",
            type: "EAR"
        });
    } 
});
