function Board(x, y, w, h, r, cl, c, multi) {
	
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
	this.cols = cl;
	this.rows = r;
	this.gridWidth = w / cl;
	this.gridHeight = h / r;
	this.pieceWidth = Math.floor((w / cl) * .95);
	this.pieceHeight = Math.floor((h / r) * .95);
	this.paddingHorizontal = Math.floor(((w / cl) - this.pieceWidth) / 2);
	this.paddingVertical = Math.floor(((h / r) - this.pieceHeight) / 2);
	this.colors = c;
	this.multi = multi;
	this.lockInTimer = 20;
	this.fallTimer = 10;
	this.fall = {};
	this.clearers = [];
	this.currentAnimations = [];
	this.combo = 1;
	this.score = 0;
	this.clearTime = 200;
	this.gameId = "";
	
	var a = [];
	var i = 0;

	while(i < this.cols){
		var j = 0;
		var col = [];
		while(j < this.rows){
			col.push(0);
			j++;
		}
		a.push(col);
		i++;
	}

	this.grid = a;
}

////////////////////////////
// Prototype Methods
////////////////////////////

Board.prototype.init = function() {
	if(this.multi) {
		var opponentBoardx = viewportWidth - this.x - this.width;
		this.opponentBoard = new OpponentBoard(opponentBoardx, this.y, this.width, this.height, this.rows, this.cols, this.gridWidth, this.gridHeight, this.paddingHorizontal, this.paddingVertical);
		this.fall = new FallingPiece();
		this.grid[this.fall.x][this.fall.y] = this.fall;
	}
	else {
		this.fall = new FallingPiece();
		this.grid[this.fall.x][this.fall.y] = this.fall;
	}
	runGameLoop();
	board.draw(r);
}

Board.prototype.draw = function(r) {
	var grid = this.grid;
	r.clear();
	r.rect(this.x, this.y, this.width, this.height).attr({fill: "black"});

	for(var i = 0; i < this.cols; i++){
		for(var j = 0; j < this.rows; j++){
			var pieceX = this.x + (i * this.gridWidth) + this.paddingHorizontal;
			var pieceY = this.y + (j * this.gridHeight) + this.paddingVertical;
			if(grid[i][j] === 0){
				drawEmptySpace(r, pieceX, pieceY, this.pieceWidth, this.pieceHeight);
			}
			// systems will be drawn separately
			else if(grid[i][j].inSystem){
				// do nothing
			}
			else{
				grid[i][j].draw();
			}
		}
	}

	if(this.multi && this.opponentBoard.grid) {
		this.opponentBoard.draw();
	}
}


Board.prototype.blockPixelCoords = function(x, y) {
	var res = [];
	var newx = (this.gridWidth * x) + this.paddingHorizontal;
	var newy = (this.gridHeight * y) + this.paddingVertical;
	res.push(newx);
	res.push(newy);
	return res;
}

Board.prototype.isValidGridBlock = function(block) {
	return this.grid[block.x][block.y] === block;
}

Board.prototype.columnBottom = function(col) {
	var res = 0;
	while(this.grid[col][res] === 0){
		res++;
	}
	return res;
}

Board.prototype.fallingPieceOnBottom = function() {
	var p = this.fall;
	var grid = this.grid;
	if(p.y + 1 >= this.rows || grid[p.x][p.y + 1] !== 0) {
		return true;
	}
	if(p.direction === 3) {
		if(p.y + 2 >= this.rows || grid[p.x][p.y + 2] !== 0){
			return true;
		}
		else {
			return false;
		}
	}
	//if the second piece is horizontally oriented
	else if(p.direction % 2 === 0) {
		if(p.direction === 0) {
			if(grid[p.x - 1][p.y + 1] !== 0) {
				return true;
			}
			else {
				return false;
			}
		}
		else {
			if(grid[p.x + 1][p.y + 1] !== 0) {
				return true;
			}
			else {
				return false;
			}
		}
	}
	return false;	
}

Board.prototype.handleFallingPieceMovement = function() {
	switch(this.input){
		case "moveleft":
			return this.fall.move(-1, 0);
		case "moveright":
			return this.fall.move(1, 0);
		case "rotatecounter":
			return this.fall.rotate(-1);
		case "movedown":
			return this.fall.move(0, 1);
		case "harddrop":
			//implement
		default:
			return false;
	}
}

Board.prototype.tick = function() {
	var grid = this.grid;

	if(this.fallingPieceOnBottom()) {
		if(this.lockInTimer <= 0) {
			this.pieceLock();
			return true;
		}
		if(this.input === "movedown") {
			this.lockInTimer = 0;
			this.input = "";
			return true;
		}
		else {
			this.lockInTimer--;
			var input = this.handleFallingPieceMovement();
			this.input = "";
			if (input) {
				return true;
			}
			else {
				return false;
			}
		}
	}
	else {
		var input = this.handleFallingPieceMovement();
		this.input = "";
		var p = this.fall;
		this.lockInTimer = 20;
		this.fallTimer--;
		if(this.fallTimer <= 0 && !this.fallingPieceOnBottom()){
			if(grid[p.x][p.y+1] === 0){
				grid[p.x][p.y] = 0;
				grid[p.x][++p.y] = p;
				this.fallTimer = 10;
				this.grid = grid;
			}
			return true;
		}
		else if(input) {
			return true;
		}
		else {
			return false;
		}
	}
}

Board.prototype.gravitize = function() {
	for(var i = 0; i < this.cols; i++) {
		for(var j = this.rows-1; j >= 0; j--) {
			var curr = this.grid[i][j];
			if(curr.class === "StationaryBlock" || curr.class === "StationaryClearer") {
				curr.gravity(this.grid);
			}
		}
	}
}

Board.prototype.clearHelper = function(block, color, from) {
	if(block === 0) {
		return false;
	}
	if(block.clearMark) {
		return true;
	}
	if(block.color !== color) {
		return false;
	}
	else {
		block.clearMark = true;
		var res = false;
		/*
		animations.push({
			piece: block,
			anim: "clear"
		});
		*/
		this.score++;
		var topSafe = block.y - 1 >= 0;
		var leftSafe = block.x - 1 >= 0;			
		var botSafe = block.y + 1 < this.rows;
		var rightSafe = block.x + 1 < this.cols;

		var temp = false;
		if(from !== 0 && leftSafe){
			temp = this.clearHelper(this.grid[block.x - 1][block.y], color, 2)
			res = res || temp;
			if(temp === false) {
				//console.log("(" + block.x + ", " + block.y + ") fails left.")
			}
		}
		temp = false;
		if(from !== 1 && topSafe){
			temp = this.clearHelper(this.grid[block.x][block.y - 1], color, 3);
			res = res || temp;
			if(temp === false) {
				//console.log("(" + block.x + ", " + block.y + ") fails top.");
			}
		}
		temp = false;
		if(from !== 2 && rightSafe){
			temp = this.clearHelper(this.grid[block.x + 1][block.y], color, 0);
			res = res || temp;
			if(temp === false) {
				//console.log("(" + block.x + ", " + block.y + ") fails right.");
			}
		}
		temp = false;
		if(from !== 3 && botSafe){
			temp = this.clearHelper(this.grid[block.x][block.y + 1], color, 1);
			res = res || temp;
			if(temp === false) {
				//console.log("(" + block.x + ", " + block.y + ") fails bottom.");
			}
		}

		if(from === -1) {
			return res;
		}
		else {
			return true;
		}
	}
}

Board.prototype.clearMarked = function () {
	var grid = this.grid;
	for(var i = 0; i < this.cols; i++) {
		for(var j = 0; j < this.rows; j++) {
			var b = grid[i][j];
			if(b.clearMark) {
				grid[i][j] = 0;
			}
		}
	}
	this.grid = grid;
}

Board.prototype.clear = function () {
	var cl = this.clearers;
	var toRemove = [];
	var testNumRemoved = 0;
	for(var i = 0; i < cl.length; i++) {
		var b = cl[i];
		var score = this.score;
		if(!this.clearHelper(b, b.color, -1)) {
			//console.log("Block at " + b.x + ", " + b.y + " did not clear.");
			b.clearMark = false;
			this.score = score;
		}
		else {
			testNumRemoved++;
			toRemove.push(i);
		}
	}
	this.clearMarked();
	for(var i = 0; i < toRemove.length; i++) {
		cl.splice(toRemove[i], 1);
	}
	this.clearers = cl;
	console.log(testNumRemoved);
}

Board.prototype.convertFallingPiece = function() {
	var p = this.fall;
	var x = p.direction % 2 !== 0 ? 0 : (p.direction === 0 ? -1 : 1);
	var y = p.direction % 2 === 0 ? 0 : (p.direction === 1 ? -1 : 1);

	var primePiece = p.components[0].type === "block" ? new StationaryBlock(p.x, p.y, p.components[0].color) : new StationaryClearer(p.x, p.y, p.components[0].color);
	var secondPiece = p.components[1].type === "block" ? new StationaryBlock(p.x + x, p.y + y, p.components[1].color) : new StationaryClearer(p.x + x, p.y + y, p.components[1].color);
	//primePiece.draw();
	//secondPiece.draw();
	if(primePiece.class === "StationaryClearer") {
		this.clearers.push(primePiece);
	}
	if(secondPiece.class === "StationaryClearer") {
		this.clearers.push(secondPiece);
	}
	this.grid[p.x][p.y] = primePiece;
	this.grid[p.x + x][p.y + y] = secondPiece;
}

Board.prototype.pieceLock = function() {

	//convert the falling piece to a locked in block
	this.convertFallingPiece();

	//handle falling piece gravity

	this.gravitize();
	this.draw(r);

	//handle clearer behavior and combo starting

	this.clear();

	//run through any animations and update the score

	this.gravitize();
	this.draw(r);

	if(this.multi) {
		this.sendUpdates();
	}

	this.fall = new FallingPiece();
	return true;
}

////////////////////////////
// SERVER-LIKE THINGS
////////////////////////////

Board.prototype.simpleGrid = function() {
	var grid = [];
	for(var i = 0; i < cols; i++) {
		grid.push([]);
		for(var j = 0; j < this.rows; j++) {
			if(this.grid[i][j] !== 0) {
				grid[i][j] = 1;
			}
			else {
				grid[i][j] = 0;
			}
		}
	}
	return grid;
}

Board.prototype.sendUpdates = function() {
	this.sendGrid();
	this.sendScore();
}

Board.prototype.sendGrid = function() {
	var grid = this.simpleGrid();
	server.emit('gridupdate', {"grid": grid});
}

Board.prototype.sendScore = function() {
	server.emit('scoreupdate', {"score": this.score});
}