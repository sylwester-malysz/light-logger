/**
 * @typedef { Array<Log> } LogCollection
 */

/**
 * class LogsTail
 */
class LogsTail {
    /** @type Array<Log> */
    #logs = [];

    /** @type Number */
    #maxSize;

    /** @type LogsTail */
    #parentLogsTail;


    constructor({ maxSize }, parentLogsTail = null) {
      this.#maxSize = maxSize;
      this.#parentLogsTail = parentLogsTail;
    }

    /**
     * @param {Log} log
     */
    add({ log }) {
      if (this.#logs.length === this.#maxSize) {
        this.#logs.shift();
      }
      this.#logs.push(log);
      if (this.#parentLogsTail) {
        this.#parentLogsTail.add({ log });
      }
    }

    fork({ maxSize = this.#maxSize } = {}) {
      return new LogsTail({ maxSize }, this);
    }


    /**
     * @returns {Array<Log>}
     */
    get() {
      return this.#logs;
    }
}

module.exports = LogsTail;
