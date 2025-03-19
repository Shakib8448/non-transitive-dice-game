const DiceParser = require("./DiceParser");
const Game = require("./Game");

function main() {
  const diceStrings = process.argv.slice(2);

  if (diceStrings.length < 3) {
    console.error("Error: At least 3 dice configurations are required.");
    console.error("Example: node main.js 2,2,4,4,9,9 6,8,1,1,8,6 7,5,3,7,5,3");
    process.exit(1);
  }

  try {
    const diceList = DiceParser.parse(diceStrings);
    const game = new Game(diceList);
    game.start();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error(
      "Example of correct usage: node main.js 2,2,4,4,9,9 6,8,1,1,8,6 7,5,3,7,5,3"
    );
    process.exit(1);
  }
}

main();
