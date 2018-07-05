// const gulp = require('gulp'); Основной
// const watch = require('gulp-watch'); Смотреть изменения
// const browserSync = require('browser-sync'); LiveLoad
// const reload = browserSync.reload; LiveLoad_Reload
// const cssMin = require('gulp-clean-css'); Css minify
// const autoPrefixer = require('gulp-autoprefixer');
// const csscomb = require('gulp-csscomb'); Сортировщик свойств
// const csscomblint = require('gulp-csscomb-lint');
// const jsMin = require('gulp-uglify'); Js minify
// const imageMin = require('gulp-imagemin'); imgOptimiz
// const pngquant = require('imagemin-pngquant'); imgOptimiz
// const rimraf = require('rimraf'); rm -r
// const fileinclude = require('gulp-file-include'); Сцепление через префикс @@include
// const concat = require('gulp-concat'); сцепление файлов в один
// const importCss = require('gulp-import-css'); Сцепляет все css в один через @import. Работает не только для css
// const sass = require('gulp-sass'); SASS компилятор
// const rigger = require('gulp-rigger'); Соединение через //= file НЕ РАБОТАЕТ В CSS
// const rename = require('gulp-rename'); Переименовать файл


'use strict';

const gulp = require('gulp');
const watch = require('gulp-watch');
const browserSync = require('browser-sync');
const reload = browserSync.reload;

const importCss = require('gulp-import-css');
const cssMin = require('gulp-clean-css');
const autoPrefixer = require('gulp-autoprefixer');
const csscomb = require('gulp-csscomb');

const jsMin = require('gulp-uglify');

const imageMin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');

const runSequence = require('run-sequence');
const rimraf = require('rimraf');

// Основыне пути
const path = {
  public: {
    html: 'public/',
    img: 'public/assets/img/',
    css: 'public/assets/css/',
    js: 'public/assets/js/'
  },
  src: {
    html: 'src/*.html',
    img: 'src/img/*.*',
    commonBlocks: 'src/common.blocks/',
    cssAll: 'src/common.blocks/*.css',
    cssMain: 'src/css/',
    normoliz: 'node_modules/normalize.css/normalize.css',
    jsAll: 'src/common.blocks/*.js',
    jsMain: 'src/js/main.js'
  },
  clean: './public'
};

// Конфигурация сервера для LiveLoad
const config = {
  server: {
    baseDir: './public'
  },
  tunnel: true,
  host: 'localhost',
  port: 9000,
  logPrefix: "Frontend_DevilDante"
};

gulp.task('webserver', function () {
  return browserSync(config);
});

// HTML
gulp.task('html:public', function () {
  return gulp.src(path.src.html) //Выберем файлы по нужному пути
    .pipe(gulp.dest(path.public.html)) //Выплюнем их в папку public
    .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});

// CSS
gulp.task('normoliz:public', function () {
  return gulp.src(path.src.normoliz)
    .pipe(cssMin())
    .pipe(gulp.dest(path.public.css));
});

gulp.task('css:collectStyle', function () {
  return gulp.src(path.src.cssMain + 'style.css') //Выберем наш css
    .pipe(importCss()) //Собрать
    .pipe(autoPrefixer())
    .pipe(csscomb())
    .pipe(gulp.dest(path.src.cssMain + '_style')); //Предпросмотр
});

// Зависим от css:collectStyle
gulp.task('css:public', ['css:collectStyle'], function () {
  return gulp.src(path.src.cssMain + '/_style/style.css') //Выберем наш css
    .pipe(cssMin())
    .pipe(gulp.dest(path.public.css)) //И в public
    .pipe(reload({stream: true}));
});

gulp.task('csscomb', function () {
  return gulp.src(path.src.cssAll) //Найдем все файлы css
    .pipe(csscomb()) //"Причешим"
    .pipe(gulp.dest(path.src.commonBlocks));
});

// JS
// gulp.task('js:public', function () {
//   return gulp.src(path.src.jsMain) //Найдем наш main файл
//     .pipe(rigger(''))
//     .pipe(jsMin()) //Сожмем наш js
//     .pipe(gulp.dest(path.public.js)) //Выплюнем готовый файл в public
//     .pipe(reload({stream: true})); //И перезагрузим сервер
// });

// IMAGE
gulp.task('image:public', function () {
  return gulp.src(path.src.img) //Выберем наши картинки
      .pipe(imageMin({ //Сожмем их
          progressive: true,
          svgoPlugins: [{removeViewBox: false}],
          use: [pngquant()],
          interlaced: true
      }))
      .pipe(gulp.dest(path.public.img)) //И бросим в public/assets
      .pipe(reload({stream: true}));
});

gulp.task('clean', function (cb) {
  return rimraf(path.clean, cb);
});

gulp.task('public', [
  'html:public',
  'css:public',
  'image:public'
  ]);

// OTHER
gulp.task('watch', function(){
  watch(path.src.html, ['html:public']);
  watch(path.src.cssAll, ['css:public']);
  watch(path.src.img, ['image:public']);
});

gulp.task('default', function(callback) {
  runSequence(['public', 'webserver'], 'watch', callback);
});
