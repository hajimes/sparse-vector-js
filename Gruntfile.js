/* global module */
module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ['coverage'],
    jshint: {
      options: {
        jshintrc: true
      },
      all: ['Gruntfile.js',
        './main.js',
        './benchmark/**/*.js',
        './test/**/*.js']
    },
    shell: {
      istanbul: {
        command: './node_modules/istanbul/lib/cli.js' +
            ' cover ./node_modules/mocha/bin/_mocha --' +
            ' -R spec test/**'
      },
    },
  });

  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-shell');

  // Default tasks
  grunt.registerTask('test', ['jshint', 'shell:istanbul']);
};
