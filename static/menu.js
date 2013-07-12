function Menu(c) {
	this.state = "main";
	this.horizontalPadding = viewportWidth < viewportHeight ? viewportWidth * 0.05 : viewportWidth * 0.1;
	this.buttonColor = c;
	this.buttons = {};
}

function Button(t, f) {
	this.text = t;
	this.action = f;
}

Menu.prototype.updateDisplayParams = function() {
	this.horizontalPadding = viewportWidth < viewportHeight ? viewportWidth * 0.05 : viewportWidth * 0.1;
}

Menu.prototype.generateButtons = function() {
	//generate Play Single Player
	var singlePlayer = function() {
		scr.singleGame();
	}
	this.buttons.singlePlayer = new Button("Single Player", singlePlayer);

	var t = this;
	//generate Go Online
	var online = function() {
		t.state = "multiplayer";
		t.draw();
	}
	this.buttons.online = new Button("Online", online);
	//generate Create Game
	var create = function() {
		if(scr.username !== "NONE"){
			server.emit('newgamerequest', {name: scr.username});
			t.state = "waiting";
			t.draw();
		}
		else {
			alert('You need to be signed in to make a game.');
		}
	}
	this.buttons.createGame = new Button("Create Game", create);

	//generate Join Game
	var join = function() {
		if(scr.username !== "NONE") {
			server.emit('joinrequest', {name : scr.username});
		}
		else {
			alert('You need to be signed in to join a game.');
		}
	}
	this.buttons.joinGame = new Button("Join Game", join);

	//generate Main Menu
	var mainMenu = function() {
		t.state = "main";
		t.draw();
	}
	this.buttons.mainMenu = new Button("Main Menu", mainMenu);
	//generate logout
	var logout = function() {
		function redirHome() {
			window.location = '/';
		}
		$.post('/logout', undefined, redirHome);
	}
	this.buttons.logout = new Button("Logout", logout);

	//generate back to online
	var backToOnline = function() {
		server.emit('quit');
		online();
	}
	this.buttons.backToOnline = new Button("Quit", backToOnline);

	var endGame = function() {
		if(board.score > scr.highScore) {
			scr.highScore = board.score;
		}
		sendInfoUpdate();
		board = undefined;
		scr.state = 'menu';
		menu.state = 'main';
		menu.draw();
	}
	this.buttons.endGame = new Button("End", endGame);
}

Menu.prototype.draw = function() {
	r.clear();
	this.generateButtons();
	switch(this.state){
		case "main":
			this.drawMenu([this.buttons.singlePlayer, this.buttons.online, this.buttons.logout]);
			break;
		case "multiplayer":
			this.drawMenu([this.buttons.createGame, this.buttons.joinGame, this.buttons.mainMenu]);
			break;
		case "waiting":
			this.drawWaiting();
			this.drawMenu([this.buttons.backToOnline]);
			break;
	}
}

Menu.prototype.drawWaiting = function() {
	r.text(viewportWidth / 2, viewportHeight / 5, "Waiting for other player...").attr('font-size', viewportHeight / 8);
}

Menu.prototype.drawMenu = function(buttons) {
	var n = buttons.length;
	var regions = n * 2 + 1;
	var height = viewportHeight / regions;
	var width = viewportWidth - (this.horizontalPadding * 2);
	for(var i = 0; i < n; i++) {
		var x = this.horizontalPadding;
		var y = height + i*height*2;
		this.drawButton(x, y, width, height, buttons[i])
	}
}

Menu.prototype.drawButton = function(x, y, width, height, button) {
	r.setStart();
	var rect = r.rect(x, y, width, height).attr({ 'fill' : this.buttonColor });
	var cx = x + width / 2;
	var cy = y + height / 2;
	var text = r.text(cx, cy, button.text).attr({ 'fill' : "#fff", 'font-size' : height/2});
	var all = r.setFinish();
	all.click(button.action);
	all.hover(function() {
		all.attr('opacity', 0.75);
	},
	function() {
		all.attr('opacity', 1);
	}
	);
}

Menu.prototype.drawMiniWindow = function(line1, line2) {
	r.rect(0, 0, viewportWidth, viewportHeight).attr({'opacity': 0.3, 'fill' : "#3D2230"});
	var windowLeft = viewportWidth / 4;
	var windowTop = viewportHeight / 4;
	var windowWidth = viewportWidth / 2;
	var windowHeight = viewportHeight / 2;
	var buttonLeft = windowLeft + viewportWidth / 8;
	var buttonTop = windowTop + windowHeight - viewportHeight / 6;
	var buttonWidth = windowWidth / 2;
	var buttonHeight = windowHeight / 6;
	r.rect(windowLeft, windowTop, windowWidth, windowHeight).attr('fill', '#aaa');
	var fontsize = windowHeight / 6;
	var text1height = windowTop + fontsize;
	var text2height = text1height + fontsize;
	var textattrs = {'font-size': fontsize, 'fill' : '#fff'};
	r.text(windowWidth, text1height, line1).attr(textattrs);
	r.text(windowWidth, text2height, line2).attr(textattrs);
	this.drawButton(buttonLeft, buttonTop, buttonWidth, buttonHeight, this.buttons.endGame);
}

Menu.prototype.soloGameOver = function() {
	var line1 = "Game Over!";
	var line2 = "Your Score: " + board.score;
	scr.totalScore += board.score;
	this.drawMiniWindow(line1, line2);
}

Menu.prototype.multiGameOver = function(won) {
	var line1;
	var line2;
	scr.totalScore += board.score;
	if(won) {
		scr.wins += 1;
		line1 = "You Win!";
		line2 = "Win Total: " + scr.wins;
	}
	else {
		line1 = "You lost :/";
		line2 = "Lifetime score: " + scr.totalScore;
	}
	this.drawMiniWindow(line1, line2)
}