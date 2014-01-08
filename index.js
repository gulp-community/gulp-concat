var through = require('through');
var os = require('os');
var path = require('path');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var File = gutil.File;

module.exports = function(fileName, opt){
    if (!fileName) throw new PluginError('gulp-concat',  'Missing fileName option for gulp-concat');
    if (!opt) opt = {};
    if (!opt.newLine) opt.newLine = gutil.linefeed;

    var buffers = {},
        outputs,
        firstFile;

    // backwards compatibility
    if(typeof(fileName) === 'string'){
        outputs = {
            fileName: null
        }
    }
    else{
        outputs = fileName;
    }

    function bufferContents(file){
        if (file.isNull()) return; // ignore
        if (file.isStream()) return this.emit('error', new PluginError('gulp-concat',  'Streaming not supported'));

        if (!firstFile) firstFile = file;

        var streamFile = file.path.substr(file.base.length),
            index // ensure correct order;
        for(var output in outputs){
            // nul or empty take all or is in output
            var includedItems = outputs[output];
            if(!includedItems || includedItems.length === 0 || ((index = includedItems.indexOf(streamFile)) > -1)){
                // if no buffer, create it
                if(!buffers[output]) buffers[output] = [];

                // if an index otherwise jush push it on the buffer
                if(index !== null){
                    buffers[output][index] = file.contents.toString('utf8');
                }
                else{
                    buffers[output].push(file.contents.toString('utf8'));
                }
            }
        }
    }

    function endStream(){
        for(var fileName in buffers){
            var joinedContents = buffers[fileName].join(opt.newLine);

            var joinedPath = path.join(firstFile.base, fileName);

            var joinedFile = new File({
                cwd: firstFile.cwd,
                base: firstFile.base,
                path: joinedPath,
                contents: new Buffer(joinedContents)
            });
            this.emit('data', joinedFile);
        }
        this.emit('end');
    }

    return through(bufferContents, endStream);
};
