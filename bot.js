const { MessageEmbed } = require('discord.js');
const { ethers } = require('ethers');
const { format } = require('date-fns');
const fetch = require('node-fetch');

const { discordSetup } = require('./discord');
const LOCALE_FRACTION = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

async function CCCSalesBot({
  WEBSOCKET_URI,
  DISCORD_BOT_TOKEN,
  DISCORD_CHANNEL_ID,
  SNOWTRACE_API_KEY,
}) {
  console.log('Setting up discord bot');
  const discordChannel = await discordSetup(
    DISCORD_BOT_TOKEN,
    DISCORD_CHANNEL_ID
  );
  console.log('Setting up discord bot complete');

  const cccAvaxPair = '0x306e2fe26cb13f1315d83a2f2297c12b14574dc2';

  const ABI = [
    'event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)',
  ];
  const provider = new ethers.providers.WebSocketProvider(WEBSOCKET_URI);
  const pairContract = new ethers.Contract(cccAvaxPair, ABI, provider);

  const createMessage = ({ color, fields }) =>
    new MessageEmbed()
      .setThumbnail(
        'https://cdn.discordapp.com/attachments/924434254664986637/925844475161501787/gradientsymbol2x.png'
      )
      .setColor(color)
      .addFields(fields);

  pairContract.on(
    'Swap',
    async (to, amt0In, amt1In, amt0Out, amt1Out, from, event) => {
      const buyCCC = Number(ethers.utils.formatUnits(amt0Out, 9) * 0.9);
      const avaxForCCC = Number(ethers.utils.formatUnits(amt1In, 18));

      const sellCCC = Number(ethers.utils.formatUnits(amt0In, 9));
      const cccForAvax = Number(ethers.utils.formatUnits(amt1Out, 18));
      const block = await event.getBlock();

      const snowTraceAPI = `https://api.snowtrace.io/api?module=stats&action=ethprice&apikey=${SNOWTRACE_API_KEY}`;

      const snowtraceResponse = await fetch(snowTraceAPI).then((res) =>
        res.json()
      );
      const avaxPrice = snowtraceResponse.result.ethusd;
      let message;

      if (buyCCC > sellCCC) {
        const avaxDollarVal = avaxForCCC * avaxPrice;
        message = createMessage({
          color: '#66ff82',
          txHash: event.transactionHash,
          fields: [
            { name: 'Transaction', value: 'Bought CCC' },
            {
              name: 'Spent',
              value: `${avaxForCCC.toLocaleString(
                undefined,
                LOCALE_FRACTION
              )}🔺 ($${avaxDollarVal.toLocaleString(
                'en-IN',
                LOCALE_FRACTION
              )})`,
            },
            {
              name: 'Receive',
              value: `${buyCCC.toLocaleString(undefined, LOCALE_FRACTION)} CCC`,
            },
            {
              name: 'Tx Hash',
              value: `https://snowtrace.io/tx/${event.transactionHash}`,
            },
            {
              name: 'Wallet',
              value: `https://snowtrace.io/token/0x4939B3313E73ae8546b90e53E998E82274afDbDB?a=${from}`,
            },
            {
              name: 'Block Time',
              value: format(
                new Date(parseInt(block.timestamp) * 1000),
                'MMM do y h:mm a'
              ),
            },
          ],
        });
      } else if (sellCCC > buyCCC) {
        const avaxDollarVal = cccForAvax * avaxPrice;
        message = createMessage({
          color: '#ff6666',
          txHash: event.transactionHash,
          fields: [
            { name: 'Transaction', value: 'Sold CCC' },
            {
              name: 'Sold',
              value: `$${sellCCC.toLocaleString(
                undefined,
                LOCALE_FRACTION
              )} CCC`,
            },
            {
              name: 'Receive',
              value: `${cccForAvax.toLocaleString(
                undefined,
                LOCALE_FRACTION
              )}🔺 (${avaxDollarVal.toLocaleString('en-IN', LOCALE_FRACTION)})`,
            },
            {
              name: 'Tx Hash',
              value: `https://snowtrace.io/tx/${event.transactionHash}`,
            },
            {
              name: 'Wallet',
              value: `https://snowtrace.io/token/0x4939B3313E73ae8546b90e53E998E82274afDbDB?a=${from}`,
            },
            {
              name: 'Block Time',
              value: format(
                new Date(parseInt(block.timestamp) * 1000),
                'MMM do y h:mm a'
              ),
            },
          ],
        });
      }

      try {
        await discordChannel.send({ embeds: [message] });
      } catch (err) {
        console.log('Error sending message', ' ', err.message);
      }
    }
  );
}

module.exports = CCCSalesBot;
