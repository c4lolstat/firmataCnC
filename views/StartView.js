/**
 * Created by Farkas on 2015.09.06..
 */
'use strict';
controller.views = controller.views || {};

(function () {
    controller.views.StartView = Marionette.ItemView.extend({

        events: {
            'click #startButton': 'startJob',
            'click #resetButton':'reset'
        },

        'modelEvents': {
            'change': 'render'
        },

        startJob: function () {
            this.setOffset();
            this.setNullPoint();
            this.openFile();
        },

        openFile: function () {
            var fileReader = new FileReader();
            var self = this;

            fileReader.onload = function(event) {
                    self.model.set('millFile', fileReader.result);

                var endPoint= window.location.origin+"/startmill";
                $.ajax({
                    url : endPoint,
                    type: "POST",
                    data: JSON.stringify(self.model.toJSON()),
                    contentType: "application/json; charset=utf-8",
                    dataType   : "json",
                    success    : function(){
                        console.log("Pure jQuery Pure JS object");
                    }
                });
            };
            fileReader.onerror = function(e) {
                onerror(e.target.error.name);
            };
            console.log(this.model.get('fileBlob'));
            fileReader.readAsText(this.model.get('fileBlob'));

        },

        setOffset: function () {
            var offset = $('select option:selected').val();
                this.model.set('millOffset', offset);
        },

        setNullPoint:function(){
                this.model.set('millNullPoint', this.model.get('tmpNullPoint'));
        },

        reset:function(){
            controller.socket.emit('reset');
        }

    });
})();