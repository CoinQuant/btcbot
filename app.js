const { Wechaty, Room } = require('wechaty');
const Crawler = require('crawler');

const News = require('./service/news');
const qrcode = require('qrcode-terminal');
const _ = require('lodash');

const Market = require('./service/market');

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
      r = await Room.find({ topic: '区块链研究技术群' });

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
      console.log(`${user.name()} logged in`);
    })
    .on('message', async function(message) {
      if (message.self()) {
        return;
      }

      const room = message.room();
      if (!room) return;

      const topic = room.topic();

      if (topic.indexOf('区块链') >= 0) {
        const platforms = [];

        _.each(app.coins, (v, k) => {
          if (
            _.indexOf(
              v,
              message.content().toLowerCase() +
                app.market.platforms[k]['suffix']
            ) >= 0
          ) {
            platforms.push(k);
          }
        });

        if (platforms.length > 0) {
          message.say(
            await app.market.tricker(message.content().toLowerCase(), platforms)
          );
        }
      }
    })
    .on('error', error => {
      app.logger.error(error.message);
    })
    .init();
};
