var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , mongo = require('mongodb')
  , mongoExpressAuth = require('mongo-express-auth');

var handler = new GameInfoHandler();
var playerList = [];
var gameList = [];

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

function openDb(onOpen, collectionName) {
    client.open(onDbReady);

    function onDbReady(error){
        if (error)
            throw error;
        client.collection(collectionName, onCollectionReady);
    }

    function onCollectionReady(error, collection){
        if (error)
            throw error;
        onOpen(collection);
    }
}

function closeDb(){
    client.close();
}

function loadPlayerInfo(name, cb) {

  function onInfoGet(collection) {
    var query = {name: name};

    function onSearch(err, result) {
      if(err) {
        cb(err, null);
      }
      else {
        cb(null, result);
      }
      closeDb();
    }
    collection.findOne(query, onSearch);
  }

  openDb(onInfoGet, 'playerInformation');
}

function insertPlayerInfo(name, cb) {

  function onInfoGet(collection) {
    var ins = new PlayerInfo(name);
    collection.insert(ins, function(err) {
      if(err)
        cb(err, null);
      cb(null, ins);
      closeDb();
    });
    
  }

  openDb(onInfoGet, 'playerInformation');
}

function editPlayerInfo(name, attrs, cb) {

  function onInfoGet(collection) {
    var query = {name: name};
    var updates = { $set : attrs };
    function onSearch(err) {
      if(err)
        cb(err);
      else
        cb(null);
      closeDb();
    }
    collection.update(query, updates, {'multi' : true}, onSearch);
    
  }

  openDb(onInfoGet, 'playerInformation');
}

function PlayerInfo (name) {
  this.name = name;
  this.wins = 0;
  this.losses = 0;
  this.winRatio = 0;
  this.gamesPlayed = 0;
  this.highScore = 0;
  this.longestGameTime = 0;
  this.totalScore = 0;
  this.scoresThisWeek = [{}, {}, {}, {}, {}, {}, {}];
  this.scoreDeltasThisWeek = [{}, {}, {}, {}, {}, {}, {}];
  this.totalBlocksCleared = 0;
  this.redBlocksCleared = 0;
  this.blueBlocksCleared = 0;
  this.greenBlocksCleared = 0;
  this.yellowBlocksCleared = 0;
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
}

function Game(index, player) {
	this.index = index;
  this.name = player.name + "'s game";
  this.players = [player];
  this.status = 0;
  this.winner = undefined;
  this.loser = undefined;
}

Game.prototype.addPlayer = function(p) {
  if(this.players.length < 2) {
    this.players.push(p);
    if(this.players.length === 2) {
      this.start();
      return 'gamestarted!';
    }
    return 'game joined';
  }
  return 'error';
}

Game.prototype.removePlayer = function(p) {
  var i = this.players.indexOf(p);
  if(i >= 0) {
    this.players.splice(i, 1);
    return true;
  }
  return false;
}

Game.prototype.start = function() {
  var t = this;
  this.status = 1;
  this.players.forEach(function(p, i) {
    p.socket.emit('gamestarted');
    p.socket.on('timeUp', function() {
      t.end();
    });
    p.socket.on('lose', function() {
      t.loser = p;
      t.end();
    });
    p.socket.on('blocksend', function(data) {
      var otherPlayer = i === 0 ? 1 : 0;
      t.players[otherPlayer].socket.emit('blockreceive', {blocks : data.blocks})
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
    if(this.loser) {
      this.winner = this.loser === playerA ? playerB : playerA;
    }
    socketA.emit('gameover', {'name': this.winner.name});
    socketB.emit('gameover', {'name': this.winner.name});
    gameList.splice(this.index, 1);
  }
}

function Player(name, socket) {
	this.name = name;
	this.grid = undefined;
  this.socket = socket;
	this.score = 0;
  var t = this;
  this.socket.on('gridupdate', function(data) {
    t.grid = data.grid;
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
  socket.emit('usernamerequest');
  var player;
  var playerListIndex;

  socket.on('username', function(data){
    player = new Player(data.username, socket);
    playerListIndex = playerList.push(player) - 1;
    socket.emit('playerregistered', {index: playerListIndex});
  });

  socket.on('newgamerequest', function(data) {
    var g = new Game(data.name, player);
    handler.add(g);
    var n = handler.nextGameIndex;
    socket.on('quit', function() {
      handler.remove(n);
    });
    socket.emit('gamecreated', {'game': g.id});
  });

  socket.on('joinrequest', function(data) {
    var game = handler.gameList[handler.nextGameIndex];
    if(game) {
      game.addPlayer(player);
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
    playerList.splice(playerListIndex, 1);
  });
});

/////////////////////
// Routes
/////////////////////

app.get('/', function (req, res) {
  mongoExpressAuth.checkLogin(req, res, function(err){
    if (err)
      res.sendfile(__dirname + '/static/login.html');
    else
      res.sendfile(__dirname + '/static/mainGame.html');
  });
});

app.get('/help', function (req, res) {
  res.sendfile(__dirname + '/static/help.html');
});

app.get('/me', function(req, res) {
  mongoExpressAuth.checkLogin(req, res, function(err){
    if (err)
      res.send(err);
    else {
      mongoExpressAuth.getAccount(req, function(err, result){
        if (err)
          res.send(err);
        else {
          loadPlayerInfo(result.username, function(err, data){
            if(err)
              res.send(err);
            else
              res.send(data);
          });
        }
      });
    }
  });
});

app.get('/static/:file', function(req, res) {
  res.sendfile(__dirname + '/static/' + req.params.file);
});

app.get('/static/images/:imagefile', function(req, res) {
  res.sendfile(__dirname + '/static/images/' + req.params.imagefile);
});

app.get('/:user/profile', function(req, res) {
  res.sendfile(__dirname + '/static/profilePage.html');
});

app.get('/api/playerInfo/get/:user', function(req, res) {
  loadPlayerInfo(req.params.user, function(err, data) {
    if(err)
      res.send(err);
    else
      res.send(data);
  })
});

app.get('/gamesList', function(req, res) {
  var responseList = [];
  gameList.forEach(function(e) {
    var ins = {};
    ins.index = e.index;
    ins.name = e.name;
    ins.numPlayers = e.players.length;
    responseList.push(ins);
  });
  res.send(responseList);
});

app.get('/playerList', function(req, res) {
  var responseList = [];
  playerList.forEach(function(e, i) {
    var ins = {};
    ins.name = e.name;
    ins.index = i;
    responseList.push(ins);
  });
  res.send(responseList);
});

app.post('/createGame', function(req, res) {
  mongoExpressAuth.checkLogin(req, res, function(err){
    if(err)
      res.send(err);
    else {
      var player = playerList[req.body.index];
      var game = new Game(gameList.length, player);
      gameList.push(game);
      res.send({index: gameList.length - 1});
    }
  });
});

app.post('/joinGame', function(req, res) {
  mongoExpressAuth.checkLogin(req, res, function(err) {
    if(err)
      res.send(err);
    else {
      var player = playerList[req.body.playerIndex];
      var game = gameList[req.body.gameIndex];
      if(game) {
        var response = game.addPlayer(player);
        res.send(response);
      }
      else
        res.send('gameIndexError');
    }
  });
});

app.post('/leaveGame', function(req, res) {
  mongoExpressAuth.checkLogin(req, res, function(err) {
    if(err)
      res.send(err);
    else {
      var player = playerList[req.body.playerIndex];
      var game = gameList[req.body.gameIndex];
      if(game) {
        if(game.removePlayer(player)) {
          res.send('success');
        }
        else {
          res.send('leavingError');
        }
      }
      else {
        res.send('gameIndexError');
      }
    }
  });
});

app.post('/login', function(req, res) {
  mongoExpressAuth.login(req, res, function(err) {
    if(err) 
      res.send(err);
    else
      res.send('nailed it');
  });
});

//GET RID OF THIS LATER
app.post('/addInfo', function(req, res) {
  mongoExpressAuth.checkLogin(req, res, function(err) {
    if(err)
      res.send(err);
    else {
      insertPlayerInfo(req.session.username, function(err, result) {
        if(err)
          res.send(err);
        else
          res.send(result);
      });
    }
  });
});

app.post('/playerupdate', function(req, res) {
  mongoExpressAuth.checkLogin(req, res, function(err) {
    if(err)
      res.send(err);
    else {
      editPlayerInfo(req.session.username, req.body.updates, function(err) {
        if(err)
          res.send(err);
        else
          res.send('success');
      })
    }
  })
});

app.post('/logout', function(req, res) {
  mongoExpressAuth.logout(req, res);
  res.send('peace bro');
});

app.post('/register', function(req, res) {
  mongoExpressAuth.register(req, function(err) {
    if(err)
      res.send(err);
    else {
      var username = req.body.username;
      insertPlayerInfo(username, function(err, result) {
        if(err)
          res.send(err);
        else
          res.send('one of us');
      });
    }
  });
});