const _ = require('lodash');
const Yunbi = require('node-yunbi');

module.exports = class YunbiSdk {
  async coins() {
    let coinsResult = await Yunbi.getMarkets();

    const coinList = [];
    _.each(coinsResult, coin => {
      coinList.push(coin.id);
    });

    return coinList;
  }

  async tricker(id) {
    const result = await Yunbi.getTicker(id);
    return _.get(priceInfo, 'ticker.last');
  }
};
