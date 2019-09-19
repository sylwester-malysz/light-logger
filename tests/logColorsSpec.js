const { expect } = require('chai');

const Logger = require('../src/Logger');

describe('Log colors test', () => {
  describe('When default color is set', () => {
    let logText;
    beforeEach(() => {
      console.error = (content) => {
        logText = content;
      };
    });
    it(' should be red on error', () => {
      const logger = new Logger();
      logger.error('test');
      expect(logText).to.equal('\u001b[31mtest');
    });
  });
});
