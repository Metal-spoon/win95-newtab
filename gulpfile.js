/* eslint-disable linebreak-style */
const gulp = require('gulp')
const sass = require('gulp-sass')(require('sass'))
const zip = require('gulp-zip')
const del = require('del')
const manifest = require('./src/manifest.json')

gulp.task('compileStyle', () => {
  return gulp.src('src/scss/style.scss').pipe(sass()).pipe(gulp.dest('src/css'))
})

gulp.task('startWatch', function () {
  gulp.watch('src/scss/**/*.scss', gulp.series('compileStyle'))
})

gulp.task('clean', () => {
  return del('dist/**', { force: true })
})

gulp.task('compileStyleDist', (done) => {
  gulp
    .src('src/scss/style.scss')
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(gulp.dest('dist/css'))
    .on('end', done)
})

gulp.task('copyAssets', (done) => {
  gulp.src(['src/assets/**/*']).pipe(gulp.dest('dist/assets')).on('end', done)
})

gulp.task('copyHtml', (done) => {
  gulp.src(['src/**/*.html']).pipe(gulp.dest('dist')).on('end', done)
})

gulp.task('copyManifest', (done) => {
  gulp.src(['src/manifest.json']).pipe(gulp.dest('dist')).on('end', done)
})

gulp.task('copyAndMinJS', (done) => {
  gulp.src(['src/**/*.js']).pipe(gulp.dest('dist')).on('end', done)
})

gulp.task('createArchive', (done) => {
  const version = manifest.version
  const timestamp = new Date().toISOString()
  console.log(version)
  console.log(timestamp)

  gulp
    .src('dist/**')
    .pipe(zip('95newtab-rel-' + version + ' ' + timestamp + '.zip'))
    .pipe(gulp.dest('Release Archive'))
    .on('end', done)
})

gulp.task('prepareLibs', (done) => {
  gulp
    .src('node_modules/jquery/dist/jquery.min.js')
    .pipe(gulp.dest('src/lib/js'))
  gulp
    .src('node_modules/bootstrap/dist/js/bootstrap.min.js')
    .pipe(gulp.dest('src/lib/js'))
    .on('end', done)
})

gulp.task(
  'prepareRelease',
  gulp.series(
    'clean',
    'compileStyleDist',
    'copyAssets',
    'copyHtml',
    'copyManifest',
    'copyAndMinJS',
    'createArchive'
  )
)
