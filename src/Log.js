const LogType = require('./LogType');

/**
 * class Log
 */
class Log {
    /** @type LogType */
    #type;

    /** @type String */
    #message;

    /** @type Object */
    #payload;

    /** @type Array<String> */
    #prefixes;

    /** @type String */
    #colorPrefix;

    /** @type Date */
    #time;

    /** @type Function */
    #nativeConsoleFunction;

    /**
     *
     * @param {LogType} type
     * @param {LogContent} content
     */
    constructor({
      message, type, payload, printLog, printPayload, prefixes, colorPrefix,
    }) {
      this.#message = message;
      this.#type = type;
      this.#payload = payload;
      this.#prefixes = prefixes;
      this.#colorPrefix = colorPrefix;
      this.#time = new Date();
      this.#nativeConsoleFunction = this.#getNativeConsoleFunction();

      if (printLog) {
        const prefix = this.#prefixes.map((singlePrefix) => `${singlePrefix} `);
        let logContent = `${this.#colorPrefix}${prefix}${this.#message}`;
        if (printPayload && this.#payload) {
          logContent += ` ${JSON.stringify(this.#payload)}`;
        }
        this.#nativeConsoleFunction(logContent);
      }
    }

    /**
     * @returns {String}
     */
    get message() {
      return this.#message;
    }

    /**
     * @returns {Object}
     */
    get payload() {
      return this.#payload;
    }

    /**
     * @returns {LogType}
     */
    get type() {
      return this.#type;
    }

    /**
     * @returns {String}
     */
    get colorPrefix() {
      return this.#colorPrefix;
    }

    /**
     * @returns {Array<String>}
     */
    get prefixes() {
      return this.#prefixes;
    }

    /**
     * @returns {Date}
     */
    get time() {
      return this.#time;
    }

    print({ template }) {
      let logContent;
      if (template) {
        logContent = template({ log: this });
      } else {
        const prefix = this.#prefixes.map((singlePrefix) => `${singlePrefix} `);
        logContent = `${this.#colorPrefix}${this.#time} ${prefix} ${this.#message}`;
        if (this.#payload) {
          logContent += ` ${JSON.stringify(this.#payload)}`;
        }
      }
      this.#nativeConsoleFunction(logContent);
    }

    #getNativeConsoleFunction = () => {
      if (this.#type === LogType.LOG) {
        return console.log;
      }
      if (this.#type === LogType.INFO) {
        return console.info;
      }
      if (this.#type === LogType.ERROR) {
        return console.error;
      }
      throw new Error('log type is required');
    }
}

module.exports = Log;
