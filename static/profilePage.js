//TODO: pull and display player info for the page.

var username = window.location.pathname.split('/')[1];

$(document).ready(function() {
	var scoreLink = $("#scoreLink");
	var multiLink = $("#multiLink");
	var miscLink = $("#miscLink");

	var playerInfo = {};

	function populatePlayerInfo() {
		function processPlayerInfo (data) {
			playerInfo.username = data.name;
			playerInfo.highScore = Number(data.highScore);
			playerInfo.wins = Number(data.wins);
			playerInfo.totalScore = Number(data.totalScore);
			playerInfo.losses = Number(data.losses);
			playerInfo.winRatio = Number(data.winRatio);
			playerInfo.gamesPlayed = Number(data.gamesPlayed);
			playerInfo.scoresThisWeek = data.scoresThisWeek;
			playerInfo.scoreDeltasThisWeek = data.scoreDeltasThisWeek;
			playerInfo.totalBlocksCleared = Number(data.totalBlocksCleared);
			playerInfo.redBlocksCleared = Number(data.redBlocksCleared);
			playerInfo.blueBlocksCleared = Number(data.blueBlocksCleared);
			playerInfo.greenBlocksCleared = Number(data.greenBlocksCleared);
			playerInfo.yellowBlocksCleared = Number(data.yellowBlocksCleared);
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
		$('#winRatio').html(""+playerInfo.winRatio);
		$('#wins').html(""+playerInfo.wins);
		$('#totalBlocksCleared').html(""+playerInfo.totalBlocksCleared);
		$('#gamesPlayed').html(""+playerInfo.gamesPlayed);
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