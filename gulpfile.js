const { src, dest, parallel, watch, series } = require('gulp')

const minifyCSS = require('gulp-csso'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify-es').default,
  rename = require('gulp-rename'),
  del = require('del'),

  jsFilePaths = 
  ['assets/js/controllers/*/*/*.js', 'assets/js/controllers/*/*.js', 'assets/js/controllers/*.js', 
  'assets/js/services/*.js']


function css() {
  return src(['assets/css/*.css', 'assets/css/lib/*.css'])
    .pipe(minifyCSS())
    .pipe(rename({
      suffix: '.min'
      }))
    .pipe(dest('build/css'))
}

function ngScript() {
  return src(jsFilePaths)
    .pipe(concat('ngFiles.min.js'))
    .pipe(uglify())
    .pipe(dest('build/js'))
}

// function ngRoot() {
//   return src('assets/js/script.js')
//     .pipe(uglify())
//     .pipe(rename({
//       suffix: '.min'
//       }))
//     .pipe(dest('build/js'))
// }

// function ngDirectives() {
//   return src('assets/js/directives/*.js')
//     .pipe(uglify())
//     .pipe(rename({
//       suffix: '.min'
//       }))
//     .pipe(dest('build/js/directives/'))
// }

function clean() {
  return del(['build'])
}

function watchfiles() {
  watch(['assets/js/controllers/*/*/*.js', 'assets/js/controllers/*/*.js', 'assets/js/controllers/*.js', 
'assets/js/services/*.js', 'assets/css/*.css', 'assets/css/lib/*.css'], series(clean, css, ngScript))
}

exports.ngScript = ngScript
// exports.ngRoot = ngRoot
exports.css = css
exports.clean = clean
exports.watch = watchfiles
// exports.html = html;
exports.default = series(clean, css, ngScript)