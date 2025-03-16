class ProbabilityCalculator {
  static calculateProbabilities(diceList) {
    const probabilities = {};

    for (let i = 0; i < diceList.length; i++) {
      probabilities[i] = {};
      for (let j = 0; j < diceList.length; j++) {
        if (i === j) continue;
        const wins = diceList[i].faces.filter((face) =>
          diceList[j].faces.some((otherFace) => face > otherFace)
        ).length;
        probabilities[i][j] = (wins / diceList[i].faces.length).toFixed(2);
      }
    }

    return probabilities;
  }
}

module.exports = ProbabilityCalculator;
