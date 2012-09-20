/*
 * @see https://github.com/ccoenraets/backbone-directory/
 * @author ccoenraets
 */

// The Template Loader. Used to asynchronously load templates located in separate .html files
var U =  U || {};
U.Util =  U.Util || {};
U.View =  U.View || {};


U.Util.TemplateLoader = {

    load: function(views, callback) {

        var deferreds = [];

        $.each(views, function(index, view) {
            if (U.View[view]) {
                deferreds.push($.get('tpl/' + view + '.html', function(data) {
                    U.View[view].prototype.template = _.template(data);
                }, 'html'));
            } else {
                alert(view + " not found");
            }
        });

        $.when.apply(null, deferreds).done(callback);
    }

};