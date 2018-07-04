'use strict';

const gulp = require('gulp');
const watch = require('gulp-watch');
const browserSync = require('browser-sync');
const reload = browserSync.reload;
const cssMin = require('gulp-clean-css');
const autoPrefixer = require('gulp-autoprefixer');
const jsMin = require('gulp-uglify');
const imageMin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const rigger = require('gulp-rigger');
const rimraf = require('rimraf');

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
    cssAll: 'src/common.blocks/**/*.css', 
    cssMain: 'src/css/style.css',
    jsAll: 'src/common.blocks/**/*.js', 
    jsMain: 'src/js/main.js'
  },
  clean: './public'
};

const config = {
  server: {
    baseDir: './public'
  },
  tunnel: true,
  host: 'localhost',
  port: 9000,
  logPrefix: "Frontend_DevilDante"
};

gulp.task('html:public', function () {
  return gulp.src(path.src.html) //Выберем файлы по нужному пути
    .pipe(gulp.dest(path.public.html)) //Выплюнем их в папку public
    .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
    });

gulp.task('css:public', function () {
  return gulp.src(path.src.cssMain) //Выберем наш css
    .pipe(rigger(''))
    .pipe(autoPrefixer()) //Добавим вендорные префиксы
    .pipe(cssMin()) //Сожмем
    .pipe(gulp.dest(path.public.css)) //И в public
    .pipe(reload({stream: true}));
    });

gulp.task('js:public', function () {
  return gulp.src(path.src.jsMain) //Найдем наш main файл
    .pipe(rigger(''))
    .pipe(jsMin()) //Сожмем наш js
    .pipe(gulp.dest(path.public.js)) //Выплюнем готовый файл в public
    .pipe(reload({stream: true})); //И перезагрузим сервер
    });

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

gulp.task('public', [
  'html:public',
  'js:public',
  'css:public',
  'image:public'
  ]);

gulp.task('watch', function(){
  return 
  watch([path.src.html], function(event, cb) {
    gulp.start('html:public');
  });
  watch([path.src.css], function(event, cb) {
    gulp.start('css:public');
  });
  watch([path.src.js], function(event, cb) {
    gulp.start('js:public');
  });
  watch([path.src.img], function(event, cb) {
    gulp.start('image:public');
  });
});

gulp.task('webserver', function () {
  return browserSync(config);
});

gulp.task('clean', function (cb) {
  return rimraf(path.clean, cb);
});

gulp.task('default', ['public', 'webserver', 'watch']);
