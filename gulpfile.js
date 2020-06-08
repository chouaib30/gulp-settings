// Load Gulp...of course
const { src, dest, task, watch, series, parallel } = require("gulp");

// CSS related plugins
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const concat = require("gulp-concat");

// JS related plugins
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");

// HTML related plugins
const pug = require("gulp-pug");

//IMAGES related plugins
const imageMin = require("gulp-imagemin");

// Browers related plugins
const browserSync = require("browser-sync").create();

// Utility plugins
const rename = require("gulp-rename");
const sourcemaps = require("gulp-sourcemaps");
const notify = require("gulp-notify");
const plumber = require("gulp-plumber");
const clean = require("gulp-rimraf");

// Project related constiables
const styleSRC = "./src/scss/*.scss";
const styleURL = "./dist/css/";
const mapURL = ".";

const jsSRC = "./src/js/*.js";
const jsURL = "./dist/js/";

const htmlSRC = "./src/views/**/*.pug";
const htmlURL = "./dist/";

const imgSRC = "./src/images/*";
const imgURL = "./dist/images/";

const fontsSRC = "./src/fonts/*";
const fontsURL = "./dist/fonts/";

const styleWatch = "./src/scss/**/*.scss";
const jsWatch = "./src/js/**/*.js";
const htmlWatch = "./src/views/**/*.pug";

const buildDir = "./dist/*";

// Tasks
function browser_sync() {
  browserSync.init({
    server: {
      baseDir: "./dist",
      proxy: "app.dev",
    },
  });
}

function reload(done) {
  browserSync.reload();
  done();
}

function css(done) {
  src([styleSRC])
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        errLogToConsole: true,
        outputStyle: "compressed",
      })
    )
    .on("error", console.error.bind(console))
    .pipe(autoprefixer("last 2 versions"))
    .pipe(concat("style.css"))
    .pipe(rename({ suffix: ".min" }))
    .pipe(sourcemaps.write(mapURL))
    .pipe(dest(styleURL))
    .pipe(browserSync.stream());
  done();
}

function js(done) {
  src([jsSRC])
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(
      babel({
        presets: [
          [
            "@babel/env",
            {
              modules: false,
            },
          ],
        ],
      })
    )
    .pipe(concat("script.js"))
    .pipe(rename({ suffix: ".min" }))
    .pipe(uglify())
    .pipe(sourcemaps.write("."))
    .pipe(dest(jsURL))
    .pipe(browserSync.stream());
  done();
}

function html(done) {
  src([htmlSRC])
    .pipe(
      pug({
        pretty: true,
      })
    )
    .pipe(dest(htmlURL))
    .pipe(browserSync.stream());
  done();
}

function images(done) {
  src([imgSRC]).pipe(imageMin()).pipe(dest(imgURL));
  done();
}

function fonts() {
  return triggerPlumber(fontsSRC, fontsURL);
}

function triggerPlumber(src_file, dest_file) {
  return src(src_file).pipe(plumber()).pipe(dest(dest_file));
}

function clear_dir(done) {
  src(buildDir, { read: false }).pipe(clean());
  done();
}

function watch_files() {
  watch(styleWatch, series(css, reload));
  watch(jsWatch, series(js, reload));
  watch(htmlWatch, series(html, reload));
}

task("css", css);
task("js", js);
task("images", images);
task("fonts", fonts);
task("html", html);
task(
  "default",
  series(
    parallel(css, js, images, fonts, html),
    parallel(browser_sync, watch_files)
  )
);
