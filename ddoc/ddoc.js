var _ = require('underscore')._;

exports.rewrites = [
    {from: '/_db/*', to : '../../*'},
    {from: '/_db', to : '../../'},
    {from: '/', to: 'index.html'},
    {from: '/*', to: '*'}

];

var lists = {};


var views = {};



views.by_title = {
    map : function(doc) {
        if (!doc.song) return;
        emit(doc.song, null);
    }
}

exports.views = views;