/**
 * Created by Farkas on 2015.09.04..
 */
'use strict';
controller.views = controller.views || {};

(function () {
    controller.views.NullPointView = Marionette.ItemView.extend({
        events: {
            'click #moveUp': 'moveUp',
            'click #moveDown': 'moveDown',
            'click #moveUpTen': 'moveUpTen',
            'click #moveDownTen': 'moveDownTen'
        },

        'modelEvents': {
            'change': 'render'
        },

        moveDown:function(){
            controller.socket.emit('moveDown');
        },
        moveUp:function(){
            controller.socket.emit('moveUp');
        },
        moveDownTen:function(){
            controller.socket.emit('moveDownTen');
        },
        moveUpTen:function(){
            controller.socket.emit('moveUpTen');
        }
    });
})();