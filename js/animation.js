let interval;
let balanceInterval;
const delay = 25;

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
        }, delay);
    } else
        radioButtons.balance.checked = false;
}

//reel animation