define('js/ui', [
    'jquery',
    'jplayer',
    'couchr',
    'director',
    'slang',
    'underscore',
    'hbt!templates/list_songs',
    'hbt!templates/song',
    'hbt!jam/jplayer/skin/blue.monday/skin'
],
function($, jplayer, couchr, director, slang, _, list_songs_t, song_t, skin_t){
    var ui = {};
    var router;
    ui.init = function(){

    }

    function list_songs() {
        couchr.get('./_db/_design/tabs/_view/by_title', function (err, res) {
            var data = _.map(res.rows, function(row){
                row.nice = slang.undasherize(row.key);
                return row;
            });
            $('.main-content').html(list_songs_t(data));
        });
    }

    function show_song(id){
        couchr.get('./_db/' + id, function (err, doc) {
            console.log(doc);
            doc.nice_song = slang.undasherize(doc.song);
            doc.nice_artist = slang.undasherize(doc.artist);
            $('.main-content').html(song_t(doc));
            couchr.get('./_db/' + id + '/tab.txt', function (err, text) {
                $('pre').text(text);
            });
            var hasMp3 = false;
            _.each(doc._attachments, function(val, key){
                if (slang.endsWith(key, '.mp3')) {
                    hasMp3 = true;
                    $('.p').html(skin_t({
                        jquery_jplayer_id : 'jquery_jplayer_1',
                        jp_container_id : 'jp_container_1',
                        title : doc.nice_song
                    }));
                    $('.jp-title').hide();
                    $("#jquery_jplayer_1").jPlayer({
                      ready: function () {
                        var mp3 = "./_db/" + id + '/' + encodeURIComponent(key);
                          console.log(mp3);
                        $(this).jPlayer("setMedia", {
                          mp3: mp3
                        });
                      },
                      swfPath: "./jam/jplayer/jquery.jplayer",
                      supplied: "mp3"
                    });
                }
            })
            if (!hasMp3) {
                console.log('no mp3');
                $('.uploadAudio').show();
                $('#fileUploader').live('change', function(){
                    $('.submit').show();
                });
            }

        });
    }


    ui.start = function(){
        router = director.Router({
            '/list' : list_songs,
            '/view/*' : show_song
        });
        router.init('/list');
    }
    return ui;
});