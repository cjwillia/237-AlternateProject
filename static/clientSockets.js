
function assignSocketResponses() {
	server.on('connected', function () {
		this.connected = true;
	});

	server.on('gamecreated', function(data) {
		console.log('gameCreated');
		board.gameId = data.game;
		board.sendGrid();
		board.sendScore();
	});

	server.on('gridrequest', function() {
		board.sendGrid();
	});

	server.on('scorerequest', function() {
		board.sendScore();
	});

	server.on('test', function() {
		console.log("flawless victory");
	});
}