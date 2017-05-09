/**
 * Created by Farkas on 2015.09.03..
 */
'use strict';
controller.views = controller.views || {};

(function () {
    controller.views.OpenFileView = Marionette.ItemView.extend({

        events:{
            'change input':'updateModel'
        },

        initialize: function(){
            this.model.on('change', this.render, this);
        },

        updateModel:function(){
            var fileBlob =$('#fileInput')[0].files[0];
            this.model.set('fileName',fileBlob.name);
            this.model.set('fileBlob',fileBlob,'silent');
        }
    });
})();