'use strict';

const EventEmitter = require('events');
const _ = require('lodash');

module.exports = class JinseNews extends EventEmitter {
  constructor(crawler) {
    super();
    this._preUrl = getBlockchainUrl();
    this._crawler = crawler;
    this._newsIndex = 48578;
    this._blockchainIndex = 48650;
  }

  async start(current) {
    this._crawler.queue([
      {
        uri: this._preUrl,
        userAgent: userAgent(),
        callback: async (err, res, done) => {
          if (err) {
            this.emit('error', err);
          }

          const $ = res.$;
          const notices = [];

          $('.pic').each((i, elem) => {
            if (i >= 8) return;
            const href = $(elem).attr('href');
            const index = getUriIndex(href);
            if (
              (_.includes(href, getNewsBlockchainUrl()) &&
                index > this._newsIndex) ||
              (_.includes(href, getBlockchainUrl()) &&
                index > this._blockchainIndex)
            ) {
              notices.push({
                title: $(elem).attr('title'),
                url: href,
              });
            }
          });

          if (notices.length > 0) {
            this.emit('data', notices);
          }
          done();
        },
      },
    ]);
  }
};

function getUriIndex(uri) {
  const index = uri.substr(_.lastIndexOf(uri, '/') + 1, _.indexOf(uri, '.'));
  return _.parseInt(index);
}

function getPreUrl(uri) {
  return uri.substr(0, _.lastIndexOf(uri, '/'));
}

function getNewsBlockchainUrl() {
  return 'http://www.jinse.com/news/blockchain';
}

function getBlockchainUrl() {
  return 'http://www.jinse.com/blockchain';
}

function userAgent() {
  return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36';
}
