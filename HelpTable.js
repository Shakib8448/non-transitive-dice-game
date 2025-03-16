class HelpTable {
  static display(probabilities) {
    console.log("\n=== Help Table (Winning Probabilities) ===");
    const diceIndices = Object.keys(probabilities);
    const header = ["Dice"].concat(diceIndices.map((i) => `Dice ${i}`));
    console.log(header.join("\t"));

    diceIndices.forEach((i) => {
      const row = [`Dice ${i}`];
      diceIndices.forEach((j) => {
        row.push(probabilities[i][j] || "-");
      });
      console.log(row.join("\t"));
    });
  }
}

module.exports = HelpTable;
