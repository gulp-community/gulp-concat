var es = require('event-stream'),
  clone = require('clone'),
  path = require('path');

module.exports = function(opt){
  // clone options
  opt = opt ? clone(opt) : {};
  if (typeof opt.splitter === 'undefined') opt.splitter = '\r\n';

  if (!opt.fileName) throw new Error("Missing fileName option for gulp-concat");

  var buffer = [];
  
  function bufferContents(file){
    // clone the file so we arent mutating stuff
    buffer.push(clone(file));
  }

  function endStream(){
    if (buffer.length === 0) return this.emit('end');

    var contents = buffer.map(function(file){
      return file.contents;
    });
    if (typeof opt.header !== 'undefined') {
      contents.unshift(header);
    }
    if (typeof opt.footer !== 'undefined') {
      contents.push(opt.footer);
    }
    var joinedContents = contents.join(opt.splitter);

    var joinedPath = path.join(path.dirname(buffer[0].path), opt.fileName);

    var joinedFile = {
      shortened: opt.fileName,
      path: joinedPath,
      contents: joinedContents
    };

    this.emit('data', joinedFile);
    this.emit('end');
  }

  return es.through(bufferContents, endStream);
};
