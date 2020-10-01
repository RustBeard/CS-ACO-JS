'use strict'

// Load plugins
const autoprefixer = require('autoprefixer')
const browsersync = require('browser-sync').create()
const cssnano = require('cssnano')
const del = require('del')
// const eslint = require('gulp-eslint')
const gulp = require('gulp')
const imagemin = require('gulp-imagemin')
const newer = require('gulp-newer')
const plumber = require('gulp-plumber')
const postcss = require('gulp-postcss')
const rename = require('gulp-rename')
const sass = require('gulp-sass')
const sourcemaps = require('gulp-sourcemaps')
const gcmq = require('gulp-group-css-media-queries')
const babel = require('gulp-babel')
const jsuglify = require('gulp-uglify')
// const webpack = require('webpack')
// const webpackconfig = require('./webpack.config.js')
// const webpackstream = require('webpack-stream')
// const spawn = require('cross-spawn')

// BrowserSync
function browserSync (done) {
  browsersync.init({
    // server: {
    //   baseDir: "./"
    // },
    proxy: 'http://csaco.local/',
    port: 8080
  })
  done()
}

// BrowserSync Reload
function browserSyncReload (done) {
  browsersync.reload()
  done()
}

// Clean assets
function clean () {
  return del(['./images'])
}

// Optimize Images
function images () {
  return gulp
    .src('./src/img/**/*')
    .pipe(newer('./images'))
    .pipe(
      imagemin([
        imagemin.gifsicle({
          interlaced: true
        }),
        imagemin.mozjpeg({
          progressive: true
        }),
        imagemin.optipng({
          optimizationLevel: 5
        }),
        imagemin.svgo({
          plugins: [{
            removeViewBox: false,
            collapseGroups: true
          }]
        })
      ])
    )
    .pipe(gulp.dest('./images'))
}

// SCSS task
function scss () {
  return gulp
    .src('./src/scss/**/*.scss')
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err)
        this.emit('end')
      }
    }))
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'expanded'
    }))
    .pipe(postcss([autoprefixer()]))
    .pipe(gcmq())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./css/'))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(postcss([cssnano()]))
    .pipe(gulp.dest('./css/'))
    .pipe(browsersync.stream())
}

// CSS task
function css () {
  return gulp
    .src('./src/css/**/*.css')
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err)
        this.emit('end')
      }
    }))
    .pipe(gulp.dest('./css/'))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(gulp.dest('./css/'))
    .pipe(browsersync.stream())
}

// Temporary JS task
function js () {
  return gulp
    .src('./src/js/**/*.js')
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err)
        this.emit('end')
      }
    }))
    .pipe(babel({
      presets: ['@babel/env'],
      ignore: ['./src/js/vendor/**/*.js']
    }))
    .pipe(gulp.dest('./js/'))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(jsuglify())
    .pipe(gulp.dest('./js/'))
    .pipe(browsersync.stream())
}

// Lint scripts
// function scriptsLint () {
//   return gulp
//     .src(['./src/js/**/*', './gulpfile.js'])
//     .pipe(plumber())
//     .pipe(eslint())
//     .pipe(eslint.format())
//     .pipe(eslint.failAfterError())
// }

// Transpile, concatenate and minify scripts
// function scripts () {
//   return (
//     gulp
//       .src(['./src/js/**/*'])
//       .pipe(plumber())
//       // .pipe(webpackstream(webpackconfig, webpack))
//       .pipe(webpackstream(webpack))
//       // folder only, filename is specified in webpack config
//       .pipe(gulp.dest('./dist/js/'))
//       .pipe(browsersync.stream())
//   )
// }

// Jekyll
// function jekyll () {
//   return spawn('bundle', ['exec', 'jekyll', 'build'], {
//     stdio: 'inherit'
//   })
// }

// Watch files
function watchFiles () {
  gulp.watch('./src/scss/**/*', scss)
  gulp.watch('./src/css/**/*', css)
  gulp.watch('./src/js/**/*', js)
  gulp.watch([
    './src/scss/**/*',
    './src/css/**/*',
    './src/js/**/*',
    './**/*.html',
    './**/*.php'
  ], browserSyncReload)
  // gulp.watch('./src/js/**/*', gulp.series(scriptsLint, scripts))
  // gulp.watch('./src/js/**/*', gulp.series(scripts))
  // gulp.watch(
  //   [
  //     // "./_layouts/**/*",
  //     // "./_pages/**/*",
  //     // "./_posts/**/*",
  //     './_projects/**/*'
  //   ],
    // gulp.series(jekyll, browserSyncReload)
  // )
  gulp.watch('./src/img/**/*', images)
}

// define complex tasks
// const js = gulp.series(scriptsLint, scripts)
// const js = gulp.series(scripts)
// const build = gulp.series(clean, gulp.parallel(css, images, jekyll, js))
const build = gulp.series(clean, gulp.parallel(scss, css, images, js))
const watch = gulp.parallel(watchFiles, browserSync)

// export tasks
exports.images = images
exports.scss = scss
exports.css = css
// exports.js = js
// exports.jekyll = jekyll
exports.clean = clean
exports.build = build
exports.watch = watch
exports.default = build
