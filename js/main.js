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

function updateBalance(newBalance) {
	elements.balance.innerText = `$${newBalance}`; //TODO: animation

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
}

function updateLog() {}

function addLogEntry(entry) {}

function clearLog() {}

function changeBet(value, exact=false) {
	if (!radioButtons.lever.checked) {
		if (exact)
			bet = value;
		else
			bet = Math.min(Math.max(bet + value, 10), balance, 100);

		elements.bet.innerText = `$${bet}`;
	}
}

async function spin() {
	if (
		!radioButtons.lever.checked
		&& !radioButtons.balance.checked
		&& !radioButtons.flashScreen.pucan.checked
	) {
		radioButtons.lever.checked = true;
		radioButtons.flashScreen.pucan.checked = false;
		radioButtons.flashScreen.red.checked = false;
		radioButtons.flashScreen.green.checked = false;
		
		//reel animation

		const spinRes = await request("spin", {'bet': bet});
		console.log(spinRes);

		/*'date' => $date,
		'bet' => $bet,
		'combination' => $spinRes['combination'],
		'res' => $spinRes['res']*/

		//TEMP
		setTimeout(() => {
			updateBalance(balance + spinRes.res);
			changeBet(Math.min(bet, balance), true);

			//addLogEntry(spinRes);

			radioButtons.lever.checked = false;
		}, 3000);
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