const { ethers } = require('ethers');
const fetch = require('node-fetch');

const {
  discordSetup,
  createMessage,
  buyFields,
  sellFields,
} = require('./discord');

const EXPECTED_PONG_BACK = 15000;
const KEEP_ALIVE_CHECK_INTERVAL = 30000;

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

  let pingTimeout = null;
  let keepAliveInterval = null;

  provider._websocket.on('open', () => {
    keepAliveInterval = setInterval(() => {
      console.log('Checking if the connection is alive, sending a ping');

      provider._websocket.ping();

      // Use `WebSocket#terminate()`, which immediately destroys the connection,
      // instead of `WebSocket#close()`, which waits for the close timer.
      // Delay should be equal to the interval at which your server
      // sends out pings plus a conservative assumption of the latency.
      pingTimeout = setTimeout(() => {
        provider._websocket.terminate();
      }, EXPECTED_PONG_BACK);
    }, KEEP_ALIVE_CHECK_INTERVAL);

    pairContract.on(
      'Swap',
      async (to, amt0In, amt1In, amt0Out, amt1Out, from, event) => {
        console.log('Swap event happened!');
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
            fields: buyFields(
              avaxForCCC,
              buyCCC,
              avaxDollarVal,
              event,
              from,
              block
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
              block
            ),
          });
        }

        try {
          await discordChannel.send({ embeds: [message] });
        } catch (err) {
          console.log('Error sending message', ' ', err.message);
        }
      }
    );
  });

  provider._websocket.on('close', (err) => {
    console.error(
      'The websocket connection was closed: ',
      JSON.stringify(err, null, 2)
    );
    clearInterval(keepAliveInterval);
    clearTimeout(pingTimeout);
    startConnection();
  });

  provider._websocket.on('pong', () => {
    console.log('Received pong, so connection is alive, clearing the timeout');
    clearInterval(pingTimeout);
  });
}

module.exports = CCCSalesBot;
