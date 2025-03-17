const crypto = require("crypto");
const readline = require("readline");

class Dice {
  constructor(faces) {
    this.faces = faces;
  }

  roll(index) {
    return this.faces[index];
  }
}

class DiceParser {
  static parse(diceStrings) {
    return diceStrings.map((diceStr) => {
      const faces = diceStr.split(",").map(Number);
      if (faces.some(isNaN)) throw new Error("Dice faces must be integers.");
      return new Dice(faces);
    });
  }
}

class FairRandomGenerator {
  static generateKey() {
    return crypto.randomBytes(32).toString("hex"); 

  static generateHMAC(key, message) {
    return crypto
      .createHmac("sha3-256", key)
      .update(message.toString())
      .digest("hex");
  }

  static generateFairRandom(key, userChoice, range) {
    const computerChoice = crypto.randomInt(range);
    const result = (computerChoice + userChoice) % range;
    return { computerChoice, result };
  }
}

class ProbabilityCalculator {
  static calculateProbabilities(diceList) {
    const probabilities = [];
    for (let i = 0; i < diceList.length; i++) {
      const row = [];
      for (let j = 0; j < diceList.length; j++) {
        if (i === j) {
          row.push("-");
          continue;
        }
        const wins = ProbabilityCalculator.calculateWins(
          diceList[i],
          diceList[j]
        );
        row.push(`${wins}%`);
      }
      probabilities.push(row);
    }
    return probabilities;
  }

  static calculateWins(diceA, diceB) {
    let wins = 0;
    for (const faceA of diceA.faces) {
      for (const faceB of diceB.faces) {
        if (faceA > faceB) wins++;
      }
    }
    const total = diceA.faces.length * diceB.faces.length;
    return ((wins / total) * 100).toFixed(2);
  }

  static displayProbabilities(diceList) {
    const probabilities =
      ProbabilityCalculator.calculateProbabilities(diceList);
    console.log("\nProbabilities of Winning:");
    console.table(probabilities);
  }
}

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
    const { key, hmac } = this.generateFairRandom(2);
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

    const { computerChoice, result } = FairRandomGenerator.generateFairRandom(
      key,
      parseInt(userChoice),
      2
    );
    console.log(`My selection: ${computerChoice} (KEY=${key}).`);
    const firstPlayer = result === 0 ? "computer" : "user";
    console.log(
      `${firstPlayer === "computer" ? "I" : "You"} make the first move.`
    );

    await this.playRound(firstPlayer);
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

    console.log(`My roll: ${computerRoll}`);
    console.log(`Your roll: ${userRoll}`);
    if (userRoll > computerRoll) {
      console.log("You win!");
    } else if (userRoll < computerRoll) {
      console.log("I win!");
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
        player === "computer" ? "I" : "You"
      } selected a random value in the range 0..${
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
      `The result is ${computerChoice} + ${userChoice} = ${result} (mod ${dice.faces.length}).`
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
      if (index !== excludeIndex) console.log(`${index} - [${dice.faces}]`);
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

function main() {
  const diceStrings = process.argv.slice(2);
  if (diceStrings.length < 3) {
    console.error("Error: At least 3 dice configurations are required.");
    console.error("Example: node game.js 2,2,4,4,9,9 6,8,1,1,8,6 7,5,3,7,5,3");
    process.exit(1);
  }

  try {
    const diceList = DiceParser.parse(diceStrings);
    const game = new Game(diceList);
    game.start();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
