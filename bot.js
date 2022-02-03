const Moralis = require('moralis/node');
const { ethers } = require('ethers');
const { fetchTokenPrice, fetchCCCPrice } = require('./utils');

const wAVAX = '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7';

const {
  discordSetup,
  createMessage,
  buyFields,
  sellFields,
} = require('./discord');

const {
  DISCORD_BOT_TOKEN,
  DISCORD_CHANNEL_ID,
  MORALIS_SERVER,
  MORALIS_APP_ID,
} = require('./secrets.json');

const MINIMUM_AVAX = 2;

async function CCCSalesBot() {
  console.log('Setting up discord bot');
  const discordChannel = await discordSetup(
    DISCORD_BOT_TOKEN,
    DISCORD_CHANNEL_ID
  );
  console.log('Setting up discord bot complete');

  Moralis.start({ serverUrl: MORALIS_SERVER, appId: MORALIS_APP_ID });

  const swapQuery = new Moralis.Query('SwapEvents');
  swapQuery.descending('block_timestamp');

  const subscription = await swapQuery.subscribe();

  subscription.on('create', async function (data) {
    console.log('Swap event happened!');
    const dataAttributes = data.attributes;
    const buyCCC = Number(
      ethers.utils.formatUnits(dataAttributes.amount0Out, 9) * 0.9
    );
    const avaxForCCC = Number(
      ethers.utils.formatUnits(dataAttributes.amount1In, 18)
    );
    const sellCCC = Number(
      ethers.utils.formatUnits(dataAttributes.amount0In, 9)
    );
    const cccForAvax = Number(
      ethers.utils.formatUnits(dataAttributes.amount1Out, 18)
    );
    const blockTimestamp = dataAttributes.block_timestamp;
    const transactionHash = dataAttributes.transaction_hash;
    const from = dataAttributes.to;
    const avaxPrice = await fetchTokenPrice(wAVAX, 'avalanche');
    const cccData = await fetchCCCPrice();

    let message;

    if (buyCCC > sellCCC) {
      const avaxDollarVal = avaxForCCC * avaxPrice;
      message = createMessage({
        color: '#66ff82',
        txHash: transactionHash,
        fields: buyFields(
          avaxForCCC,
          buyCCC,
          avaxDollarVal,
          transactionHash,
          from,
          blockTimestamp,
          cccData
        ),
      });
    } else if (sellCCC > buyCCC) {
      const avaxDollarVal = cccForAvax * avaxPrice;
      message = createMessage({
        color: '#ff6666',
        txHash: transactionHash,
        fields: sellFields(
          cccForAvax,
          sellCCC,
          avaxDollarVal,
          transactionHash,
          from,
          blockTimestamp,
          cccData
        ),
      });
    }

    try {
      if (avaxForCCC >= MINIMUM_AVAX || cccForAvax >= MINIMUM_AVAX) {
        console.log(`avaxForCCC ${avaxForCCC}, cccForAvax ${cccForAvax}`);
        console.log(
          `Minimum amount >= ${MINIMUM_AVAX}, sending message to discord.`
        );
        await discordChannel.send({ embeds: [message] });
      }
    } catch (err) {
      console.log('Error sending message', ' ', err.message);
    }
  });
}

module.exports = CCCSalesBot;
