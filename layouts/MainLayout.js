/**
 * Created by Farkas on 2015.08.05..
 */
'use strict';

controller.layouts = controller.layouts || {};

(function(){
    controller.layouts.MainLayout = Marionette.LayoutView.extend({
        regions:{
            connection:'#connection',
            setup:'#setup',
            drill:'#drill',
            mill:'#mill',
            finish:'#finish'
        }
    });
})();