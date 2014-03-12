var through = require('through');
var os = require('os');
var path = require('path');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var File = gutil.File;
var Buffer = require('buffer').Buffer;

module.exports = function(fileName, opt){
  if (!fileName) throw new PluginError('gulp-concat', 'Missing fileName option for gulp-concat');
  if (!opt) opt = {};
  // to preserve existing |undefined| behaviour and to introduce |newLine: ""| for binaries
  if (typeof opt.newLine === 'undefined') opt.newLine = gutil.linefeed;

  var buffer = [];
  var firstFile = null;

  function bufferContents(file){
    if (file.isNull()) return; // ignore
    if (file.isStream()) return this.emit('error', new PluginError('gulp-concat',  'Streaming not supported'));

    if (!firstFile) firstFile = file;

    buffer.push(file.contents);
  }

  function endStream(){
    if (buffer.length === 0) return this.emit('end');

    var joinedBuffer;

    if (!opt.newLine) {
      joinedBuffer = buffer;
    } else {
      joinedBuffer = [];
      var newLineBuffer = new Buffer(opt.newLine);
      buffer.forEach(function(b, i) {
        if (i) joinedBuffer.push(newLineBuffer);
        joinedBuffer.push(b);
      });
    };

    var joinedContents = Buffer.concat(joinedBuffer);

    var joinedPath = path.join(firstFile.base, fileName);

    var joinedFile = new File({
      cwd: firstFile.cwd,
      base: firstFile.base,
      path: joinedPath,
      contents: joinedContents
    });

    this.emit('data', joinedFile);
    this.emit('end');
  }

  return through(bufferContents, endStream);
};
