'use strict';

var through = require('through2');
var fs = require('fs');
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

  // unless opt.force is true, only concatenate and push through the joined file 
  // when the destination does not exist or is older than the newest source file
  if (typeof opt.force !== 'boolean') {
    opt.force = false;
  }


  var isUsingSourceMaps = false;
  var latestFile;
  var latestMod;
  var fileName;
  var queue = [];
  
  if (typeof file === 'string') {
    fileName = file;
  } else if (typeof file.path === 'string') {
    fileName = path.basename(file.path);
  } else {
    throw new PluginError('gulp-concat', 'Missing path in file options for gulp-concat');
  }

  function bufferContents(file, enc, cb) {
    // ignore empty files
    if (file.isNull()) {
      cb();
      return;
    }

    // we dont do streams (yet)
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

    // set latest file if not already set,
    // or if the current file was modified more recently.
    if (!latestMod || file.stat && file.stat.mtime > latestMod) {
      latestFile = file;
      latestMod = file.stat && file.stat.mtime;
    }

    // add file to the queue
    queue.push(file);

    cb();
  }

  function endStream(cb) {

    // no files passed in, no file goes out
    if (!latestFile) {
      cb();
      return;
    }

    var self = this;
    var joinedFile;

    // if file opt was a file path
    // clone everything from the latest file
    if (typeof file === 'string') {
      joinedFile = latestFile.clone({contents: false});
      joinedFile.path = path.join(latestFile.base, file);
    } else {
      joinedFile = new File(file);
    }

    fs.stat(joinedFile.path, function(err, stat) {

      var pass = true;
      var concat;

      // if opt.force is false, check whether we can skip the concatenation
      if (!opt.force) {
        if (err) {
          if (err.code !== 'ENOENT') {
            self.emit('error', new PluginError('gulp-concat', 'Can\'t stat destination'));
            pass = false;
          }
        } else if (latestMod && stat.mtime > latestMod) {
          pass = false;
        }
      }

      if (pass) {
        // construct concat instance
        concat = new Concat(isUsingSourceMaps, fileName, opt.newLine);

        // add files to concat instance
        while (queue.length !== 0) {
          var f = queue.shift();
          concat.add(f.relative, f.contents, f.sourceMap);
        }

        joinedFile.contents = concat.content;

        if (concat.sourceMapping) {
          joinedFile.sourceMap = JSON.parse(concat.sourceMap);
        }

        self.push(joinedFile);
      }

      cb();
    });

  }

  return through.obj(bufferContents, endStream);
};
