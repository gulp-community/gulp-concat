var concat = require('../');
var should = require('should');
var File = require('gulp').File;
require('mocha');

describe('gulp-concat', function() {
  describe('concat()', function() {
    it('should concat two files', function(done) {
      var stream = concat("test.js");
      var fakeFile = new File({
        base: "/home/contra/test",
        path: "/home/contra/test/file.js"
      });
      fakeFile.contents = new Buffer("wadup");

      var fakeFile2 = new File({
        base: "/home/contra/test",
        path: "/home/contra/test/file2.js"
      });
      fakeFile2.contents = new Buffer("doe");

      stream.on('data', function(newFile){
        should.exist(newFile);
        should.exist(newFile.path);
        should.exist(newFile.relative);
        should.exist(newFile.contents);
        newFile.path.should.equal("/home/contra/test/test.js");
        newFile.relative.should.equal("test.js");
        String(newFile.contents).should.equal("wadup\r\ndoe");
        done();
      });
      stream.write(fakeFile);
      stream.write(fakeFile2);
      stream.end();
    });
  });
});
