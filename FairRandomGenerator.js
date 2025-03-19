const crypto = require("crypto");

class FairRandomGenerator {
  static generateKey() {
    return crypto.randomBytes(32).toString("hex");
  }

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

module.exports = FairRandomGenerator;
