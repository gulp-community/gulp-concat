var through = require('through');
var path = require('path');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var File = gutil.File;
var Buffer = require('buffer').Buffer;
var Concat = require('concat-with-sourcemaps');

module.exports = function(fileName, opt) {
  if (!fileName) throw new PluginError('gulp-concat', 'Missing fileName option for gulp-concat');
  if (!opt) opt = {};
  // to preserve existing |undefined| behaviour and to introduce |newLine: ""| for binaries
  if (typeof opt.newLine !== 'string') opt.newLine = gutil.linefeed;

  var buffer = [];

  function bufferContents(file) {
    if (file.isNull()) return; // ignore
    if (file.isStream()) return this.emit('error', new PluginError('gulp-concat',  'Streaming not supported'));

    buffer.push(file);
  }

  function endStream() {
    var length = buffer.length;
    if (length > 0) {
      var firstFile = buffer[0];

      if (opt.sort) {
        buffer.sort(function (a, b) { return a.path > b.path; });
      }

      var concat = new Concat(!!firstFile.sourceMap, fileName, opt.newLine);

      for (var i = 0; i < length; i++) {
        var file = buffer[i];
        concat.add(file.relative, file.contents.toString(), file.sourceMap);
      }

      var joinedPath = path.join(firstFile.base, fileName);

      var joinedFile = new File({
        cwd: firstFile.cwd,
        base: firstFile.base,
        path: joinedPath,
        contents: new Buffer(concat.content)
      });
      if (concat.sourceMapping)
        joinedFile.sourceMap = JSON.parse(concat.sourceMap);

      this.emit('data', joinedFile);
    }

    this.emit('end');
  }

  return through(bufferContents, endStream);
};
