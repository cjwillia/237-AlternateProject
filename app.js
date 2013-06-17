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
  handler.add(this);
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
}

Game.prototype.end = function() {
  this.status = 2;
}

Game.prototype.distributeUpdate = function() {
  if(this.status === 1) {
    var playerA = this.players[0];
    var playerB = this.players[1];
    var socketA = playerA.socket;
    var socketB = playerB.socket;
    socketA.emit('update', { score: playerB.score, grid: playerB.grid });
    socketB.emit('update', { score: playerA.score, grid: playerA.grid });
  }
}

function Player(name, grid, socket) {
	this.name = name;
	this.grid = grid;
  this.socket = socket;
	this.score = 0;
  this.socket.on('gridupdate', function(data) {
    this.grid = data.grid;
    socket.emit('test');
  });
  this.socket.on('scoreupdate', function(data) {
    this.score = data.score;
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

  socket.on('newgamerequest', function(data) {
    var p = new Player(data.name, data.grid, socket);
    var g = new Game(data.name, p);
    socket.emit('gamecreated', {'game': g.id});
  });

  socket.on('joinrequest', function(data) {
    var p = new Player(data.name, data.grid, socket);
    handler.gameList[handler.nextGameIndex].addPlayer(p);
  });

  socket.on('disconnect', function() {

  });
});