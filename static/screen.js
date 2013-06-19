function Screen() {
	this.state = "menu";
	this.allowTyping = false;
	this.gameList = [];
	this.username = "NONE";
}

Screen.prototype.menu = function() {
	this.state = "menu";
	menu = new Menu();
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
	console.log('gl');
	var content = $("#menubarContent");
	content.html("");
	var createButton = $("<button>");
	createButton.attr('id', 'createButton');
	createButton.html('Create Game');
	createButton.click(function() {
		server.emit('newgamerequest');
	});
	var joinButton = $("<button>");
	joinButton.attr('id', 'joinButton');
	joinButton.html('Join Game');
	joinButton.click(function() {
		server.emit('joinrequest');
	});
	content.append(createButton);
	content.append(joinButton);
}

Screen.prototype.liveGame = function() {
	this.state = "liveGame";
	board = new Board(boardx, boardy, boardWidth, boardHeight, rows, cols, colors);
	userControl();
	board.init();
	runGameLoop();
}