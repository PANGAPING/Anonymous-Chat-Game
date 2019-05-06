var express = require("express");

var app = new express();

var http = require("http").Server(app);
var io = require("socket.io")(http);


app.use(express.static("./dist"));

http.listen(8000);

var onlineUsers = {};

var sockets = {};

var broadcastMessages = [];

var onlineCount = 0;

io.on("connection",function(socket){
    socket.on("login",function(obj){
        if (obj.name in onlineUsers){
            socket.emit("nameExist")   
        }
        else{
           if(obj.name){
           		sockets[obj.name] = socket
            	socket.id = obj.name;
            	onlineUsers[obj.name] = obj;
            	onlineCount += 1;
     			socket.emit("loginSuccess",{name:obj.name})
            	socket.emit("initFinders",onlineUsers)
           } 
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
    	console.log("NewPrivateMessage"+obj.target)
    	console.log(onlineUsers[obj.target].obj)

        if (onlineUsers[obj.target].obj == socket.id){
            sockets[obj.target].emit("newPrivateMessage",{from:socket.id,content:obj.content})
            socket.emit("newPrivateMessage",{from:socket.id,content:obj.content})
        }
        else{
        	console.log("不是这个对象")
        }
    })

    socket.on("newBroadcastMessage",function(obj){
        var newBroadcastMessage = {from:socket.id,content:obj.content}
        broadcastMessages.push(newBroadcastMessage)
        io.emit("newBroadcastMessage",newBroadcastMessage)
    })


    socket.on("requestObj",function(obj){
        var requestUser = socket.id
        var beRequestUser = obj.name
        if (!onlineUsers[requestUser].obj&&!onlineUsers[beRequestUser].obj){
            sockets[beRequestUser].emit("requestObj",{name:socket.id})
            onlineUsers[requestUser].requestingUser = beRequestUser
            onlineUsers[beRequestUser].beRequestingUser = requestUser
        }
    })

    socket.on("refuseRequest",function(){
        var beRequestingUser = onlineUsers[socket.id].beRequestingUser
        if (beRequestingUser){
            sockets[beRequestingUser].emit("refuseRequest")
            onlineUsers[beRequestingUser].requestingUser = ""
            onlineUsers[socket.id].beRequestingUser = ""
        }
    })

    socket.on("acceptRequest",function(){
        var beRequestingUser = onlineUsers[socket.id].beRequestingUser
        if (beRequestingUser){
            sockets[beRequestingUser].emit("acceptRequest",{name:socket.id})
            onlineUsers[beRequestingUser].requestingUser = ""
            onlineUsers[socket.id].beRequestingUser = ""
            onlineUsers[beRequestingUser].obj = socket.id
            onlineUsers[socket.id].obj = beRequestingUser
        }
    })

    socket.on("disconnect",function(){
        delete onlineUsers[socket.id]
        onlineCount -= 1;
        io.emit("delFinder",{name:socket.id})
    })
})
