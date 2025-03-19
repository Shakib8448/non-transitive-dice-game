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

module.exports = ProbabilityCalculator;
