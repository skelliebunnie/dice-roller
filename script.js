var rollBtn = document.querySelector("#rollBtn");
var diceBox = document.querySelector("#diceBox");
var diceTotal = document.querySelector("#total");
var diceMathContainer = document.querySelector("#diceMath");
var itemResult = document.querySelector("#itemResult");
var itemCount = document.querySelector("#itemCount");
var itemsOL = document.querySelector("#items");
var addItemForm = document.querySelector("#addItemForm");
var clearBtn = document.querySelector("#clearBtn");
var predefinedListButtons = document.querySelector("#predefinedListButtons");

var dice = [ 2,3,4,6,8,10,12,14,16,18,20,24,30,34,48,50,60,100 ];
/**
 * 3 + 2 = 5
 * 3 + 4 = 7
 * 3 + 8 = 11
 * 3 + 12 = 15
 * 3 + 14 = 17
 * 3 + 16 = 19
 * ...
 */
// var nonDice = [5,7,11,13,15,17,19,21,22,26,32,36,38,42,44,46,52,54,56,58];

var list = JSON.parse(localStorage.getItem("dice-roller-list")) || ["demo", "list"];

var predefinedLists = {
	customBGs: {
		name: "Custom Battleground Lobby Rules",
		list: ["taunt only", "no taunt", "force single minion type, no neutrals", "force single minion type, neutrals allowed", "only neutrals", "no minions until T5", "number of minions = tavern tier", "only minions from your tavern tier", "only minions from Tiers <whatever>"]
	},
	colors: {
		name: "Colors",
		list: ["chartreuse", "lemon", "sky blue", "antique lace", "copenhagen blue", "poppy red", "spanish yellow", "pumpkin orange", "sepia", "espresso", "chocolate", "sienna", "henna", "jade", "cerulean"]
	} 
}

for(const plist in predefinedLists) {

	var btn = document.createElement("button");
	btn.className += "btn btn-success";
	btn.setAttribute("id", predefinedLists[plist].name);
	btn.textContent = predefinedLists[plist].name;
	btn.addEventListener("click", (e) => {
		list = predefinedLists[plist].list;
		listItems();
	});

	predefinedListButtons.append(btn);
}

function listItems() {
	itemsOL.innerHTML = "";

	localStorage.setItem("dice-roller-list", JSON.stringify(list));

	list.forEach(item => {
		var index = list.indexOf(item) + 1;

		var listItemLI = document.createElement("li");

		var listItemNumber = document.createElement("span");
		listItemNumber.setAttribute("class", "itemNumber");
		listItemNumber.textContent = `${index}.`;
		var listItem = document.createElement("span");
		listItem.setAttribute("id", `result_${index}`);
		listItem.setAttribute("class", "item");
		listItem.textContent = item;

		var deleteBtn = document.createElement("i");
		deleteBtn.className += "fa fa-times";
		deleteBtn.setAttribute("data-index", index);
		deleteBtn.addEventListener("click", removeItem);

		listItemLI.setAttribute("id", `item_${index}`);
		listItemLI.append(listItemNumber);
		listItemLI.append(listItem);
		listItemLI.append(deleteBtn);

		itemsOL.append(listItemLI);
		
	});
	
	itemCount.textContent = `(${list.length})`;
}
listItems();

function addItem(item) {
	list.push(item);

	listItems();
}

function removeItem() {
	var index = this.getAttribute("data-index") - 1;

	list.splice(index, 1);

	listItems();
}

/**
 * "default" dice are 4, 6, 8, 10, 12, 20
 * 1) how many items in list?
 * 	a) if divisible by 2, start there
 * 	b) if NOT divisible by 2, check against 'default' dice
 * 		- if greater than 20, subtract 20 then work with remainder (etc)
 *   	- if remainder is divisible by 2, do that! if not, repeat (b)
 */

// expects an array
function getDice(items) {
	var diceToRoll = [];

	// if the number of items matches a die number, just use that die
	if( dice.includes(items.length) ) {
		console.log(items.length);
		diceToRoll = [items.length];
	} 
	// if the number of items does NOT match a die number
	// but IS divisible by 2 AND the result is in the dice list,
	// divide by 2 and return that number
	// this will just split the number
	// so if items.length === 120 we'll get 60 (twice)
	// if the result is in the dice array, we can use it
	else if(items.length > 2 && items.length % 2 === 0 && dice.includes( items.length / 2 ) ) {

		console.log(items.length / 2);
		// must push in twice, since we divided by 2 to get the die number!
		diceToRoll.push.apply( diceToRoll, [items.length / 2, items.length / 2] );
		
	} 
	// otherwise, we'll have to get fancy
	else {
		for( var i = 0; i < dice.length; i++ ) {
			// if we can add 3 to the dice number and get the same
			// number as the length of items, we'll use d3 + dN
			if( (3 + dice[i]) == items.length ) {
				diceToRoll.push(dice[i]);
				diceToRoll.push(3);
			}
		}
	}
	console.log(diceToRoll);

	return diceToRoll;
}

// expects an integer
function rollDie(sides) {
	// Math.ceil rounds UP, so we never get 0
	return Math.ceil(Math.random() * sides);
	// Math.floor (rounds DOWN) variant:
	// return Math.floor(Math.random() * sides) + 1;
}

function getResults() {
	diceBox.innerHTML = "";

	if(list.length > 1) {
		var results = {};
		var diceToRoll = getDice(list);

		var total = 0,
				diceMath = "";

		for(var i = 0; i < diceToRoll.length; i++) {
			// define key as dN
			var die = `d${diceToRoll[i]}`;
			// set the value for the key to an (empty) array,
			// IF the key does NOT exist
			if( !(die in results) ) {
				results[die] = [];
			}
			// push the value in
			results[die].push( rollDie(diceToRoll[i]) );
		}

		// var addOrSubtract = Math.floor(Math.random() * 1);
		for(const die in results) {
			var addOrSubtract = Math.random();
			diceBox.innerHTML += `<p><strong>${die}:</strong> ${results[die]}</p>`;

			// if this is the first number we're doing,
			// assign vals to diceMath and total
			if(diceMath === "") {
				diceMath = results[die];
				total = parseInt(results[die]);

			} 
			// otherwise, randomly add/subtract the number
			else {
				if(addOrSubtract > 0.5) {
					total += parseInt(results[die]);
					diceMath += ` + ${results[die]}`;
				} else {
					total -= parseInt(results[die]);
					diceMath += ` - ${results[die]}`;
				}
			}
		}

		total = (total === 0) ? 1 : Math.abs(total);
		diceMath += ` = ${total}`;

		if(diceToRoll.length > 1) {
			diceMathContainer.innerText = diceMath;
		}

		var resultText = document.querySelector(`#result_${total}`).textContent;

		diceTotal.innerText = total;
		itemResult.innerText = resultText;
	} else if(list.length === 1) {
		diceBox.innerHTML = "Try adding more than one (1) item!";
	} else {
		diceBox.innerHTML = "The list is empty!";
	}
}

rollBtn.addEventListener("click", getResults);

clearBtn.addEventListener("click", (e) => {
	list = [];
	listItems();
});

addItemForm.addEventListener("submit", (e) => {
	e.preventDefault();

	var newItem = document.querySelector("#addItem").value;

	document.querySelector("#addItem").value = "";

	addItem(newItem);
});