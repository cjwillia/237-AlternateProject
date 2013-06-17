/////////////////////////////
// OBJECTS
/////////////////////////////

function FallingComponent(type, color) {
	this.class = "FallingComponent";
	this.type = type;
	this.color = color;
	this.inSystem = true;
}

function FallingPiece() {
	this.class = "FallingPiece";
	this.x = Math.floor(board.cols / 2);
	this.y = 0;
	this.components = createComponents();
	this.direction = 0;
	this.image = undefined;
}

function StationaryBlock(x, y, color) {
	this.class = "StationaryBlock";
	this.x = x;
	this.y = y;
	this.color = color;
	this.inSystem = false;
	this.image = undefined;
	this.pointValue = 1;
	this.clearMark = false;
}

function StationaryClearer(x, y, color) {
	this.class = "StationaryClearer";
	this.x = x;
	this.y = y;
	this.color = color;
	this.image = undefined;
	this.pointValue = 1;
	this.clearMark = false;
	board.clearers.push(this);
}

function System(x, y, w, h, color, grid) {
	this.class = "System";
	this.x = w > 0 ? x : x + w;
	this.y = h > 0 ? y : y + h;
	this.w = Math.abs(w);
	this.h = Math.abs(h);
	this.color = color;
	this.image = undefined;
	this.inSystem = false;
	this.pointValue = 8;
}

function SystemComponent(x, y, color, parent){
	this.class = "SystemComponent";
	this.x = x;
	this.y = y;
	this.color = color;
	this.parent = parent;
	this.inSystem = true;
}

////////////////////////////
// OBJECT PROTO-METHODS
////////////////////////////

FallingPiece.prototype.move = function(dx, dy) {
	var newx = this.x + dx;
	var newy = this.y + dy;
	var leftLimit = this.direction === 0 ? 1 : 0;
	var rightLimit = this.direction === 1 ? board.cols - 1 : board.cols;
	var topLimit = this.direction === 2 ? 1 : 0;
	var botLimit = this.direction === 3 ? board.rows - 1 : board.rows;
	var grid = board.grid;
	if(leftLimit <= newx && newx < rightLimit && topLimit <= newy && newy < botLimit) {
		var b = grid[this.x + dx][this.y + dy];
		if(b === 0){
			grid[this.x][this.y] = 0;
			this.x = newx;
			this.y = newy;
			grid[this.x][this.y] = this;
			board.grid = grid;
			return true;
		}
		else {
			return false;
		}
	}
	else {
		return false;
	}
}

FallingPiece.prototype.rotate = function(direction) {
	var newdir = (this.direction + direction) % 4;
	if(newdir < 0)
		newdir = 3;
	var newx = newdir % 2 !== 0 ? this.x : (newdir === 0 ? this.x - 1 : this.x + 1);
	var newy = newdir % 2 === 0 ? this.y : (newdir === 1 ? this.y - 1 : this.y + 1);
	if(0 <= newx && newx < board.cols && 0 <= newy && newy < board.rows) {
		var b = board.grid[newx][newy];
		if(b === 0) {
			this.direction = newdir;
			return true;
		}
		else {
			return false;
		}
	}
	else {
		return false;
	}
}

FallingPiece.prototype.draw = function() {
	r.setStart();
	function drawPieceComponent(x, y, ty, c) {
		var rect = r.rect((x * board.gridWidth) + board.x, (y * board.gridHeight) + board.y, board.pieceWidth, board.pieceHeight);
		rect.attr({fill: c, stroke: "yellow", "stroke-opacity": 0.8});
		var gridArea = board.gridWidth * board.gridHeight;
		if(ty === "clearer") {
			function getLinePaths(l, r, t, b) {
				var l1 = "M";
				var l2 = "M";
				var linePadding = Math.floor(gridArea / 480);  //should be a constant?
				l2 += (l + linePadding) + "," + (b - linePadding) + "L" + (r - linePadding) + "," + (t + linePadding) + "Z";
				l1 += (l + linePadding) + "," + (t + linePadding) + "L" + (r - linePadding) + "," + (b - linePadding) + "Z";
				return [l1, l2];
			}

			var right = (x * board.gridWidth) + board.pieceWidth + board.x;
			var bottom = (y * board.gridHeight) + board.pieceHeight + board.y;
			var linePaths = getLinePaths((x * board.gridWidth) + board.x, right, (y * board.gridHeight) + board.y, bottom);

			var line1 = r.path(linePaths[0]);
			var line2 = r.path(linePaths[1]);

			var lines = r.set();
			lines.push(line1, line2);
			lines.attr("fill", "white");
		}
	}
	drawPieceComponent(this.x, this.y, this.components[0].type, this.components[0].color);
	var nextPiecex = this.direction % 2 !== 0 ? this.x : (this.direction === 0 ? this.x - 1 : this.x + 1);
	var nextPiecey = this.direction % 2 === 0 ? this.y : (this.direction === 1 ? this.y - 1 : this.y + 1);
	drawPieceComponent(nextPiecex, nextPiecey, this.components[1].type, this.components[1].color);
	this.image = r.setFinish();
}

FallingPiece.prototype.animateHardDrop = function() {
	//implement
}

StationaryBlock.prototype.gravity = function() {
	var grid = board.grid;
	if(this.y + 1 === board.rows){
		return false;
	}
	if(grid[this.x][this.y + 1] === 0) {
		while(grid[this.x][this.y + 1] === 0) {
			grid[this.x][this.y] = 0;
			this.y += 1;
			grid[this.x][this.y] = this;
			board.draw(r);
		}
		board.grid = grid;
		return true;
	}
	return false;
}

StationaryBlock.prototype.draw = function() {
	r.setStart();
	var gridArea = board.gridWidth * board.gridHeight;
	var rect = r.rect((this.x * board.gridWidth) + board.x, (this.y * board.gridHeight) + board.y, board.pieceWidth, board.pieceHeight, Math.floor(gridArea / 800));
	rect.attr({fill: this.color, stroke: "black", "stroke-opacity": 0.8});
	this.image = r.setFinish();
}

StationaryBlock.prototype.animateFall = function() {
	var y = board.columnBottom(this.x) - 1;
	var attrs = board.blockPixelCoords(this.x, y);
	var ms = (y - this.y)*this.blockWeight;
	this.image.animateWith(board.globalAnimationObject, board.globalAnimation, {x:attrs[0], y:attrs[1]}, ms, "easeOut");
}

StationaryBlock.prototype.animateClear = function() {
	var im = this.image;
	im.animateWith(board.globalAnimationObject, board.globalAnimation, {opacity: 0}, board.clearTime);
	return this.pointValue;
}

StationaryClearer.prototype.draw = function() {
	r.setStart();
	var gridArea = board.gridWidth * board.gridHeight;
	var rect = r.rect((this.x * board.gridWidth) + board.x, (this.y * board.gridHeight) + board.y, board.pieceWidth, board.pieceHeight, Math.floor(gridArea / 800));
	rect.attr({fill: this.color, stroke: "black", "stroke-opacity": 0.8});

	function getLinePaths(l, r, t, b) {
		var l1 = "M";
		var l2 = "M";
		var linePadding = Math.floor(gridArea / 480);  //should be a constant?
		l2 += (l + linePadding) + "," + (b - linePadding) + "L" + (r - linePadding) + "," + (t + linePadding) + "Z";
		l1 += (l + linePadding) + "," + (t + linePadding) + "L" + (r - linePadding) + "," + (b - linePadding) + "Z";
		return [l1, l2];
	}

	var right = (this.x * board.gridWidth) + board.pieceWidth + board.x;
	var bottom = (this.y * board.gridHeight) + board.pieceHeight + board.y;
	var linePaths = getLinePaths((this.x * board.gridWidth) + board.x, right, (this.y * board.gridHeight) + board.y, bottom);

	var line1 = r.path(linePaths[0]);
	var line2 = r.path(linePaths[1]);

	var lines = r.set();
	lines.push(line1, line2);
	lines.attr("fill", "white");
	this.image = r.setFinish();
}

StationaryClearer.prototype.gravity = function() {
	var grid = board.grid;
	if(this.y + 1 === board.rows){
		return false;
	}
	if(grid[this.x][this.y + 1] === 0) {
		while(grid[this.x][this.y + 1] === 0) {
			grid[this.x][this.y] = 0;
			this.y += 1;
			grid[this.x][this.y] = this;
			board.draw(r);
		}
		board.grid = grid;
		return true;
	}
	return false;
}

StationaryClearer.prototype.animateFall = function() {
	var y = board.columnBottom(this.x);
	var attrs = board.blockPixelCoords(this.x, y);
	var ms = (y - this.y)*this.blockWeight;
	this.image.animateWith(board.globalAnimationObject, board.globalAnimation, {x:attrs[0], y:attrs[1]}, ms, "easeOut");

}

StationaryClearer.prototype.animateClear = function() {
	var im = this.image;
	im.animateWith(board.globalAnimationObject, board.globalAnimation, {opacity: 0}, board.clearTime);
	return this.pointValue;
}

System.prototype.draw = function() {
	r.setStart();
	var gridArea = board.gridWidth * board.gridHeight;
	var rect = r.rect(this.x, this.y, ((this.x + this.w) * board.gridWidth) + this.pieceWidth, ((this.y * this.h) * board.gridHeight) + this.pieceWidth, Math.floor(gridHeight / 800));
	rect.attr({fill: this.color, stroke: "black", "stroke-opacity": 0.8})
	this.image = r.setFinish();
}

System.prototype.gravity = function() {
	var spaceBelow = [];
	var res = false;

	while(spaceBelow.length === 0 && ((this.y + this.h) + 1) !== board.rows){
		for(var i = this.x; i < this.x + this.w; i++) {
			if(spaceBelow !== 0) {
				spaceBelow.push(board.grid[i][(this.y + this.h) + 1]);
			}
		}
		if(spaceBelow.length === 0) {
			res = true;
			for(var i = this.x; i < this.x + this.w; i++) {
				board.grid[i][this.y] = 0;
			}
			this.y = this.y + 1;
			board.grid[this.x][this.y] = this;
			this.components = [];
			board.addSystemComponents(this);
		}
	}
	return res;
}

System.prototype.animateClear = function() {
	var im = this.image;
	im.animateWith(board.globalAnimationObject, board.globalAnimation, {opacity: 0}, board.clearTime);
	return this.pointValue;
}

System.prototype.updatePointValue = function() {
	this.pointValue = this.w === this.h ? this.w * this.h * this.w : this.w * this.h * 2;
}