$(function () {
    var queue = {};
    var debug = true;
    function log(){
        if(!debug){return;}
        if(console && console.log){
            console.log(arguments);
        }
    }

    function notify(event, data){
        data = data || null;
        if(!queue.hasOwnProperty(event)){
            return log(event,'nothing listening!');
        }
        $.each(queue[event], function (i, obj) {
            var ret = obj(data) || null;
            if(event != 'bind' && event !='start' && event != 'package-finished' && event !='binding-finished'){
                log(event,'width');
            }
        });
        return true;
    }

    function observe(event, obj){
        if(typeof event == 'object'){
            $.each(event, function (i, ev) {
                observe(ev, obj);
            });
        }else if(typeof event == 'string'){
            if(!queue.hasOwnProperty(event)){
                queue[event] = [];
                queue[event].push(obj);
            }
        }else{
            log('Queue Reject', event);
        }
    }

    window.notify = notify;
    window.observe = observe;
    window.debug = debug;
});

var router;
//routing server
$(function () {
    var started = false;
    var logged_in = false;
    var home = function () {
        $('section').hide();
        notify('start-loading');
        if(started){
            if(logged_in){
                notify('build-home');
            }else{
                location.href = "#/login";
                notify('build-login');
            }
        }else{
            //
        }
    }

    var about = function () {
        $('section').hide();
        notify('start-loading');
        if(started){
            if(logged_in){
                notify('build-about');
            }else{
                location.href = '#/login';
                notify('build-login');
            }
        }else{
            //
        }
    }

    var login = function () {
        $('section').hide();
        notify('start-loading');
        if(started){
            if(logged_in){
                location.href = '#/home';
                notify('build-home');
            }else{
                notify('build-login');
            }
        }else{
            //
        }
    }

    var unknown = function () {
        $('section').hide();
        notify('start-loading');
        if(started){
            if(logged_in){
                location.href = '#/home';
                notify('build-home');
            }else{
                location.href = '#/login';
                notify('build-login');
            }
        }else{
            //
        }
    }

    router = Router({
        '/home':home,
        '/about':about,
        '/login':login,
        '/:unknown':unknown
    });
    router.init();

    observe('start-loading', function () {
        $('section').hide();
        $('#whole-page').hide();
        $('#loading-page').show();
    });

    observe('finish-loading', function () {
        $('#whole-page').show();
        $('#loading-page').hide();
    });

    var socket;
    observe('connect-to-server', function () {
        socket = socketCluster.connect();
        socket.on('connect', function (status) {
            started = true;
            var hash = window.location.hash.slice(2);
            if(status.isAuthenticated){
                $('#login-errors-message').hide().text('');
                logged_in = true;
                $('nav').show();
                if(hash.length < 1){
                    notify('start-loading');
                    location.href = '#/home';
                    notify('build-home');
                }else{
                    notify('build-' + hash);
                }
            }else{
                logged_in = false;
                if(hash == 'login' || hash ==''){

                }else{
                    $('#login-errors-message').show();
                    $('#login-errors-message').text('You must be logged in to access that area.');
                }
                $('nav').hide();
                location.href = '#/login';
                notify('build-login');
            }
        });

        socket.on('authenticate', function (status) {
            console.log('authenticate');
        });

        socket.on('error', function (err) {
            console.log('------ error -------',err);
        });

        socket.on('disconnect', function () {
            console.log('------ disconnect -------');
        });

        //连接中断
        socket.on('connectAbort', function () {
            console.log('------ connectAbort -------');
        });

        socket.on('raw', function () {
            console.log('------ raw -------');
        });

        socket.on('kickOut', function () {
            console.log('------ kickOut -------');
        });

        socket.on('subscribe', function () {
            console.log('------ subscribe -------');
        });

        socket.on('subscribeFail', function () {
            console.log('------ subscribeFail -------');
        });

        socket.on('unsubscribe', function () {
            console.log('------ unsubscribe -------');
        });

        socket.on('authStateChange', function (data) {
            console.log('------ authStateChange -------',data);
        });

        socket.on('unsubscribe', function () {
            console.log('------ unsubscribe -------');
        });

        socket.on('subscribeStateChange', function (data) {
            console.log('------ subscribeStateChange -------',data);
        });

        socket.on('subscribeRequest', function () {
            console.log('------ subscribeRequest -------');
        });

        socket.on('authenticate', function () {
            console.log('------ authenticate -------');
        });

        socket.on('deauthenticate', function () {
            console.log('------ deauthenticate -------');
        });

        socket.on('message', function (data) {
            console.log('------ message -------',data);
        });
    });

    $('#login-button').on('click', function (e) {
        socket.emit('login',{
            phone:$('#phone').val(),
            password:$('#password').val()
        }, function (err) {
            if(err){
                logged_in = false;
                $('#login-errors-message').show().text(err);
            }else{
                logged_in = true;
                $('nav').show();
                var hash = window.location.hash.slice(2);
                notify('start-loading');
                location.href = '#/home';
                notify('build-home');
            }
        });
    });

    $('.logout').on('click', function () {
        socket.emit('logout',null, function (err) {
            if(!err){
                logged_in = false;
                $('nav').hide();
                location.href = "#/login";
                notify('build-login');
            }
        });
    });
});

$(function () {
    observe('build-home', function () {
        $('nav').show();
        notify('finish-loading');
        $('section[data-route="home"]').show();
    });
});

$(function () {
    observe('build-about', function () {
        $('nav').show();
        notify('finish-loading');
        $('section[data-route="about"]').show();
    });
});

$(function () {
    observe('build-login', function () {
        $('nav').hide();
        notify('finish-loading');
        $('section[data-route="login"]').show();
    });
});

$(document).ready(function () {
    notify('connect-to-server');
});