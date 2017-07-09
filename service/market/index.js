const _ = require('lodash');

module.exports = class Market {
  constructor() {
    this._sdks = {};
  }

  get platforms() {
    return {
      yunbi: {
        name: '云币网',
        suffix: 'cny'
      },
      bter: {
        name: '比特儿',
        suffix: '_cny'
      }
    };
  }

  async coins() {
    const pfs = _.keys(this.platforms);
    const coinList = {};

    for (let i = 0; i < pfs.length; i++) {
      const Sdk = require(`./lib/${pfs[i]}.js`);
      this._sdks[pfs[i]] = new Sdk('');

      try {
        let list = await this._sdks[pfs[i]].coins();
        coinList[pfs[i]] = list;
      } catch (e) {}
    }

    return coinList;
  }

  async tricker(content, pf) {
    const pfs = _.keys(this.platforms);
    let info = `当前${content}价格:`;

    for (let i = 0; i < pfs.length; i++) {
      const coinId = content.toLowerCase() + this.platforms[pfs[i]]['suffix'];

      try {
        if (pf.indexOf(pfs[i]) < 0) continue;

        let price = await this._sdks[pfs[i]].tricker(coinId);
        info += `\n${this.platforms[pfs[i]]['name']}:${price}`;
      } catch (e) {
        if ('yunbi' === pfs[i]) {
          info += '\n云币工作人员正在抄底，请耐心等候！';
        }
      }
    }

    return info;
  }
};
