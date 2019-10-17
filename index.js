const app = require('express')();
const cors = require('cors');
const io = require('socket.io')(8080);
const SerialPort = require('serialport');

app.use(cors());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/saxmono.ttf', (req, res) => {
  res.sendFile(__dirname + '/saxmono.ttf');
});

const server = app.listen(80, () => console.log('HTTP server is running on http://localhost'));

const port = new SerialPort("/dev/ttyUSB0", {
  baudRate: 9600,
  dataBits: 8,
  parity: 'none',
  stopBits: 1,
});

const parser = new SerialPort.parsers.Delimiter({
  includeDelimiter: true,
  delimiter: '<E>',
});

port.pipe(parser);

parser.on('data', (data) => {
  const frame = data.toString().replace(/\s/g, '');
  const timeFrameMatch = frame.match(/<ID\d{2}><\d{2}:(\d{2}):(\d{2})\d{2}><E>/);

  if (!timeFrameMatch) {
    return;
  }

  const [, minutes, seconds] = timeFrameMatch;
  console.log('Time =', minutes + ':' + seconds);

  io.emit('time', {
    minutes,
    seconds,
  });
});

function exit() {
  server.close();
  io.close();
  port.close();
  console.log('Cleaned');
  process.exit(0);
}

process.on('SIGINT', exit);
process.on('SIGUSR1', exit);
process.on('SIGUSR2', exit);
process.on('uncaughtException', exit);
