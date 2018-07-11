// const gulp = require('gulp'); Основной
// const watch = require('gulp-watch'); Смотреть изменения. Может не работать - использовать gulp.watch
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
// const runSequence = require('run-sequence'); последов. запуск тасков (синх!)


'use strict';

const gulp = require('gulp');

const browserSync = require('browser-sync');
const reload = browserSync.reload;

const importCss = require('gulp-import-css');
const cssMin = require('gulp-clean-css');
const autoPrefixer = require('gulp-autoprefixer');
const csscomb = require('gulp-csscomb');

const jsMin = require('gulp-uglify');

const imageMin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const svgSprite = require('gulp-svg-sprite');

const runSequence = require('run-sequence');
const rename = require('gulp-rename');
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
    jsMain: 'src/js/main.js',
    svgIcons: 'src/img/svgSprite/*.svg'
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

const svgSpriteConfig = {
  mode: {
    css: { // Activate the «css» mode
      render: {
        css: true // Activate CSS output (with default options)
      }
    }
  }
};

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

gulp.task('css:public', ['css:collectStyle'], function () { // Зависим от css:collectStyle
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
gulp.task('js:public', function () {
  return gulp.src(path.src.jsMain) //Найдем наш main файл
    .pipe(jsMin()) //Сожмем наш js
    .pipe(gulp.dest(path.public.js)) //Выплюнем готовый файл в public
    .pipe(reload({stream: true})); //И перезагрузим сервер
});

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

//  Helpful tasks
gulp.task('svgSpriteCreate', function () {
  return gulp.src(path.src.svgIcons)
  .pipe(svgSprite(svgSpriteConfig))
  .pipe(gulp.dest('src/sprite'));
});

gulp.task('svgSprite', ['svgSpriteCreate'], function () {
  return gulp.src('src/sprite/css/svg/sprite.css-03f10c0d.svg')
  .pipe(rename('sprite.svg'))
  .pipe(gulp.dest('src/img'));
});

gulp.task('clean', function (cb) {
  return rimraf(path.clean, cb);
});

gulp.task('webserver', function () {
  return browserSync(config);
});

gulp.task('watch', function(){
  gulp.watch(path.src.html, ['html:public']);
  gulp.watch(path.src.cssAll, ['css:public']);
  gulp.watch(path.src.jsAll, ['js:public']);
  gulp.watch(path.src.img, ['image:public']);
});

gulp.task('public', [
  'html:public',
  'normoliz:public',
  'css:public',
  'js:public',
  'image:public'
  ]);

gulp.task('public--full', function(callback) {
  runSequence('clean', 'public', callback);
});

gulp.task('start--work', function(callback) {
  runSequence('public', 'webserver', 'watch', callback);
});
