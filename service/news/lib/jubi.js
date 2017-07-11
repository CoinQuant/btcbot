const EventEmitter = require('events');
const _ = require('lodash');

module.exports = class JubiNews extends EventEmitter {
  constructor(crawler) {
    super();
    this._preUrl = 'https://www.jubi.com';
    this._crawler = crawler;
  }

  async start(current) {
    this._crawler.queue([
      {
        uri: this._preUrl + '/gonggao/',
        callback: async (err, res, done) => {
          if (err) {
            this.emit('error', err);
          }

          const $ = res.$;
          const notices = [];
          $('.new_list li').each((i, elem) => {
            const path = $($($($($(elem).children())[2]).children())[0]).attr(
              'href'
            );
            let last = path.substr(
              _.lastIndexOf(path, '/') + 1,
              _.indexOf(path, '.')
            );

            if (parseInt(last) > current) {
              notices.push({
                title: $($($(elem).children())[0]).text(),
                time: $($($(elem).children())[1]).text(),
                url: this._preUrl + path
              });
            }
          });

          this.emit('data', notices);

          done();
        }
      }
    ]);
  }
};
