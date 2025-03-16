const readline = require("readline");
const Dice = require("./Dice");
const FairRandom = require("./FairRandom");
const ProbabilityCalculator = require("./ProbabilityCalculator");
const HelpTable = require("./HelpTable");

class Game {
  constructor(diceFaces) {
    this.dice = diceFaces.map((faces) => new Dice(faces));
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async start() {
    console.log("Welcome to the Non-Transitive Dice Game!");

    // Determine who makes the first move
    const { firstMove } = await this.determineFirstMove();
    console.log(
      firstMove === 0
        ? "You make the first move!"
        : "Computer makes the first move!"
    );

    // Play the game
    await this.playGame(firstMove);
  }

  async determineFirstMove() {
    const key = FairRandom.generateKey();
    const hmac = FairRandom.generateHMAC(key, "0");
    console.log(`HMAC: ${hmac}`);
    console.log("Guess 0 or 1 to determine who makes the first move.");

    const userGuess = await this.prompt("Your guess (0 or 1): ");
    const { combinedNumber, computerNumber } = FairRandom.fairRandomInt(
      key,
      parseInt(userGuess),
      2
    );

    console.log(`Computer's number: ${computerNumber}`);
    console.log(`Result: ${combinedNumber}`);
    console.log(`Key: ${key.toString("hex")}`);

    return { firstMove: combinedNumber };
  }

  async playGame(firstMove) {
    // Implement game logic here
  }

  prompt(question) {
    return new Promise((resolve) => this.rl.question(question, resolve));
  }
}

module.exports = Game;
