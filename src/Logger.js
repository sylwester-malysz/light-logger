/* eslint-disable class-methods-use-this */
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
      // eslint-disable-next-line no-console
      [LogType.ERROR]: console.error,
      // eslint-disable-next-line no-console
      [LogType.INFO]: console.info,
      // eslint-disable-next-line no-console
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

    #printSingleLog = ({ log, template }) => {
      const printFunction = this.#printFunctions[log.type];
      const colorPrefix = this.#colorPrefixes[log.type];
      const templateFn = template || this.#template;
      const logContent = templateFn({
        message: log.message,
        type: log.type,
        time: log.time,
        payload: log.payload,
        prefixes: log.prefixes,
        colorPrefix,
        ...this.#printConfig,
      });
      printFunction(logContent);
    };

    #createLog = ({
      message, payload, fullPayload, type,
    }) => {
      const log = new Log({
        message,
        payload,
        fullPayload,
        type,
        prefixes: this.#prefixes,
      });
      this.#logsTail.add({ log });
      if (this.#printLog) {
        this.#printSingleLog({ log });
      }
    };

    #log = (message, { payload, fullPayload } = {}) => {
      this.#createLog({
        message,
        payload,
        fullPayload,
        type: LogType.LOG,
      });
    }

    #info = (message, { payload, fullPayload } = {}) => {
      this.#createLog({
        message,
        payload,
        fullPayload,
        type: LogType.INFO,
      });
    };

    #error = (message, { payload, fullPayload } = {}) => {
      this.#createLog({
        message,
        payload,
        fullPayload,
        type: LogType.ERROR,
      });
    };

    /**
     *
     * @returns {Log[]}
     */
    #getLogs = () => [...this.#logsTail.get()];

    /**
     * @param {Function} template
     */
    #printLogsStack = ({ template = null } = {}) => {
      this.#logsTail.get().map((log) => this.#printSingleLog({ log, template }));
    };

    #fork = ({
      extraPrefixes = [], errorPrefixColor = null, infoPrefixColor = null, logPrefixColor = null, prefixes = null, printLog = null, printPayload = null,
    } = {}) => {
      // eslint-disable-next-line no-use-before-define
      const forkedLogger = new Logger({
        printLog: printLog === null ? this.#printLog : printLog,
        printPayload: printPayload === null ? this.#printConfig.printPayload : printPayload,
        errorPrefixColor: errorPrefixColor === null ? this.#colorPrefixes[LogType.ERROR] : errorPrefixColor,
        infoPrefixColor: infoPrefixColor === null ? this.#colorPrefixes[LogType.INFO] : infoPrefixColor,
        logPrefixColor: logPrefixColor === null ? this.#colorPrefixes[LogType.LOG] : logPrefixColor,
        prefixes: [...(prefixes || this.#prefixes), ...extraPrefixes],
      }, this.#logsTail.fork());
      return forkedLogger;
    };

    get log() {
      return this.#log;
    }

    set log(_val) {
      throw new Error('"log" attr is reserved. Cannot be used as sublogger');
    }

    get info() {
      return this.#info;
    }

    set info(_val) {
      throw new Error('"info" attr is reserved. Cannot be used as sublogger');
    }

    get error() {
      return this.#error;
    }

    set error(_val) {
      throw new Error('"error" attr is reserved. Cannot be used as sublogger');
    }

    get fork() {
      return this.#fork;
    }

    set fork(_val) {
      throw new Error('"fork" attr is reserved. Cannot be used as sublogger');
    }

    get printLogsStack() {
      return this.#printLogsStack;
    }

    set printLogsStack(_val) {
      throw new Error('"printLogsStack" attr is reserved. Cannot be used as sublogger');
    }

    get getLogs() {
      return this.#getLogs;
    }

    set getLogs(_val) {
      throw new Error('"getLogs" attr is reserved. Cannot be used as sublogger');
    }
}

module.exports = Logger;
