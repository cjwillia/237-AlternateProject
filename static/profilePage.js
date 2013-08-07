//TODO: pull and display player info for the page.

var username = window.location.pathname.split('/')[1];

$(document).ready(function() {
	var scoreLink = $("#scoreLink");
	var multiLink = $("#multiLink");
	var miscLink = $("#miscLink");

	var playerInfo = {};
	var oneToThirty = [];

	for(var i = 0; i < 30; i++) {
		oneToThirty.push(i+1);
	}

	function populatePlayerInfo() {
		function deString(e, i, a) {
			a[i] = Number(e);
		}
		function processPlayerInfo (data) {
			playerInfo.username = data.name;
			playerInfo.highScore = Number(data.highScore);
			playerInfo.wins = Number(data.wins);
			playerInfo.longestGameTime = Number(data.longestGameTime);
			playerInfo.totalScore = Number(data.totalScore);
			playerInfo.losses = Number(data.losses);
			playerInfo.winRatio = Number(data.winRatio);
			playerInfo.gamesPlayed = Number(data.gamesPlayed);
			playerInfo.recentScores = data.recentScores;
			playerInfo.recentScoreDeltas = data.recentScoreDeltas;
			playerInfo.totalBlocksCleared = Number(data.totalBlocksCleared);
			playerInfo.redBlocksCleared = Number(data.redBlocksCleared);
			playerInfo.blueBlocksCleared = Number(data.blueBlocksCleared);
			playerInfo.greenBlocksCleared = Number(data.greenBlocksCleared);
			playerInfo.yellowBlocksCleared = Number(data.yellowBlocksCleared);
			playerInfo.recentScores.forEach(deString);
			playerInfo.recentScoreDeltas.forEach(deString);
			dispersePlayerInfo();
		}
		$.get(
			'/api/playerInfo/get/'+username,
			undefined,
			processPlayerInfo
		);
	}

	function dispersePlayerInfo() {
		$('#username').html(""+username);
		$('#highScore').html(""+playerInfo.highScore);
		$('#totalScore').html(""+playerInfo.totalScore);
		$('#longestGameTime').html(""+playerInfo.longestGameTime);
		$('#winRatio').html(""+playerInfo.winRatio);
		$('#wins').html(""+playerInfo.wins);
		$('#losses').html(""+playerInfo.losses);
		$('#totalBlocksCleared').html(""+playerInfo.totalBlocksCleared);
		$('#gamesPlayed').html(""+playerInfo.gamesPlayed);
		$('#redBlocksCleared').html(""+playerInfo.redBlocksCleared);
		$('#blueBlocksCleared').html(""+playerInfo.blueBlocksCleared);
		$('#greenBlocksCleared').html(""+playerInfo.greenBlocksCleared);
		$('#yellowBlocksCleared').html(""+playerInfo.yellowBlocksCleared);
		drawCharts();
	}

	function drawCharts() {
		var options = {
			axis: '0 0 0 1',
			smooth: false,
			axisxstep: 1,
			symbol: 'circle'
		}
		if(playerInfo.recentScores.length > 0) {
			var scoreLineChart = Raphael('scoreLineChart', 400, 200);
			scoreLineChart.linechart(20, 20, 380, 180, oneToThirty, playerInfo.recentScores, options);
		}
		if(playerInfo.recentScoreDeltas.length > 0) {
			var scoreDeltaLineChart = Raphael('scoreDeltaLineChart', 400, 200);
			scoreLineChart.linechart(20, 20, 380, 180, oneToThirty, playerInfo.recentScoreDeltas, options);
		}
	}

	function select(obj) {
		if(!obj.hasClass('selected')) {
			var selected = $('.selected');
			selected.removeClass('selected');
			obj.addClass('selected');
			hideBody(selected[0].id.replace('Link', ''));
			displayBody(obj[0].id.replace('Link', ''));
		}
	}

	function hideBody(prefix) {
		var body = $('#'+prefix+'InfoContainer');
		body.css('display', 'none');
	}

	function displayBody(prefix) {
		var body = $('#'+prefix+'InfoContainer');
		body.css('display', 'block');
	}

	scoreLink.click(function() {
		select(scoreLink);
	});
	multiLink.click(function() {
		select(multiLink);
	});
	miscLink.click(function() {
		select(miscLink);
	});
	populatePlayerInfo();
});