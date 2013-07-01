window.onload = function() {
	var usernameField = $('#usernameField');
	var passwordField = $('#passwordField');
	var loginButton = $('#loginButton');
	var registerButton = $('#registerButton');
	loginButton.click(login);
	registerButton.click(register);

	function login() {
		var username = usernameField[0].value;
		var password = passwordField[0].value;
		$.post(
			'/login',
			{
				username: username,
				password: password
			},
			handleLoginResult
		);
	}

	function register() {
		var username = usernameField[0].value;
		var password = passwordField[0].value;
		$.post(
			'/register',
			{
				username: username,
				password: password
			},
			handleRegisterResult
		);
	}

	function handleLoginResult(result) {
		if(result === 'nailed it') {
			loginSuccess();
		}
		else {
			loginFail(result);
		}
	}

	function handleRegisterResult(result) {
		if(result === 'one of us') {
			registerSuccess();
		}
		else {
			registerFail(result);
		}
	}

	function loginSuccess() {
		window.location = '/';
	}

	function registerSuccess() {
		login();
	}

	function loginFail(msg) {
		alert(msg);
	}

	function registerFail(msg) {
		alert(msg);
	}
}