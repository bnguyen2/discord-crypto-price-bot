const { Client, Intents, MessageEmbed } = require('discord.js');
const { format } = require('date-fns');

const LOCALE_FRACTION = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

const discordSetup = (discordBotToken, discordChannelId) => {
  const discordBot = new Client({
    intents: [Intents.FLAGS.GUILD_MESSAGES],
  });
  return new Promise((resolve, reject) => {
    discordBot.login(discordBotToken);
    discordBot.on('ready', async () => {
      const channel = await discordBot.channels.fetch(discordChannelId);
      resolve(channel);
    });
  });
};

const createMessage = ({ color, fields }) =>
  new MessageEmbed()
    .setThumbnail(
      'https://cdn.discordapp.com/attachments/924434254664986637/925844475161501787/gradientsymbol2x.png'
    )
    .setColor(color)
    .addFields(fields);

const buyFields = (avax, ccc, avaxDollarVal, event, from, block) => {
  return [
    { name: 'Transaction', value: 'Buy CCC' },
    {
      name: 'Spent',
      value: `${avax.toLocaleString(
        undefined,
        LOCALE_FRACTION
      )}🔺 ($${avaxDollarVal.toLocaleString('en-IN', LOCALE_FRACTION)})`,
    },
    {
      name: 'Received',
      value: `${ccc.toLocaleString(undefined, LOCALE_FRACTION)} CCC`,
    },
    {
      name: 'Tx Hash',
      value: `[${event.transactionHash}](https://snowtrace.io/tx/${event.transactionHash})`,
    },
    {
      name: 'Wallet',
      value: `[${from}](https://snowtrace.io/token/0x4939B3313E73ae8546b90e53E998E82274afDbDB?a=${from})`,
    },
    {
      name: 'Block Time',
      value: format(
        new Date(parseInt(block.timestamp) * 1000),
        'MMM do y h:mm a'
      ),
    },
  ];
};

const sellFields = (avax, ccc, avaxDollarVal, event, from, block) => {
  return [
    { name: 'Transaction', value: 'Sell CCC' },
    {
      name: 'Spent',
      value: `${ccc.toLocaleString(undefined, LOCALE_FRACTION)} CCC`,
    },
    {
      name: 'Received',
      value: `${avax.toLocaleString(
        undefined,
        LOCALE_FRACTION
      )}🔺 ($${avaxDollarVal.toLocaleString('en-IN', LOCALE_FRACTION)})`,
    },
    {
      name: 'Tx Hash',
      value: `[${event.transactionHash}](https://snowtrace.io/tx/${event.transactionHash})`,
    },
    {
      name: 'Wallet',
      value: `[${from}](https://snowtrace.io/token/0x4939B3313E73ae8546b90e53E998E82274afDbDB?a=${from})`,
    },
    {
      name: 'Block Time',
      value: format(
        new Date(parseInt(block.timestamp) * 1000),
        'MMM do y h:mm a'
      ),
    },
  ];
};

module.exports = { discordSetup, createMessage, buyFields, sellFields };
