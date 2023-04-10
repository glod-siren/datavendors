const { src, dest, series, parallel } = require('gulp');
const { exec } = require('shelljs');
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const rimraf = require('rimraf');
const zip = require('gulp-zip');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const cache = require('gulp-cached');

const PACKAGE_NAME = require('./package.json').name;

function copyFiles(source, destination) {
  return function copyFiles() {
    return fs.copy(source, destination);
  }
}

function install(location) {
  return async function install() {
    const process = exec(`npm install --only=production`, { cwd: location, silent: true });
    if (process.code) {
      console.log(process.stdout);
      throw new Error(process.stderr);
    }
  };
}

function mkdir(dir) {
  return async function mkdir() {
    mkdirp.sync(dir);
  };
}

function zipPackage() {
  return src('build/**/*')
    .pipe(zip(`${PACKAGE_NAME}.zip`))
    .pipe(dest('target'));
}

function compileTypescript() {
  const tsProject = ts.createProject('tsconfig.json');
  return tsProject.src()
    .pipe(cache())
    .pipe(sourcemaps.init())
    .pipe(tsProject()).js
    .pipe(sourcemaps.write())
    .pipe(dest(tsProject.options.outDir));
}

function copyNonScriptFiles() {
  return src(['package.json']).pipe(dest('dist'));
}

exports.compile = parallel(compileTypescript, copyNonScriptFiles);

exports.clean = async function clean() {
  ['build', 'target', 'dist'].forEach(path => rimraf.sync(path));
};

const cleanBuild = async () => rimraf.sync('build');

const build = series(
  exports.clean,
  exports.compile,
  mkdir(`build/kibana/${PACKAGE_NAME}`),
  copyFiles('dist', `build/kibana/${PACKAGE_NAME}`),
  install(`build/kibana/${PACKAGE_NAME}`)
);

exports.package = series(build, zipPackage, cleanBuild);
