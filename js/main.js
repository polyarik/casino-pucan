let elements = {};
let radioButtons = {};

let balance = 0;
let bet = 10;

function init() {
	elements = {
		'balance': document.querySelector(".balance").querySelector("span"),
		'balanceChange': document.querySelector(".balance-change"),
		'bet': document.querySelector(".bet-value").querySelector("span"),
		'reels': document.getElementsByClassName("reel")
	};

	radioButtons = {
		'flashScreen': {
			'green': document.querySelector("#flash-screen-green-radio"),
			'red': document.querySelector("#flash-screen-green-radio"),
			'pucan': document.querySelector("#flash-screen-green-radio"),
		},
		'lever': document.querySelector("#lever-radio"),
		'balance': document.querySelector("#balance-radio")
	};

	updateBalance();
	//updateLog();
}

async function updateBalance() {
	balance = await request("getBalance");
	elements.balance.innerText = `$${balance}`; //TODO: animation
}

async function updateLog() {
	//balance = await request("getLog");

	//...
}

function addLogEntry(entry) {
	//...
}

function changeBet(change) {
	change = (change > 0) ? 10 : -10;
	bet = Math.min(Math.max(bet + change, 10), balance, 100);

	elements.bet.innerText = `$${bet}`;
}

function spin() {
	if (
		!radioButtons.lever.checked
		|| !radioButtons.balance.checked
		|| !radioButtons.flashScreen.pucan.checked
	) {
		//send a request


		//get response (res <- last log entry)
			//uncheck flash radio
			//check flash radio
			//uncheck lever radio
	}
}

async function request(func, params=null) {
	let data = `func=${func}`;

	if (params) {
		for (param in params) {
			const value = params[param];
			data += `&${param}=${value}`;
		}
	}

	let response = await fetch(`functions.php?${data}`)
	let result = await response.json();

	return result;
}