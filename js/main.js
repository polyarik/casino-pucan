let elements = {};
let radioButtons = {};

let balance = 0;
let bet = 10;
let combination = "222";

function init() {
	elements = {
		'balance': document.querySelector(".balance").querySelector("span"),
		'balanceChange': document.querySelector(".balance-change"),
		'bet': document.querySelector(".bet-value").querySelector("span"),
		'reels': [
			document.querySelector("#reel-1"),
			document.querySelector("#reel-2"),
			document.querySelector("#reel-3")
		]
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

	initReelsPos(elements.reels, combination);

	syncBalance();
	//syncLog();
}

async function startNewGame() {
	if (!balance) {
		const newBalance = await request('startNewGame');
		//clearLog();

		if (newBalance) {
			updateBalance(newBalance);
			changeBet(10, true);
		}
	}
}

async function syncBalance() {
	const newBalance = await request("getBalance");
	updateBalance(newBalance);
}

function updateBalance(newBalance) {
	displayBalance(newBalance);

	if (!newBalance)
		radioButtons.flashScreen.pucan.checked = true;
	else if (newBalance < balance)
		radioButtons.flashScreen.red.checked = true;
	else
		radioButtons.flashScreen.green.checked = true;

	balance = newBalance;
}

async function syncLog() {
	//balance = await request("getLog");
	//...

	//get current combination
	//initReelsPos(elements.reels, combination); ?
}

function updateLog() {}

function addLogEntry(entry) {}

function clearLog() {}

function changeBet(value, exact=false) {
	if (exact)
		bet = value;
	else if (!radioButtons.lever.checked)
		bet = Math.min(Math.max(bet + value, 10), balance, 100);

	elements.bet.innerText = `${bet}`;
}

async function spin() {
	if (
		!radioButtons.lever.checked
		&& !radioButtons.flashScreen.pucan.checked
	) {
		radioButtons.lever.checked = true;
		radioButtons.flashScreen.pucan.checked = false;
		radioButtons.flashScreen.red.checked = false;
		radioButtons.flashScreen.green.checked = false;
		
		startSpinningReels(elements.reels);
		const spinRes = await request("spin", {'bet': bet});
		console.log(spinRes);

		/*'date' => $date,
		'bet' => $bet,
		'combination' => $spinRes['combination'],
		'res' => $spinRes['res']*/

		combination = spinRes.combination + "";
		await stopSpinningReels(elements.reels, combination, 8, 1);

		updateBalance(balance + spinRes.res);
		changeBet(Math.min(bet, balance), true);
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