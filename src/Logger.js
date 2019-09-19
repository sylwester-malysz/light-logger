// eslint-disable-next-line max-classes-per-file
const LogsTail = require('./LogsTail');
const LogType = require('./LogType');
const Log = require('./Log');

class Logger {
    /** @type Number */
    #maxTailSize;

    /** @type Array<String> */
    #prefixes;

    /** @type LogsTail */
    #logsTail;

    /** @type Object<String> */
    #colorPrefixes;

    /** @type Boolean */
    #printLog;

    /** @type Boolean */
    #printPayload;

    constructor({
      printLog = true, printPayload = true, maxTailSize = 100, errorPrefixColor = '\x1b[31m', infoPrefixColor = '\x1b[36m', logPrefixColor = '\x1b[33m', prefixes = [],
    } = {}, logsTail = null) {
      this.#maxTailSize = maxTailSize;
      this.#prefixes = prefixes;
      this.#printLog = printLog;
      this.#printPayload = printPayload;
      this.#logsTail = logsTail || new LogsTail({ maxSize: maxTailSize });
      this.#colorPrefixes = {
        [LogType.ERROR]: errorPrefixColor,
        [LogType.INFO]: infoPrefixColor,
        [LogType.LOG]: logPrefixColor,
      };
    }

    #createLog = ({
      message, payload, colorPrefix, prefixes, type,
    }) => {
      const log = new Log({
        message,
        payload,
        printLog: this.#printLog,
        printPayload: this.#printPayload,
        colorPrefix: colorPrefix === null ? this.#colorPrefixes[type] : colorPrefix,
        prefixes: prefixes || this.#prefixes,
        type,
      });
      this.#logsTail.add({ log });
    };

    log(message, { payload = null, colorPrefix = null, prefixes = null } = {}) {
      this.#createLog({
        message,
        payload,
        colorPrefix,
        prefixes,
        type: LogType.LOG,
      });
    }

    info(message, { payload = null, colorPrefix = null, prefixes = null } = {}) {
      this.#createLog({
        message,
        payload,
        colorPrefix,
        prefixes,
        type: LogType.INFO,
      });
    }

    error(message, { payload = null, colorPrefix = null, prefixes = null } = {}) {
      this.#createLog({
        message,
        payload,
        colorPrefix,
        prefixes,
        type: LogType.ERROR,
      });
    }

    /**
     *
     * @returns {Log[]}
     */
    getLogs() {
      return [...this.#logsTail.get()];
    }

    /**
     * @param {Function} template
     */
    printLogsStack({ template = null } = {}) {
      this.#logsTail.get().map((log) => log.print({ template }));
    }

    fork({
      extraPrefixes = [], errorPrefixColor = null, infoPrefixColor = null, logPrefixColor = null, prefixes = null, printLog = null, printPayload = null,
    }) {
      // eslint-disable-next-line no-use-before-define
      const forkedLogger = new LoggerFork({
        printLog: printLog === null ? this.#printLog : printLog,
        printPayload: printPayload === null ? this.#printPayload : printPayload,
        errorPrefixColor: errorPrefixColor === null ? this.#colorPrefixes[LogType.ERROR] : errorPrefixColor,
        infoPrefixColor: infoPrefixColor === null ? this.#colorPrefixes[LogType.INFO] : infoPrefixColor,
        logPrefixColor: logPrefixColor === null ? this.#colorPrefixes[LogType.LOG] : logPrefixColor,
        prefixes: [...(prefixes || this.#prefixes), ...extraPrefixes],
      }, this.#logsTail);
      return forkedLogger;
    }
}

class LoggerFork extends Logger {
    #logsTail;

    constructor(loggerParams, logsTail) {
      super(loggerParams);
      this.#logsTail = logsTail;
    }
}

module.exports = Logger;
