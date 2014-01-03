var through = require('through');
var PassThrough = require('stream').PassThrough;
var os = require('os');
var path = require('path');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var File = gutil.File;

module.exports = function(fileName, opt){
  if (!fileName) throw new PluginError('gulp-concat',  'Missing fileName option for gulp-concat');
  if (!opt) opt = {};
  if (!opt.newLine) opt.newLine = gutil.linefeed;

  var joinedFile = new File({
    contents: null
  });

  function bufferContents(file){
    if (file.isNull()) return; // ignore

    if (file.isStream()) {
      if (!joinedFile.contents) {
        joinedFile.cwd = file.cwd;
        joinedFile.base = file.base;
        joinedFile.path = path.join(file.base, fileName);
        joinedFile.contents = new PassThrough();
        file.contents.pipe(joinedFile.contents, {end: false});
      } else {
        joinedFile.contents.write(Buffer(opt.newLine));
        file.contents.pipe(joinedFile.contents, {end: false});
      }
      return;
    }

    if (!joinedFile.contents) {
      joinedFile.cwd = file.cwd;
      joinedFile.base = file.base;
      joinedFile.path = path.join(file.base, fileName);
      joinedFile.contents = file.contents;
    } else {
      joinedFile.contents = Buffer.concat([
        joinedFile.contents,Buffer(opt.newLine),file.contents
      ], joinedFile.contents.length + file.contents.length
        + Buffer(opt.newLine).length);
    }

  }

  function endStream(){
    if (!joinedFile.contents) return this.emit('end');

    this.emit('data', joinedFile);
    this.emit('end');
  }

  return through(bufferContents, endStream);
};
