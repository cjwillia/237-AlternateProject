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
	//add parens after isMobile when done testing
	if(window.innerHeight) {
		if(isMobile() && scr.state !== 'menu') {
			return window.innerHeight - window.innerHeight / 6;
		}
		return window.innerHeight;
	}
	else if(document.body && document.body.offsetHeight) {
		if(isMobile() && scr.state !== 'menu') {
			return document.body.offsetHeight - document.body.offsetHeight / 6;
		}
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

function showMobileControls() {
	$('#mobileControls').css('display', 'block');
	viewportHeight = getViewportHeight();
	adjustDisplay();
}

function hideMobileControls() {
	$('#mobileControls').css('display', 'none');
	viewportHeight = getViewportHeight();
	adjustDisplay();
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
	var buttonWidth = viewportHeight / 6;
	var buttonPadding = (Math.floor(viewportWidth - buttonWidth * 4) / 4) / 5;
	$('.mobileControl').attr({
		height: buttonWidth,
		width: buttonWidth
		
	});

	$('.mobileControl').css({
		'padding-left': buttonPadding,
		'padding-right': buttonPadding
	});

	r.setSize(viewportWidth, viewportHeight);
	menu.updateDisplayParams();
	
	switch(scr.state) {
		case "singleGame":
			board.updateDisplayParams(false);
			board.draw(r);
			if(board.over) {
				menu.draw();
			}
			break;
		case "liveGame":
			board.updateDisplayParams(true);
			board.draw(r);
			if(board.over) {
				menu.draw();
			}
			break;
		case "menu":
			menu.draw();
			break;
	}
}

function timerStringToSeconds(str) {
	var parts = str.split(":");
	var mins = Number(parts[0]);
	var secs = Number(parts[1]);
	return mins * 60 + secs;
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

function deString(e, i, a) {
	a[i] = Number(e);
}

function getPlayerInfo() {
	function processPlayerInfo (data) {
		scr.playerInfo.username = data.name;
		scr.playerInfo.highScore = Number(data.highScore);
		scr.playerInfo.wins = Number(data.wins);
		scr.playerInfo.totalScore = Number(data.totalScore);
		scr.playerInfo.longestGameTime = Number(data.longestGameTime);
		scr.playerInfo.losses = Number(data.losses);
		scr.playerInfo.winRatio = Number(data.winRatio);
		scr.playerInfo.gamesPlayed = Number(data.gamesPlayed);
		scr.playerInfo.recentScores = data.recentScores;
		scr.playerInfo.recentScoreDeltas = data.recentScoreDeltas;
		scr.playerInfo.totalBlocksCleared = Number(data.totalBlocksCleared);
		scr.playerInfo.redBlocksCleared = Number(data.redBlocksCleared);
		scr.playerInfo.blueBlocksCleared = Number(data.blueBlocksCleared);
		scr.playerInfo.greenBlocksCleared = Number(data.greenBlocksCleared);
		scr.playerInfo.yellowBlocksCleared = Number(data.yellowBlocksCleared);
		scr.playerInfo.recentScores.forEach(deString);
		scr.playerInfo.recentScoreDeltas.forEach(deString);
	}
	$.get(
		'/me',
		undefined,
		processPlayerInfo
	);
}

function sendInfoUpdate() {
	var updates = {
		highScore: scr.playerInfo.highScore,
		wins: scr.playerInfo.wins,
		totalScore: scr.playerInfo.totalScore,
		longestGameTime: scr.playerInfo.longestGameTime,
		losses: scr.playerInfo.losses,
		winRatio: scr.playerInfo.winRatio,
		gamesPlayed: scr.playerInfo.gamesPlayed,
		recentScores: scr.playerInfo.recentScores,
		recentScoreDeltas: scr.playerInfo.recentScoreDeltas,
		totalBlocksCleared: scr.playerInfo.totalBlocksCleared,
		redBlocksCleared: scr.playerInfo.redBlocksCleared,
		blueBlocksCleared: scr.playerInfo.blueBlocksCleared,
		greenBlocksCleared: scr.playerInfo.greenBlocksCleared,
		yellowBlocksCleared: scr.playerInfo.yellowBlocksCleared
	}
	$.post('/playerupdate', {updates: updates});
}

function compileWeekList(weekScores) {
	var res = [];
	for(var i = 0; i < weekScores.length; i++) {
		var dayList = weekScores[i]["list"];
		if(dayList !== null && dayList.length > 0) {
			for(var j = 0; j < dayList.length; j++) {
				res.push(dayList[j]);
			}
		}
	}
	return res;
}

function getPlayerList(onGet) {
	$.get('/playerList', undefined, onGet);
}

function getGameList(onGet) {
	$.get('/gamesList', undefined, onGet);
}

function createGame() {
	function onCreate(data) {
		scr.gameId = data.index;
	}
	$.post('/createGame', {index: scr.playerIndex}, onCreate);
}

function joinGame(index) {
	$.post('/joinGame', {playerIndex: scr.playerIndex, gameIndex: index}, menu.drawPleaseWait);
}

function leaveGame(index) {
	$.post('/leaveGame', {playerIndex: scr.playerIndex, gameIndex: index});
}

function adjustTextSize(string, containerWidth, startSize) {
	var size = startSize;
	var text = r.text(-1000, -1000, string).attr('font-size', size);
	while(text.getBBox().width > containerWidth) {
		size -= 1;
		text.attr('font-size', size);
	}
	return text;
}