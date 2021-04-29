// eslint-disable-next-line max-classes-per-file
const LogsTail = require('./LogsTail');
const LogType = require('./LogType');
const Log = require('./Log');

const defaultLogTemplate = ({
  message,
  payload,
  time,
  prefixes,
  colorPrefix,
  printPayload,
  printTime,
  printPrefix,
}) => colorPrefix
    + (printTime && `${time.toISOString()} `)
    + (printPrefix && prefixes.map((singlePrefix) => `${singlePrefix} `))
    + message
    + ((printPayload && payload) ? ` ${JSON.stringify(payload)}` : '');


class Logger {
    /** @type Array<String> */
    #prefixes;

    /** @type LogsTail */
    #logsTail;

    /** @type Object<String> */
    #colorPrefixes;

    /** @type Boolean */
    #printLog;

    /** @type Object<Boolean> */
    #printConfig;

    /** @type Object<Function> */
    #printFunctions = {
      [LogType.ERROR]: console.error,
      [LogType.INFO]: console.info,
      [LogType.LOG]: console.log,
    };

    /** @type Function */
    #template;

    /**
     * @param {Boolean} printLog
     * @param {Boolean} printTime
     * @param {Boolean} printPrefix
     * @param {Boolean} printPayload
     * @param maxTailSize
     * @param {String} errorPrefixColor
     * @param {String} infoPrefixColor
     * @param {String} logPrefixColor
     * @param {String[]} prefixes
     * @param {LogsTail=} logsTail
     * @param {Function} customTemplate
     */
    constructor({
      printLog = true,
      printTime = true,
      printPrefix = true,
      printPayload = true,
      maxTailSize = 100,
      errorPrefixColor = '\x1b[31m',
      infoPrefixColor = '\x1b[36m',
      logPrefixColor = '\x1b[33m',
      prefixes = [],
      customTemplate,
    } = {}, logsTail = null) {
      this.#prefixes = prefixes;
      this.#printLog = printLog;
      this.#printConfig = {
        printPayload,
        printTime,
        printPrefix,
      };
      this.#template = customTemplate || defaultLogTemplate;
      this.#logsTail = logsTail || new LogsTail({ maxSize: maxTailSize });
      this.#colorPrefixes = {
        [LogType.ERROR]: errorPrefixColor,
        [LogType.INFO]: infoPrefixColor,
        [LogType.LOG]: logPrefixColor,
      };
    }

    #createLog = ({
      message, payload, type,
    }) => {
      const log = new Log({
        message,
        payload,
        type,
        prefixes: this.#prefixes,
      });
      this.#logsTail.add({ log });
      if (this.#printLog) {
        const printFunction = this.#printFunctions[type];
        const colorPrefix = this.#colorPrefixes[type];
        const logContent = this.#template({
          message: log.message,
          type: log.type,
          time: log.time,
          payload: log.payload,
          prefixes: log.prefixes,
          colorPrefix,
          ...this.#printConfig,
        });
        printFunction(logContent);
      }
    };


    log(message, { payload } = {}) {
      this.#createLog({
        message,
        payload,
        type: LogType.LOG,
      });
    }

    info(message, { payload } = {}) {
      this.#createLog({
        message,
        payload,
        type: LogType.INFO,
      });
    }

    error(message, { payload } = {}) {
      this.#createLog({
        message,
        payload,
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
        printPayload: printPayload === null ? this.#printConfig.printPayload : printPayload,
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
