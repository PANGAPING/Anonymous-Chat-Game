var express = require("express");

var app = new express();

var http = require("http").Server(app);
var io = require("socket.io")(http);


app.use(express.static("./public"));

http.listen(8000);

var onlineUsers = {};

var sockets = {};

var broadcastMessages = [];

var onlineCount = 0;

io.on("connection",function(socket){

    console.log("There is some one connection")
    socket.on("login",function(obj){
        if (obj.name in onlineUsers){
            socket.emit("nameExist")   
        }
        else{
            sockets[obj.name] = socket
            socket.id = obj.name;
            onlineCount += 1;
            socket.emit("initFinders",onlineUsers)
        }    
    })

    socket.on("move",function(obj){
        var moveUser = onlineUsers[socket.id]
        moveUser.position = obj.position
        moveUser.direction = obj.direction
    })

    socket.on("updateFinders",function(){
        socket.emit("updateFinders",onlineUsers)
    })

    socket.on("newPrivateMessage",function(obj){
        sockets[obj.target].emit("newPrivateMessage",{from:socket.id,content:obj.content})
    })

    socket.on("newBroadcastMessage",function(obj){
        var newBroadcastMessage = {from:socket.id,content:obj.content}
        broadcastMessages.push(newBroadcastMessage)
        io.emit("newBroadcastMessage",newBroadcastMessage)
    })

    socket.on("disconnect",function(){
        delete onlineUsers[socket.io]
        onlineCount -= 1;
        io.emit("delFinder",{name:socket.id})
    })
})
