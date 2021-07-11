<?php

define('SPIN_DELAY', 3);

session_start();

if (!isset($_SESSION['lastSpin'])) {
	$_SESSION['balance'] = 0;
	$_SESSION['log'] = array();
	$_SESSION['lastSpin'] = -1;
}

if (isset($_GET['func'])) {
	switch ($_GET['func']) {
		case 'spin': {
			$date = time();

			if ($_SESSION['lastSpin'] !== -1 && $date - $_SESSION['lastSpin'] < SPIN_DELAY)
				exit("0");

			if (!$_SESSION['balance'])
				exit("0");

			$bet = min(floor(+$_GET['bet'] / 10) * 10, $_SESSION['balance'], 100);

			if ($bet <= 0)
				exit("0");

			$spinRes = spin($bet);
			$_SESSION['balance'] += $spinRes['res'];
			$_SESSION['lastSpin'] = $date;
			
			array_push($_SESSION['log'], [
				'date' => $date,
				'bet' => $bet,
				'combination' => $spinRes['combination'],
				'res' => $spinRes['res'] 
			]);

			echo json_encode(end($_SESSION['log']));
			break;
		}

		case 'getBalance': {
			echo json_encode($_SESSION['balance']);
			break;
		}

		case 'getLog': {
			echo json_encode($_SESSION['log']);
			break;
		}

		case 'startNewGame': {
			if (!$_SESSION['balance'] || $_GET['password'] === "davayponovoy")
				startNewGame();

			echo json_encode($_SESSION['balance']);
		}
	}
}

function startNewGame() {
	$_SESSION['balance'] = 100;
	$_SESSION['log'] = array(); // or unset ?
}

function spin($bet) {
	$rand = mt_rand(1, 20);

	if ($rand < 11) {
		// nothing
		$combination[0] = mt_rand(1, 7);
		$combination[1] = mt_rand(1, 7);
		$combination[2] = mt_rand(1, 7);

		while ($combination[0] == $combination[1]) {
		  $combination[1] = mt_rand(1,7);
		}

		while ($combination[0] == $combination[2] || $combination[1] == $combination[2]) {
			$combination[2] = mt_rand(1,7);
		}
	} else {
		// match
		$num = getNum();
		$combination = array($num, $num, $num);

		if ($rand < 18) {
			// match of 2
			$differentNum = mt_rand(0, 2);
			$combination[$differentNum] = mt_rand(1,7);

			while ($combination[$differentNum] == $num) {
				$combination[$differentNum] = mt_rand(1,7);
			}
		}
	}

	$res = calcResult($combination, $bet);
	return array('combination' => (int) implode('', $combination), 'res' => $res);
}

function getNum() {
	for ($i = 1; $i < 7; $i++) {
		$num = mt_rand(0, 2);

		if (!$num)
			return $i;
	}

	return 7;
}

function calcResult($combination, $bet) {
	if ($combination[0] == $combination[1] && $combination[0] == $combination[2]) {
		$res = $bet * $combination[0] * 2 - $bet; // match of 3
	} elseif ($combination[0] == $combination[1] || $combination[0] == $combination[2] || $combination[1] == $combination[2]) {
		$num = ($combination[0] == $combination[1]) ? $combination[0] : $combination[2];
		$res = round(($bet * $num / 2) / 10) * 10 - $bet; // match of 2
	} else
		$res = -$bet;

	return $res;
}