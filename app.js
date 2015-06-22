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
  // console.log(socket.request);

  socket.on("login", function(credentials){
    // if(connectedUsers)
    connectedUsers.push({userId: userId, user : credentials["user"], pass : credentials["pass"]});
    console.log(connectedUsers);
    io.emit('didLogin', {"userId": userId, "connectedUsers" : connectedUsers});
    userId++;
  });

  socket.on('disconnectUser', function (userId) {
    for(var i in connectedUsers){
        if(connectedUsers[i]["userId"] == userId["userId"]){
            connectedUsers.splice(i,1);
            break;
        }
    }
    console.log(connectedUsers);
  });
});



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

// app.get("/resources/title/:title", function(req, res){
//     Resource.findOne({title:req.params['title']}, function(err, data){
//         if(!err){
//             res.json(data);
//         } else {
//             res.status(500).end();
//         }
//     });
// });

app.listen(3000);
