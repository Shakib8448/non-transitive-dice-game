const readline = require("readline");
const crypto = require("crypto");
const FairRandomGenerator = require("./FairRandomGenerator");
const ProbabilityCalculator = require("./ProbabilityCalculator");

class Game {
  constructor(diceList) {
    this.diceList = diceList;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async start() {
    console.log("Let's determine who makes the first move.");
    const { key, hmac, computerChoice } = this.generateFairRandom(2);
    console.log(`I selected a random value in the range 0..1 (HMAC=${hmac}).`);
    console.log("Try to guess my selection.");
    console.log("0 - 0");
    console.log("1 - 1");
    console.log("X - exit");
    console.log("? - help");

    const userChoice = await this.prompt("Your selection: ");
    if (userChoice === "X") return this.exit();
    if (userChoice === "?") {
      ProbabilityCalculator.displayProbabilities(this.diceList);
      return this.start();
    }

    const userGuess = parseInt(userChoice);
    console.log(`My selection: ${computerChoice} (KEY=${key}).`);
    if (userGuess === computerChoice) {
      console.log("You guessed correctly! You make the first move.");
      await this.playRound("user");
    } else {
      console.log("I make the first move.");
      await this.playRound("computer");
    }
  }

  async playRound(firstPlayer) {
    let computerDiceIndex, userDiceIndex;

    if (firstPlayer === "computer") {
      computerDiceIndex = this.chooseComputerDice();
      console.log(
        `I choose the [${this.diceList[computerDiceIndex].faces}] dice.`
      );
      userDiceIndex = await this.chooseUserDice(computerDiceIndex);
      console.log(
        `You choose the [${this.diceList[userDiceIndex].faces}] dice.`
      );
    } else {
      userDiceIndex = await this.chooseUserDice();
      console.log(
        `You choose the [${this.diceList[userDiceIndex].faces}] dice.`
      );
      computerDiceIndex = this.chooseComputerDice(userDiceIndex);
      console.log(
        `I choose the [${this.diceList[computerDiceIndex].faces}] dice.`
      );
    }

    const computerRoll = await this.rollDice(computerDiceIndex, "computer");
    const userRoll = await this.rollDice(userDiceIndex, "user");

    console.log(`My roll result is ${computerRoll}.`);
    console.log(`Your roll result is ${userRoll}.`);
    if (userRoll > computerRoll) {
      console.log(`You win (${userRoll} > ${computerRoll})!`);
    } else if (userRoll < computerRoll) {
      console.log(`I win (${computerRoll} > ${userRoll})!`);
    } else {
      console.log("It's a tie!");
    }

    this.rl.close();
  }

  async rollDice(diceIndex, player) {
    if (
      diceIndex === undefined ||
      diceIndex < 0 ||
      diceIndex >= this.diceList.length
    ) {
      console.error("Error: Invalid dice selection.");
      return this.exit();
    }

    const dice = this.diceList[diceIndex];
    if (!dice) {
      console.error("Error: Dice not found.");
      return this.exit();
    }

    const { key, hmac } = this.generateFairRandom(dice.faces.length);
    console.log(
      `${
        player === "computer"
          ? "It's time for my roll."
          : "It's time for your roll."
      }`
    );
    console.log(
      `I selected a random value in the range 0..${
        dice.faces.length - 1
      } (HMAC=${hmac}).`
    );
    console.log("Add your number modulo " + dice.faces.length + ".");
    for (let i = 0; i < dice.faces.length; i++) {
      console.log(`${i} - ${i}`);
    }
    console.log("X - exit");
    console.log("? - help");

    const userChoice = await this.prompt("Your selection: ");
    if (userChoice === "X") return this.exit();
    if (userChoice === "?") {
      ProbabilityCalculator.displayProbabilities(this.diceList);
      return this.rollDice(diceIndex, player);
    }

    const { computerChoice, result } = FairRandomGenerator.generateFairRandom(
      key,
      parseInt(userChoice),
      dice.faces.length
    );
    console.log(`My number is ${computerChoice} (KEY=${key}).`);
    console.log(
      `The fair number generation result is ${computerChoice} + ${userChoice} = ${result} (mod ${dice.faces.length}).`
    );
    return dice.roll(result);
  }

  generateFairRandom(range) {
    const key = FairRandomGenerator.generateKey();
    const computerChoice = crypto.randomInt(range);
    const hmac = FairRandomGenerator.generateHMAC(key, computerChoice);
    return { key, hmac, computerChoice };
  }

  chooseComputerDice(excludeIndex = null) {
    const availableIndices = this.diceList
      .map((_, index) => index)
      .filter((index) => index !== excludeIndex);
    return availableIndices[
      Math.floor(Math.random() * availableIndices.length)
    ];
  }

  async chooseUserDice(excludeIndex = null) {
    console.log("Choose your dice:");
    this.diceList.forEach((dice, index) => {
      if (index !== excludeIndex)
        console.log(`${index} - ${dice.faces.join(",")}`);
    });
    console.log("X - exit");
    console.log("? - help");

    const userChoice = await this.prompt("Your selection: ");
    if (userChoice === "X") return this.exit();
    if (userChoice === "?") {
      ProbabilityCalculator.displayProbabilities(this.diceList);
      return this.chooseUserDice(excludeIndex);
    }
    return parseInt(userChoice);
  }

  prompt(question) {
    return new Promise((resolve) => this.rl.question(question, resolve));
  }

  exit() {
    console.log("Exiting the game.");
    this.rl.close();
    process.exit();
  }
}

module.exports = Game;
