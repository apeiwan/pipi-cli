#!/usr/bin/env node
require('shelljs/global');
let gulp = require('gulp');
let path = require('path');
let urlPrefixer = require('./gulp-url-prefixer');
let postcss = require('gulp-postcss');
let postcssConfig = require('./postcssConfig');
let minimist = require('minimist');
let fileInline = require('gulp-file-inline');
let shell = require('shelljs');
let htmlclean = require('gulp-htmlclean');
let uglify = require('gulp-uglify');

/**
 * 获取打包参数
 */
let options = minimist(process.argv.slice(2));
let build = options.build || 'build';
let publicPath = options.publicPath || '';
let cdn = options.cdn;

/**
 * 目录配置
 */
let dirs = {
  source: {
    root: './src',
    css: './src/**/*.css',
    images: './src/**/*.{png,gif,jpg,ico,jpeg,svg,svga}',
    html: './src/**/*.html',
    scripts: './src/**/*.js',
  }
};

/**
 * 插件配置
 */
let pluginsConfig = {
  urlPrefixer: {
    prefix: cdn
  }
};


gulp.task('misc', function () {
  return gulp.src('./src/**/*', { base: './src' })
    .pipe(gulp.dest(build));
});

gulp.task('css', function () {
  return gulp.src(dirs.source.css, { base: './src' })
    .pipe(urlPrefixer.css(pluginsConfig.urlPrefixer))
    .pipe(postcss(postcssConfig))
    .pipe(gulp.dest(build));
});

gulp.task('images', function () {
  return gulp.src(dirs.source.images, { base: './src' })
    .pipe(gulp.dest(build));
});

gulp.task('scripts', function () {
  return gulp.src(dirs.source.scripts, { base: './src' })
    .pipe(uglify())
    .pipe(gulp.dest(build));
});

gulp.task('html', function () {
  const ext2CDN = function (pathname) {
    const extname = path.extname(pathname);
    if (extname.indexOf('.html') === -1) {
      return cdn;
    } else if (extname.indexOf('.html') !== -1) {
      return publicPath;
    }
    return '';
  };
  return gulp.src(dirs.source.html, { base: './src' })
    .pipe(fileInline({
      js: {
        filter: function (tag) {
          return tag.indexOf('data-inline') > 0;
        }
      },
      css: {
        filter: function (tag) {
          return tag.indexOf('data-inline') > 0;
        }
      },
    }))
    .pipe(htmlclean())
    .pipe(urlPrefixer.html({
      prefix: ext2CDN
    }))
    .pipe(gulp.dest(build));
});

gulp.task('clean', function (done) {
  shell.rm('-rf', build);
  done();
});

gulp.task('released', gulp.series(['clean'],['misc'], ['images'], ['css'], ['scripts'], ['html']));

gulp.task('default', gulp.series(['released']));
