////////////////////////////
// FUNCTIONS
////////////////////////////

function generateRandomComponent() {
	var isBlock = Math.floor(Math.random() * 5);
	var pieceColor = board.colors[Math.floor(Math.random() * board.colors.length)];
	if(isBlock === 0){
		return new FallingComponent("clearer", pieceColor);
	}
	else{
		return new FallingComponent("block", pieceColor);
	}
}

function createComponents() {
	var res = [];
	res.push(generateRandomComponent());
	res.push(generateRandomComponent());
	return res;
}

function drawEmptySpace(r, x, y, w, h) {
	var rect = r.rect(x, y, w, h);
	rect.attr({
		"stroke-width" : 0,
		"fill" : "#AAAAAA",
		"opacity" : 0.15
	});
}

function drawSimpleBlock(r, x, y, w, h) {
	var rect = r.rect(x, y, w, h);
	rect.attr({
		"stroke-width" : 0,
		"fill" : "#CCCCCC"
	});
}

function showMenubar() {
	var menubar = $("#menubar");
	menubar.animate({ top: "0%" });
	console.log('showing menubar');
}

function hideMenubar() {
	var menubar = $("#menubar");
	menubar.animate({ top: "-22%" });
	console.log('hiding menubar');
}

function updateBoard() {
	if(!board.animating){
		board.tick();
		if(!board.animating){
			board.draw(r);
		}
	}
}

function runGameLoop() {
	updateBoard();
	gameLoop = setTimeout(runGameLoop, 50);
}

function getViewportWidth() {
	if(window.innerWidth) {
		return window.innerWidth;
	}
	else if(document.body && document.body.offsetWidth) {
		return document.body.offsetWidth;
	}
	else {
		return 0;
	}
}

function getViewportHeight() {
	if(window.innerHeight) {
		return window.innerHeight;
	}
	else if(document.body && document.body.offsetHeight) {
		return document.body.offsetHeight;
	}
	else {
		return 0;
	}
}


//I stole these

//http://james.padolsey.com/javascript/deep-copying-of-objects-and-arrays/

function deepCopy(obj) {
    if (Object.prototype.toString.call(obj) === '[object Array]') {
        var out = [], i = 0, len = obj.length;
        for ( ; i < len; i++ ) {
            out[i] = arguments.callee(obj[i]);
        }
        return out;
    }
    if (typeof obj === 'object') {
        var out = {}, i;
        for ( i in obj ) {
            out[i] = arguments.callee(obj[i]);
        }
        return out;
    }
    return obj;
}


//