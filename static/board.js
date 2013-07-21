//TODO: Touch Buttons

function Board(x, y, w, h, rw, cl, c, multi) {
	
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
	this.cols = cl;
	this.rows = rw;
	this.gridWidth = w / cl;
	this.gridHeight = h / rw;
	this.pieceWidth = Math.floor((w / cl) * .95);
	this.pieceHeight = Math.floor((h / rw) * .95);
	this.paddingHorizontal = Math.floor(((w / cl) - this.pieceWidth) / 2);
	this.paddingVertical = Math.floor(((h / rw) - this.pieceHeight) / 2);
	this.colors = c;
	this.multi = multi;
	this.lockInTimer = 20;
	this.fallTimer = 10;
	this.fall = {};
	this.clearers = [];
	this.animating = false;
	this.combo = 1;
	this.score = 0;
	this.timeStarted = new Date();
	this.timerString = "2:00";
	this.over = false;
	this.disableKeys = false;
	
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

Board.prototype.updateDisplayParams = function(isLive) {
	var boardx;
	var boardy;
	var boardWidth;
	var boardHeight;
	if(isLive) {
		if(viewportWidth > viewportHeight) {
			boardx = viewportWidth / 10;
			boardy = viewportHeight / 5;
			boardWidth = viewportWidth / 5;
			boardHeight = viewportHeight * 3 / 5;
		}
		else {
			
		}
	}
	else {
		if(viewportWidth > viewportHeight) {
			boardx = viewportWidth * 4 / 10;
			boardy = viewportHeight / 5;
			boardWidth = viewportWidth / 5;
			boardHeight = viewportHeight * 3 / 5;
		}
		else {
			boardx = viewportWidth / 10;
			boardy = viewportHeight / 10;
			boardWidth = viewportWidth - boardx * 2;
			boardHeight = viewportHeight - boardy * 2;
		}
	}
	this.x = boardx;
	this.y = boardy;
	this.width = boardWidth;
	this.height = boardHeight;
	this.gridWidth = this.width / this.cols;
	this.gridHeight = this.height / this.rows;
	this.pieceWidth = Math.floor((this.width / this.cols) * .95);
	this.pieceHeight = Math.floor((this.height / this.rows) * .95);
	this.paddingHorizontal = Math.floor(((this.width / this.cols) - this.pieceWidth) / 2);
	this.paddingVertical = Math.floor(((this.height / this.rows) - this.pieceHeight) / 2);
}

Board.prototype.init = function() {
	if(this.multi) {
		var opponentBoardx = viewportWidth - this.x - this.width;
		this.opponentBoard = new OpponentBoard(opponentBoardx, this.y, this.width, this.height, this.rows, this.cols, this.gridWidth, this.gridHeight, this.paddingHorizontal, this.paddingVertical);
		this.fall = new FallingPiece();
		this.grid[this.fall.x][this.fall.y] = this.fall;
		this.updateDisplayParams(true);
	}
	else {
		this.fall = new FallingPiece();
		this.grid[this.fall.x][this.fall.y] = this.fall;
		this.updateDisplayParams(false);
	}
	runGameLoop();
	board.draw(r);
}

Board.prototype.draw = function(r) {
	var grid = this.grid;
	if(this.animating) {
		return;
	}
	r.clear();
	
	r.rect(this.x, this.y, this.width, this.height).attr({fill: "black"});

	if(viewportWidth > viewportHeight) {
		r.text(this.x - this.width / 8, this.y, "Score").attr("font-size", this.height / 20);
		r.text(this.x - this.width / 8, this.y + this.height / 20, this.score + "").attr("font-size", this.height / 20);
		r.text((this.x * 2 + this.width) / 2, this.y - this.height / 10, this.timerString).attr("font-size", this.height / 10);
		if(this.multi) {
			this.opponentBoard.draw();
		}
	}
	else {
		r.text(this.x + this.width / 4, this.y - this.height / 20, this.score + "").attr("font-size", this.height / 20);
		r.text(this.x + this.width * 3 / 4, this.y - this.height / 20, this.timerString).attr("font-size", this.height / 20);
	}

	for(var i = 0; i < this.cols; i++) {
		for(var j = 0; j < this.rows; j++) {
			var pieceX = this.x + (i * this.gridWidth) + this.paddingHorizontal;
			var pieceY = this.y + (j * this.gridHeight) + this.paddingVertical;
			if(grid[i][j] === 0) {
				drawEmptySpace(r, pieceX, pieceY, this.pieceWidth, this.pieceHeight);
			}
			else {
				drawEmptySpace(r, pieceX, pieceY, this.pieceWidth, this.pieceHeight);
				grid[i][j].draw();
			}
		}
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
	if(p === undefined) {
		return false;
	}
	if(p.y + 1 >= this.rows || grid[p.x][p.y + 1] !== 0) {
		return true;
	}
	if(p.direction === 3) {
		if(p.y + 2 >= this.rows || grid[p.x][p.y + 2] !== 0) {
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
			this.hardDrop();
			break;
		default:
			return false;
	}
}

Board.prototype.hardDrop = function() {
	this.input = "";
	this.pieceLock();
	this.fallTimer = 10;
}

Board.prototype.updateTime = function() {
	var d = Math.floor(((new Date()) - this.timeStarted) / 1000);
	if(d === 0) {
		this.timerString = "2:00";
		return;
	}
	if(d === 60) {
		this.timerString = "1:00";
		return;
	}
	if(d === 120) {
		this.timerString = "0:00";
		return;
	}
	var s = d < 60 ? "1:" : "0:";
	var n = 60 - d % 60;
	s += n < 10 ? "0" + n : n;
	this.timerString = s;
}

Board.prototype.tick = function() {
	var grid = this.grid;

	this.updateTime();

	if(this.animating) {
		return;
	}

	if(this.timerString === "0:00") {
		this.gameOver();
		return;
	}

	if(this.fallingPieceOnBottom()) {
		if(this.lockInTimer <= 0) {
			this.pieceLock();
			this.fallTimer = 10;
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

Board.prototype.gravitize = function(cb) {
	var anims = [];
	var t = this;
	var f = function() {
		cb();
	}
	var callbackSet = false;

	for(var i = 0; i < this.cols; i++) {
		for(var j = this.rows-1; j >= 0; j--) {
			var curr = this.grid[i][j];
			if(curr.class === "StationaryBlock" || curr.class === "StationaryClearer") {
				var oldy = j * this.gridHeight + this.y;
				if(curr.gravity(this.grid)) {
					var x = curr.x * this.gridWidth + this.x;
					var newy = curr.y * this.gridHeight + this.y;
					var anim;
					if(!callbackSet) {
						anim = Raphael.animation({ transform: "t"+0+","+(newy - oldy) }, 200, "<", f);
					}
					else {
						anim = Raphael.animation({ transform: "t"+0+","+(newy - oldy) }, 200, "<");
					}
					anims.push({a: anim, b: curr});
				}
			}
		}
	}

	
	
	//animate
	if(anims.length > 0) {
		this.animating = true;
		var lastObj = anims[anims.length - 1];
		var lastBlock = lastObj.b;
		var lastAnim = lastObj.a;
		for(var i = 0; i < anims.length - 1; i++) {
			var obj = anims[i];
			var b = obj.b;
			var a = obj.a;
			b.image.animateWith(lastBlock, lastAnim, a);
		}
		lastBlock.image.animate(lastAnim);
	}
	else {
		cb();
	}
}

Board.prototype.clearHelper = function(block, color, from) {
	if(block === 0) {
		return false;
	}
	if(block.color !== color) {
		return false;
	}
	if(block.clearMark) {
		return true;
	}
	else {
		block.clearMark = true;
		var res = false;
		this.score += block.pointValue * this.combo;
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
				b.image.remove();
				grid[i][j] = 0;
			}
		}
	}
	this.grid = grid;
}

Board.prototype.clear = function () {
	var cl = this.clearers;
	var toRemove = [];
	for(var i = 0; i < cl.length; i++) {
		var b = cl[i];
		var score = this.score;
		if(!this.clearHelper(b, b.color, -1)) {
			b.clearMark = false;
			this.score = score;
		}
		else {
			toRemove.push(i);
		}
	}
	this.clearMarked();
	for(var i = 0; i < toRemove.length; i++) {
		cl.splice(toRemove[i], 1);
	}
	this.clearers = cl;
	return toRemove.length !== 0;
}

Board.prototype.animateBigClear = function(score) {
	//useless because of needing to clear paper.
	var pointfontsize = this.height / 8;
	var textfontsize = pointfontsize / 4;
	var xcenter = this.x + this.width;
	var line1y = this.y + this.height / 2;
	var line2y = line1y + pointfontsize;
	var ty = this.height / 4;
	r.setStart();
	r.text(xcenter, line1y, score + "").attr({ 'font-size' : pointfontsize, 'fill' : '#fff'});
	r.text(xcenter, line2y, "point clear!").attr({ 'font-size' : textfontsize, 'fill' : '#fff'});
	var all = r.setFinish();
	all.animate({opacity: 0, transform: 't'+0+','+ty}, 4000, "<>", function() {
		all.remove();
	});
	return all;
}

Board.prototype.convertFallingPiece = function() {
	var p = this.fall;
	if(p === undefined) {
		return;
	}
	
	var x = p.direction % 2 !== 0 ? 0 : (p.direction === 0 ? -1 : 1);
	var y = p.direction % 2 === 0 ? 0 : (p.direction === 1 ? -1 : 1);

	p.image.remove();
	this.fall = undefined;

	var primePiece = p.components[0].type === "block" ? new StationaryBlock(p.x, p.y, p.components[0].color) : new StationaryClearer(p.x, p.y, p.components[0].color);
	var secondPiece = p.components[1].type === "block" ? new StationaryBlock(p.x + x, p.y + y, p.components[1].color) : new StationaryClearer(p.x + x, p.y + y, p.components[1].color);
	primePiece.draw();
	secondPiece.draw();
	if(primePiece.class === "StationaryClearer") {
		this.clearers.push(primePiece);
	}
	if(secondPiece.class === "StationaryClearer") {
		this.clearers.push(secondPiece);
	}
	this.grid[p.x][p.y] = primePiece;
	this.grid[p.x + x][p.y + y] = secondPiece;
}

Board.prototype.doCombo = function() {
	this.combo++;
	if(this.clear()) {
		var t = this;
		var cb = function() {
			if(t.clearers.length > 0) {
				t.doCombo();
			}
		}
		this.gravitize(cb);
	}
}

Board.prototype.comboStarter = function() {
	var comboStart = this.clear();
	var t = this;
	var cb;
	if(comboStart) {
		cb = function() {
			if(t.clearers.length > 0) {
				t.doCombo();
			}
			t.combo = 1;
			if(t.multi) {
				t.sendUpdates();
			}
			
			t.animating = false;
		}
	}
	else {
		cb = function() {
			t.combo = 1;
			if(t.multi) {
				t.sendUpdates();
			}
			t.animating = false;
		}
	}
	this.gravitize(cb);
}

Board.prototype.updatePieceValues = function() {
	for(var i = 0; i < this.cols; i++) {
		for(var j = 0; j < this.rows; j++) {
			var b = this.grid[i][j];
			if(b.class === "StationaryClearer" || b.class === "StationaryBlock") {
				b.updatePointValue();
			}
		}
	}
}

Board.prototype.pieceLock = function() {
	this.disableKeys = true;
	var t = this;
	//convert the falling piece to a locked in block
	this.convertFallingPiece();

	//handle falling piece gravity

	var cb = function() {
		t.comboStarter();
		if(t.grid[2][0].class === "StationaryClearer" || t.grid[2][0].class === "StationaryBlock"
		 || t.grid[3][0].class === "StationaryClearer" || t.grid[3][0].class === "StationaryBlock") {
			t.gameOver();
			return;
		}
		t.fall = new FallingPiece();
		t.grid[t.fall.x][t.fall.y] = t.fall;
		t.fall.draw();
		t.fallTimer = 10;
		t.lockInTimer = 20;
		t.disableKeys = false;
	}

	this.gravitize(cb);
	
}

Board.prototype.gameOver = function() {
	this.draw(r);
	this.over = true;
	if(this.multi) {
		if(this.timerString === "0:00"){
			server.emit("timeUp");
		}
		else {
			server.emit("lose");
		}
	}
	else {
		menu.soloGameOver();
	}
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