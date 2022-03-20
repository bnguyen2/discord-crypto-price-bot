const { Client, Intents, MessageEmbed } = require('discord.js');
const { format } = require('date-fns');
const numeral = require('numeral');

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

const buyFields = (
  avax,
  ccc,
  avaxDollarVal,
  transactionHash,
  from,
  blockTimestamp,
  cccData
) => {
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
      name: 'CCC Price',
      value: cccData.price,

      inline: true,
    },
    {
      name: 'Market Cap',
      value: numeral(cccData.marketCap).format('$0.0a').toUpperCase(),
      inline: true,
    },
    {
      name: 'Liquidity',
      value: numeral(cccData.liquidity).format('$0.0a').toUpperCase(),
      inline: true,
    },
    {
      name: 'Tx Hash',
      value: `[${transactionHash}](https://snowtrace.io/tx/${transactionHash})`,
    },
    {
      name: 'Wallet',
      value: `[${from}](https://snowtrace.io/token/0x4939B3313E73ae8546b90e53E998E82274afDbDB?a=${from})`,
    },
    {
      name: 'Block Time',
      value: format(new Date(`${blockTimestamp}`), 'MMM do y h:mm a'),
    },
    {
      name: 'CCC Website',
      value: `[Link](https://crosschaincapital.finance/)`,
      inline: true,
    },
    {
      name: 'TJ',
      value: `[Buy](https://traderjoexyz.com/trade?outputCurrency=0x4939B3313E73ae8546b90e53E998E82274afDbDB)`,
      inline: true,
    },
    {
      name: 'Dex Screener',
      value: `[Link](https://dexscreener.com/avalanche/0x306e2fe26cb13f1315d83a2f2297c12b14574dc2)`,
      inline: true,
    },
  ];
};

const sellFields = (
  avax,
  ccc,
  avaxDollarVal,
  transactionHash,
  from,
  blockTimestamp,
  cccData
) => {
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
      name: 'CCC Price',
      value: cccData.price,
      inline: true,
    },
    {
      name: 'Market Cap',
      value: numeral(cccData.marketCap).format('$0.0a').toUpperCase(),
      inline: true,
    },
    {
      name: 'Liquidity',
      value: numeral(cccData.liquidity).format('$0.0a').toUpperCase(),
      inline: true,
    },
    {
      name: 'Tx Hash',
      value: `[${transactionHash}](https://snowtrace.io/tx/${transactionHash})`,
    },
    {
      name: 'Wallet',
      value: `[${from}](https://snowtrace.io/token/0x4939B3313E73ae8546b90e53E998E82274afDbDB?a=${from})`,
    },
    {
      name: 'Block Time',
      value: format(new Date(`${blockTimestamp}`), 'MMM do y h:mm a'),
    },
    {
      name: 'CCC Site',
      value: `[Link](https://crosschaincapital.finance/)`,
      inline: true,
    },
    {
      name: 'TJ',
      value: `[Buy](https://traderjoexyz.com/trade?outputCurrency=0x4939B3313E73ae8546b90e53E998E82274afDbDB)`,
      inline: true,
    },
    {
      name: 'Dex Screener',
      value: `[Link](https://dexscreener.com/avalanche/0x306e2fe26cb13f1315d83a2f2297c12b14574dc2)`,
      inline: true,
    },
  ];
};

module.exports = { discordSetup, createMessage, buyFields, sellFields };
