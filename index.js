var es = require('event-stream');
var os = require('os');
var path = require('path');
var gutil = require('gulp-util');

module.exports = function(fileName, opt){
  if (!fileName) throw new Error("Missing fileName option for gulp-concat");
  if (!opt) opt = {};
  if (!opt.newLine) opt.newLine = gutil.linefeed;
  
  var buffer = [];
  function bufferContents(file){
    if (file.isNull()) return; // ignore
    if (file.isStream()) return cb(new Error("gulp-concat: Streaming not supported"));

    var str = file.contents.toString('utf8');

    buffer.push(file);
  }

  function endStream(){
    if (buffer.length === 0) return this.emit('end');

    var joinedContents = buffer.map(function(file){
      return file.contents.toString('utf8');
    }).join(opt.newLine);

    var joinedPath = path.join(buffer[0].base, fileName);

    var joinedFile = new gutil.File({
      cwd: buffer[0].cwd,
      base: buffer[0].base,
      path: joinedPath,
      contents: new Buffer(joinedContents)
    });

    this.emit('data', joinedFile);
    this.emit('end');
  }

  return es.through(bufferContents, endStream);
};
