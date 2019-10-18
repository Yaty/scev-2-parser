const app = require('express')();
const cors = require('cors');
const io = require('socket.io').listen(8080);
const SerialPort = require('serialport');
const pug = require('pug');

app.use(cors());

const index = pug.compileFile('index.pug');

app.get('/', (req, res) => {
  res.send(index({
    socketIoUrl: ':8080',
    backgroundColor: req.query.backgroundColor || 'black',
    fontColor: req.query.fontColor || 'red',
  }));
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

function exit(...params) {
  if (params.length > 0) {
    console.log(...params);
  }

  server.close(() => {
    console.log('HTTP server closed');

    io.close(() => {
      console.log('Socket.io closed');

      port.close(() => {
        console.log('Serial port closed');
        console.log('Cleaned');
        process.exit(0);
      });
    });
  });
}

process.on('SIGINT', exit);
process.on('SIGUSR1', exit);
process.on('SIGUSR2', exit);
process.on('uncaughtException', exit);
process.on('unhandledRejection', exit);
