const Dice = require("./Dice");

class DiceParser {
  static parse(diceStrings) {
    return diceStrings.map((diceStr) => {
      const faces = diceStr.split(",").map(Number);
      if (faces.some(isNaN)) {
        throw new Error(
          `Invalid dice configuration: "${diceStr}". Dice faces must be integers.`
        );
      }
      return new Dice(faces);
    });
  }
}

module.exports = DiceParser;
