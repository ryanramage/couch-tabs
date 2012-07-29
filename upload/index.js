var readDirFiles = require('read-dir-files');
var async = require('async');
var fs = require('fs');
var nano = require('nano'); //('http://localhost:5984/wf');

var db;

var folder = process.argv[2];
if (process.argv[3]) {
    db = nano(process.argv[3]);
} else {
    db = nano('http://localhost:5984/tabs');
}



readDirFiles.list(folder, {recursive: false, normalize: true }, function (err, filenames) {
    if (err) return console.dir(err);
    async.forEachLimit(filenames, 3, upload, function(err){
      if (err) return console.log(err);
    });
});


function upload(filename, cb){
    var _id = short_filename(folder, filename);
    var doc = {
        _id : _id,
        song : find_song_name(_id),
        artist : find_artist(_id)
    }
    if (!doc.song) return cb();
    db.insert(doc, _id, function(err, body){
        fs.createReadStream(filename).pipe(
            db.attachment.insert(_id, 'tab.txt', null, 'text/plain', {rev : body.rev}, function(err, body){
                cb();
            })
        );


    })
}


function find_artist(filename) {
    return filename.split('_')[0];
}

function find_song_name(filename) {
    var with_ext = filename.split('_')[1];
    if (with_ext) {
        return with_ext.substring(0, with_ext.indexOf('.'));
    }
    return null;

}


function short_filename(initialPath, full_filename) {
    return full_filename.substring(initialPath.length);
}