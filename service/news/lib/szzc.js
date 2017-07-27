const EventEmitter = require('events');
const _ = require('lodash');

module.exports = class JubiNews extends EventEmitter {
  constructor(crawler) {
    super();
    this._preUrl = 'https://szzc.com';
    this._crawler = crawler;
  }

  async start(current) {
    this._crawler.queue([
      {
        uri: this._preUrl + '/api/news/articles/NOTICE?language=zh',
        callback: async (err, res, done) => {
          if (err) {
            this.emit('error', err);
          }

          const notices = [];
          const body = JSON.parse(res.body);

          if (_.get(body, 'status.success')) {
            const data = _.get(body, 'result.data');

            for (let i = 0; i < data.length; i++) {
              if (+new Date(data[i].publication_date) > current) {
                notices.push({
                  title: data[i].subject,
                  time: data[i].publication_date,
                  url: this._preUrl + '/#!/news/' + data[i].id,
                });
              }
            }
          }

          this.emit('data', notices);

          done();
        },
      },
    ]);
  }
};
