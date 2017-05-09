/**
 * Created by Farkas on 2015.08.05..
 */

var controller = new Marionette.Application({templates:{}});

controller.addRegions({
    header:'#header',
    content:'#content',
    footer:'#footer'
});

controller.eventAgg = _.extend({}, Backbone.Events);

controller.socket = io.connect('http://localhost:8090');

controller.on('start',function(){
    Backbone.history.start();
});

