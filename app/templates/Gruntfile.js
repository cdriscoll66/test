module.exports = function (grunt) {
  'use strict';

  require('time-grunt')(grunt);

  require('jit-grunt')(grunt,  {
    includereplace: 'grunt-include-replace',
    useminPrepare: 'grunt-usemin',
    validation: 'grunt-html-validation',
    replace: 'grunt-text-replace'
  });

  // Project configuration.
  grunt.option('force', true);

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    // Configs
    xh: {
      src: 'src',
      dist: 'dist',
      tmp: '.tmp',
      build: ['head.html', 'scripts.html'],
      root: __dirname,
      includes: '<%%= xh.src %>/includes',
      designs: 'designs',
      assets: '{img,media,fonts,<%%= xh.designs %>}'
    },

    useminPrepare: {
      html: {
        src: '<%%= xh.build %>',
        cwd: '<%%= xh.includes %>',
        expand: true
      },

      htmlmin: {
        src: '<%%= xh.build %>',
        cwd: '<%%= xh.includes %>',
        expand: true
      },

      options: {
        dest: '<%%= xh.dist %>',
        root: '<%%= xh.src %>',
        flow: {
          steps: {'js': ['concat'], 'css': ['concat'] },
          post: {},
          htmlmin: {
            steps: {'js': ['concat', 'uglifyjs'], 'css': ['concat'] },
            post: {}
          }
        }
      }
    },

    usemin: {
      html: {
        src: '<%%= xh.build %>',
        cwd: '<%%= xh.includes %>',
        expand: true
      },

      options: {
        assetsDirs: ['<%%= xh.includes %>/']
      }
    },

    clean: {
      tmp: { src: ['<%%= xh.tmp %>'] },
      dist: { src: ['<%%= xh.dist %>/*.html', '<%%= xh.dist %>/css', '<%%= xh.dist %>/js', '<%%= xh.dist %>/fonts'] }
    },

    // HTML Includes
    includereplace: {
      dist: {
        options: {
          globals: {<% if (reloader !== 'None' && !server) { %>
            reloader: '<script>//<![CDATA[\ndocument.write(\"<script async src=\'//HOST:<% if (reloader === 'BrowserSync') { %>3000/browser-sync-client.js<% } else if (reloader === 'LiveReload') { %>35729/livereload.js?snipver=1<% } %>\'><\\\/script>\".replace(/HOST/g, location.hostname));\n//]]></script>'<% } %>
          },
          includesDir: '<%%= xh.includes %>'
        },
        files: [{
          expand: true,
          cwd: '<%%= xh.src %>',
          src: ['*.html', '!template.html'],
          dest: '<%%= xh.dist %>',
          ext: '.html'
        }]
      }
    },

    jsbeautifier: {
      options : {
        html: {
          indentSize: 2
        },
        js: {
          indentSize: 2
        }
      },

      html: {
        src: '<%%= xh.dist %>/*.html'
      },

      js: {
        src: '<%%= xh.dist %>/js/main.js'
      }
    },

    validation: {
      src: ['<%%= xh.dist %>/*.html'],
      options: {
        reset: true,
        relaxerror: [
          'Bad value X-UA-Compatible for attribute http-equiv on element meta.',
          'The frameborder attribute on the iframe element is obsolete. Use CSS instead.'
        ]
      }
    },

    // CSS
    <% if (cssPreprocessor === 'SCSS') { %>sass: {
      dist: {
        options: {
          style: 'expanded',
          loadPath: '<%%= xh.src %>/bower_components/'
        },
        files: {
          '<%%= xh.dist %>/css/main.css': '<%%= xh.src %>/scss/main.scss'
        }
      }
    },<% } %><% if (cssPreprocessor === 'LESS') { %>
    less: {
      dist: {
        options: {
          path: '<%%= xh.src %>/bower_components/'
        },
        files: {
          '<%%= xh.dist %>/css/main.css': '<%%= xh.src %>/less/main.less'
        }
      }
    },<% } %><% if (cssPreprocessor === 'LIBSASS') { %>
    sass: {
      dist: {
        options: {
          outputStyle: 'expanded',
          imagePath: '../img',
          includePaths: [
            '<%%= xh.src %>/bower_components'
          ],
          // for some reason sourceMaps will have correct path only when
          // absolute source map path is used
          sourceMap: '<%%= xh.root %>/<%%= xh.dist %>/css/main.css.map'
        },
        files: {
          '<%%= xh.dist %>/css/main.css': '<%%= xh.src %>/scss/main.scss'
        }
      }
    },<% } %>

    autoprefixer: {
      main: {
        src: '<%%= xh.dist %>/css/main.css',
        dest: '<%%= xh.dist %>/css/main.css'
      }
    },

    remfallback: {
      options: {
        mediaQuery: true
      },
      main: {
        files: {
          '<%%= xh.dist %>/css/main.css': ['<%%= xh.dist %>/css/main.css']
        }
      },
    },

    cssbeautifier: {
      files: ['<%%= xh.dist %>/css/*.css', '!<%%= xh.dist %>/css/libraries.min.css'],
      options : {
        indent: '  '
      }
    },

    // JS
    copy: {
      normalize: {
        src: '<%%= xh.src %>/bower_components/normalize.css/normalize.css',<% if (cssPreprocessor === 'SCSS' || cssPreprocessor === 'LIBSASS') { %>
        dest: '<%%= xh.src %>/bower_components/normalize.css/normalize.scss'<% } %><% if (cssPreprocessor === 'LESS') { %>
        dest: '<%%= xh.src %>/bower_components/normalize.css/normalize.less'<% } %>
      },

      jquery: {
        expand: true,
        cwd: '<%%= xh.src %>/bower_components/jquery/dist/',
        src: ['jquery.min.js', 'jquery.min.map'],
        dest: '<%%= xh.dist %>/js/'
      },

      assets: {
        files: [
          {
            expand: true,
            cwd: '<%%= xh.src %>',
            src: ['<%%= xh.assets %>/**/*.*', '!**/do_not_delete_me.png'],
            dest: '<%%= xh.dist %>'
          }
        ]
      },

      js: {
        expand: true,
        cwd: '<%%= xh.src %>/js/',
        src: ['main.js'<% if (useCSS3Pie) { %>, 'PIE.htc'<% } %>],
        dest: '<%%= xh.dist %>/js/'
      },<% if (isWP) { %>

      wp: {
        expand: true,
        cwd: '<%%= xh.dist %>/',
        src: ['**', '!**/<%%= xh.designs %>/**', '!*.html'],
        dest: '<%= wpThemeFolder  %>'
      },<% } %>

      // Backup include files
      backup: {
        expand: true,
        cwd: '<%%= xh.includes %>',
        src: '<%%= xh.build %>',
        dest: '<%%= xh.tmp %>'
      },

      // Restore include files
      restore: {
        expand: true,
        cwd: '<%%= xh.tmp %>',
        src: '<%%= xh.build %>',
        dest: '<%%= xh.includes %>/'
      }
    },

    uglify: {
      options: {
        preserveComments: 'some'
      }
    },

    jshint: {
      options: {
        jshintrc: true,
        force: true
      },
      dist: {
        src: ['<%%= xh.src %>/js/main.js']
      }
    },

    // Replacements in main.css and main.js
    replace: {
      css: {
        src: ['<%%= xh.dist %>/css/main.css'],
        overwrite: true,
        replacements: [{
          from: '@@timestamp',
          to: '<%%= grunt.template.today() %>'
        },
        // Table of contents in main.css
        {
          from: '@@toc',
          to: function () {
            var tmp = grunt.config.get('xh.tmp');

            if (!grunt.file.exists(tmp + '/csstoc.json')) {
              return '';
            }

            var toc_file = grunt.file.readJSON(tmp + '/csstoc.json');
            var files = toc_file.results;
            var toc = '';
            var i = 1;
            var match;

            function capitalize(s) {
              return s[0].toUpperCase() + s.slice(1);
            }

            for (var key in files) {
              if (files.hasOwnProperty(key)) {

                var results = files[key];

                for (var key in results) {
                  if (results.hasOwnProperty(key)) {

                    match = results[key]['match'];
                    match = match.replace(/"|'|@import|;|.scss|.less/gi, "").trim();
                    match = match.split('/').pop();
                    match = capitalize(match);

                    if (['Variables', 'Mixins', 'Placeholders'].indexOf(match) === -1) {
                      toc += '\n    ' + i + '. ' + match;
                      i++;
                    }
                  }
                }
              }
            }
            return toc;
          }
        },
        // Add empty line after section & subsection comment
        {
          from: /=== \*\//g,
          to: '=== */\n'
        },
        // Add empty line after rule if it doesn't have one already
        {
          from: /}(?!\n\n)/gi,
          to: '}\n'
        }]
      },

      js: {
        src: ['<%%= xh.dist %>/js/main.js'],
        overwrite: true,
        replacements: [{
          from: '@@timestamp',
          to: '<%%= grunt.template.today() %>'
        }]
      }<% if (reloader !== 'None' && !server) { %>,

      reloader: {
        src: ['<%%= xh.includes %>/scripts.html'],
        overwrite: true,
        replacements: [{
          from: '@@reloader\n',
          to: ''
        }]
      }<% } %>
    },

    // Create list of @imports
    search: {
      imports: {
        files: {<% if (cssPreprocessor === 'SCSS' || cssPreprocessor === 'LIBSASS') { %>
          src: ['<%%= xh.src %>/scss/main.scss']<% } %><% if (cssPreprocessor === 'LESS') { %>
          src: ['<%%= xh.src %>/less/main.less']<% } %>
        },
        options: {
          searchString: /@import[ \("']*([^;]+)[;\)"']*/g,
          logFormat: 'json',
          logFile: '<%%= xh.tmp %>/csstoc.json'
        }
      }
    }<% if (reloader === 'BrowserSync') { %>,

    browserSync: {
      src: {
        bsFiles: {
          src: [
            '<%%= xh.dist %>/css/*.css',
            '<%%= xh.dist %>/js/*.js',
            '<%%= xh.dist %>/<%%= xh.assets %>/**/*.*',
            '<%%= xh.dist %>/**/*.html'
          ]
        },

        options: {
          watchTask: true,<% if (server) { %>
          server: {
            baseDir: './',
            port: 3000
          },<% } %>
          notify: false
        }
      }
    }<% } else if (reloader === 'LiveReload' && server) { %>,

    connect: {
      server: {
        options: {
          base: './',
          open: true,
          livereload: 35729,
          hostname: 'localhost',
          port: 3000
        }
      }
    }<% } %>,

    // Watch
    watch: {
      options: {
        spawn: false<% if (reloader === 'BrowserSync') { %>,
        interrupt: true<% } %>
      },

      compileCSS: {
        files: [<% if (cssPreprocessor === 'SCSS' || cssPreprocessor === 'LIBSASS') { %>'<%%= xh.src %>/scss/**/*.scss'<% } %><% if (cssPreprocessor === 'LESS') { %>'<%%= xh.src %>/less/**/*.less'<% } %>],
        tasks: ['build-css'<% if (isWP) { %>, 'copy:wp'<% } %>]
      }<% if (reloader === 'LiveReload') { %>,

      css: {
        files: ['<%%= xh.dist %>/css/*.css'],
        options: {
          livereload: true
        }
      }<% } %>,

      html: {
        files: ['<%%= xh.src %>/*.html', '<%%= xh.includes %>/*.html'],
        tasks: ['build-html']<% if (reloader === 'LiveReload') { %>,
        options: {
          livereload: true
        }<% } %>
      },

      js: {
        files: ['<%%= xh.src %>/js/*.js'],
        tasks: ['build-js'<% if (isWP) { %>, 'copy:wp'<% } %>]<% if (reloader === 'LiveReload') { %>,
        options: {
          livereload: true
        }<% } %>
      },

      assets: {
        files: ['<%%= xh.src %>/<%%= xh.assets %>/**/*'],
        tasks: ['build-assets'<% if (isWP) { %>, 'copy:wp'<% } %>]<% if (reloader === 'LiveReload') { %>,
        options: {
          livereload: true
        }<% } %>
      }
    }

  });

  /**
   * Just helper tasks, won't really work on it's own
   */
  grunt.registerTask('_before-build-html', [
    'copy:backup'
  ]);

  grunt.registerTask('_after-build-html', [
    'includereplace',
    'copy:restore',
    'jsbeautifier:html',
    'clean:tmp'
  ]);

  grunt.registerTask('build-html', [
    '_before-build-html',
    'useminPrepare:html',
    'concat:generated',
    'usemin',
    '_after-build-html'
  ]);

  grunt.registerTask('build-htmlmin', [
    '_before-build-html',
    'useminPrepare:htmlmin',
    'concat:generated',
    'uglify:generated',
    'usemin',
    '_after-build-html'
  ]);

  grunt.registerTask('build-assets', [
    'copy:assets'
  ]);

  grunt.registerTask('build-css', [<% if (cssPreprocessor === 'SCSS' || cssPreprocessor === 'LIBSASS') { %>
    'sass',<% } %><% if (cssPreprocessor === 'LESS') { %>
    'less',<% } %>
    'autoprefixer',
    'remfallback',
    'cssbeautifier',
    'search',
    'replace:css',
    'clean:tmp'
  ]);

  grunt.registerTask('build-js', [
    'copy:js',
    'jsbeautifier:js',
    'replace:js',
    'jshint'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'postinstall',

    'build-htmlmin',
    'build-assets',
    'build-css',
    'build-js',<% if (isWP) { %>

    'copy:wp',<% } %>
  ]);

  grunt.registerTask('validate', [
    'validation'
  ]);

  grunt.registerTask('qa', [<% if (reloader !== 'None' && !server) { %>
    'replace:reloader',<% } %>
    'build',
    'validate',
    'jshint'
  ]);

  grunt.registerTask('postinstall', [<% if (!useBootstrap) { %>
    'copy:normalize',<% } %>
    'copy:jquery'
  ]);

  grunt.registerTask('default', [
    'postinstall'<% if (reloader === 'BrowserSync') { %>,
    'browserSync'<% } else if (reloader === 'LiveReload' && server) { %>,
    'connect:server'<% } %>,
    'watch'
  ]);
};
