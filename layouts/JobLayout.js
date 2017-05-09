/**
 * Created by Farkas on 2015.08.05..
 */
'use strict';

controller.layouts = controller.layouts || {};

(function(){
    controller.layouts.JobLayout = Marionette.LayoutView.extend({
        regions:{
            thickness:'#thickness',
            offset:'#offset',
            file:'#file',
            nullpoint:'#nullpoint',
            start:'#start'
        }
    });
})();