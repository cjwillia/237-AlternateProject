function BattleManager() {
	this.blocksToSend = [];
	this.active = "false";
	this.blockSendThreshold = 4;
}


BattleManager.prototype.sendBlocks = function(n) {
	if(this.active) {
		if(n > this.blockSendThreshold) {
			var send = [];
			for(var i = this.blockSendThreshold; i < n; i++) {
				var color = board.colors[Math.floor(Math.random() * board.colors.length)];
				var xPosition = Math.floor(Math.random() * board.cols);
				xPosition = xPosition === Math.floor(board.cols / 2) ? xPosition + 1 : xPosition;
				xPosition = xPosition === Math.floor(board.cols / 2) - 1 ? xPosition - 1 : xPosition;
				send.push({color: color, x: xPosition});
			}
			server.emit('blocksend', {blocks: send});
		}
	}
}

BattleManager.prototype.receiveBlocks = function(blocks) {
	var row = [];
	for(var i = 0; i < board.cols; i++) {
		row.push(0);
	}
	for(var i = 0; i < blocks.length; i++) {
		var block = blocks[i];
		var inCol = row[block.x];
		var y = 0 + inCol;
		var newBlock = new StationaryBlock(block.x, y, block.color);
		if(board.grid[newBlock.x][newBlock.y] === 0) {
			board.grid[newBlock.x][newBlock.y] = newBlock;
			board.blocksReceived.push(newBlock);
			row[block.x]++;
		}
	}
}