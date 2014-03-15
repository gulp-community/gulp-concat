var concat = require('../');
var should = require('should');
var os = require('os');
var path = require('path');
var File = require('gulp-util').File;
var Buffer = require('buffer').Buffer;
require('mocha');

describe('gulp-concat', function() {
  describe('concat()', function() {

    oneFile    (concat('test.js'                   ), 'wadup', 'wadup');
    oneFile    (concat('test.js', {newLine: '\r\n'}), 'wadup', 'wadup');
    oneFile    (concat('test.js', {newLine: ''    }), 'wadup', 'wadup');

    twoFiles   (concat('test.js'                   ), 'wadup', 'doe', 'wadup\ndoe');
    twoFiles   (concat('test.js', {newLine: '\r\n'}), 'wadup', 'doe', 'wadup\r\ndoe');
    twoFiles   (concat('test.js', {newLine: ''    }), 'wadup', 'doe', 'wadupdoe');

    threeFiles (concat('test.js'                   ), 'wadup', 'doe', 'hey', 'wadup\ndoe\nhey');
    threeFiles (concat('test.js', {newLine: '\r\n'}), 'wadup', 'doe', 'hey', 'wadup\r\ndoe\r\nhey');
    threeFiles (concat('test.js', {newLine: ''    }), 'wadup', 'doe', 'hey', 'wadupdoehey');

    function oneFile(stream, contents, result) {
      it('should concat two files', function(done) {
        var fakeFile = new File({
          cwd: '/home/contra/',
          base: '/home/contra/test',
          path: '/home/contra/test/file1.js',
          contents: new Buffer(contents)
        });

        stream.on('data', function(newFile){
          should.exist(newFile);
          should.exist(newFile.path);
          should.exist(newFile.relative);
          should.exist(newFile.contents);

          var newFilePath = path.resolve(newFile.path);
          var expectedFilePath = path.resolve('/home/contra/test/test.js');
          newFilePath.should.equal(expectedFilePath);

          newFile.relative.should.equal('test.js');
          String(newFile.contents).should.equal(result);
          Buffer.isBuffer(newFile.contents).should.equal(true);
          done();
        });
        stream.write(fakeFile);
        stream.end();
      });
    };

    function twoFiles(stream, contents1, contents2, result) {
      it('should concat two files', function(done) {
        var fakeFile1 = new File({
          cwd: '/home/contra/',
          base: '/home/contra/test',
          path: '/home/contra/test/file1.js',
          contents: new Buffer(contents1)
        });

        var fakeFile2 = new File({
          cwd: '/home/contra/',
          base: '/home/contra/test',
          path: '/home/contra/test/file2.js',
          contents: new Buffer(contents2)
        });

        stream.on('data', function(newFile){
          should.exist(newFile);
          should.exist(newFile.path);
          should.exist(newFile.relative);
          should.exist(newFile.contents);

          var newFilePath = path.resolve(newFile.path);
          var expectedFilePath = path.resolve('/home/contra/test/test.js');
          newFilePath.should.equal(expectedFilePath);

          newFile.relative.should.equal('test.js');
          String(newFile.contents).should.equal(result);
          Buffer.isBuffer(newFile.contents).should.equal(true);
          done();
        });
        stream.write(fakeFile1);
        stream.write(fakeFile2);
        stream.end();
      });
    };

    function threeFiles(stream, contents1, contents2, contents3, result) {
      it('should concat three files', function(done) {
        var fakeFile1 = new File({
          cwd: '/home/contra/',
          base: '/home/contra/test',
          path: '/home/contra/test/file1.js',
          contents: new Buffer(contents1)
        });

        var fakeFile2 = new File({
          cwd: '/home/contra/',
          base: '/home/contra/test',
          path: '/home/contra/test/file2.js',
          contents: new Buffer(contents2)
        });

        var fakeFile3 = new File({
          cwd: '/home/contra/',
          base: '/home/contra/test',
          path: '/home/contra/test/file3.js',
          contents: new Buffer(contents3)
        });

        stream.on('data', function(newFile){
          should.exist(newFile);
          should.exist(newFile.path);
          should.exist(newFile.relative);
          should.exist(newFile.contents);

          var newFilePath = path.resolve(newFile.path);
          var expectedFilePath = path.resolve('/home/contra/test/test.js');
          newFilePath.should.equal(expectedFilePath);

          newFile.relative.should.equal('test.js');
          String(newFile.contents).should.equal(result);
          Buffer.isBuffer(newFile.contents).should.equal(true);
          done();
        });
        stream.write(fakeFile1);
        stream.write(fakeFile2);
        stream.write(fakeFile3);
        stream.end();
      });
    };

  });
});
