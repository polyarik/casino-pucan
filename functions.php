<?php

define('SPIN_DELAY', 3);

if (!isset($_SESSION)) {
	session_start();
	
	$_SESSION['balance'] = 0;
	$_SESSION['log'] = array();
	$_SESSION['lastSpin'] = null;
}

if (isset($_GET['func'])) {
	switch ($_GET['func']) {
		case 'spin': {
			$date = time();

			if ($_SESSION['lastSpin'] !== null && $_SESSION['lastSpin'] - $date < SPIN_DELAY)
				exit(0);

			if (!$_SESSION['balance'])
				exit(0);

			$bet = min(floor(+$_GET['bet'] / 10) * 10, $_SESSION['balance'], 100);

			if ($bet <= 0)
				exit(0);

			$spinRes = spin($bet);
			$_SESSION['balance'] += $spinRes['res'];
			
			array_push($_SESSION['log'], [
				'date' => $date,
				'bet' => $bet,
				'line' => $spinRes['line'],
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
		$line[0] = mt_rand(1, 7);
		$line[1] = mt_rand(1, 7);
		$line[2] = mt_rand(1, 7);

		while ($line[0] == $line[1]) {
		  $line[1] = mt_rand(1,7);
		}

		while ($line[0] == $line[2] || $line[1] == $line[2]) {
			$line[2] = mt_rand(1,7);
		}
	} else {
		// match
		$num = getNum();
		$line = array($num, $num, $num);

		if ($rand < 18) {
			// match of 2
			$differentNum = mt_rand(0, 2);
			$line[$differentNum] = mt_rand(1,7);

			while ($line[$differentNum] == $num) {
				$line[$differentNum] = mt_rand(1,7);
			}
		}
	}

	$res = calcResult($line, $bet);
	return array('line' => (int) implode('', $line), 'res' => $res);
}

function getNum() {
	for ($i = 1; $i < 7; $i++) {
		$num = mt_rand(0, 2);

		if (!$num)
			return $i;
	}

	return 7;
}

function calcResult($line, $bet) {
	if ($line[0] == $line[1] && $line[0] == $line[2]) {
		$res = $bet * $line[0] * 2 - $bet; // match of 3
	} elseif ($line[0] == $line[1] || $line[0] == $line[2] || $line[1] == $line[2]) {
		$num = ($line[0] == $line[1]) ? $line[0] : $line[2];
		$res = round(($bet * $num / 2) / 10) * 10 - $bet; // match of 2
	} else
		$res = -$bet;

	return $res;
}