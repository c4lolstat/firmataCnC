/**
 * Created by Farkas on 2015.08.03..
 */

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        //handlebars: {
        //    options: {
        //        namespace: 'Handlebars.templates'
        //    },
        //    all: {
        //        files: {
        //            "web/compiled/doom.tpl.js": "web/templates/doom.handlebars",
        //            "web/compiled/input.tpl.js": "web/templates/input.handlebars",
        //            "web/compiled/error.tpl.js": "web/templates/error.handlebars",
        //            "web/compiled/header.tpl.js": "web/templates/header.handlebars",
        //            "web/compiled/popup.tpl.js": "web/templates/popup.handlebars"
        //        }
        //    }
        //},
        bowercopy: {
            options:{
                runBower:true,
                srcPrefix: 'bower_components'
            },
            resources: {
                options: {
                    destPrefix: 'resources'
                },
                files: {
                    'backbone.js': 'backbone/backbone.js',
                    'handlebars.js': 'handlebars/handlebars.js',
                    'jquery.js': 'jquery/jquery.js',
                    'underscore.js': 'underscore/underscore.js',
                    'backbone.marionette.js':'marionette/lib/core/backbone.marionette.js'

                }
            },
            tests: {
                options: {
                    destPrefix: 'web/test/jasmine'
                },
                files: {
                    'jasmine.css':'jasmine/lib/jasmine-core/jasmine.css',
                    'jasmine.js':'jasmine/lib/jasmine-core/jasmine.js',
                    'jasmine-html.js':'jasmine/lib/jasmine-core/jasmine-html.js',
                    'boot.js':'jasmine/lib/jasmine-core/boot.js'
                }
            }
        },
        //jsdoc : {
        //    dist : {
        //        src: ['web/helpers/*.js','web/models/*.js','web/views/*.js','server.js'],
        //        options: {
        //            destination: 'doc',
        //            template : "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template",
        //            configure : "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template/jsdoc.conf.json"
        //        }
        //    }
        //}
    });

    //grunt.loadNpmTasks('grunt-contrib-handlebars');
    grunt.loadNpmTasks('grunt-bowercopy');
    //grunt.loadNpmTasks('grunt-jsdoc');

    //grunt.registerTask('precompile', ['handlebars']);
    grunt.registerTask('update', ['bowercopy']);
    //grunt.registerTask('documentation', ['jsdoc']);
};