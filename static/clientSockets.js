
function assignSocketResponses() {
	server.on('connected', function () {
	});

	server.on('gamecreated', function(data) {
		board.gameId = data.game;
	});

	server.on('gridrequest', function() {
		board.sendGrid();
	});

	server.on('scorerequest', function() {
		board.sendScore();
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
}