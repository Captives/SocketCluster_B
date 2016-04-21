var fs = require('fs');
var express = require('express');
var serveStatic = require('serve-static');
var path = require('path');

module.exports.run = function (worker) {
    console.log('   >> Worker PID:', process.pid);

    var app = require('express')();
    var mysql = require('mysql');
    var pool = mysql.createPool({
        connectionLimit: 500,
        host: "192.168.10.25",
        user: "root",
        password: "123456",
        database: "example",
        debug: false
    });

    var crypto = require('crypto');
    var sha256 = require('sha256');
    var httpServer = worker.httpServer;
    var scServer = worker.scServer;
    httpServer.on('request', app);

    //使HTML格式规范
    app.locals.pretty = true;
    app.set("views", __dirname + "/views");
    app.set("view engine", "jade");
    app.use(serveStatic(path.resolve(__dirname, 'public')));

    app.get('*', function (req, res) {
       res.render('index',{
           title:'Test App'
       });
    });

    /*
     In here we handle our incoming realtime connections and listen for events.
     */
    scServer.on('connection', function (socket) {
        console.log("client " + socket.id + " has connected # pid=", process.pid);
        socket.on("login", function (data, respond) {
            var sql = "SELECT * FROM users WHERE phone = ?";
            pool.query(sql,[data.phone], function (err,rows) {
                if(err){
                    console.log(err);
                    respond(err);
                }else{
                    if(rows.length){
                        //var password = sha256(data.password);
                        var password = crypto.createHash('md5').update(data.password).digest('hex');
                        if(password == rows[0].password){
                            socket.setAuthToken({phone:data.phone});
                            respond(null);
                        }else{
                            respond("密码不匹配!");
                        }
                    }else{
                        respond("该账户不存在!");
                    }
                }
            });
        });

        socket.on('logout', function (data, respond) {
            socket.deauthenticate();
            respond(null);
        });
        
        socket.on('raw', function (data) {
            console.log('------ raw -------',data);
        });

        socket.on('disconnect', function (data) {
            console.log("Client " + socket.id + " has disconnected!");
        });

        socket.on('subscribe', function (data) {
            console.log('------ subscribe -------',data);
        });

        socket.on('unsubscribe', function (data) {
            console.log('------ unsubscribe -------',data);
        });

        socket.on('subscribe', function (data) {
            console.log('------ subscribe -------',data);
        });

        socket.on('badAuthToken', function (data) {
            console.log('------ badAuthToken -------',data);
        });

        socket.on('message', function (data) {
            console.log('------ message -------',data);
        });

        socket.on('error', function (err) {
            console.error(err);
        });
    });
};