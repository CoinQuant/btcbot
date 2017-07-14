const EventEmitter = require('events');
const _ = require('lodash');

const JubiNews = require('./lib/jubi.js');
const HuobiNews = require('./lib/huobi.js');
const OKCoinNews = require('./lib/okcoin.js');

module.exports = class News extends EventEmitter {
  constructor(crawler) {
    super();
    this._crawler = crawler;
  }

  get current() {
    return {
      jubi: 2702,
      huobi: 619,
      okcoin: 412
    };
  }

  set current(value) {
    this.current[value.platform] = value.value;
  }

  async start() {
    const pfs = _.keys(this.current);

    for (let i = 0; i < pfs.length; i++) {
      const NN = require(`./lib/${pfs[i]}.js`);
      const newsAndNotice = new NN(this._crawler);

      try {
        newsAndNotice.start(this.current[pfs[i]]);
        newsAndNotice.on('data', async data => {
          this.emit('data', data);
        });
      } catch (e) {}
    }
  }
};
