/**
 * @typedef { Array<Log> } LogCollection
 */

/**
 * class LoggerStore
 */
class LogsTail {
    /** @type Array<Log> */
    #logs = [];

    /** @type Number */
    #maxSize;


    constructor({ maxSize }) {
      this.#maxSize = maxSize;
    }

    /**
     * @param {Log} log
     */
    add({ log }) {
      if (this.#logs.length === this.#maxSize) {
        this.#logs.shift();
      }
      this.#logs.push(log);
    }


    /**
     * @returns {Array<Log>}
     */
    get() {
      return this.#logs;
    }
}

module.exports = LogsTail;
