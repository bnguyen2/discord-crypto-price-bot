const { ethers } = require('ethers');
const { fetchTokenPrice, fetchCCCPrice } = require('./utils');

const {
  discordSetup,
  createMessage,
  buyFields,
  sellFields,
} = require('./discord');

const {
  JSON_RPC,
  DISCORD_BOT_TOKEN,
  DISCORD_CHANNEL_ID,
} = require('./secrets.json');

const MINIMUM_AVAX = 2;

async function CCCSalesBot() {
  console.log('Setting up discord bot');
  const discordChannel = await discordSetup(
    DISCORD_BOT_TOKEN,
    DISCORD_CHANNEL_ID
  );
  console.log('Setting up discord bot complete');

  const cccAvaxPair = '0x306e2fe26cb13f1315d83a2f2297c12b14574dc2';
  const wAVAX = '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7';

  const ABI = [
    'event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)',
  ];
  const provider = new ethers.providers.JsonRpcProvider(JSON_RPC);
  const pairContract = new ethers.Contract(cccAvaxPair, ABI, provider);

  pairContract.on(
    'Swap',
    async (to, amt0In, amt1In, amt0Out, amt1Out, from, event) => {
      console.log('Swap event happened!');
      const buyCCC = Number(ethers.utils.formatUnits(amt0Out, 9) * 0.9);
      const avaxForCCC = Number(ethers.utils.formatUnits(amt1In, 18));
      const sellCCC = Number(ethers.utils.formatUnits(amt0In, 9));
      const cccForAvax = Number(ethers.utils.formatUnits(amt1Out, 18));
      const block = await event.getBlock();
      const avaxPrice = await fetchTokenPrice(wAVAX, 'avalanche');
      const cccData = await fetchCCCPrice();

      let message;

      if (buyCCC > sellCCC) {
        const avaxDollarVal = avaxForCCC * avaxPrice;
        message = createMessage({
          color: '#66ff82',
          txHash: event.transactionHash,
          fields: buyFields(
            avaxForCCC,
            buyCCC,
            avaxDollarVal,
            event,
            from,
            block,
            cccData
          ),
        });
      } else if (sellCCC > buyCCC) {
        const avaxDollarVal = cccForAvax * avaxPrice;
        message = createMessage({
          color: '#ff6666',
          txHash: event.transactionHash,
          fields: sellFields(
            cccForAvax,
            sellCCC,
            avaxDollarVal,
            event,
            from,
            block,
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
    }
  );
}

module.exports = CCCSalesBot;
