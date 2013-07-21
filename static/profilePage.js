//TODO: pull and display player info for the page.

$(document).ready(function() {
	var scoreLink = $("#scoreLink");
	var multiLink = $("#multiLink");
	var miscLink = $("#miscLink");

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
});