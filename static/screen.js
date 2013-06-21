function Screen() {
	this.state = "menu";
	this.allowTyping = false;
	this.gameId = undefined;
	this.gameList = [];
	this.username = "NONE";
	this.selectedGame = "NONE";
}

Screen.prototype.parseCommand = function() {
	var inp = $("#textbar")[0].value;
	//temporary functionality
	this.username = inp;
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
		var username = $('#username_field')[0].value;
		server.emit('username', { 'username': username });
		scr.username = username;
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
	
}

Screen.prototype.liveGame = function() {
	this.state = "liveGame";
	var boardx = viewportWidth / 10;
	var boardy = viewportHeight / 5;
	var boardWidth = viewportWidth / 5;
	var boardHeight = viewportHeight * 3 / 5;
	board = new Board(boardx, boardy, boardWidth, boardHeight, rows, cols, colors, true);
	board.init();
}