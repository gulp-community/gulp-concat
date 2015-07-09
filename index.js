'use strict';

var through = require('through2');
var path = require('path');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var File = gutil.File;
var Concat = require('concat-with-sourcemaps');

// file can be a vinyl file object or a string
// when a string it will construct a new one
module.exports = function(file, opt) {
  if (!file) {
    throw new PluginError('gulp-concat', 'Missing file option for gulp-concat');
  }
  opt = opt || {};

  // to preserve existing |undefined| behaviour and to introduce |newLine: ""| for binaries
  if (typeof opt.newLine !== 'string') {
    opt.newLine = gutil.linefeed;
  }

  var isUsingSourceMaps = false;
  var fileName;
  var fileNameFromFn;
  var concat;
  var targets = {};

  if (typeof file === 'string') {
    fileName = file;
  } else if (typeof file.path === 'string') {
    fileName = path.basename(file.path);
  } else if(file.constructor === Function || (file.path && file.path.constructor === Function)) {
    fileNameFromFn = (file.path || file);
  } else {
    throw new PluginError('gulp-concat', 'Missing path in file options for gulp-concat');
  }


  function bufferContents(file, enc, cb) {
    var source;

    // ignore empty files
    if (file.isNull()) {
      cb();
      return;
    }

    // we don't do streams (yet)
    if (file.isStream()) {
      this.emit('error', new PluginError('gulp-concat',  'Streaming not supported'));
      cb();
      return;
    }

    // enable sourcemap support for concat
    // if a sourcemap initialized file comes in
    if (file.sourceMap && isUsingSourceMaps === false) {
      isUsingSourceMaps = true;
    }

    // Get target filename from function.
    if(fileNameFromFn) {
      fileName = fileNameFromFn(file);

      if(!fileName) {
        throw new PluginError('gulp-concat', 'When using a function to dynamically generate fileName, please ensure a valid name is returned: '+fileName);
      }
    }

    // Targets map.
    // Anything passed as the target name will be
    // saved to this map and iterated over within endSteam.
    if(!targets[fileName]) {
      targets[fileName] = {files: []};
    }

    // Add current file from stream to map
    targets[fileName].files[file.path] = {};

    // Add instance
    if(!targets[fileName].files[file.path]) {
      targets[fileName].files[file.path] = {instance: file};
    }

    // Create shorthand pointer
    source = targets[fileName].files[file.path];

    // set latest file if not already set,
    // or if the current file was modified more recently.
    if (!source.latestMod || source.instance.stat && source.instance.stat.mtime > source.latestMod) {
      source.instance = file;
      source.latestMod = source.instance.stat && source.instance.stat.mtime;
    }

    // construct concat instance
    if (!targets[fileName].concat) {
      targets[fileName].concat = new Concat(isUsingSourceMaps, fileName, opt.newLine);
    }

    // add file to concat instance
    targets[fileName].concat.add(source.instance.relative, source.instance.contents, source.instance.sourceMap);
    cb();
  }

  function endStream(cb) {

    // Loop through saved files
    // Create a new File object and set its contents to the
    // contents add via concat.add()
    for(var group in targets) {
      targets[group].instance = new File({path: group});
      targets[group].instance.contents = targets[group].concat.content;

      if(targets[group].sourceMapping) {
        targets[group].instance.sourceMap = JSON.parse(targets[group].concat.sourceMap);
      }

      // Add files to stream
      this.push(targets[group].instance);
    }

    cb();
  }

  return through.obj(bufferContents, endStream);
};
