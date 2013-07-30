
function assignSocketResponses() {
	server.on('usernamerequest', function() {
		server.emit('username', {username: scr.playerInfo.username});
	});

	server.on('playerregistered', function(data) {
		scr.playerIndex = data.index;
	});

	server.on('gamecreated', function(data) {
		scr.gameId = data.game;
	});

	server.on('gridrequest', function() {
		board.sendGrid();
	});

	server.on('scorerequest', function() {
		board.sendScore();
	});

	server.on('update', function(data) {
		board.opponentBoard.updateGrid(data.grid);
		board.opponentBoard.updateScore(data.score);
	});

	server.on('ready', function(data) {
		console.log(data.gamelist);
		scr.gameList = data.gamelist;
		scr.menubarGameList();
	});

	server.on('gamejoinfail', function() {
		alert('Error joining game.');
	});

	server.on('gamejoinsuccess', function(data) {
		board.gameId = data.game;
	});

	server.on('gamestarted', function(){
		scr.liveGame();
	});

	server.on('gameover', function(winner) {
		board.gameOver();
		if(winner.name === scr.playerInfo.username) {
			menu.multiGameOver(true);
		}
		else {
			menu.multiGameOver(false);
		}
	});

	server.on('blockreceive', function(data) {
		board.blocksReceived = data.blocks;
	});
}