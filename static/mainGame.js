/* Main Game Canvas */

var scr;
var server;
var menu;
var board;
var gameLoop;
var r;
var viewportWidth;
var viewportHeight;
var boardx = 100;
var boardy = 100;
var boardWidth = 300;
var boardHeight = 350;
var rows = 9;
var cols = 6;
var colors = ["red", "blue", "green", "yellow"];


function userControl() {
	document.onkeydown = function(event){
		var keyCodes = {"left": 37, "up": 38, "right": 39, "down": 40, "space": 32, "s": 83, "t": 84};
		if(scr.allowTyping) {
			if(event.keyCode === keyCodes["t"]) {
				scr.allowTyping = false;
				hideMenubar();
			}
		}
		else {
			event.preventDefault();

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
			if(event.keyCode === keyCodes["s"]) {
				board.input = "sendupdate";
			}
			if(event.keyCode === keyCodes["t"]) {
				scr.allowTyping = true;
				showMenubar();
			}
		}
	};
}

window.onload = function () {
	server = io.connect('http://localhost:8888');
	assignSocketResponses();
	scr = new Screen();
	viewportWidth = getViewportWidth();
	viewportHeight = getViewportHeight();
	scr.menubarLogin();
	r = Raphael('main', viewportWidth, viewportHeight);
	//should default to menu for finished project
	scr.liveGame();
};

