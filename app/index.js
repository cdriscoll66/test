'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var updateNotifier = require('update-notifier');

var XhGenerator = yeoman.generators.Base.extend({
  init: function () {
    this.pkg = require('../package.json');

    this.on('end', function () {
      this.installDependencies({
        skipInstall: this.options['skip-install']
      });
    });
  },

  // notify user about updates
  askForUpdate: function () {
    var done = this.async();

    var notifier = updateNotifier({
      packageName: this.pkg.name,
      packageVersion: this.pkg.version,
      updateCheckInterval: 1000 * 60
    });

    var prompts = [{
      type: 'confirm',
      name: 'updateNotify',
      message: 'Do you want to continue using older version?',
      default: true
    }];

    notifier.notify('Update available');

    if(notifier.update) {
      this.prompt(prompts, function (props) {
        this.updateNotify = props.updateNotify;

        if (!this.updateNotify) {
          copyToClipboard('npm update -g ' + this.pkg.name);
          this.log(chalk.yellow('Update command was copied to your clipboard \n'));
          process.exit();
        }

        done();
      }.bind(this));
    } else {
      done();
    }

    // copying npm update -g generator-xh to clipboard
    // tested on OS X, Linux, possibly working on OpenBSD and Windows.
    var copyToClipboard = function (data) {
      var proc;
      var exec;

      switch (process.platform) {
      case 'darwin':
        proc = require('child_process').spawn('pbcopy');
        break;
      case 'win32':
        proc = require('child_process').spawn('clip');
        exec = require('child_process').exec;
        exec('clip', function(error, stdout, stderr) {});
        break;
      case 'linux':
        proc = require('child_process').spawn('xclip', ['-selection', 'clipboard']);
        break;
      case 'openbsd':
        proc = require('child_process').spawn('xclip', ['-selection', 'clipboard']);
        break;
      default:
        throw 'Tried to copy update command to your clipboard, but you are using unknown platform: ' + process.platform;
      }

      proc.stdin.write(data);
      proc.stdin.end();
    };
  },

  askFor: function () {
    var done = this.async();

    // Welcome user
    this.log('');
    this.log(chalk.cyan(' ***********************************************************') + '\n');
    this.log(chalk.cyan('  Welcome to'), chalk.white.bgRed.bold(' XH ') + '\n');
    this.log(chalk.white('  A Yeoman generator for scaffolding web projects') + '\n');
    this.log(chalk.cyan(' ***********************************************************') + '\n');

    var prompts = [{
        name: 'projectName',
        message: 'Please enter the project name',
        validate: function (input) {
          return !!input;
        }
      }, {
        type: 'confirm',
        name: 'useBranding',
        message: 'Should XHTMLized branding be used?',
        default: true
      }, {
        type: 'list',
        name: 'reloader',
        message: 'Which type of live reloader would you like to use?',
        choices: ['LiveReload', 'BrowserSync', 'None'],
        default: 'BrowserSync'
      }, {
        when: function (response) {
          return response.reloader !== 'None';
        },
        type: 'confirm',
        name: 'server',
        message: 'Do you want to run development server?',
        default: true
      }, {
        type: 'confirm',
        name: 'ignoreDist',
        message: 'Add dist folder to the Git ignore list?',
        default: false
      }, {
        type: 'list',
        name: 'cssPreprocessor',
        message: 'Which CSS preprocessor would you like to use?',
        choices: [{
          name: 'SCSS (LibSass; not fully compatible with Ruby version but much faster)',
          value: 'LIBSASS'
        }, {
          value: 'LESS'
        }, {
          name: 'SCSS (Ruby)',
          value: 'SCSS'
        }],
        default: 'LIBSASS'
      }, {
        type: 'confirm',
        name: 'isWP',
        message: 'Is this WordPress project?',
        default: false
      }, {
        type: 'checkbox',
        name: 'features',
        message: 'Select additional features:',
        choices: [{
          name: 'Bootstrap',
          value: 'useBootstrap',
          checked: false
        }, {
          name: 'Modernizr',
          value: 'useModernizr',
          checked: false
        }, {
          name: 'CSS3 Pie',
          value: 'useCSS3Pie',
          checked: false
        }]
      }
    ];

    this.prompt(prompts, function (props) {
      this.projectName = props.projectName;
      this.useBranding = props.useBranding;
      this.ignoreDist = props.ignoreDist;
      this.cssPreprocessor = props.cssPreprocessor;
      this.isWP = props.isWP;
      this.features = props.features;
      this.reloader = props.reloader;
      this.server = props.server;

      var features = this.features;

      function hasFeature(feat) {
        return features.indexOf(feat) !== -1;
      }

      this.useBootstrap = hasFeature('useBootstrap');
      this.useModernizr = hasFeature('useModernizr');
      this.useCSS3Pie = hasFeature('useCSS3Pie');

      if (this.useBranding) {
        this.projectAuthor = 'XHTMLized';
      } else {
        this.projectAuthor = '';
      }

      // WP
      if (this.isWP) {
        this.wpFolder = 'wp';
        this.wpThemeFolderName = this._.slugify(this.projectName);
        this.wpThemeFolder = this.wpFolder + '/wp-content/themes/' + this.wpThemeFolderName;
      }

      this.props = props;
      this.props.wpFolder = this.wpFolder;
      this.props.wpThemeFolder = this.wpThemeFolder;

      done();

    }.bind(this));
  },

  // Create project structure
  generate: function () {

    // Create config file
    this.config.set('config', this.props);
    this.config.save();

    // Configurations files
    this.copy('bowerrc', '.bowerrc');
    this.copy('editorconfig', '.editorconfig');
    this.copy('gitattributes', '.gitattributes');
    this.copy('jshintrc', '.jshintrc');
    this.template('gitignore', '.gitignore');

    // Application files
    this.template('_package.json', 'package.json');
    this.template('_bower.json', 'bower.json');
    this.template('Gruntfile.js', 'Gruntfile.js');

    // Project index
    this.template('_index.html', 'index.html');

    // Directory structure
    this.mkdir('src');
    this.mkdir('src/includes');
    this.mkdir('src/js');
    this.mkdir('src/fonts');
    this.mkdir('src/img');
    this.mkdir('src/img/common');
    this.mkdir('src/media');
    this.mkdir('src/xprecise');

    this.copy('src/img/do_not_delete_me.png', 'src/fonts/do_not_delete_me.png');
    this.copy('src/img/do_not_delete_me.png', 'src/img/do_not_delete_me.png');
    this.copy('src/img/do_not_delete_me.png', 'src/media/do_not_delete_me.png');
    this.copy('src/img/do_not_delete_me.png', 'src/xprecise/do_not_delete_me.png');

    // HTML
    this.copy('src/_template.html', 'src/template.html');

    this.template('src/includes/_head.html', 'src/includes/head.html');
    this.copy('src/includes/_header.html', 'src/includes/header.html');
    this.copy('src/includes/_sidebar.html', 'src/includes/sidebar.html');
    this.copy('src/includes/_scripts.html', 'src/includes/scripts.html');
    this.copy('src/includes/_footer.html', 'src/includes/footer.html');

    // HTML
    if (this.isWP) {
      this.mkdir(this.wpThemeFolder);
      this.copy('src/_wp.html', 'src/wp.html');
    }

    // SCSS
    if (this.cssPreprocessor === 'SCSS' || this.cssPreprocessor === 'LIBSASS') {
      this.mkdir('src/scss');
      this.template('src/scss/_main.scss', 'src/scss/main.scss');
      this.copy('src/scss/_variables.scss', 'src/scss/_variables.scss');
      this.copy('src/scss/_mixins.scss', 'src/scss/_mixins.scss');
      this.copy('src/scss/_common.scss', 'src/scss/_common.scss');
      if (this.isWP) {
        this.copy('src/scss/_wordpress.scss', 'src/scss/_wordpress.scss');
      }
    }

    // LESS
    if (this.cssPreprocessor === 'LESS') {
      this.mkdir('src/less');
      this.template('src/less/_main.less', 'src/less/main.less');
      this.copy('src/less/_variables.less', 'src/less/variables.less');
      this.copy('src/less/_mixins.less', 'src/less/mixins.less');
      this.copy('src/less/_common.less', 'src/less/common.less');
      if (this.isWP) {
        this.copy('src/less/_wordpress.less', 'src/less/wordpress.less');
      }
    }

    // JS
    this.template('src/js/_main.js', 'src/js/main.js');

    if (this.useCSS3Pie) {
      this.copy('src/js/_PIE.htc', 'src/js/PIE.htc');
    }
  }
});

module.exports = XhGenerator;
