module.exports = function(grunt){

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    //Configuration
    watch: {
      options: {livereload:true},
      js: {
        files: ['js/**/*.js'],
        },
      html: {
        files: ['*.html','views/**/*.html','*.js','views/**/*.js'],
      },
      css: {
        files: ['css/*.css'],
      }
    },

    jshint: {
      all: ['Gruntfile.js', 'js/**/*.js']
    },

    connect: {
      server: {
        options: {
          port: 9001,
          protocol: "http",
          hostname: "localhost",
          base: '.',
          directory: null,
          open: "http://localhost:9001/index.html",
          livereload: true,
          keepalive: true,
          }
        }
    },

    concurrent: {
  		server: {
  			tasks: ['connect', 'watch'],
  			options: {
  				logConcurrentOutput: true
  			}
  		}
  	},

    copy: {
      bootstrap_fonts: {
        files: [
          // includes files within path
          {expand: true, flatten: true, src: ['bower_components/bootstrap/fonts/*'], dest: 'dist/fonts/', filter: 'isFile'},
        ],
      },
    },

    ngAnnotate: {
        options: {
            singleQuotes: true
        },
        app: {
            files: {
                'src/js/designtool.js' : ['js/designtool.js'],
                'src/js/mainServices.js' : ['js/services/mainServices.js'],
                'src/js/mainDirectives.js' : ['js/directives/mainDirectives.js'],
                'src/js/courseCtrl.js' : ['views/course/courseCtrl.js'],
                'src/js/courseSvc.js' : ['views/course/courseSvc.js'],
                'src/js/navCtrl.js' : ['views/navigation/navCtrl.js'],
                'src/js/navSvc.js' : ['views/navigation/navSvc.js'],
                'src/js/pagesCtrl.js' : ['views/pages/pagesCtrl.js'],
                'src/js/pagesSvc.js' : ['views/pages/pagesSvc.js'],
                'src/js/imgCtrl.js' : ['views/images/imgCtrl.js'],
                'src/js/imgSvc.js' : ['views/images/imgSvc.js'],
                'src/js/cssCtrl.js' : ['views/css/cssCtrl.js'],
                'src/js/cssSvc.js' : ['views/css/cssSvc.js'],
                'src/js/headersCtrl.js' : ['views/headers/headersCtrl.js'],
                'src/js/headersSvc.js' : ['views/headers/headersSvc.js'],
            }
        }
    },

    uglify: {
      vendor: {
        files: {
          'dist/js/vendor.js': [
            'bower_components/jquery/dist/jquery.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-ui-router/release/angular-ui-router.js',
            'bower_components/bootstrap/dist/js/bootstrap.js',
            'bower_components/jquery-ui/jquery-ui.js',
            'bower_components/sweetalert/dist/sweetalert.min.js',
            'bower_components/Blob.js/Blob.js',
            'bower_components/canvas-toBlob.js/canvas-toBlob.js',
            'bower_components/FileSaver.js/FileSaver.js',
            'bower_components/jszip/dist/jszip.js',
            'bower_components/jquery-zclip/jquery.zclip.js',
            'bower_components/handlebars/handlebars.js',
            'bower_components/Croppie/croppie.js',
            'bower_components/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.js',
            'bower_components/color-thief/dist/color-thief.min.js',
            'bower_components/angularjs-slider/dist/rzslider.js',
            'js/php.js'
          ],
        }
      },
      scripts: {
        files: {
          'dist/js/scripts.js': [
            'src/js/designtool.js',
            'src/js/mainServices.js',
            'src/js/mainDirectives.js',
            'src/js/courseCtrl.js',
            'src/js/courseSvc.js',
            'src/js/navCtrl.js',
            'src/js/navSvc.js',
            'src/js/pagesCtrl.js',
            'src/js/pagesSvc.js',
            'src/js/imgCtrl.js',
            'src/js/imgSvc.js',
            'src/js/cssCtrl.js',
            'src/js/cssSvc.js',
            'src/js/headersCtrl.js',
            'src/js/headersSvc.js'
          ]
        }
      }
    },

    cssmin: {
      vendor: {
        files: {
          'dist/css/vendor.css': [
            'bower_components/bootstrap/dist/css/bootstrap.css',
            'bower_components/sweetalert/dist/sweetalert.css',
            'bower_components/Croppie/croppie.css',
            'bower_components/angular-bootstrap-colorpicker/css/colorpicker.css',
            'bower_components/angularjs-slider/dist/rzslider.css',
            'bower_components/jquery-ui/themes/base/core.css',
            'bower_components/jquery-ui/themes/base/resizable.css',
            'bower_components/jquery-ui/themes/base/theme.css'
          ]
        }
      },
      style: {
        files: {
          'dist/css/style.css': ['css/designtool.css']
        }
      }
    }

});

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-ng-annotate');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Custom Task Commands
  grunt.registerTask('serve',['concurrent']);
  grunt.registerTask('build',['ngAnnotate', 'uglify', 'cssmin']);
  grunt.registerTask('default',['concurrent']);
};
