/**
 * Created by Farkas on 2015.09.01..
 */
'use strict';
controller.models = controller.models || {};

(function () {
    controller.models.JobModel = Backbone.Model.extend({

        defaults: {
            millOffset:0,
            millFile:[],
            millNullPoint:0,
            tmpNullPoint:0,
            fileName:'',
            fileBlob:'',
            allSteps:0,
            stepsDone:0,
            started:false
        }

    });
})();