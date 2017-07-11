const EventEmitter = require('events');

const JubiNews = require('./lib/jubi.js');

module.exports = class News extends EventEmitter {
  constructor(crawler) {
    super();
    this._crawler = crawler;
  }

  get current() {
    return {
      jubi: 2702
    };
  }

  set current(value) {
    this.current[value.platform] = value.value;
  }

  async start() {
    const jubi = new JubiNews(this._crawler);
    await jubi.start(this.current['jubi']);

    jubi.on('data', async data => {
      this.emit('data', data);
    });
  }
};
