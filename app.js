var express = require('express'),
    restful = require('node-restful'),
    mongoose = restful.mongoose;
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');

app.use(bodyParser.json());

//used to parse form data
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.query());

/* DB */
// mongoose.connect("mongodb://192.168.21.42/resources");

// //generated routes with inline schema definition
// var Resource = app.resource = restful.model('resource', mongoose.Schema({
//     title: 'string',
//     year: 'number'
// })).methods(['get', 'post', 'put', 'delete']);

// //generated routes with schema defined in ../models folder
// var User = require("./models/user");
// var usersRest = restful.model('User', User.schema).methods(['get', 'post', 'put', 'delete']);

// Resource.register(app, '/resources');
// usersRest.register(app, '/users');

// //this is how to save a Resourse object to the DB
// var test = new Resource();
// test.title = "title";
// test.year = 1992;
// //acts as an insert
// test.save();


// DATA
var connectedUsers = [];
var userId = 0;

//-----------custom routes------------
app.get('/', function(req, res){
  res.sendfile('index.html');
});

io.on("connection", function(socket){
  console.log('a user connected');

  socket.on("login", function(credentials){
    connectedUsers.push({userId: userId, user : credentials["user"], pass : credentials["pass"], socketId : socket.id, inGame : false});
    io.sockets.connected[socket.id].emit('didLogin', {"userId": userId, "connectedUsers" : connectedUsers});
    userId++;
    socket.emit('playerJoined', {});
  });

  socket.on('getAvailablePlayers', function() {
    io.sockets.connected[socket.id].emit('availablePlayers', {"availablePlayers": getAvailablePlayers(userIdFromUserSocketId(socket.id))});
  });

  socket.on('disconnectUser', function (userId) {
    for(var i in connectedUsers){
        if(connectedUsers[i]["userId"] == userId["userId"]){
            connectedUsers.splice(i,1);
            break;
        }
    }
  });

  socket.on('requestPlay', function (gameInfo) {
    // console.log(gameInfo["opponentId"]);
    io.sockets.connected[userSocketIdFromUserId(gameInfo["opponentId"])].emit('playRequest', {"gameType" : gameInfo["gameType"], "requesterId" : gameInfo["requesterId"]});
  });

  socket.on('addLine', function(data) {
    io.sockets.connected[userSocketIdFromUserId(data["opponentId"])].emit('lineAdded', {"row" : data["row"], "column" : data["column"], "isVertical" : data["isVertical"]});
  });

  socket.on('acceptGame', function(data) {
    // console.log(data["opponentId"]);
    io.sockets.connected[userSocketIdFromUserId(data["opponentId"])].emit('gameAccepted', {});
  });

  socket.on('denyGame', function (data) {
    // console.log("DENY GAME");
    // console.log(data["opponentId"]);
    io.sockets.connected[userSocketIdFromUserId(data["opponentId"])].emit('gameDenied', {});
  });
});

function getAvailablePlayers(userId)
{
    dropDisconnectedUsers();
    var availablePlayers = [];
    for(var i in connectedUsers){
        if(connectedUsers[i]["userId"] != userId){
            availablePlayers.push(connectedUsers[i]);
        }
    } 
    return availablePlayers;
}

function userSocketIdFromUserId(userId) {
    for(var i in connectedUsers){
        if(connectedUsers[i]["userId"] == userId){
            return connectedUsers[i].socketId;
        }
    }
}

function userIdFromUserSocketId(socketId) {
    for(var i in connectedUsers){
        if(connectedUsers[i]["socketId"] == socketId){
            return connectedUsers[i].userId;
        }
    }
}

function dropDisconnectedUsers() {
    for(var i in connectedUsers) {
        if(!io.sockets.connected[connectedUsers[i].socketId]) {
            connectedUsers.splice(i,1);
        }
    }
    console.log(connectedUsers);
}

setInterval(function() {
    dropDisconnectedUsers();
}, 1000);


app.get("/hello", function(req, res){
    res.json({message:"hello", from:"server"});
});

app.get("/status", function(req, res){
    res.status(200).end();
});

http.listen(3001, function(){
  console.log('listening on *:3001');
});

app.post("/post", function(req, res){
    console.log(req.body);
    res.json(req.body);
});

app.listen(3000);
