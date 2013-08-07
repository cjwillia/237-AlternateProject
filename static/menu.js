//TODO: make multiplayer workflow easier

function Menu(c) {
	this.state = "main";
	this.horizontalPadding = viewportWidth < viewportHeight ? viewportWidth * 0.05 : viewportWidth * 0.1;
	this.buttonColor = c;
	this.gameListPage = 0;
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
	var t = this;
	//generate Play Single Player
	var singlePlayer = function() {
		t.state = "singleplayer";
		t.draw();
	}
	this.buttons.singlePlayer = new Button("Single Player", singlePlayer);

	//generate Score Attack
	var scoreAttack = function() {
		scr.singleGame();
	}
	this.buttons.scoreAttack = new Button("Score Attack", scoreAttack);

	//generate Infinite Mode
	var infiniteMode = function() {
		scr.infiniteGame();
	}
	this.buttons.infiniteMode = new Button("Infinite Mode", infiniteMode);

	//generate Help
	var help = function() {
		window.location.href = "/help";
	}

	this.buttons.help = new Button("Help", help);

	//generate profile
	var profile = function() {
		window.location.href = "/" + scr.playerInfo.username + "/profile";
	}

	this.buttons.profile = new Button("Profile", profile);

	//generate Go Online
	var online = function() {
		t.state = "multiplayer";
		t.draw();
	}
	this.buttons.online = new Button("Online", online);

	//generate live Game Lobby
	var liveGameLobby = function() {
		battleManager.active = false;
		t.state = "liveGameLobby";
		t.draw();
	}
	this.buttons.liveGameLobby = new Button("Live Score Battle", liveGameLobby);

	//generate live Battle Lobby
	var liveBattleLobby = function() {
		battleManager.active = true;
		t.state = "liveBattleLobby";
		t.draw();
	}
	this.buttons.liveBattleLobby = new Button("Live Block Battle", liveBattleLobby);

	//generate Create Game
	var create = function() {
		createGame();
		t.state = "waiting";
		t.draw();
	}
	this.buttons.createGame = new Button("Create Game", create);

	//generate Join Game
	var join = function() {
		t.state = "gameList";
		t.draw(0);
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
		leaveGame(scr.gameId);
		online();
	}
	this.buttons.backToOnline = new Button("Quit", backToOnline);

	//generate Leave Lobby
	var leaveLobby = function() {
		t.state = "multiplayer";
		battleManager.active = false;
		t.draw();
	}
	this.buttons.leaveLobby = new Button("Back", leaveLobby);

	//generate End Game
	var endGame = function() {
		sendInfoUpdate();
		board = undefined;
		scr.state = 'menu';
		t.state = 'main';
		hideMobileControls();
		t.draw();
	}
	this.buttons.endGame = new Button("End", endGame);
}

Menu.prototype.draw = function(page) {
	r.clear();
	this.generateButtons();
	switch(this.state){
		case "main":
			this.drawMenu([this.buttons.singlePlayer, this.buttons.online, this.buttons.profile, this.buttons.help, this.buttons.logout]);
			break;
		case "singleplayer":
			this.drawMenu([this.buttons.scoreAttack, this.buttons.infiniteMode, this.buttons.mainMenu]);
			break;
		case "multiplayer":
			this.drawMenu([this.buttons.liveGameLobby, this.buttons.mainMenu]);
			break;
		case "liveGameLobby":
			this.drawMenu([this.buttons.createGame, this.buttons.joinGame, this.buttons.leaveLobby]);
			break;
		case "liveBattleLobby":
			this.drawMenu([this.buttons.createGame, this.buttons.joinGame, this.buttons.leaveLobby]);
			break;
		case "waiting":
			this.drawWaiting();
			this.drawMenu([this.buttons.backToOnline]);
			break;
		case "gameList":
			var t = this;
			getGameList(function(list) {
				t.drawGameList(list, page);
			});
			break;
		case "soloGameOver":
			this.redrawSoloGameOver();
			break;
		case "multiGameWon":
			this.redrawMultiGameOver(true);
			break;
		case "multiGameLost":
			this.redrawMultiGameOver(false);
			break;
	}
}

Menu.prototype.drawGameListElementBox = function (x, y, w, h, e) {
	var container = r.rect(x, y, w, h).attr('fill', '#aaa');
	container.hover(function() {
		container.attr('opacity', 0.75);
	},
	function() {
		container.attr('opacity', 1);
	});
	container.click(function() {
		joinGame(e.index);
	});
	var s = e.name;
	var text = adjustTextSize(s, w, h / 2);
	text.attr({x: x + w / 2, y: y + h / 2, fill: '#fff'});

}

Menu.prototype.drawGameListControls = function(space, y, height, page, lastPage) {
	var t = this;
	var buttonWidth = (viewportWidth - space * 4) / 3;
	var cy = y + height / 2;

	var backButton = r.set();
	var backX = space;
	var backCX = backX + buttonWidth / 2;
	backButton.push(r.rect(backX, y, buttonWidth, height).attr('fill', this.buttonColor));
	backButton.push(adjustTextSize('Back', buttonWidth, height / 2).attr({x: backCX, y: cy, fill: '#fff'}));
	backButton.click(function() {
		t.state = "multiplayer";
		t.draw();
	});

	var prevButton = r.set();
	var prevX = space + buttonWidth + space;
	var prevCX = prevX + buttonWidth / 2;
	var prevOpacity = page === 0 ? 0.25 : 1;
	prevButton.push(r.rect(prevX, y, buttonWidth, height).attr({fill: this.buttonColor, opacity : prevOpacity}));
	prevButton.push(adjustTextSize('Prev Page', buttonWidth, height / 2).attr({x:prevCX, y: cy, fill: '#fff'}));
	if(page !== 0) {
		prevButton.click(function() {
			getGameList(function(list) {
				t.drawGameList(list, page-1);
			});
		});
	}

	var nextButton = r.set();
	var nextX = space + (buttonWidth + space) * 2;
	var nextCX = nextX + buttonWidth / 2;
	var nextOpacity = lastPage ? 0.25 : 1;
	nextButton.push(r.rect(nextX, y, buttonWidth, height).attr({fill: this.buttonColor, opacity : nextOpacity}));
	nextButton.push(adjustTextSize('Next Page', buttonWidth, height / 2).attr({x:nextCX, y: cy, fill: '#fff'}));
	if(!lastPage) {
		nextButton.click(function() {
			t.drawGameList(list, page+1);
		});
	}
}

Menu.prototype.drawGameList = function(list, page) {
		var width = 200;
		var height = 150;
		var minPadding = 10;
		var cols = Math.floor(viewportWidth / (width + minPadding));
		var rows = Math.floor(viewportHeight / (height + minPadding)) - 1;
		var total = cols * rows;
		var startIndex = 0 + (page * total);
		var endIndex = startIndex + total;
		var workingList = list.slice(startIndex, endIndex);
		var horizontalSpacing = (viewportWidth - cols * 200) / (cols + 2);
		var verticalSpacing = (viewportHeight - (rows+1) * 150) / (rows + 3);
		var workingListIndex = 0;
		var lastPage = false;
		var firstPage = page === 0;
		for(var i = 0; i < cols; i++) {
			for(var j = 0; j < rows; j++) {
				var listElement = workingList[workingListIndex];
				if(listElement) {
					var x = horizontalSpacing + (horizontalSpacing * i + width * i);
					var y = verticalSpacing + (verticalSpacing * j + height * j);
					this.drawGameListElementBox(x, y, width, height, listElement);
					workingListIndex++;
				}
				else {
					lastPage = true;
				}
			}
		}
		var lastrow = verticalSpacing + height / 2 + (verticalSpacing + (height)) * (rows);
		this.drawGameListControls(horizontalSpacing * 3, lastrow, height / 2, page, lastPage);
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
	var fontsize = viewportWidth > viewportHeight ? windowHeight / 6 : windowHeight / 10;
	var text1height = windowTop + fontsize;
	var text2height = text1height + fontsize;
	var textattrs = {'font-size': fontsize, 'fill' : '#fff'};
	r.text(windowWidth, text1height, line1).attr(textattrs);
	r.text(windowWidth, text2height, line2).attr(textattrs);
	this.drawButton(buttonLeft, buttonTop, buttonWidth, buttonHeight, this.buttons.endGame);
}

Menu.prototype.soloGameOver = function() {
	this.state = "soloGameOver";
	var line1 = "Game Over!";
	var line2 = "Your Score: " + board.score;
	scr.playerInfo.totalScore += board.score;
	scr.playerInfo.gamesPlayed++;
	if(board.score > scr.playerInfo.highScore) {
		scr.playerInfo.highScore = board.score;
	}
	if(scr.playerInfo.recentScores.length === 30) {
		scr.playerInfo.recentScores.shift();
	}
	scr.playerInfo.recentScores.push(board.score);
	this.drawMiniWindow(line1, line2);
}

Menu.prototype.redrawSoloGameOver = function() {
	var line1 = "Game Over!";
	var line2 = "Your Score: " + board.score;
	this.drawMiniWindow(line1, line2);
}

Menu.prototype.infiniteGameOver = function() {
	var line1 = "Game Over!";
	var line2 = board.score + " points in " + board.timerString;
	var timerSeconds = timerStringToSeconds(board.timerString);
	if(timerSeconds > scr.playerInfo.longestGameTime) {
		scr.playerInfo.longestGameTime = timerSeconds;
	}
	this.drawMiniWindow(line1, line2);
}

Menu.prototype.redrawInfiniteGameOver = function() {
	var line1 = "Game Over!";
	var line2 = board.score + " points in " + board.timerString;
	this.drawMiniWindow(line1, line2);
}

Menu.prototype.multiGameOver = function(won) {
	var line1;
	var line2;
	scr.playerInfo.totalScore += board.score;
	if(won) {
		scr.playerInfo.wins += 1;
		line1 = "You Win!";
		line2 = "Win Total: " + scr.playerInfo.wins;
		this.state = "multiGameWon";
	}
	else {
		scr.playerInfo.losses += 1;
		line1 = "You lost :/";
		line2 = "Lifetime score: " + scr.playerInfo.totalScore;
		this.state = "multiGameLost";
	}
	var scoreDelt = board.score - board.opponentBoard.score;
	if(scr.playerInfo.recentScoreDeltas.length === 30) {
		scr.playerInfo.recentScoreDeltas.shift();
	}
	scr.playerInfo.recentScoreDeltas.push(scoreDelt);
	scr.playerInfo.winRatio = scr.playerInfo.wins / scr.playerInfo.losses;
	this.drawMiniWindow(line1, line2)
}

Menu.prototype.redrawMultiGameOver = function(won) {
	var line1;
	var line2;
	if(won) {
		line1 = "You Win!";
		line2 = "Win Total: " + scr.playerInfo.wins;
	}
	else {
		line1 = "You lost :/";
		line2 = "Lifetime score: " + scr.playerInfo.totalScore;
	}
	this.drawMiniWindow(line1, line2);
}