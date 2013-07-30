function Screen() {
	this.state = "menu";
	this.allowTyping = false;
	this.playerIndex = undefined;
	this.gameId = undefined;
	this.gameList = [];
	this.selectedGame = "NONE";
	this.playerInfo = {
		username: "NONE",
		highScore: undefined,
		totalScore: undefined,
		longestGameTime: 0,
		wins: 0,
		losses: 0,
		winRatio: 0,
		gamesPlayed: 0,
		scoresThisWeek: [],
		scoreDeltasThisWeek: [],
		totalBlocksCleared: 0,
		redBlocksCleared: 0,
		blueBlocksCleared: 0,
		greenBlocksCleared: 0,
		yellowBlocksCleared: 0
	};
}

Screen.prototype.parseCommand = function() {
	//this may never be implemented! :D
}

Screen.prototype.menubarLogin = function() {
	var content = $("#menubarContent");
	content.html("");
	var username_field = $("<input>");
	username_field.attr({
		"id": "username_field",
		"type": "text",
		"name": "username",
		"placeholder": "username"
	});
	username_field.addClass('menubarcontent');
	var divider = $("<span>");
	divider.addClass("menubardivider");
	var submit = $("<button>");
	submit.html("Submit");
	submit.addClass('menubarcontent');
	content.append(username_field);
	content.append(divider);
	content.append(submit);
	submit.click(function(){
		//chat finctionality one day????
	});
}

Screen.prototype.menubarGameList = function() {
}

Screen.prototype.generateGamelistHtml = function() {
	var res = $("<ul>");
	var l = this.gameList;
	l.forEach(function(g) {
		var li = $("<li>");
		var s = "";
		s += g.id;
		s += ", ";
		s += g.players.length === 0 ? "No current players. :c" : g.players.length + " in game";
		li.click(function(){
			scr.selectedGame = g.id;
			$('.selectedgame').removeClass('selectedgame');
			li.addClass('selectedgame');
		});
		li.html(s);
		res.append(li);
	});
	return res;
}

Screen.prototype.singleGame = function() {
	this.state = "singleGame";
	var boardx = viewportWidth * 4 / 10;
	var boardy = viewportHeight / 5;
	var boardWidth = viewportWidth / 5;
	var boardHeight = viewportHeight * 3 / 5;
	board = new Board(boardx, boardy, boardWidth, boardHeight, rows, cols, colors, false, false);
	board.init();
}

Screen.prototype.infiniteGame = function() {
	this.state = "infiniteGame";
	var boardx = viewportWidth * 4 / 10;
	var boardy = viewportHeight / 5;
	var boardWidth = viewportWidth / 5;
	var boardHeight = viewportHeight * 3 / 5;
	board = new Board(boardx, boardy, boardWidth, boardHeight, rows, cols, colors, false, true);
	board.init();
}

Screen.prototype.liveGame = function() {
	this.state = "liveGame";
	var boardx = viewportWidth / 10;
	var boardy = viewportHeight / 5;
	var boardWidth = viewportWidth / 5;
	var boardHeight = viewportHeight * 3 / 5;
	board = new Board(boardx, boardy, boardWidth, boardHeight, rows, cols, colors, true, false);
	board.init();
}

Screen.prototype.liveBattle = function() {
	this.state = "liveBattle";
	var boardx = viewportWidth / 10;
	var boardy = viewportHeight / 5;
	var boardWidth = viewportWidth / 5;
	var boardHeight = viewportHeight * 3 / 5;
	battleManager.active = true;
	board = new Board(boardx, boardy, boardWidth, boardHeight, rows, cols, colors, true, false);
	board.init();
}