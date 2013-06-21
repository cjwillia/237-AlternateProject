function Menu(c) {
	this.state = "main";
	this.horizontalPadding = viewportWidth * 0.1;
	this.buttonColor = c;
	this.buttons = {};
}

function Button(t, f) {
	this.text = t;
	this.action = f;
}

Menu.prototype.generateButtons = function() {
	//generate Play Single Player
	this.buttons.singlePlayer = new Button("Single Player", scr.singleGame);

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
}

Menu.prototype.draw = function() {
	r.clear();
	this.generateButtons();
	switch(this.state){
		case "main":
			this.drawMenu([this.buttons.singlePlayer, this.buttons.online]);
			break;
		case "multiplayer":
			this.drawMenu([this.buttons.createGame, this.buttons.joinGame]);
			break;
	}
}

Menu.prototype.drawMenu = function(buttons) {
	var n = buttons.length;
	var regions = n * 2 + 1;
	var height = viewportHeight / regions;
	for(var i = 0; i < n; i++) {
		var x = this.horizontalPadding;
		var y = height + i*height*2;
		this.drawButton(x, y, height, buttons[i])
	}
}

Menu.prototype.drawButton = function(x, y, height, button) {
	r.setStart();
	var width = viewportWidth - (this.horizontalPadding * 2);
	var rect = r.rect(x, y, width, height).attr({ 'fill' : this.buttonColor });
	var cx = x + width / 2;
	var cy = y + height / 2;
	var text = r.text(cx, cy, button.text).attr({ 'fill' : "#fff", 'font-size' : height/2});
	r.setFinish().click(button.action);
}