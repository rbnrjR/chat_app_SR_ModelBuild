const express = require('express'),
      app = express(),
      server = require('http').createServer(app),
      io = require('socket.io').listen(server),
      redis = require('redis'), //redis
      client = redis.createClient(), //redisClient
      mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/rubanraj');
const db = mongoose.connection;
let Chat = require('./schema/chatSchema.js'),
    chat = new Chat(),
    users = {},
    chatArray = [],
    i = 1;
client.on('connect', function() {
  console.log('connected to redis');
});
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('connected - schema');
});
server.listen(8080);
/*mongoose.connect('mongodb://localhost/rubanraj',function(err){
	if(err){
		console.log("error");
	}
	else{
		console.log("connected to db");
	}
});*/
console.log("server");
app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html');
});
io.sockets.on('connection',function(socket) {
  socket.on('new user',function(data,callback){
  	if(data in users){
  		callback(false);
  	}
  	else{
  		callback(true);
  		socket.nickname=data;
  		users[socket.nickname]=socket;
  		//nicknames.push(socket.nickname);
  		updateNicknames();
  	}
  });
  function updateNicknames(){
    io.sockets.emit('usernames', Object.keys(users));
  }
  socket.on('send message', function(data,callback){
    var msg = data.trim();
    	/*var newMsg=new ({msg:msg,nick:socket.nickname});
      //for MongoDB ---->
    	newMsg.save(function(err){
        if(err) throw err;
        io.sockets.emit('new message',{msg:msg,nick:socket.nickname});
      });*/
      //redisClient ---->
      client.hmset('chatText:'+i, 'msg', msg, 'nick', socket.nickname, function(err, reply) {
        console.log(reply);
        io.sockets.emit('new message',{msg:msg,nick:socket.nickname});
        //i++;
      });
      if(i%5 == 0){
        for (var j = 1; j <= i; j++) {
          client.hgetall('chatText:'+j, (err, reply) => {
            if (err) {
              console.log(err);
            }
            /*db.collection('details').save(reply, (err) => {
              if (err) {
                console.log(err);
              }
            });*/
            chatArray.push(reply);
            //console.log('alen : '+chatArray.length);
            if (chatArray.length==5) {
              console.log(chatArray);
              dbcall();
            }

          });
        }
        function dbcall () {
          chat.messages = (chatArray);
          chat.save();
        }
        i = 0; chatArray = [];
      }
      i++;
      //console.log("i++ val = "+i);
  });

  socket.on('disconnect',function(data){
    if(!socket.nickname) return;
    delete users[socket.nickname];
    updateNicknames();
  });
});
