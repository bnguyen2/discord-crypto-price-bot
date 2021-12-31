const axios = require('axios');
const { MORALIS_API_KEY } = require('./secrets.json');

async function fetchTokenPrice(address, chain) {
  const url = `https://deep-index.moralis.io/api/v2/erc20/${address}/price?chain=${chain}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'X-API-KEY': MORALIS_API_KEY,
      },
    });
    const data = response.data;
    return data.usdPrice;
  } catch (err) {
    console.error('err', JSON.stringify(err, null, 2));
    return err.message;
  }
}

module.exports = { fetchTokenPrice };
