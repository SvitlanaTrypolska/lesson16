import gulp from 'gulp';
import gulpSass from 'gulp-sass';
import * as sass from 'sass';
import cleanCSS from 'gulp-clean-css';
import uglify from 'gulp-uglify';
import imagemin from 'gulp-imagemin';
import autoprefixer from 'gulp-autoprefixer';
import htmlmin from 'gulp-htmlmin';
import gulpIf from 'gulp-if';
import browserSync from 'browser-sync';
import replace from 'gulp-replace';
import debug from 'gulp-debug';

const sassCompiler = gulpSass(sass);
const isProduction = true;

const paths = {
  styles: {
    src: 'app/compileStyles/style.scss'/**/,
    dest: 'dist/css'
  },
  scripts: {
    src: 'app/scripts/',
    dest: 'dist/mjs'
  },
  images: {
    src: 'app/images/**/*',
    dest: 'dist/images'
  },
  sprite: {
    src: 'app/sprite.svg',
    dest: 'dist'
  },
  pages: {
    src: 'app/index.html',
    dest: 'dist'
  }
};

// Process SCSS
function compileStyles() {
  return gulp.src(paths.styles.src)
    .pipe(debug({ title: 'Processing SCSS:' }))
    .pipe(sassCompiler().on('error', sassCompiler.logError))
    .pipe(autoprefixer())
    .pipe(gulpIf(isProduction, cleanCSS()))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

// Minify JavaScript
function scripts() {
  return gulp.src(paths.scripts.src)
    .pipe(uglify())
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

// Optimize images
function images() {
  return gulp.src(paths.images.src)
    .pipe(gulpIf(isProduction, imagemin()))
    .pipe(gulp.dest(paths.images.dest))
    .pipe(browserSync.stream());
}

// Minify HTML and update paths for CSS files
function pages() {
  return gulp.src(paths.pages.src)
    .pipe(replace(/xlink:href="\.\//g, 'xlink:href="./'))
    .pipe(gulpIf(isProduction, htmlmin({ collapseWhitespace: true })))
    .pipe(gulp.dest(paths.pages.dest))
    .pipe(browserSync.stream());
}

// Watch files for changes
function watch() {
  browserSync.init({
    server: {
      baseDir: './dist'
    },
    startPath: '/index.html'
  });

  gulp.watch(paths.styles.src, compileStyles);
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch(paths.images.src, images);
  gulp.watch(paths.pages.src, pages).on('change', browserSync.reload);
}

// Build task
const compileBuild = gulp.series(gulp.parallel(compileStyles, scripts, images, pages));
const dev = gulp.series(compileBuild, watch);

// Export tasks
export { compileStyles, scripts, images, pages, compileBuild, dev, watch };
export default dev;
