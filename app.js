var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

var handler = new GameInfoHandler();

server.listen(8888);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/static/mainGame.html');
});

app.get('/static/:file', function(req, res) {
  res.sendfile(__dirname + '/static/' + req.params.file);
});

app.post('/login', function(req, res) {
});



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
  this.status = 1;
  handler.nextGameIndex++;
  this.players.forEach(function(p) {
    p.socket.emit('gamestarted');
  });
  var t = this;
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
    setTimeout(f, 200);
  }
  if(this.status === 2) {
    socketA.emit('gameover');
    socketB.emit('gameover');
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