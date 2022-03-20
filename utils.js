const axios = require('axios');
const NodeCache = require('node-cache');
const { MORALIS_API_KEY } = require('./secrets.json');

const myCache = new NodeCache();

async function fetchTokenPrice(address, chain) {
  const url = `https://deep-index.moralis.io/api/v2/erc20/${address}/price?chain=${chain}`;

  if (myCache.has('price')) {
    return myCache.get('price');
  }

  try {
    const response = await axios.get(url, {
      headers: {
        'X-API-KEY': MORALIS_API_KEY,
      },
    });
    const data = response.data;

    // set cache with 5s ttl
    myCache.set('price', data.usdPrice, 5);

    return data.usdPrice;
  } catch (err) {
    console.error('err', JSON.stringify(err, null, 2));
    if (myCache.has('price')) {
      return myCache.get('price');
    }
  }
}

async function fetchCCCPrice() {
  const url =
    'https://api.dexscreener.io/latest/dex/pairs/avalanche/0x306e2fe26cb13f1315d83a2f2297c12b14574dc2';

  if (myCache.has('cccPrice')) {
    return myCache.get('cccPrice');
  }

  try {
    const response = await axios.get(url);
    const data = response.data;
    const cccPrice = data.pair.priceUsd;
    const marketCap = data.pair.fdv;
    const liquidity = data.pair.liquidity.usd;

    // set cache with 5s ttl
    myCache.set(
      'cccPrice',
      {
        price: cccPrice,
        marketCap,
        liquidity,
      },
      5
    );

    return {
      price: cccPrice,
      marketCap,
      liquidity,
    };
  } catch (err) {
    console.error('err', JSON.stringify(err, null, 2));
    if (myCache.has('cccPrice')) {
      return myCache.get('cccPrice');
    }
  }
}

module.exports = { fetchTokenPrice, fetchCCCPrice };
