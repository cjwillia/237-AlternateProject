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
}

function hideMenubar() {
	var menubar = $("#menubar");
	menubar.animate({ top: "-22%" });
}

function updateBoard() {
	if(board.over) {
		return;
	}
	if(!board.animating) {
		board.tick();
		if(!board.animating) {
			if(board.over) {
				return;
			}
			board.draw(r);
		}
	}
}

function runGameLoop() {
	if(board.over) {
		return;
	}
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

function isOrientationPortrait() {
	return viewportWidth < viewportHeight;
}

function isOrientationLandscape() {
	return viewportHeight < viewportWidth;
}

function isMobile() {
	var mobileRegex = /Android|WebOS|iPhone|iPad|iPod|Blackberry|Windows Phone/i
	if(navigator.userAgent.match(mobileRegex)) {
		return true;
	}
	return false;
}

function adjustDisplay() {
	/*
	try {
		r.remove();
		r = Raphael('main', viewportWidth, viewportHeight);
	}
	catch(e) {
		alert("please do not resize the window.");
		r = Raphael('main', viewportWidth, viewportHeight);
	}
	*/

	r.setSize(viewportWidth, viewportHeight);
	menu.updateDisplayParams();
	
	switch(scr.state) {
		case "singleGame":
			board.updateDisplayParams(false);
			board.draw(r);
			break;
		case "liveGame":
			board.updateDisplayParams(true);
			board.draw(r);
			break;
		case "menu":
			menu.draw();
			break;
	}
}


//I stole this

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

function getPlayerInfo() {
	function processPlayerInfo (data) {
		scr.username = data.name;
		scr.highScore = Number(data.highScore);
		scr.wins = Number(data.wins);
		scr.totalScore = Number(data.totalScore);
	}
	$.get(
		'/me',
		undefined,
		processPlayerInfo
	);
}

function sendInfoUpdate() {
	var updates = {
		highScore: scr.highScore,
		wins: scr.wins,
		totalScore: scr.totalScore
	}
	$.post('/playerupdate', {updates: updates});
}

