const readline = require("readline");
const crypto = require("crypto");
const Dice = require("./Dice");
const FairRandom = require("./FairRandom");
const ProbabilityCalculator = require("./ProbabilityCalculator");
const HelpTable = require("./HelpTable");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const diceFaces = process.argv
  .slice(2)
  .map((arg) => arg.split(",").map(Number));

if (diceFaces.length < 3 || diceFaces.some((faces) => faces.length !== 6)) {
  console.error(
    "Invalid input. Please provide at least 3 dice, each with 6 faces."
  );
  console.error("Example: node index.js 2,2,4,4,9,9 6,8,1,1,8,6 7,5,3,7,5,3");
  process.exit(1);
}

for (const faces of diceFaces) {
  if (faces.some((face) => isNaN(face))) {
    console.error("Invalid input. All dice faces must be integers.");
    console.error("Example: node index.js 2,2,4,4,9,9 6,8,1,1,8,6 7,5,3,7,5,3");
    process.exit(1);
  }
}

const dice = diceFaces.map((faces) => new Dice(faces));
const probabilities = ProbabilityCalculator.calculateProbabilities(dice);

class Game {
  constructor(dice, rl) {
    this.dice = dice;
    this.rl = rl;
  }

  async start() {
    console.log("Welcome to the Non-Transitive Dice Game!");
    const { firstMove } = await this.determineFirstMove();
    console.log(
      firstMove === 0
        ? "You make the first move!"
        : "Computer makes the first move!"
    );
    await this.playGame(firstMove);
  }

  async determineFirstMove() {
    const { combinedNumber, computerNumber, key, hmac } =
      FairRandom.fairRandomInt(0, 2);
    console.log(`HMAC: ${hmac}`);
    console.log("Guess 0 or 1 to determine who makes the first move.");

    const userGuess = await this.prompt("Your guess (0 or 1): ");
    const result = (parseInt(userGuess) + computerNumber) % 2;

    console.log(`Computer's number: ${computerNumber}`);
    console.log(`Result: ${result}`);
    console.log(`Key: ${key.toString("hex")}`);

    return { firstMove: result };
  }

  async playGame(firstMove) {
    let userDice, computerDice;

    if (firstMove === 0) {
      userDice = await this.userSelectDice();
      computerDice = this.computerSelectDice(userDice);
    } else {
      computerDice = this.computerSelectDice();
      userDice = await this.userSelectDice(computerDice);
    }

    console.log(`You choose Dice: [${userDice.faces.join(",")}]`);
    console.log(`Computer chooses Dice: [${computerDice.faces.join(",")}]`);

    const userRoll = await this.fairRoll(userDice.faces.length, "your");
    console.log(`Your throw: ${userRoll}`);

    const computerRoll = await this.fairRoll(
      computerDice.faces.length,
      "computer's"
    );
    console.log(`Computer's throw: ${computerRoll}`);

    if (userRoll > computerRoll) {
      console.log("You win!");
    } else if (userRoll < computerRoll) {
      console.log("Computer wins!");
    } else {
      console.log("It's a tie!");
    }

    this.rl.close();
  }

  async userSelectDice(excludeDice = null) {
    console.log("Choose your dice:");
    this.dice.forEach((d, i) => {
      console.log(`${i} - [${d.faces.join(",")}]`);
    });
    console.log("X - exit");
    console.log("? - help");

    const selection = await this.prompt("Your selection: ");
    if (selection === "x") {
      console.log("Exiting the game. Goodbye!");
      process.exit(0);
    } else if (selection === "?") {
      HelpTable.display(probabilities);
      return await this.userSelectDice(excludeDice);
    } else if (
      !isNaN(selection) &&
      selection >= 0 &&
      selection < this.dice.length
    ) {
      const selectedDice = this.dice[selection];
      if (excludeDice && selectedDice === excludeDice) {
        console.log(
          "This dice is already selected by the computer. Please choose another dice."
        );
        return await this.userSelectDice(excludeDice);
      }
      return selectedDice;
    } else {
      console.log("Invalid input. Please try again.");
      return await this.userSelectDice(excludeDice);
    }
  }

  computerSelectDice(excludeDice = null) {
    const availableDice = this.dice.filter(
      (d) => !excludeDice || d !== excludeDice
    );
    const selectedDice =
      availableDice[Math.floor(Math.random() * availableDice.length)];
    return selectedDice;
  }

  async fairRoll(rangeMax, player) {
    const { combinedNumber, computerNumber, key, hmac } =
      FairRandom.fairRandomInt(0, rangeMax);
    console.log(`HMAC for ${player} throw: ${hmac}`);
    console.log(`Add your number modulo ${rangeMax}.`);

    const userNumber = parseInt(await this.prompt("Your number: "));
    const result = (userNumber + computerNumber) % rangeMax;

    console.log(`Computer's number: ${computerNumber}`);
    console.log(`Key: ${key.toString("hex")}`);
    console.log(`Result: ${result}`);

    return result;
  }

  prompt(question) {
    return new Promise((resolve) => this.rl.question(question, resolve));
  }
}

const game = new Game(dice, rl);
game.start();
