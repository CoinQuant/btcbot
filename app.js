'use strict';

const _ = require('lodash');
const { Wechaty, Room } = require('wechaty');
const Crawler = require('crawler');
const qrcode = require('qrcode-terminal');

const News = require('coin-news');
const Market = require('markets');

module.exports = app => {
  app.beforeStart(async () => {
    app.market = new Market();
    app.coins = await app.market.coins();

    app.crawler = new Crawler({
      maxConnection: 10,
      rateLimit: 1500
    });

    const news = new News(app.crawler);

    news.on('data', async data => {
      const content = '';
      const r = await Room.find({ topic: '区块链研究技术群' });

      if (!r) return;

      for (let i = 0; i < data.length; i++) {
        await r.say(data[i].title + '\n' + data[i].url);
      }
    });

    // start get news
    setTimeout(async () => {
      await news.start();
    }, 10000);
  });

  Wechaty.instance()
    .on('scan', async function(url, code) {
      const loginUrl = url.replace(/\/qrcode\//, '/l/');
      await qrcode.generate(loginUrl);
    })
    .on('login', user => {
      app.logger.info(`WeChat: ${user.name()} logged in`);
    })
    .on('message', async function(message) {
      const symbol = message.content().toLowerCase();

      if (message.self() && (IS_PROD() || (!IS_PROD() && symbol.length >= 5)))
        return;

      const room = message.room();
      if (!room) return;

      const topic = room.topic();

      if (!_.includes(topic, '区块链')) return;

      const platforms = [];

      _.each(app.coins, (v, k) => {
        let suffix = app.market.platforms[k]['suffix'];
        if (_.includes(v, `${symbol}${suffix}`)) {
          platforms.push(k);
        }
      });

      if (0 === platforms.length) return;
      message.say(await app.market.ticker(symbol, platforms));
    })
    .on('error', error => {
      app.logger.error(error.message);
    })
    .init();
};

function IS_PROD() {
  return process.env.EGG_SERVER_ENV === 'prod';
}
