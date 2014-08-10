module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jade: {
      compile: {
        options: {
          data: {
            debug: false
          }
        },
        files: {
          "public/index.html": ["views/index.jade"],
          "public/server.html": ["views/server.jade"]
        }
      }
    },
    cssmin: {
      combine: {
        files: {
          'public/css/styles.min.css': ['views/css/cover.css', 'views/css/fileTree.css']
        }
      }
    },
    uglify: {
      options: {
        mangle: false,
        compress: {
          drop_console: true
        },
        beautify: {
          width: 80,
          beautify: true
        },
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
          '<%= grunt.template.today("yyyy-mm-dd") %> */'
      },
      my_target: {
        files: {
          'public/js/script.min.js': ['views/js/scripts.js'],
          'public/js/server.min.js': ['views/js/server.js']
        }
      }
    },
    watch: {
      js: {
        files: 'views/js/*',
        tasks: ['uglify']
      },
      css: {
        files: 'views/css/*',
        tasks: ['cssmin']
      },
      jade: {
        files: ['views/*.jade', 'views/jade/*'],
        tasks: ['jade']
      },
    },
  });

  grunt.event.on('watch', function(action, filepath, target) {
    grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
  });

  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');

  grunt.registerTask('compile', ['jade', 'cssmin', 'uglify']);

};