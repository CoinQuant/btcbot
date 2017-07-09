const _ = require('lodash');
const rp = require('request-promise');

module.exports = class YunbiSdk {
  constructor(accessKey) {
    this._preUrl = 'https://yunbi.com';
    this._accessKey = accessKey;
  }

  async coins() {
    let coinsResult = await rp(this._preUrl + '/api/v2/markets.json');

    if ('string' === typeof coinsResult) {
      coinsResult = JSON.parse(coinsResult);
    }

    const coinList = [];
    _.each(coinsResult, coin => {
      coinList.push(coin.id);
    });

    return coinList;
  }

  async tricker(id) {
    const result = await rp(this._preUrl + `/api/v2/tickers/${id}.json`);
    const priceInfo = JSON.parse(result);

    return _.get(priceInfo, 'ticker.last');
  }
};
