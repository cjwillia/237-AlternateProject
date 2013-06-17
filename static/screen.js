function Screen() {
	this.state = "menu";
}

Screen.prototype.menu = function() {
	this.state = "menu";
	menu = new Menu();
}

Screen.prototype.liveGame = function() {
	this.state = "liveGame";
	board = new Board(boardx, boardy, boardWidth, boardHeight, rows, cols, colors);
	userControl();
	board.init();
	runGameLoop();
}