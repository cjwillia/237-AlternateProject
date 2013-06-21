function OpponentBoard(x, y, w, h, r, cl) {
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
	this.rows = r;
	this.cols = cl;
	this.gridWidth = w / cl;
	this.gridHeight = h / r;
	this.pieceWidth = Math.floor((w / cl) * .95);
	this.pieceHeight = Math.floor((h / r) * .95);
	this.paddingHorizontal = Math.floor(((w / cl) - this.pieceWidth) / 2);
	this.paddingVertical = Math.floor(((h / r) - this.pieceHeight) / 2);
	this.grid = undefined;
	this.score = 0;
}

OpponentBoard.prototype.getGrid = function() {
	server.emit('gridrequest');
}

OpponentBoard.prototype.getScore = function() {
	server.emit('scorerequest');
}

OpponentBoard.prototype.updateGrid = function(g) {
	this.grid = g;
}

OpponentBoard.prototype.updateScore = function(s) {
	this.score = s;
}

OpponentBoard.prototype.draw = function () {
	r.setStart();
	r.rect(this.x, this.y, this.width, this.height).attr('fill', 'black');

	for(var i = 0; i < this.cols; i++) {
		for(var j = 0; j < this.rows; j++) {
			var pieceX = this.x + (i * this.gridWidth) + this.paddingHorizontal;
			var pieceY = this.y + (j * this.gridHeight) + this.paddingVertical;
			if(this.grid[i][j] === 0) {
				drawEmptySpace(r, pieceX, pieceY, this.pieceWidth, this.pieceHeight);
			}
			else {
				drawSimpleBlock(r, pieceX, pieceY, this.pieceWidth, this.pieceHeight);
			}
		}
	}
}