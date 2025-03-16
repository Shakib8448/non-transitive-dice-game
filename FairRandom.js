const crypto = require("crypto");

class FairRandom {
  static generateKey() {
    return crypto.randomBytes(32);
  }

  static generateHMAC(key, message) {
    return crypto
      .createHmac("sha3-256", key)
      .update(message.toString())
      .digest("hex");
  }

  static fairRandomInt(userNumber, rangeMax) {
    const key = FairRandom.generateKey();
    const computerNumber = crypto.randomInt(rangeMax);
    const combinedNumber = (userNumber + computerNumber) % rangeMax;
    const hmac = FairRandom.generateHMAC(key, computerNumber);
    return { combinedNumber, computerNumber, key, hmac };
  }
}

module.exports = FairRandom;
