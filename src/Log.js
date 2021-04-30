/**
 * class Log
 */
class Log {
    /** @type LogType */
    #type;

    /** @returns {LogType} */
    get type() {
      return this.#type;
    }

    /** @type String */
    #message;

    /** @returns {String} */
    get message() {
      return this.#message;
    }

    /** @type String[] */
    #prefixes;

    /** @returns {String[]} */
    get prefixes() {
      return this.#prefixes;
    }

    /** @type Object */
    #payload;

    /** @returns {Object} */
    get payload() {
      return this.#payload;
    }

    /** @type Object */
    #fullPayload;

    /** @returns {Object} */
    get fullPayload() {
      return this.#fullPayload;
    }

    /** @type Date */
    #time;

    /** @returns {Date} */
    get time() {
      return this.#time;
    }

    constructor({
      message,
      type,
      payload,
      fullPayload,
      prefixes,
    }) {
      this.#message = message;
      this.#type = type;
      this.#payload = payload;
      this.#fullPayload = fullPayload;
      this.#prefixes = prefixes;
      this.#time = new Date();
    }
}

module.exports = Log;
