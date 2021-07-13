let interval;
let balanceInterval;
const delay = 7;
const reelStep = 3;

function initReelsPos(reels, combination) {
    for (let i in combination) {
        const pos = getPosition(combination[i]);
        positionReel(reels[i], pos);
    }
}

function startSpinningReels(reels) {
    clearInterval(interval);

    let reelsPos = getReelsPos(reels);

    interval = setInterval(() => {
        for (let i in reels) {
            reelsPos[i] += reelStep;
            reelsPos[i] %= 175;
            positionReel(reels[i], reelsPos[i]);
        }
    }, delay);
}

async function stopSpinningReels(reels, combination, spins, additionalSpins) {
    await spinReels(reels, combination, spins);
    await spinReels(reels, [combination[1], combination[2]], additionalSpins, [0]);
    await spinReels(reels, [combination[2]], additionalSpins, [0, 1]);

    return true;
}

async function spinReels(reels, combination, spins, stoppedReels=[]) {
    return new Promise((resolve) => {
        clearInterval(interval);

        let spinningReels = reels.filter((reel, i) => !stoppedReels.includes(i));
        let reelsPos = getReelsPos(spinningReels);
        let currSpin = 0;

        interval = setInterval(() => {
            for (let i in spinningReels) {
                reelsPos[i] += reelStep;
                currSpin += Math.floor(reelsPos[0] / 175);
                reelsPos[i] %= 175;
    
                if (currSpin < spins || reelsPos[0] < getPosition(combination[0]))
                    positionReel(spinningReels[i], reelsPos[i]);
                else {
                    const pos = getPosition(combination[0]);
                    positionReel(spinningReels[0], pos);
                    clearInterval(interval);
                    resolve(true);
                }
            }
        }, delay);
    });
}

function getPosition(num) {
    num = parseInt(num);
    return (num == 1) ? 150 : (num - 2) * 25;
}

function getReelsPos(reels) {
    let reelsPos = [];

    for (reel of reels) {
        reelsPos.push(parseInt(reel.style.backgroundPositionY));
    }

    return reelsPos;
}

function positionReel(reel, pos) {
    reel.style.backgroundPositionY = `${pos % 175}%`;
}

function displayBalance(newBalance) {
    clearInterval(balanceInterval);

    let displayedBalance = +elements.balance.innerText;
    let change = newBalance - displayedBalance;
    const incr = (change > 0);

    if (change) {
        elements.balanceChange.innerText = incr ? `+${change}` : `${change}`;
        radioButtons.balance.checked = true;

        let step;
        
        balanceInterval = setInterval(() => {
            change = newBalance - displayedBalance;
            step = Math.floor(change / 100) + incr;
            displayedBalance += step;

            if (incr && displayedBalance < newBalance || !incr && displayedBalance > newBalance)
                elements.balance.innerText = `${displayedBalance}`;
            else {
                elements.balance.innerText = `${newBalance}`;
                radioButtons.balance.checked = false;
                clearInterval(balanceInterval);
            }
        }, delay * 4);
    } else
        radioButtons.balance.checked = false;
}