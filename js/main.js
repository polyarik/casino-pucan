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
			'red': document.querySelector("#flash-screen-red-radio"),
			'pucan': document.querySelector("#flash-screen-pucan-radio"),
		},
		'lever': document.querySelector("#lever-radio"),
		'balance': document.querySelector("#balance-radio")
	};

	syncBalance();
	//syncLog();
}

async function startNewGame() {
	if (!balance) {
		const newBalance = await request('startNewGame');
		//clearLog();

		if (newBalance)
			updateBalance(newBalance);
	}
}

async function syncBalance() {
	const newBalance = await request("getBalance");
	updateBalance(newBalance);
}

function updateBalance(newBalance, flash=true) {
	elements.balance.innerText = `$${newBalance}`; //TODO: animation

	radioButtons.flashScreen.green.checked = false;
	radioButtons.flashScreen.red.checked = false;
	radioButtons.flashScreen.pucan.checked = false;

	if (flash) {
		if (!newBalance)
			radioButtons.flashScreen.pucan.checked = true;
		else if (newBalance < balance)
			radioButtons.flashScreen.red.checked = true;
		else
			radioButtons.flashScreen.green.checked = true;
	}

	balance = newBalance;
}

async function syncLog() {
	//balance = await request("getLog");
	//...
}

function updateLog() {}

function addLogEntry(entry) {}

function clearLog() {}

function changeBet(change) {
	change = (change > 0) ? 10 : -10;
	bet = Math.min(Math.max(bet + change, 10), balance, 100);

	elements.bet.innerText = `$${bet}`;
}

async function spin() {
	if (
		!radioButtons.lever.checked
		&& !radioButtons.balance.checked
		&& !radioButtons.flashScreen.pucan.checked
	) {
		radioButtons.lever.checked = true;

		updateBalance(balance - bet, false);
		//reel animation

		const spinRes = await request("spin", {'bet': bet});
		console.log(spinRes);

		/*'date' => $date,
		'bet' => $bet,
		'line' => $spinRes['line'],
		'res' => $spinRes['res']*/

		updateBalance(balance + spinRes.res);
		//addLogEntry(spinRes);

		radioButtons.lever.checked = false;
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

	let response = await fetch(`functions.php?${data}`);
	let result = await response.json();

	return result;
}