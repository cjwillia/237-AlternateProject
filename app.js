var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , mongo = require('mongodb')
  , mongoExpressAuth = require('mongo-express-auth');

var handler = new GameInfoHandler();

//DB stuff

var host = 'localhost';
var port = mongo.Connection.DEFAULT_PORT;
var optionsWithEnableWriteAccess = { w: 1 };
var dbName = 'gameDb';

var client = new mongo.Db(
    dbName,
    new mongo.Server(host, port),
    optionsWithEnableWriteAccess
);

mongoExpressAuth.init({
    mongo: { 
        'dbName': dbName,
        collectionName: 'accounts'
    }
}, function(){
  server.listen(8888);
});

function generateKey(len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for(var i = 0; i < len; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: generateKey(10) }));

function openDb(onOpen) {
    client.open(onDbReady);

    function onDbReady(error){
        if (error)
            throw error;
        client.collection('playerInformation', onplayerInformationReady);
    }

    function onplayerInformationReady(error, playerInformation){
        if (error)
            throw error;

        onOpen(playerInformation);
    }
}

function closeDb(){
    client.close();
}


function PlayerInfo (name) {
  this.name = name;
  this.wins = 0;
  this.totalScore = 0;
}

//socket stuff

function GameInfoHandler() {
  this.gameList = [];
  this.nextGameIndex = 0;
}

GameInfoHandler.prototype.add = function(g) {
  this.gameList.push(g);
}

GameInfoHandler.prototype.remove = function(i) {
  this.gameList.splice(i, 1);
  this.nextGameIndex--;
}

function Game(id, player) {
	this.id = id;
  this.players = [player];
  this.status = 0;
  this.winner = undefined;
}

Game.prototype.addPlayer = function(p) {
  if(this.players.length < 2) {
    this.players.push(p);
    if(this.players.length === 2) {
      this.start();
    }
  }
}

Game.prototype.start = function() {
  var t = this;
  this.status = 1;
  handler.nextGameIndex++;
  this.players.forEach(function(p) {
    p.socket.emit('gamestarted');
    p.socket.on('timeUp', function() {
      t.end();
    });
    p.socket.on('lose', function() {
      t.end();
    });
  });
  var f = function() {
    t.distributeUpdate();
  }
  setTimeout(f, 200);
}

Game.prototype.end = function() {
  this.status = 2;
}

Game.prototype.distributeUpdate = function() {
  var playerA = this.players[0];
  var playerB = this.players[1];
  var socketA = playerA.socket;
  var socketB = playerB.socket;
  if(this.status === 1) {
    var t = this;
    var f = function() {
      t.distributeUpdate();
    }
    socketA.emit('update', { score: playerB.score, grid: playerB.grid });
    socketB.emit('update', { score: playerA.score, grid: playerA.grid });
    this.winner = playerA.score > playerB.score ? playerA : playerB;
    setTimeout(f, 200);
  }
  if(this.status === 2) {
    socketA.emit('gameover', {'name': this.winner.name});
    socketB.emit('gameover', {'name': this.winner.name});
  }
}

function Player(name, grid, socket) {
	this.name = name;
	this.grid = grid;
  this.socket = socket;
	this.score = 0;
  var t = this;
  this.socket.on('gridupdate', function(data) {
    t.grid = data.grid;
    socket.emit('test');
  });
  this.socket.on('scoreupdate', function(data) {
    t.score = data.score;
  });
}

Player.prototype.getGrid = function() {
  this.socket.emit('gridrequest');
}

Player.prototype.getScore = function() {
  this.socket.emit('scorerequest');
}

io.sockets.on('connection', function(socket) {
  socket.emit('connected');

  socket.on('username', function(data){
    socket.set('nickname', data.username, function() {
      var send = [];
      handler.gameList.forEach(function(g){
        var o = {};
        o.players = [];
        g.players.forEach(function(p, i){
          o.players[i] = p.name;
        });
        o.id = g.id;
        send.push(o);
      });
      socket.emit('ready', {'gamelist': send});
    });
  });

  socket.on('newgamerequest', function(data) {
    var p = new Player(data.name, data.grid, socket);
    var g = new Game(data.name, p);
    handler.add(g);
    socket.emit('gamecreated', {'game': g.id});
  });

  socket.on('joinrequest', function(data) {
    var game = handler.gameList[handler.nextGameIndex];
    if(game) {
      var p = new Player(data.name, data.grid, socket);
      game.addPlayer(p);
      socket.emit('gamejoinsuccess', {'game': game.id});
    }
    else {
      socket.emit('gamejoinfail');
    }
  });

  socket.on('gridrequest', function() {

  });

  socket.on('scorerequest', function() {

  });

  socket.on('disconnect', function() {

  });
});

//routes

app.get('/', function (req, res) {
  mongoExpressAuth.checkLogin(req, res, function(err){
    if (err)
      res.sendfile(__dirname + '/static/login.html');
    else
      res.sendfile(__dirname + '/static/mainGame.html');
  });
});

app.get('/me', function(req, res){
  mongoExpressAuth.checkLogin(req, res, function(err){
    if (err)
      res.send(err);
    else {
      mongoExpressAuth.getAccount(req, function(err, result){
        if (err)
          res.send(err);
        else 
          res.send(result.username);
      });
    }
  });
});

app.get('/static/:file', function(req, res) {
  res.sendfile(__dirname + '/static/' + req.params.file);
});

app.post('/login', function(req, res) {
  mongoExpressAuth.login(req, res, function(err) {
    if(err) 
      res.send(err);
    else
      res.send('nailed it');
  });
});

app.post('/logout', function(req, res) {
  mongoExpressAuth.logout(req, res);
  res.send('peace bro');
});

app.post('/register', function(req, res) {
  mongoExpressAuth.register(req, function(err) {
    if(err)
      res.send(err);
    else
      res.send('one of us');
  });
});