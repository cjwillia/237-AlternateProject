/* Main Game Canvas */

var scr;
var server;
var menu;
var board;
var gameLoop;
var r;
var viewportWidth;
var viewportHeight;
var rows = 9;
var cols = 6;
var menuColor = "#4D2037";
var colors = ["red", "blue", "green", "yellow"];
var today = new Date();
var battleManager;


function userControl() {
	document.onkeydown = function(event){
		var keyCodes = {
			"enter": 13,
			"left": 37,
			"up": 38,
			"right": 39,
			"down": 40,
			"space": 32,
			"s": 83,
			"t": 84,
			"`": 192
		};
		if(scr.allowTyping) {
			if(event.keyCode === keyCodes["`"]) {
				scr.allowTyping = false;
				hideMenubar();
			}
			if(event.keyCode === keyCodes["enter"]) {
				scr.parseCommand();
			}
		}
		else {
			event.preventDefault();
			if(board){
				if(board.disableKeys){
					return;
				}
			
				if(event.keyCode === keyCodes["left"]) {
					board.input = "moveleft";
				}
				if(event.keyCode === keyCodes["up"]) {
					board.input = "rotatecounter";
				}
				if(event.keyCode === keyCodes["right"]) {
					board.input = "moveright";
				}
				if(event.keyCode === keyCodes["down"]) {
					board.input = "movedown";
				}
				if(event.keyCode === keyCodes["space"]) {
					board.input = "harddrop";
				}
			}
			if(event.keyCode === keyCodes["`"]) {
				scr.allowTyping = true;
				showMenubar();
			}
		}
	};
	$('#leftButton').click(function() {
		board.input = "moveleft";
	});
	$('#rightButton').click(function() {
		board.input = "moveright";
	});
	$('#rotateButton').click(function() {
		board.input = "rotatecounter";
	});
	$('#downButton').click(function() {
		board.input = "movedown";
	});
}

window.onload = function () {
	getPlayerInfo();
	server = io.connect('http://localhost:8888');
	assignSocketResponses();
	scr = new Screen();
	viewportWidth = getViewportWidth();
	viewportHeight = getViewportHeight();
	userControl();
	battleManager = new BattleManager();
	r = Raphael('main', viewportWidth, viewportHeight);
	menu = new Menu(menuColor);
	adjustDisplay();
	menu.draw();
};

window.onresize = function() {
	viewportWidth = getViewportWidth();
	viewportHeight = getViewportHeight();
	adjustDisplay();
};

window.onbeforeunload = function() {
	if(scr.state === "liveGame") {
		server.emit('lose');
		console.log('forfeit');
	}
}