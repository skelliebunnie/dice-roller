var rollBtn = document.querySelector("#rollBtn");
var diceBox = document.querySelector("#diceBox");
var numberOfDice = 2;

const options = { 
	element: diceBox,
	numberOfDice: numberOfDice,
	callback: saveResults,
	delay: 5000,
	noSound: true
};

rollBtn.addEventListener("click", (e) => {
	rollADie( options );
});

function saveResults(res) {
	console.log(res);
}